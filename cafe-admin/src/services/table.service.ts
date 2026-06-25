import { createClient } from '@/lib/supabase/client'
import type { RestaurantTable } from '@/types/database.types'

export const TableService = {
  async getAll(): Promise<RestaurantTable[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .order('table_number', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  async create(table: Omit<RestaurantTable, 'table_id'>): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('restaurant_tables').insert(table)
    if (error) throw error
  },

  async update(tableId: number, updates: Partial<RestaurantTable>): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('restaurant_tables')
      .update(updates)
      .eq('table_id', tableId)

    if (error) throw error
  },

  async delete(tableId: number): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('restaurant_tables')
      .delete()
      .eq('table_id', tableId)

    if (error) throw error
  },

  async toggleActive(tableId: number, isActive: boolean): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('restaurant_tables')
      .update({ is_active: isActive })
      .eq('table_id', tableId)

    if (error) throw error
  },
}