import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons
} from '@ionic/angular/standalone';
import { SupabaseClientService } from '../../services/supabase-client.service';
import { AuthService } from '../../services/auth.service';

interface OrderHistory {
  order_id: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  expanded: boolean;
  items?: OrderHistoryItem[];
  loadingItems?: boolean;
}

interface OrderHistoryItem {
  menu_name: string;
  unit_price: number;
  quantity: number;
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons],
})
export class OrderHistoryPage implements OnInit {
  orders: OrderHistory[] = [];
  loading = true;

  constructor(
    private supabase: SupabaseClientService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    await this.loadHistory();
  }

  private async loadHistory() {
    this.loading = true;

    const { data, error } = await this.supabase.client
      .from('orders')
      .select('order_id, total_amount, payment_status, created_at')
      .eq('customer_id', this.auth.currentUserId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      this.orders = data.map((o: any) => ({ ...o, expanded: false }));
    }

    this.loading = false;
  }

  async toggleOrder(order: OrderHistory) {
    order.expanded = !order.expanded;

    if (order.expanded && !order.items) {
      order.loadingItems = true;

      const { data } = await this.supabase.client
        .from('order_items')
        .select('menu_name, unit_price, quantity')
        .eq('order_id', order.order_id)
        .order('order_item_id', { ascending: true });

      order.items = data ?? [];
      order.loadingItems = false;
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}