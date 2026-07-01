const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

function normalizeFirebasePrivateKey(key) {
  if (!key) return key;
  let normalized = key.trim();

  if (normalized.startsWith('{')) {
    try {
      const parsed = JSON.parse(normalized);
      if (parsed.private_key) {
        return parsed.private_key.replace(/\\n/g, '\n');
      }
    } catch (err) {
      // continue to string normalization below
    }
  }

  if (normalized.includes('\\n')) {
    normalized = normalized.replace(/\\n/g, '\n');
  }

  return normalized;
}

let firebaseCredential;
let envCredential = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  envCredential = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizeFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  };
}

if (envCredential && /-----BEGIN .*PRIVATE KEY-----/.test(envCredential.privateKey)) {
  firebaseCredential = envCredential;
} else {
  firebaseCredential = require('./ynovb3-554a8-firebase-adminsdk-fbsvc-e0a9537d23.json');
}

const firebaseApp = initializeApp({
  credential: cert(firebaseCredential),
});

const db = getFirestore(firebaseApp);
const messaging = getMessaging(firebaseApp);

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());


async function getFcmToken(deviceId) {
  const doc = await db.collection('devices').doc(deviceId).get();
  if (!doc.exists) throw new Error(`Device not found: ${deviceId}`);
  return doc.data().fcmToken;
}

// Stripe

app.post('/payment-sheet', async (req, res) => {
  try {
    const customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-06-20' }
    );

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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Notification

app.post('/notify-purchase', async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId requis' });

  try {
    const fcmToken = await getFcmToken(deviceId);

    await messaging.send({
      token: fcmToken,
      notification: {
        title: 'Paiement confirmé',
        body: 'Votre paiement a été effectué avec succès. Merci !',
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/notify-served', async (req, res) => {
  const { deviceId, menuName } = req.body;
  if (!deviceId || !menuName) {
    return res.status(400).json({ error: 'deviceId et menuName requis' });
  }

  try {
    const fcmToken = await getFcmToken(deviceId);

    await messaging.send({
      token: fcmToken,
      notification: {
        title: 'Votre plat est prêt !',
        body: `${menuName} vient d'être servi.`,
      },
      data: {
        title: 'Votre plat est prêt !',
        body: `${menuName} vient d'être servi.`,
        type: 'served',
      },
      android: {
        priority: 'high',
        notification: {
          title: 'Votre plat est prêt !',
          body: `${menuName} vient d'être servi.`,
          channelId: 'smart_cafe_default',
          sound: 'default',
          defaultSound: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true,
            badge: 1,
          },
        },
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Dashboard

app.get('/dashboard', async (req, res) => {
  const snapshot = await db.collection('devices').get();
  const devices = snapshot.docs.map(d => ({
    id: d.id,
    fcmToken: d.data().fcmToken,
    updatedAt: d.data().updatedAt,
  }));

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Push Dashboard</title>
      <style>
        body { font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px; }
        h1 { color: #23b2a4; }
        label { display: block; margin-top: 12px; font-weight: 600; }
        input, select, textarea {
          width: 100%; padding: 8px; margin-top: 4px;
          border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;
        }
        button {
          margin-top: 20px; padding: 12px 24px; background: #23b2a4;
          color: white; border: none; border-radius: 4px; cursor: pointer;
          font-size: 16px;
        }
        button:hover { background: #1e8e7e; }
        .device { padding: 8px; background: #f5f5f5; margin: 4px 0; border-radius: 4px; font-size: 13px; }
      </style>
    </head>
    <body>
      <h1>Push Notification Dashboard</h1>

      <h3>Devices enregistrés (${devices.length})</h3>
      ${devices.map(d => `
        <div class="device">
          <strong>${d.id}</strong><br/>
          Token: ${d.fcmToken.substring(0, 40)}...<br/>
          Updated: ${new Date(d.updatedAt).toLocaleString()}
        </div>
      `).join('')}

      <h3>Envoyer une notification</h3>
      <form id="form">
        <label>Device</label>
        <select name="deviceId" required>
          ${devices.map(d => `<option value="${d.id}">${d.id}</option>`).join('')}
        </select>

        <label>Titre</label>
        <input name="title" value="Test depuis le dashboard" required />

        <label>Message</label>
        <textarea name="body" rows="3" required>Hello !</textarea>

        <button type="submit">Envoyer</button>
      </form>

      <p id="result"></p>

      <script>
        document.getElementById('form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target));
          const res = await fetch('/notify-custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const json = await res.json();
          document.getElementById('result').innerText = JSON.stringify(json);
        });
      </script>
    </body>
    </html>
  `);
});

app.post('/notify-custom', async (req, res) => {
  const { deviceId, title, body } = req.body;

  try {
    const fcmToken = await getFcmToken(deviceId);

    await messaging.send({
      token: fcmToken,
      notification: { title, body },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Erreur:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend sur http://localhost:' + PORT));