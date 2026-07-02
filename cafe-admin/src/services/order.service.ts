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
    const { data, error } = await supabase
      .from('order_items')
      .update({ item_status: status })
      .eq('order_item_id', orderItemId)
      .select('menu_name, order_id')
      .single()

    if (error) throw error

    if (status === 'served' && data?.order_id) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'https://ynovb3-smart-cafe.onrender.com'}/notify-served`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            menuName: data.menu_name,
          }),
        })
      } catch (notifyError) {
        console.error('Erreur notification FCM depuis l’admin', notifyError)
      }
    }
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