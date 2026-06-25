import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types/database.types'

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
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('order_id', orderId)

    if (error) throw error
  },

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('order_id', orderId)

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
      .subscribe()

    return () => supabase.removeChannel(channel)
  },
}