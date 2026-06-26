import { Injectable } from '@angular/core';
import { SupabaseClientService } from './supabase-client.service';

export interface Category {
  category_id: number;
  category_name: string;
  category_sort: number | null;
}

export interface MenuItem {
  menu_id: number;
  menu_name: string;
  menu_description: string | null;
  category_id: number;
  price: number;
  is_available: boolean;
}

/**
 * Responsable uniquement de la lecture du menu (catégories + plats).
 * Ne connaît rien au panier ni aux commandes (SRP).
 */
@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private supabase: SupabaseClientService) {}

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.client
      .from('categories')
      .select('category_id, category_name, category_sort')
      .order('category_sort', { ascending: true });

    if (error) {
      console.error('Erreur chargement catégories', error);
      return [];
    }
    return data ?? [];
  }

  async getAvailableItems(): Promise<MenuItem[]> {
    const { data, error } = await this.supabase.client
      .from('menu_items')
      .select('menu_id, menu_name, menu_description, category_id, price, is_available')
      .eq('is_available', true)
      .order('menu_sort', { ascending: true });

    if (error) {
      console.error('Erreur chargement plats', error);
      return [];
    }
    return data ?? [];
  }

  groupByCategory(items: MenuItem[]): Record<number, MenuItem[]> {
    const grouped: Record<number, MenuItem[]> = {};
    for (const item of items) {
      (grouped[item.category_id] ??= []).push(item);
    }
    return grouped;
  }
}