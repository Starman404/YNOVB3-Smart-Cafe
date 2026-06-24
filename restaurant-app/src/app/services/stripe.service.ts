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

/**
 * Gère le paiement via le PaymentSheet natif de Stripe (carte + Google Pay + Apple Pay).
 *
 * Pourquoi pas Stripe.js (elements / paymentRequest) ? Parce que l'API navigateur
 * `PaymentRequest`, sur laquelle repose le bouton Google Pay de Stripe.js, n'est
 * supportée que par le vrai navigateur Chrome — pas par la WebView Android utilisée
 * par une app Capacitor. Le plugin natif appelle directement le SDK Android/iOS de
 * Stripe, qui lui sait afficher Google Pay/Apple Pay correctement dans une app.
 */
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
        // Passer à false une fois en compte Google Pay de production validé.
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