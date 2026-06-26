import { createClient } from '@/lib/supabase/client'

export interface DailyRevenue {
  date: string
  revenue: number
  orders: number
}

export interface TopItem {
  menu_name: string
  total_quantity: number
  total_revenue: number
}

export interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  activeOrders: number
  totalTables: number
}

export const AnalyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    // Commandes du jour
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)

    // Commandes actives (articles non servis)
    const { data: activeItems } = await supabase
      .from('order_items')
      .select('order_id')
      .in('item_status', ['confirmed', 'preparing', 'ready'])

    // Tables actives
    const { data: tables } = await supabase
      .from('restaurant_tables')
      .select('table_id')
      .eq('is_active', true)

    const uniqueActiveOrders = new Set(activeItems?.map((i) => i.order_id) ?? [])

    return {
      todayRevenue: todayOrders?.reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0,
      todayOrders: todayOrders?.length ?? 0,
      activeOrders: uniqueActiveOrders.size,
      totalTables: tables?.length ?? 0,
    }
  },

  async getWeeklyRevenue(): Promise<DailyRevenue[]> {
    const supabase = createClient()

    // 7 derniers jours
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toISOString().split('T')[0]
    })

    const { data: orders } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', `${days[0]}T00:00:00`)
      .eq('payment_status', 'paid')

    // Groupe par jour
    const revenueByDay: Record<string, { revenue: number; orders: number }> = {}
    days.forEach((d) => { revenueByDay[d] = { revenue: 0, orders: 0 } })

    orders?.forEach((o) => {
      const day = o.created_at.split('T')[0]
      if (revenueByDay[day]) {
        revenueByDay[day].revenue += o.total_amount ?? 0
        revenueByDay[day].orders += 1
      }
    })

    return days.map((date) => ({
      date,
      revenue: Math.round(revenueByDay[date].revenue * 100) / 100,
      orders: revenueByDay[date].orders,
    }))
  },

  async getTopItems(): Promise<TopItem[]> {
    const supabase = createClient()
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)

    const { data } = await supabase
      .from('order_items')
      .select('menu_name, quantity, unit_price')
      .gte('created_at', weekAgo.toISOString())
      .not('item_status', 'eq', 'cancelled')

    // Groupe par article
    const itemMap: Record<string, TopItem> = {}
    data?.forEach((item) => {
      if (!itemMap[item.menu_name]) {
        itemMap[item.menu_name] = {
          menu_name: item.menu_name,
          total_quantity: 0,
          total_revenue: 0,
        }
      }
      itemMap[item.menu_name].total_quantity += item.quantity
      itemMap[item.menu_name].total_revenue += item.quantity * item.unit_price
    })

    return Object.values(itemMap)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 5)
  },
}