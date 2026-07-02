import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseClientService } from './supabase-client.service';
import { AuthService } from './auth.service';

/**
 * Responsable uniquement des favoris du client connecté.
 * Non disponible pour les invités.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly favoritesSubject = new BehaviorSubject<Set<number>>(new Set());
  readonly favorites$ = this.favoritesSubject.asObservable();

  constructor(
    private supabase: SupabaseClientService,
    private auth: AuthService
  ) {}

  get snapshot(): Set<number> {
    return this.favoritesSubject.value;
  }

  isFavorite(menuId: number): boolean {
    return this.favoritesSubject.value.has(menuId);
  }

  async load(): Promise<void> {
    if (!this.auth.isLoggedIn) {
      this.favoritesSubject.next(new Set());
      return;
    }

    const { data, error } = await this.supabase.client
      .from('favorites')
      .select('menu_id')
      .eq('user_id', this.auth.currentUserId);

    if (error) {
      console.error('Erreur chargement favoris', error);
      return;
    }

    this.favoritesSubject.next(new Set((data ?? []).map((f: any) => f.menu_id)));
  }

  async toggle(menuId: number): Promise<void> {
    if (!this.auth.isLoggedIn) return;

    const current = new Set(this.snapshot);

    if (current.has(menuId)) {
      await this.supabase.client
        .from('favorites')
        .delete()
        .eq('user_id', this.auth.currentUserId)
        .eq('menu_id', menuId);
      current.delete(menuId);
    } else {
      await this.supabase.client
        .from('favorites')
        .insert({ user_id: this.auth.currentUserId, menu_id: menuId });
      current.add(menuId);
    }

    this.favoritesSubject.next(current);
  }
}