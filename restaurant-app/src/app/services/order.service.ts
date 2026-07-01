import { Injectable } from '@angular/core';
import { SupabaseClientService } from './supabase-client.service';
import { CartLine } from './cart.service';
import { environment } from '../../environments/environment';

export type ItemStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed';

export interface Order {
  order_id: string;
  table_id: number;
  customer_id: string | null;
  payment_status: PaymentStatus;
  total_amount: number;
  created_at: string;
}

export interface OrderItemRow {
  order_item_id: number;
  menu_id: number;
  menu_name: string;
  unit_price: number;
  quantity: number;
  item_status: ItemStatus;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private supabase: SupabaseClientService) {}

  async getOrCreateOpenOrder(tableId: number, customerId: string | null): Promise<Order | null> {
    const { data, error } = await this.supabase.client.rpc('get_or_create_open_order', {
      p_table_id: tableId,
      p_customer_id: customerId,
    });

    if (error || !data) {
      console.error('Erreur récupération commande', error);
      return null;
    }
    return data as Order;
  }

  async getOpenOrderForTable(tableId: number): Promise<Order | null> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*')
      .eq('table_id', tableId)
      .neq('payment_status', 'paid')
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  async addItemsToOrder(orderId: string, lines: CartLine[]): Promise<boolean> {
    const rows = lines.map((l) => ({
      order_id: orderId,
      menu_id: l.menu_id,
      menu_name: l.menu_name,
      unit_price: l.unit_price,
      quantity: l.quantity,
      item_status: 'confirmed',
    }));

    const { error: itemsError } = await this.supabase.client.from('order_items').insert(rows);
    if (itemsError) {
      console.error('Erreur ajout articles', itemsError);
      return false;
    }

    const order = await this.getOrder(orderId);
    if (!order) return false;

    const addedTotal = lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
    const { error: updateError } = await this.supabase.client
      .from('orders')
      .update({ total_amount: order.total_amount + addedTotal })
      .eq('order_id', orderId);

    return !updateError;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const { data, error } = await this.supabase.client
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) return null;
    return data;
  }

  async getOrderItems(orderId: string): Promise<OrderItemRow[]> {
    const { data, error } = await this.supabase.client
      .from('order_items')
      .select('order_item_id, menu_id, menu_name, unit_price, quantity, item_status')
      .eq('order_id', orderId)
      .order('order_item_id', { ascending: true });

    if (error) return [];
    return data ?? [];
  }

  async markAsPaid(orderId: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('order_id', orderId);

    return !error;
  }


  async notifyItemServed(deviceId: string, menuName: string): Promise<void> {
    try {
      await fetch(`${environment.apiUrl}/notify-served`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, menuName }),
      });
    } catch (err) {
      console.error('Erreur envoi notification', err);
    }
  }

  subscribeToOrder(
    orderId: string,
    onItemsChange: () => void,
    onOrderChange: (order: Order) => void
  ): () => void {
    const channel = this.supabase.client
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'order_items', filter: `order_id=eq.${orderId}` },
        () => onItemsChange()
      )
      .on(
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `order_id=eq.${orderId}` },
        (payload: any) => onOrderChange(payload.new as Order)
      )
      .subscribe();

    return () => {
      this.supabase.client.removeChannel(channel);
    };
  }
}