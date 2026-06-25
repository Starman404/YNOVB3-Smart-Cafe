import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Stripe, PaymentSheetEventsEnum } from '@capacitor-community/stripe';
import { environment } from '../../environments/environment';

interface PaymentSheetData {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
}


// Gère le paiement via le PaymentSheet natif de Stripe (carte + Google Pay + Apple Pay).

@Injectable({ providedIn: 'root' })
export class StripeService {
  private initialized = false;

  constructor(private http: HttpClient) {}

  private ensureInitialized() {
    if (this.initialized) return;
    Stripe.initialize({ publishableKey: environment.stripePublishableKey });
    this.initialized = true;
  }

  async pay(amountCents: number): Promise<'completed' | 'cancelled' | 'failed'> {
    this.ensureInitialized();

    let data: PaymentSheetData;
    try {
      data = await firstValueFrom(
        this.http.post<PaymentSheetData>(`${environment.apiUrl}/payment-sheet`, { amount: amountCents })
      );
    } catch {
      return 'failed';
    }

    try {
      await Stripe.createPaymentSheet({
        paymentIntentClientSecret: data.paymentIntent,
        customerId: data.customer,
        customerEphemeralKeySecret: data.ephemeralKey,
        merchantDisplayName: 'Luxe Café',
        enableGooglePay: true,
        countryCode: 'FR',
        GooglePayIsTesting: true,
      });

      const result = await Stripe.presentPaymentSheet();

      switch (result.paymentResult) {
        case PaymentSheetEventsEnum.Completed:
          return 'completed';
        case PaymentSheetEventsEnum.Canceled:
          return 'cancelled';
        default:
          return 'failed';
      }
    } catch {
      return 'failed';
    }
  }
}