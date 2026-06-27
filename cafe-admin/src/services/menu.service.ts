import { createClient } from '@/lib/supabase/client'
import type { Category, MenuItem } from '@/types/database.types'

export const MenuService = {
  // Catégories
  async getCategories(): Promise<Category[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_sort', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  async createCategory(name: string, sort: number | null): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .insert({ category_name: name, category_sort: sort })

    if (error) throw error
  },

  async updateCategory(id: number, name: string, sort: number | null): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .update({ category_name: name, category_sort: sort })
      .eq('category_id', id)

    if (error) throw error
  },

  async deleteCategory(id: number): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', id)

    if (error) throw error
  },

  // Articles
  async getItems(): Promise<MenuItem[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, categories(category_name)')
      .order('menu_sort', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  async createItem(item: Omit<MenuItem, 'menu_id'>): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('menu_items').insert(item)
    if (error) throw error
  },

  async updateItem(menuId: number, updates: Partial<MenuItem>): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('menu_id', menuId)

    if (error) throw error
  },

  async deleteItem(menuId: number): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('menu_id', menuId)

    if (error) throw error
  },

  async toggleAvailability(menuId: number, isAvailable: boolean): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: isAvailable })
      .eq('menu_id', menuId)

    if (error) throw error
  },

  async reorderCategories(ids: number[]): Promise<void> {
    const supabase = createClient()
    await Promise.all(
      ids.map((id, index) =>
        supabase
          .from('categories')
          .update({ category_sort: index + 1 })
          .eq('category_id', id)
      )
    )
  },

  async reorderItems(ids: number[]): Promise<void> {
    const supabase = createClient()
    await Promise.all(
      ids.map((id, index) =>
        supabase
          .from('menu_items')
          .update({ menu_sort: index + 1 })
          .eq('menu_id', id)
      )
    )
  },
}