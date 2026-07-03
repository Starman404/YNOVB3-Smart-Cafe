# Documentation Technique — Restaurant App (Ionic/Angular)

> **Version** : 1.2 — Juillet 2026  
> **Stack** : Ionic Angular · Supabase · Stripe · Firebase FCM · Capacitor

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture du projet](#2-architecture-du-projet)
3. [Prérequis et installation](#3-prérequis-et-installation)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Base de données Supabase](#5-base-de-données-supabase)
6. [Services Angular](#6-services-angular)
7. [Pages et navigation](#7-pages-et-navigation)
8. [Backend Express (server.js)](#8-backend-express-serverjs)
9. [Notifications push (Firebase FCM)](#9-notifications-push-firebase-fcm)
10. [Paiement Stripe](#10-paiement-stripe)
11. [Scan QR code](#11-scan-qr-code)
12. [Thème et design tokens](#12-thème-et-design-tokens)
13. [Deep linking Android](#13-deep-linking-android)
14. [Déploiement](#14-déploiement)
15. [Commandes utiles](#15-commandes-utiles)
16. [Points d'attention et dette technique](#16-points-dattention-et-dette-technique)

---

## 1. Vue d'ensemble

Application mobile native (Android / iOS via Capacitor) permettant aux clients d'un restaurant de :

- Identifier leur table par scan QR ou saisie manuelle
- Consulter le menu par catégories (avec section "Vos favoris" pour les comptes connectés)
- Commander des plats (plusieurs "rounds" possibles pendant le repas)
- Suivre le statut de chaque article en temps réel
- Payer via Stripe (carte + Google Pay)
- Recevoir une notification push quand un plat est servi
- Gérer leur compte (nom, email, mot de passe, thème clair/sombre)
- Sauvegarder des plats en favoris (comptes connectés)
- Consulter l'historique de leurs commandes (comptes connectés)

L'application est accessible également sur navigateur web via Vercel (`https://ynovb-3-smart-cafe.vercel.app`) mais certaines fonctionnalités (scan caméra, Google Pay, notifications push) nécessitent un build natif.

---

## 2. Architecture du projet

```
Smart-Cafe/                          ← dépôt GitHub racine
├── restaurant-app/                  ← app Ionic (ce document)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── landing/         ← scan QR + saisie table
│   │   │   │   ├── login/           ← connexion / inscription / invité
│   │   │   │   ├── menu/            ← menu par catégories + favoris + panier
│   │   │   │   ├── order/           ← commande en cours + paiement
│   │   │   │   ├── order-history/   ← historique des commandes (compte requis)
│   │   │   │   └── settings/        ← thème, profil, historique, déconnexion
│   │   │   ├── services/
│   │   │   │   ├── supabase-client.service.ts  ← client Supabase (SRP)
│   │   │   │   ├── auth.service.ts             ← authentification
│   │   │   │   ├── table.service.ts            ← table active de session
│   │   │   │   ├── menu.service.ts             ← lecture catégories/plats
│   │   │   │   ├── cart.service.ts             ← état du panier local
│   │   │   │   ├── order.service.ts            ← commandes + temps réel
│   │   │   │   ├── favorites.service.ts        ← favoris client
│   │   │   │   ├── stripe.service.ts           ← paiement natif
│   │   │   │   ├── theme.service.ts            ← thème clair/sombre
│   │   │   │   ├── device.service.ts           ← ID unique appareil
│   │   │   │   └── fcm.service.ts              ← notifications push
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts               ← protection routes
│   │   │   ├── tabs/                           ← shell 3 onglets
│   │   │   ├── app.routes.ts
│   │   │   └── app.component.ts
│   │   ├── environments/
│   │   │   ├── environment.ts                  ← dev
│   │   │   └── environment.prod.ts             ← prod
│   │   ├── theme/
│   │   │   └── variables.scss                  ← design tokens
│   │   └── global.scss
│   ├── supabase/
│   │   └── schema.sql                          ← schéma complet DB
│   ├── public/
│   │   └── .well-known/
│   │       └── assetlinks.json                 ← Android App Links
│   ├── android/                                ← projet Android natif (Capacitor)
│   ├── capacitor.config.ts
│   └── package.json
└── server/                                     ← backend Express
    ├── server.js                               ← Stripe + Firebase FCM
    ├── serviceAccountKey.json                  ← clé Firebase (ne pas committer)
    └── package.json
```

### Principe de découpage (SRP / DRY / KISS)

Chaque service a une responsabilité unique. Aucune logique métier dans les pages — elles délèguent entièrement aux services. Aucune couleur codée en dur dans les `.scss` de pages — tout passe par les variables CSS de `variables.scss`.

---

## 3. Prérequis et installation

### Prérequis globaux

| Outil | Version minimale |
|---|---|
| Node.js | 18+ |
| Ionic CLI | 7+ (`npm i -g @ionic/cli`) |
| Android Studio | Flamingo+ (avec SDK Android 33+) |
| Java JDK | 17+ |

### Installation de l'app Ionic

```bash
cd restaurant-app
npm install
```

### Installation du backend

```bash
cd server
npm install
```

---

## 4. Variables d'environnement

### `src/environments/environment.ts` (dev)

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://PROJET.supabase.co',
  supabaseAnonKey: 'eyJ...',
  stripePublishableKey: 'pk_test_...',
  apiUrl: 'https://TON_BACKEND.onrender.com',
  firebaseConfig: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...'
  }
};
```

### Variables du backend (`server/`)

```
STRIPE_SECRET_KEY=sk_test_...
PORT=4000
```

Le fichier `serviceAccountKey.json` (clé de compte de service Firebase) doit être présent dans `server/` mais **ne doit jamais être commité** (ajouté au `.gitignore`).

---

## 5. Base de données Supabase

### Schéma

Le schéma complet est dans `supabase/schema.sql`. Il contient le reset, la création des tables, les index, les policies RLS, les GRANT et les données de test. À exécuter intégralement dans l'éditeur SQL de Supabase pour initialiser ou réinitialiser la base.

### Tables principales

| Table | Rôle |
|---|---|
| `categories` | Catégories du menu (Entrées, Plats, etc.) |
| `menu_items` | Plats avec prix, description, disponibilité |
| `restaurant_tables` | Tables physiques du restaurant |
| `accounts` | Profils clients (liés à `auth.users`) |
| `orders` | Une commande par table non payée à la fois |
| `order_items` | Articles de commande avec `item_status` individuel |
| `favorites` | Plats favoris par client (user_id + menu_id, unique) |

### Table `favorites`

```sql
create table favorites (
  favorite_id bigint generated always as identity primary key,
  user_id uuid references accounts(user_id) on delete cascade,
  menu_id bigint references menu_items(menu_id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, menu_id)
);
```

Seuls les utilisateurs connectés peuvent gérer leurs favoris (policy RLS `users can manage own favorites`).

### Règle clé sur les commandes

Un index unique partiel garantit **une seule commande ouverte (`payment_status != 'paid'`) par table** :

```sql
create unique index one_open_order_per_table
  on orders (table_id)
  where payment_status != 'paid';
```

La fonction `get_or_create_open_order(p_table_id, p_customer_id)` gère la race condition si deux appareils à la même table passent commande au même instant.

### Calcul automatique du total

Le `total_amount` d'une commande est recalculé automatiquement via un trigger après chaque insert / update / delete sur `order_items` — il n'est jamais mis à jour manuellement côté app.

```sql
create trigger order_items_total_sync
  after insert or update or delete on order_items
  for each row execute function recalculate_order_total();
```

### Cycle de vie d'un `item_status`

```
(panier local, pas en base)
        ↓ "Passer commande"
    confirmed  →  preparing  →  ready  →  served
                                              ↓
                                    notification push envoyée
                                              ↓
                              si tous les items = served → bouton "Payer" visible
```

### Realtime

Les tables `orders` et `order_items` sont dans `supabase_realtime` :

```sql
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
```

### RLS

Les policies autorisent tout le monde à lire/créer/modifier les commandes (aucune donnée personnelle sensible dans une commande — juste des plats et un montant). L'écriture sur `menu_items`, `categories` et `restaurant_tables` est réservée à la clé `service_role` (SQL editor Supabase uniquement, puisqu'il n'y a pas d'app staff pour l'instant).

---

## 6. Services Angular

### `SupabaseClientService`

Source unique du client Supabase. Aucune logique métier — juste `createClient()`. Tous les autres services l'injectent plutôt que de créer leur propre client.

### `AuthService`

Gère la session utilisateur via Supabase Auth. Expose :
- `isLoggedIn`, `currentUserId`, `currentUserEmail`
- `signIn()`, `signUp()`, `signOut()`
- `getMyAccountName()`, `updateName()`, `updateEmail()`, `updatePassword()`

> **Note** : lors du `signUp`, un profil est inséré dans `accounts` en plus de la création dans `auth.users`. Si l'insert échoue, la fonction SQL `get_or_create_open_order` gère ce cas en passant en mode invité plutôt qu'en crashant.

### `TableService`

Responsable de la table active pour la session :
- Lit/écrit en `sessionStorage` (clé `lux_table`)
- `resolveByNumber(n)` → vérifie en base que la table existe et est active
- Exposé via `table$` (Observable) et `current` (snapshot synchrone)

### `MenuService`

Lecture seule du menu :
- `getCategories()` → triées par `category_sort`
- `getAvailableItems()` → filtrées `is_available = true`, triées par `menu_sort`
- `groupByCategory(items)` → `Record<number, MenuItem[]>` pour l'affichage

### `CartService`

État du panier entièrement local (pas en base) :
- Persisté en `sessionStorage` (clé `lux_cart`)
- `add()`, `updateQuantity()`, `clear()`
- Exposé via `lines$` (Observable)
- `total` et `count` en getter synchrone

### `FavoritesService`

Gère les plats favoris du client connecté :
- `load()` → charge les favoris depuis Supabase au chargement du menu
- `toggle(menuId)` → ajoute ou retire un favori, met à jour le `BehaviorSubject` localement sans rechargement
- `isFavorite(menuId)` → lecture synchrone depuis le snapshot
- Non disponible pour les invités (`isLoggedIn` vérifié avant toute opération)
- Exposé via `favorites$` (Observable de `Set<number>`)

### `OrderService`

Toute la logique commande :
- `getOrCreateOpenOrder(tableId, customerId)` → appelle la RPC Supabase
- `getOpenOrderForTable(tableId)` → lecture directe au chargement de la page
- `addItemsToOrder(orderId, lines)` → insère les articles avec `item_status = 'confirmed'` (le trigger recalcule `total_amount` automatiquement)
- `markAsPaid(orderId)` → passe `payment_status = 'paid'`
- `subscribeToOrder(orderId, onItemsChange, onOrderChange)` → Supabase Realtime, retourne une fonction de désinscription
- `notifyItemServed(deviceId, menuName)` → appelle `POST /notify-served` sur le backend

### `StripeService`

Paiement via `@capacitor-community/stripe` (PaymentSheet natif) :
- `pay(amountCents)` → appelle `POST /payment-sheet`, crée et présente le PaymentSheet
- Retourne `'completed' | 'cancelled' | 'failed'`
- `GooglePayIsTesting: true` à passer à `false` en production avec les clés live

### `ThemeService`

Thème clair/sombre :
- Persisté en `localStorage` (clé `lux_theme`)
- Applique/retire la classe `.theme-light` sur `document.body`
- Initialisé au démarrage via `AppComponent` (injection dans le constructeur)

### `DeviceService`

ID unique et persistant par appareil :
- Stocké en `localStorage` (clé `device_Id`)
- Généré une seule fois via `crypto.randomUUID()`
- Utilisé comme clé dans Firestore pour retrouver le token FCM

### `FcmService`

Notifications push :
- Ignoré sur le web (`Capacitor.getPlatform() === 'web'`)
- Enregistre les listeners puis demande la permission
- Sauvegarde le token FCM dans Firestore (`devices/{deviceId}`)

---

## 7. Pages et navigation

```
/landing          → saisie/scan QR code
/login            → connexion / inscription / invité
/tabs
  /tabs/menu      → menu + favoris + panier
  /tabs/order     → commande en cours + paiement
  /tabs/settings  → thème, profil, historique, déconnexion
/order-history    → historique des commandes (compte requis)
```

### Landing

- Mode scan par défaut (utilise `@capacitor-mlkit/barcode-scanning`)
- Fallback saisie manuelle
- Lit `?table=N` dans l'URL pour les deep links / tests
- Installe le module Google Barcode Scanner au premier scan si absent (écoute `googleBarcodeScannerModuleInstallProgress` avant de lancer le scan)

### Login

- Mode `login` / `signup` basculable
- Option "Continuer sans compte" → redirige directement vers `/tabs/menu`

### Menu

- Navigation par catégories (rail horizontal sticky)
- **Section "Vos favoris"** tout en haut si l'utilisateur est connecté et a au moins un favori — chip "♥ Favoris" dans le rail de navigation
- Bouton ♥/♡ sur chaque plat, visible uniquement si connecté — `event.stopPropagation()` empêche l'ajout au panier lors du toggle favori
- Barre de panier flottante en or dès qu'un article est ajouté
- Redirige vers `/tabs/order` au clic sur la barre

### Order

- **Section "Déjà commandé"** : articles en base avec leur `item_status` (badge coloré)
- **Section "Nouveaux articles"** : panier local avec `+`/`-`
- **Bouton "Passer commande"** : visible uniquement si panier non vide → crée ou réutilise la commande ouverte de la table
- **Bouton "Payer"** : visible uniquement quand tous les articles sont `served`
- Mise à jour temps réel via Supabase Realtime
- Détecte les passages à `served` pour déclencher une notification push

### Order History (`/order-history`)

- Accessible depuis Settings (compte connecté uniquement)
- Liste toutes les commandes du client triées par date décroissante
- Résumé par commande : date formatée + montant total
- Dropdown au clic → charge et affiche le détail des articles à la demande (lazy loading)

### Settings

- Toggle thème clair/sombre (persistant)
- Si invité : proposition de se connecter
- Si connecté :
  - Modification nom / email / mot de passe via popups natives (`AlertController`)
  - Bouton "Voir l'historique" → navigue vers `/order-history`
  - Déconnexion

---

## 8. Backend Express (`server.js`)

Tourne sur le port 4000 (configurable via `PORT`).

| Endpoint | Méthode | Rôle |
|---|---|---|
| `/payment-sheet` | POST | Crée customer + ephemeralKey + PaymentIntent Stripe |
| `/notify-purchase` | POST | Notif push après paiement (`deviceId`) |
| `/notify-served` | POST | Notif push quand un plat est servi (`deviceId`, `menuName`) |
| `/notify-custom` | POST | Notif manuelle depuis le dashboard |
| `/dashboard` | GET | Interface HTML de test des notifications |

### Helper interne `getFcmToken(deviceId)`

Factorise la lecture du token FCM depuis Firestore. Utilisé par tous les endpoints de notification.

### Lancer en local

```bash
cd server
node server.js
```

### Déploiement

Déployé sur Render (`https://ynovb3-smart-cafe.onrender.com`). L'URL est référencée dans `environment.ts` → `apiUrl`.

---

## 9. Notifications push (Firebase FCM)

### Flux

1. Au démarrage de l'app native, `FcmService.initPush()` demande la permission
2. Le token FCM est sauvegardé dans Firestore : `devices/{deviceId}.fcmToken`
3. Quand un `order_item` passe à `served` via Realtime, `order.page.ts` compare l'ancien et le nouvel état et appelle `orderService.notifyItemServed()`
4. Le backend lit le token FCM dans Firestore et envoie la notif via Firebase Admin SDK

### Configuration Android requise

Dans `android/app/google-services.json` : fichier de configuration Firebase (à télécharger depuis la console Firebase → Project Settings → Android app).

### Note importante

La collection Firestore utilisée est `'devices'` (pluriel) — cohérent entre `FcmService` (écriture) et `server.js` (lecture). Toute modification de ce nom doit être faite dans les deux fichiers simultanément.

---

## 10. Paiement Stripe

### Flux

```
order.page.ts
  → stripe.service.ts : pay(amountCents)
    → POST /payment-sheet (server.js)
      → Stripe API : customer + ephemeralKey + PaymentIntent
    → Stripe.createPaymentSheet() + presentPaymentSheet()
      → PaymentSheet natif (carte / Google Pay)
  → si 'completed' : orderService.markAsPaid(orderId)
```

### Clés

- `pk_test_...` / `sk_test_...` en développement
- `GooglePayIsTesting: true` en dev → **à passer à `false` en production avec les clés `pk_live_...` / `sk_live_...`**

### Limitation connue

`markAsPaid()` est appelé côté client après confirmation du PaymentSheet. Sans webhook Stripe côté serveur, un crash de l'app juste après paiement laisserait la commande en `unpaid` malgré le paiement réel. À corriger en production via un webhook `payment_intent.succeeded`.

---

## 11. Scan QR code

Plugin utilisé : `@capacitor-mlkit/barcode-scanning`

### Format du QR code

```
https://ynovb-3-smart-cafe.vercel.app/landing?table=N
```

Le paramètre `table` est un `int` correspondant à `table_number` dans `restaurant_tables`.

### Comportement

1. Demande de permission caméra
2. Vérification que le module Google Barcode Scanner est disponible → si absent, écoute `googleBarcodeScannerModuleInstallProgress` et attend `state === 'completed'` avant de lancer le scan
3. Scan → extraction du `?table=N` de l'URL → vérification en base

### Limitations

- Ne fonctionne pas sur le navigateur web → utiliser la saisie manuelle ou l'URL directe `?table=N`
- Nécessite Google Play Services sur l'appareil Android

---

## 12. Thème et design tokens

Tous les tokens sont dans `src/theme/variables.scss`. **Aucune couleur ne doit être codée en dur dans les fichiers `.scss` des pages.**

### Palette

| Variable | Valeur (sombre) | Usage |
|---|---|---|
| `--lux-night` | `#0B1410` | Fond principal |
| `--lux-night-soft` | `#161613` | Surfaces (toolbar, tab bar) |
| `--lux-stone` | `#3A3835` | Bordures, séparateurs |
| `--lux-ivory` | `#F7F4EE` | Texte principal |
| `--lux-ivory-dim` | `#C9C4B8` | Texte secondaire |
| `--lux-gold` | `#C9A769` | Accents, prix, CTAs |
| `--lux-bordeaux` | `#6B1E23` | Erreurs, favoris actifs, déconnexion |

Le thème clair redéfinit ces variables sur `body.theme-light`. Le `ThemeService` applique/retire cette classe.

### Règle absolue

Ne jamais écrire de valeur hexadécimale ou `rgba()` directement dans un fichier `.scss` de page. En cas d'ajout d'une nouvelle couleur, l'ajouter d'abord dans `variables.scss` (thème sombre ET thème clair), puis l'utiliser via la variable.

---

## 13. Deep linking Android

### Objectif

Qu'un scan de QR code ouvre directement l'app installée plutôt que le navigateur Chrome.

### Fichiers configurés

| Fichier | Rôle |
|---|---|
| `public/.well-known/assetlinks.json` | Prouve la propriété du domaine à Android |
| `android/app/src/main/AndroidManifest.xml` | Déclare le domaine dans l'`<intent-filter>` |
| `capacitor.config.ts` | Indique à Capacitor le hostname de production |

### `assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "io.ionic.starter",
    "sha256_cert_fingerprints": ["57:BA:FF:70:60:0A:0F:5B:BB:3D:8E:EF:97:BB:45:13:C6:16:7F:50:7A:C5:B8:69:06:F6:E6:15:89:75:77:26"]
  }
}]
```

> Le SHA-256 correspond à la clé de debug. En production, utiliser la clé de release.

---

## 14. Déploiement

### App web (Vercel)

- **Repo** : `Smart-Cafe` sur GitHub
- **Root Directory** : `restaurant-app`
- **Build Command** : `npm run build`
- **Output Directory** : `www`
- **URL** : `https://ynovb-3-smart-cafe.vercel.app`

Vercel redéploie automatiquement à chaque push sur la branche principale.

### Backend (Render)

- **Dossier** : `server/`
- **Start Command** : `node server.js`
- **URL** : `https://ynovb3-smart-cafe.onrender.com`
- **Variables d'environnement à configurer sur Render** :
  - `STRIPE_SECRET_KEY`
  - `PORT` (optionnel, Render l'injecte automatiquement)
  - `serviceAccountKey.json` → Secret File sur Render

### Build Android natif

```bash
ionic build
npx cap sync android
npx cap run android
```

---

## 15. Commandes utiles

```bash
# Développement web
ionic serve

# Build + sync + déploiement Android
ionic build && npx cap sync android && npx cap run android

# Vérifier la clé de signature Android (debug)
cd android && gradlew signingReport

# Vérifier assetlinks.json en prod
curl https://ynovb-3-smart-cafe.vercel.app/.well-known/assetlinks.json

# Réinitialiser la base de données Supabase
# → Exécuter supabase/schema.sql dans l'éditeur SQL Supabase

# Lancer le backend en local
cd server && node server.js

# Dashboard notifications push (backend local)
http://localhost:4000/dashboard
```

---

## 16. Points d'attention et dette technique

### Critique (à corriger avant mise en production réelle)

| Point | Impact | Solution |
|---|---|---|
| `markAsPaid()` côté client | Paiement réel sans mise à jour DB si l'app crash | Implémenter un webhook Stripe `payment_intent.succeeded` côté serveur |
| `applicationId = "io.ionic.starter"` | ID générique, à changer avant publication Play Store | Mettre à jour dans `android/app/build.gradle` + `assetlinks.json` |
| SHA-256 debug dans `assetlinks.json` | Deep linking cassé sur une release signée | Regénérer avec la clé de release à la publication |
| `GooglePayIsTesting: true` | Paiements Google Pay fictifs en production | Passer à `false` avec les clés `pk_live_` / `sk_live_` |
