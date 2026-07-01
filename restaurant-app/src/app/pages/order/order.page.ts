import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner
} from '@ionic/angular/standalone';
import { CartService, CartLine } from '../../services/cart.service';
import { OrderService, Order, OrderItemRow } from '../../services/order.service';
import { TableService } from '../../services/table.service';
import { AuthService } from '../../services/auth.service';
import { StripeService } from '../../services/stripe.service';
import { DeviceService } from '../../services/device.service';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Envoyé',
  confirmed: 'Confirmé',
  preparing: 'En préparation',
  ready: 'Prêt',
  served: 'Servi',
  cancelled: 'Annulé',
};

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner],
})
export class OrderPage implements OnInit, OnDestroy {
  cartLines: CartLine[] = [];
  cartTotal = 0;

  activeOrder: Order | null = null;
  orderedItems: OrderItemRow[] = [];

  loading = true;
  sending = false;
  paying = false;
  error = '';

  private unsubscribe: (() => void) | null = null;

  constructor(
    private cart: CartService,
    private orderService: OrderService,
    private tableService: TableService,
    private auth: AuthService,
    private stripe: StripeService,
    private deviceService: DeviceService
  ) {}

  async ngOnInit() {
    this.cart.lines$.subscribe((lines) => {
      this.cartLines = lines;
      this.cartTotal = this.cart.total;
    });

    const table = this.tableService.current;
    if (table) {
      const order = await this.orderService.getOpenOrderForTable(table.table_id);
      if (order) {
        await this.loadOrder(order);
      }
    }

    this.loading = false;
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }

  get canPay(): boolean {
    return (
      this.orderedItems.length > 0 &&
      this.orderedItems.every((i) => i.item_status === 'served') &&
      this.activeOrder?.payment_status !== 'paid'
    );
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  increment(line: CartLine) {
    this.cart.updateQuantity(line.menu_id, line.quantity + 1);
  }

  decrement(line: CartLine) {
    this.cart.updateQuantity(line.menu_id, line.quantity - 1);
  }

  private async loadOrder(order: Order) {
    this.activeOrder = order;
    this.orderedItems = await this.orderService.getOrderItems(order.order_id);

    this.unsubscribe?.();
    this.unsubscribe = this.orderService.subscribeToOrder(
      order.order_id,
      async () => {
        const previousItems = [...this.orderedItems];
        this.orderedItems = await this.orderService.getOrderItems(order.order_id);

        const deviceId = await this.deviceService.getDeviceId();
        for (const item of this.orderedItems) {
          const wasNotServed = previousItems.find(
            (p) => p.order_item_id === item.order_item_id && p.item_status !== 'served'
          );
          if (item.item_status === 'served' && wasNotServed) {
            await this.orderService.notifyItemServed(deviceId, item.menu_name);
          }
        }
      },
      (updatedOrder) => { this.activeOrder = updatedOrder; }
    );
  }

  async sendOrder() {
    const table = this.tableService.current;
    if (!table) {
      this.error = "Aucune table sélectionnée. Retournez à l'accueil pour scanner le QR code.";
      return;
    }
    if (this.cartLines.length === 0) return;

    this.sending = true;
    this.error = '';

    const order = await this.orderService.getOrCreateOpenOrder(table.table_id, this.auth.currentUserId);
    if (!order) {
      this.sending = false;
      this.error = "Impossible d'accéder à la commande de cette table. Merci de réessayer.";
      return;
    }

    const ok = await this.orderService.addItemsToOrder(order.order_id, this.cartLines);
    this.sending = false;

    if (!ok) {
      this.error = "Impossible d'envoyer la commande. Merci de réessayer.";
      return;
    }

    this.cart.clear();
    await this.loadOrder(await this.orderService.getOrder(order.order_id) ?? order);
  }

  async pay() {
    if (!this.activeOrder) return;

    this.paying = true;
    this.error = '';

    const amountCents = Math.round(this.activeOrder.total_amount * 100);
    const result = await this.stripe.pay(amountCents);

    if (result === 'completed') {
      await this.orderService.markAsPaid(this.activeOrder.order_id);
    } else if (result === 'failed') {
      this.error = 'Le paiement a échoué. Merci de réessayer.';
    }

    this.paying = false;
  }

  startNewOrder() {
    this.activeOrder = null;
    this.orderedItems = [];
    this.unsubscribe?.();
  }
}