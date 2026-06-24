import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseClientService } from './supabase-client.service';

export interface RestaurantTable {
  table_id: number;
  table_number: number;
  table_label: string | null;
}

const STORAGE_KEY = 'lux_table';

/**
 * Responsable uniquement de la table active pour la session en cours :
 * lecture, vérification en base, persistance.
 */
@Injectable({ providedIn: 'root' })
export class TableService {
  private readonly tableSubject = new BehaviorSubject<RestaurantTable | null>(this.restore());
  readonly table$ = this.tableSubject.asObservable();

  constructor(private supabase: SupabaseClientService) {}

  get current(): RestaurantTable | null {
    return this.tableSubject.value;
  }

  /**
   * Vérifie qu'un numéro de table existe et est actif, puis le mémorise pour la session.
   * Retourne null si la table n'existe pas / n'est pas active.
   */
  async resolveByNumber(tableNumber: number): Promise<RestaurantTable | null> {
    const { data, error } = await this.supabase.client
      .from('restaurant_tables')
      .select('table_id, table_number, table_label')
      .eq('table_number', tableNumber)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    this.set(data);
    return data;
  }

  set(table: RestaurantTable) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(table));
    this.tableSubject.next(table);
  }

  clear() {
    sessionStorage.removeItem(STORAGE_KEY);
    this.tableSubject.next(null);
  }

  private restore(): RestaurantTable | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
