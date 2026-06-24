import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent,
         IonButton, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { StripeService } from '../../services/stripe.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle,
            IonContent, IonButton, IonSpinner, IonIcon],
})
export class OrderPage {
  paying = false;
  paymentStatus: 'idle' | 'completed' | 'cancelled' | 'failed' = 'idle';

  // Replace with real total from your order state/service
  totalCents = 5000; // 50,00 €

  constructor(private stripeService: StripeService) {}

  async onPay() {
    this.paying = true;
    this.paymentStatus = 'idle';
    try {
      this.paymentStatus = await this.stripeService.pay(this.totalCents);
    } catch (e) {
      this.paymentStatus = 'failed';
    } finally {
      this.paying = false;
    }
  }
}