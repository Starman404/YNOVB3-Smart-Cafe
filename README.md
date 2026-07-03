# ☕ Lux Café — Écosystème Digital

> *L'élégance du service, la précision du code.*

Projet "Fil Rouge" réalisé dans le cadre du programme **B3 développement** — Défi technique basé sur un cas réel de digitalisation de la restauration de luxe française.

---

## 📖 Contexte

Dans une stratégie de diversification inspirée des grandes maisons comme **Dior** ou **Louis Vuitton**, une marque de luxe française a décidé d'ouvrir un café-restaurant haut de gamme : le **Lux Café**.

Face au retard numérique du secteur de la restauration en France — contrairement aux États-Unis, au Japon ou à la Corée du Sud — la marque souhaite proposer une expérience **100 % connectée, fluide et innovante**, à la hauteur d'une clientèle exigeante et mobile.

---

## 🏗️ L'écosystème

Le projet se compose de **deux applications complémentaires** communicant via une base de données commune :

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   Application Mobile    │         │   Application Web Admin │
│   (Client / Commande)   │         │   (Staff / Gestion)     │
│   Ionic + Capacitor     │         │   Next.js 16            │
│   iOS & Android         │         │   cafe-admin/           │
└────────────┬────────────┘         └────────────┬────────────┘
             │                                    │
             └──────────────┬─────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │         Supabase          │
              │  PostgreSQL + Auth        │
              │  Realtime + Storage       │
              └───────────────────────────┘
```

### Application mobile — `restaurant-app/`
Destinée aux **clients du café**. Accessible via scan du QR code présent sur la table.
- Consulter le menu par catégorie
- Passer commande et ajouter des articles en cours de repas
- Suivre le statut de sa commande en temps réel
- Gérer ses favoris et son compte
- Payer via Stripe

### Application web admin — `cafe-admin/`
Destinée au **personnel de l'établissement** (serveurs, cuisine, gérant).
- Kanban des commandes en temps réel
- Gestion du menu (articles, catégories, drag & drop)
- Gestion des tables et génération des QR codes
- Historique et analytics des ventes
- Consultation des comptes clients

---

## 📁 Structure du dépôt

```
lux-cafe/
├── restaurant-app/          # Application mobile (Ionic Capacitor)
│   ├── docs/
│   │   └── README.md        # Doc fonctionenelle de l'application mobile
│   ├── src/
│   │   ├── app/             # Pages et composants Ionic
│   │   ├── services/        # Services Angular/Ionic
│   │   └── environments/    # Config par environnement
│   ├── android/             # Projet Android natif
│   ├── ios/                 # Projet iOS natif
│   └── capacitor.config.ts
│
├── cafe-admin/              # Application web admin (Next.js)
│   ├── docs/
│   │   └── README.md        # Doc fonctionenelle de l'application web
│   ├── src/
│   │   ├── app/             # Pages Next.js (App Router)
│   │   ├── components/      # Composants UI et features
│   │   ├── services/        # Couche d'accès aux données
│   │   ├── hooks/           # Custom hooks React Query
│   │   ├── types/           # Types TypeScript
│   │   └── lib/             # Utilitaires et config Supabase
│   └── proxy.js             # Middleware auth Next.js 16
│
├── server/                  # Server Backend (Lien Render)
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── audits/                  # Audits réalisé
│   ├── lighthpuse/          # Audits lighthouse
│   └── Wave.png             # Audit WAVE
│
├── docs/                    # Documentation du projet
│   └── FUNCTIONAL.md        # Documentation fonctionnelle
│
└── supabase.sql             # SQL de supabase complet

```

---

## 📚 Documentation

| Document | Description | Lien |
|---|---|---|
| 📋 Documentation fonctionnelle | Contexte, personas, user stories, parcours utilisateurs, règles métier | [`docs/FUNCTIONAL.md`](./docs/FUNCTIONAL.md) |
| 🔧 Documentation technique App Web | Stack, architecture, BDD, services, hooks, conventions | [`docs/TECHNICAL.md`](./cafe-admin/docs/README.md) |
| 🔧 Documentation technique App Mobile | Stack, architecture, BDD, services, pages, server backend | [`docs/TECHNICAL.md`](./restaurant-app/docs/README.md) |
| 🗄️ Base de données | Script SQL d'initialisation complet | [`docs/init.sql`](./docs/init.sql) |

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm 9+
- Compte [Supabase](https://supabase.com)
- (Mobile) Android Studio ou Xcode

### 1. Base de données

```bash
# Dans Supabase SQL Editor, exécuter le script d'initialisation
# docs/init.sql
```

### 2. Application web admin

```bash
cd cafe-admin
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

npm run dev
# → http://localhost:3000
```

### 3. Application mobile

```bash
cd restaurant-app
npm install
ionic serve
# → http://localhost:8100

# Android
npx cap sync android
npx cap open android

# iOS
npx cap sync ios
npx cap open ios
```

---

## 🔑 Variables d'environnement

### `cafe-admin/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_CLIENT_APP_URL=https://ynovb-3-smart-cafe.vercel.app
```

> Les clés sont disponibles dans **Supabase → Settings → API**

---

## 🛠️ Stack technique

| | Application web | Application mobile |
|---|---|---|
| **Framework** | Next.js 16 | Ionic + Capacitor |
| **Langage** | TypeScript | TypeScript |
| **Style** | Tailwind CSS v4 + shadcn/ui | SCSS + Design tokens luxe |
| **BDD** | Supabase (PostgreSQL) | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth | Supabase Auth |
| **Temps réel** | Supabase Realtime | Supabase Realtime |
| **Paiement** | — | Stripe |
| **Data fetching** | TanStack React Query | — |
| **Drag & drop** | dnd-kit | — |
| **Graphiques** | Recharts | — |
| **QR Code** | qrcode | MLKit Barcode Scanning |

---

## 🌿 Conventions Git

Le projet suit la convention **Conventional Commits** :

```bash
feat(orders): add realtime kanban board
fix(auth): redirect unauthenticated users to login
chore: install shadcn/ui components
docs: add technical documentation
perf: add optimistic updates on order mutations
refactor(menu): extract category logic to service layer
```

| Préfixe | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Maintenance (deps, config) |
| `docs` | Documentation |
| `perf` | Performance |
| `refactor` | Refactoring |
| `style` | CSS / design |


---

## 📄 Licence

Projet académique — tous droits réservés.