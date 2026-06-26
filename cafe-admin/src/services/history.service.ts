import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types/database.types'

export interface HistoryFilters {
  dateFrom?: string
  dateTo?: string
  paymentStatus?: string
  tableId?: number
}

export const HistoryService = {
  async getOrders(filters: HistoryFilters = {}): Promise<Order[]> {
    const supabase = createClient()

    let query = supabase
      .from('orders')
      .select(`
        *,
        restaurant_tables(table_number, table_label),
        order_items(*)
      `)
      .order('created_at', { ascending: false })

    if (filters.dateFrom) {
      query = query.gte('created_at', `${filters.dateFrom}T00:00:00`)
    }

    if (filters.dateTo) {
      query = query.lte('created_at', `${filters.dateTo}T23:59:59`)
    }

    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus)
    }

    if (filters.tableId) {
      query = query.eq('table_id', filters.tableId)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },
}