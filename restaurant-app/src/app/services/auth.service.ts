import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseClientService } from './supabase-client.service';
import type { Session } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  errorMessage?: string;
}

/**
 * Responsable uniquement de l'authentification : connexion, inscription,
 * déconnexion, état de session. Ne touche à aucune autre table métier.
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
    return 'Une erreur est survenue. Merci de réessayer.';
  }
}
