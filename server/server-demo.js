const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
 
const stripe = Stripe('sk_test_51TlZWOCWxp55hcOONlqCAUHeIkC5DLMxE710aNAfcc65xT5vFNuBAIcKWuo2bKIlSbjS5voHcEVbNBXdvwTGaQXg00cmGU51TM');
const app = express();
 
app.use(cors({ origin: '*' }));
app.use(express.json());
 
app.post('/payment-sheet', async (req, res) => {
  try {
    // 1. Créer un customer (ou réutiliser un existant)
    const customer = await stripe.customers.create();
 
    // 2. Générer une ephemeralKey pour ce customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-06-20' }
    );
 
    // 3. Créer le PaymentIntent (montant en centimes : 500 = 5,00 €)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount ?? 500,
      currency: 'eur',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });
 
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: 'pk_test_51TlZWOCWxp55hcOOAYX7V2IJwf4es16HFUEXEqGHFmw5Kc60erQcVMJkFzQBjawUi7QjlBgs5MbJdT6Ihv9NjnHh00cvSJqr8t',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
 
app.listen(4000, () => console.log('Backend Stripe sur http://localhost:4000'));
