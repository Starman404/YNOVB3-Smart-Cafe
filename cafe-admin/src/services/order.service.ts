import { createClient } from '@/lib/supabase/client'
import type { Order, ItemStatus } from '@/types/database.types'

export const OrderService = {
  async getAll(): Promise<Order[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant_tables(table_number, table_label),
        order_items(*)
      `)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  async updateItemStatus(orderItemId: number, status: ItemStatus): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('order_items')
      .update({ item_status: status })
      .eq('order_item_id', orderItemId)

    if (error) throw error
  },

  async cancelItem(orderItemId: number): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('order_items')
      .update({ item_status: 'cancelled' })
      .eq('order_item_id', orderItemId)

    if (error) throw error
  },

  subscribeToOrders(callback: () => void) {
    const supabase = createClient()
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'order_items',
      }, callback)
      .subscribe()

    return () => supabase.removeChannel(channel)
  },
}