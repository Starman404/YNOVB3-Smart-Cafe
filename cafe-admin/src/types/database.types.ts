export type ItemStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'cancelled'

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed'

export interface Category {
  category_id: number
  category_name: string
  category_sort: number | null
}

export interface MenuItem {
  menu_id: number
  menu_name: string
  menu_description: string | null
  category_id: number | null
  price: number
  menu_sort: number | null
  is_available: boolean
  categories?: Category
}

export interface RestaurantTable {
  table_id: number
  table_number: number
  table_label: string | null
  capacity: number
  is_active: boolean
}

export interface Order {
  order_id: string
  table_id: number | null
  customer_id: string | null
  payment_status: PaymentStatus
  stripe_payment_intent_id: string | null
  total_amount: number
  created_at: string
  updated_at: string
  restaurant_tables?: RestaurantTable
  order_items?: OrderItem[]
}

export interface OrderItem {
  order_item_id: number
  order_id: string
  menu_id: number | null
  menu_name: string
  unit_price: number
  quantity: number
  item_note: string | null
  item_status: ItemStatus
  created_at: string
}

export interface Account {
  user_id: string
  user_name: string
  user_email: string | null
  created_at: string
}