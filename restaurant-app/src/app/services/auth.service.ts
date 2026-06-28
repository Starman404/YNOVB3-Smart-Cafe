import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseClientService } from './supabase-client.service';
import type { Session } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  errorMessage?: string;
}

/**
 * Responsable uniquement de l'authentification et du profil associé :
 * connexion, inscription, déconnexion, nom, email, mot de passe. Ne touche
 * à aucune autre table métier (commandes, menu...).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSubject = new BehaviorSubject<Session | null>(null);
  readonly session$ = this.sessionSubject.asObservable();

  constructor(private supabase: SupabaseClientService) {
    this.supabase.client.auth.getSession().then(({ data }) => {
      this.sessionSubject.next(data.session);
    });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.sessionSubject.next(session);
    });
  }

  get isLoggedIn(): boolean {
    return this.sessionSubject.value !== null;
  }

  get currentUserId(): string | null {
    return this.sessionSubject.value?.user.id ?? null;
  }

  get currentUserEmail(): string | null {
    return this.sessionSubject.value?.user.email ?? null;
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (error) return { success: false, errorMessage: this.translateError(error.message) };
    return { success: true };
  }

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.client.auth.signUp({ email, password });
    if (error) return { success: false, errorMessage: this.translateError(error.message) };

    if (data.user) {
      const { error: profileError } = await this.supabase.client
        .from('accounts')
        .insert({ user_id: data.user.id, user_name: name, user_email: email });

      if (profileError) {
        return { success: false, errorMessage: 'Compte créé mais profil incomplet. Contactez le support.' };
      }
    }

    return { success: true };
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
  }

  async getMyAccountName(): Promise<string | null> {
    if (!this.currentUserId) return null;

    const { data, error } = await this.supabase.client
      .from('accounts')
      .select('user_name')
      .eq('user_id', this.currentUserId)
      .single();

    if (error || !data) return null;
    return data.user_name;
  }

  async updateName(newName: string): Promise<AuthResult> {
    if (!this.currentUserId) {
      return { success: false, errorMessage: 'Vous devez être connecté.' };
    }

    const { error } = await this.supabase.client
      .from('accounts')
      .update({ user_name: newName })
      .eq('user_id', this.currentUserId);

    if (error) return { success: false, errorMessage: 'Impossible de mettre à jour le nom.' };
    return { success: true };
  }

  /**
   * Met à jour l'email. Selon la configuration Supabase Auth, un email de
   * confirmation peut être envoyé avant que le changement soit définitif —
   * dans ce cas, `currentUserEmail` ne reflètera la nouvelle valeur qu'après
   * que le lien de confirmation a été cliqué.
   */
  async updateEmail(newEmail: string): Promise<AuthResult> {
    const { error: authError } = await this.supabase.client.auth.updateUser({ email: newEmail });
    if (authError) return { success: false, errorMessage: this.translateError(authError.message) };

    if (this.currentUserId) {
      await this.supabase.client
        .from('accounts')
        .update({ user_email: newEmail })
        .eq('user_id', this.currentUserId);
    }

    return { success: true };
  }

  async updatePassword(newPassword: string): Promise<AuthResult> {
    const { error } = await this.supabase.client.auth.updateUser({ password: newPassword });
    if (error) return { success: false, errorMessage: this.translateError(error.message) };
    return { success: true };
  }

  private translateError(message: string): string {
    if (message.includes('Invalid login credentials')) {
      return 'Email ou mot de passe incorrect.';
    }
    if (message.includes('already registered')) {
      return 'Un compte existe déjà avec cet email.';
    }
    if (message.includes('Password should be at least')) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    if (message.includes('email')) {
      return 'Adresse email invalide ou déjà utilisée.';
    }
    return 'Une erreur est survenue. Merci de réessayer.';
  }
}