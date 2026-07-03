# Documentation Technique — Lux Café Admin

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Base de données](#4-base-de-données)
5. [Authentification & sécurité](#5-authentification--sécurité)
6. [Services](#6-services)
7. [Hooks](#7-hooks)
8. [Pages & fonctionnalités](#8-pages--fonctionnalités)
9. [Temps réel](#9-temps-réel)
10. [Conventions de code](#10-conventions-de-code)
11. [Conventions Git](#11-conventions-git)
12. [Installation & démarrage](#12-installation--démarrage)
13. [Variables d'environnement](#13-variables-denvironnement)

---

## 1. Présentation du projet

L'application **Lux Café Admin** est une interface web de gestion destinée au personnel d'un café-restaurant haut de gamme. Elle permet de superviser en temps réel les commandes, gérer le menu, les tables et consulter l'historique des ventes.

Elle fait partie d'un système plus large comprenant également une application mobile cliente (Ionic Capacitor) permettant aux clients de passer commande depuis leur table via QR code.

### Objectifs

- Suivi des commandes en temps réel (Kanban)
- Gestion complète du menu (articles, catégories, disponibilité)
- Gestion des tables et génération de QR codes
- Historique et analytics des ventes
- Consultation des comptes clients

---

## 2. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js | 16.x |
| Langage | TypeScript | 5.x |
| Style | Tailwind CSS | 4.x |
| Composants UI | shadcn/ui (preset Nova) | 4.x |
| Base de données | Supabase (PostgreSQL) | — |
| Authentification | Supabase Auth | — |
| Temps réel | Supabase Realtime | — |
| Data fetching | TanStack React Query | 5.x |
| State management | Zustand | 5.x |
| Drag & drop | dnd-kit | — |
| Graphiques | Recharts | 3.x |
| Icônes | Lucide React | — |
| Notifications | Sonner | — |
| Dates | date-fns | 4.x |
| QR Code | qrcode | — |

---

## 3. Architecture du projet

```
cafe-admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       ├── page.tsx          # Page de connexion
│   │   │       └── layout.tsx        # Titre de page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Shell dashboard (Sidebar + MobileNav)
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx          # Dashboard / Analytics
│   │   │       ├── orders/           # Gestion commandes
│   │   │       ├── menu/             # Gestion menu
│   │   │       ├── tables/           # Gestion tables
│   │   │       ├── history/          # Historique
│   │   │       └── accounts/         # Comptes clients
│   │   ├── layout.tsx                # Layout racine
│   │   ├── page.tsx                  # Redirection → /dashboard
│   │   ├── not-found.tsx             # Page 404
│   │   └── error.tsx                 # Page erreur globale
│   ├── components/
│   │   ├── ui/                       # Composants shadcn/ui
│   │   ├── shared/                   # Composants partagés
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── SortableList.tsx
│   │   │   └── RealtimeIndicator.tsx
│   │   └── features/                 # Composants métier
│   │       ├── dashboard/
│   │       ├── orders/
│   │       ├── menu/
│   │       ├── tables/
│   │       └── history/
│   ├── services/                     # Couche d'accès aux données
│   │   ├── order.service.ts
│   │   ├── menu.service.ts
│   │   ├── table.service.ts
│   │   ├── history.service.ts
│   │   ├── account.service.ts
│   │   └── analytics.service.ts
│   ├── hooks/                        # Custom hooks React Query
│   │   ├── useOrders.ts
│   │   ├── useMenu.ts
│   │   ├── useTables.ts
│   │   ├── useHistory.ts
│   │   ├── useAccounts.ts
│   │   └── useAnalytics.ts
│   ├── types/
│   │   └── database.types.ts         # Types TypeScript (miroir du schema SQL)
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts             # Client navigateur
│       │   └── server.ts             # Client serveur (SSR)
│       └── utils.ts                  # Utilitaires (cn)
├── proxy.js                          # Proxy Next.js 16 (auth middleware)
└── .env.local                        # Variables d'environnement
```

### Principes d'architecture

L'application suit une architecture en couches :

**Page → Hook → Service → Supabase**

- Les **pages** gèrent uniquement l'UI et l'état local
- Les **hooks** encapsulent la logique React Query (cache, mutations, optimistic updates)
- Les **services** sont des modules purs qui effectuent les appels Supabase
- Les **types** sont centralisés et partagés entre toutes les couches

---

## 4. Base de données

La base de données est hébergée sur **Supabase** (PostgreSQL).

### Schéma

#### `categories`
| Colonne | Type | Description |
|---|---|---|
| `category_id` | bigint (PK) | Identifiant auto-généré |
| `category_name` | varchar(50) | Nom de la catégorie |
| `category_sort` | int | Ordre d'affichage |

#### `menu_items`
| Colonne | Type | Description |
|---|---|---|
| `menu_id` | bigint (PK) | Identifiant auto-généré |
| `menu_name` | varchar(100) | Nom de l'article |
| `menu_description` | varchar(300) | Description |
| `category_id` | bigint (FK) | Référence vers `categories` |
| `price` | decimal(10,2) | Prix unitaire |
| `menu_sort` | int | Ordre d'affichage |
| `is_available` | boolean | Disponibilité |

#### `accounts`
| Colonne | Type | Description |
|---|---|---|
| `user_id` | uuid (PK) | Référence vers `auth.users` |
| `user_name` | varchar(50) | Nom d'affichage |
| `user_email` | varchar(100) | Email |
| `created_at` | timestamptz | Date de création |

#### `restaurant_tables`
| Colonne | Type | Description |
|---|---|---|
| `table_id` | bigint (PK) | Identifiant auto-généré |
| `table_number` | int (unique) | Numéro de table |
| `table_label` | varchar(50) | Libellé personnalisé |
| `capacity` | int | Capacité en couverts |
| `is_active` | boolean | Table active ou non |

#### `orders`
| Colonne | Type | Description |
|---|---|---|
| `order_id` | uuid (PK) | Identifiant unique |
| `table_id` | bigint (FK) | Référence vers `restaurant_tables` |
| `customer_id` | uuid (FK) | Référence vers `accounts` |
| `payment_status` | enum | `unpaid`, `pending`, `paid`, `refunded`, `failed` |
| `stripe_payment_intent_id` | varchar(200) | Référence paiement Stripe |
| `total_amount` | decimal(10,2) | Montant total |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Dernière mise à jour |

#### `order_items`
| Colonne | Type | Description |
|---|---|---|
| `order_item_id` | bigint (PK) | Identifiant auto-généré |
| `order_id` | uuid (FK) | Référence vers `orders` |
| `menu_id` | bigint (FK) | Référence vers `menu_items` |
| `menu_name` | varchar(100) | Nom au moment de la commande |
| `unit_price` | decimal(10,2) | Prix unitaire au moment de la commande |
| `quantity` | int | Quantité |
| `item_note` | varchar(300) | Note spécifique à l'article |
| `item_status` | enum | `pending`, `confirmed`, `preparing`, `ready`, `served`, `cancelled` |
| `created_at` | timestamptz | Date de création |

### Contrainte d'unicité

```sql
-- Une seule commande ouverte (non payée) par table à la fois
CREATE UNIQUE INDEX one_open_order_per_table
  ON orders (table_id)
  WHERE payment_status != 'paid';
```

### Row Level Security (RLS)

Toutes les tables ont le RLS activé. Les politiques sont divisées en deux niveaux :

**Accès public (anon + authenticated)**
- Lecture des `categories`, `menu_items`, `restaurant_tables`

**Accès client (authenticated)**
- Lecture et création de ses propres `orders` et `order_items`
- Lecture et modification de son propre `account`

**Accès staff (authenticated)**
- Lecture et mise à jour de toutes les `orders`
- Lecture et mise à jour de tous les `order_items`
- CRUD complet sur `menu_items`, `categories`, `restaurant_tables`
- Lecture de tous les `accounts`

---

## 5. Authentification & sécurité

### Flux d'authentification

L'authentification utilise **Supabase Auth** avec email/mot de passe.

```
Utilisateur → /login → supabase.auth.signInWithPassword()
           → Cookie de session → Proxy vérifie la session
           → /dashboard (si authentifié)
           → /login (si non authentifié)
```

### Proxy (middleware Next.js 16)

Le fichier `proxy.js` à la racine du projet intercepte toutes les requêtes vers `/dashboard/*` et `/login` pour vérifier la session Supabase et rediriger si nécessaire.

```javascript
// proxy.js
export async function proxy(request) {
  // Vérifie la session via supabase.auth.getUser()
  // Redirige vers /login si non authentifié sur /dashboard
  // Redirige vers /dashboard si déjà authentifié sur /login
}
```

### Clients Supabase

Deux clients distincts sont utilisés selon le contexte :

- `src/lib/supabase/client.ts` — client navigateur (composants `'use client'`)
- `src/lib/supabase/server.ts` — client serveur (Server Components, Server Actions)

---

## 6. Services

Chaque service respecte le **Single Responsibility Principle** : un service par domaine métier.

### `OrderService`

| Méthode | Description |
|---|---|
| `getAll()` | Récupère toutes les commandes avec leurs articles et tables |
| `updateItemStatus(id, status)` | Met à jour le statut d'un article |
| `cancelItem(id)` | Annule un article |
| `subscribeToOrders(callback)` | Souscrit aux changements temps réel |

### `MenuService`

| Méthode | Description |
|---|---|
| `getCategories()` | Récupère toutes les catégories triées |
| `getItems()` | Récupère tous les articles avec leurs catégories |
| `createCategory(name, sort)` | Crée une catégorie |
| `updateCategory(id, name, sort)` | Met à jour une catégorie |
| `deleteCategory(id)` | Supprime une catégorie |
| `createItem(item)` | Crée un article |
| `updateItem(id, updates)` | Met à jour un article |
| `deleteItem(id)` | Supprime un article |
| `toggleAvailability(id, bool)` | Active/désactive un article |
| `reorderCategories(ids)` | Réordonne les catégories |
| `reorderItems(ids)` | Réordonne les articles |

### `TableService`

| Méthode | Description |
|---|---|
| `getAll()` | Récupère toutes les tables |
| `create(table)` | Crée une table |
| `update(id, updates)` | Met à jour une table |
| `delete(id)` | Supprime une table |
| `toggleActive(id, bool)` | Active/désactive une table |

### `HistoryService`

| Méthode | Description |
|---|---|
| `getOrders(filters)` | Récupère l'historique avec filtres (date, paiement, table) |

### `AnalyticsService`

| Méthode | Description |
|---|---|
| `getDashboardStats()` | KPIs du jour (revenus, commandes, tables actives) |
| `getWeeklyRevenue()` | Revenus des 7 derniers jours |
| `getTopItems()` | Top 5 articles de la semaine |

---

## 7. Hooks

Les hooks encapsulent la logique React Query et exposent les données et mutations aux composants.

### Pattern utilisé

```typescript
// Lecture — useQuery
export function useOrders() {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: OrderService.getAll,
  })
}

// Mutation avec optimistic update
export function useUpdateItemStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderItemId, status }) =>
      OrderService.updateItemStatus(orderItemId, status),
    onMutate: async ({ orderItemId, status }) => {
      // Met à jour le cache immédiatement
    },
    onError: (_err, _vars, context) => {
      // Revient en arrière si erreur
    },
    onSettled: () => {
      // Invalide le cache pour re-fetch
    },
  })
}
```

### Clés de cache

| Hook | Query Key |
|---|---|
| `useOrders` | `['orders']` |
| `useCategories` | `['categories']` |
| `useMenuItems` | `['menu-items']` |
| `useTables` | `['tables']` |
| `useOrderHistory` | `['order-history', filters]` |
| `useAccounts` | `['accounts']` |
| `useDashboardStats` | `['dashboard-stats']` |
| `useWeeklyRevenue` | `['weekly-revenue']` |
| `useTopItems` | `['top-items']` |

---

## 8. Pages & fonctionnalités

### `/login`
- Formulaire email/mot de passe
- Validation en temps réel (bouton désactivé si champs vides)
- Toast d'erreur si identifiants incorrects
- Redirection automatique vers `/dashboard` si déjà connecté

### `/dashboard`
- KPIs du jour : revenus, nombre de commandes, tables actives, tables configurées
- Graphique de revenus sur 7 jours (AreaChart)
- Top 5 articles de la semaine (BarChart horizontal)
- Rafraîchissement automatique toutes les 30 secondes

### `/dashboard/orders`
Kanban en temps réel avec 3 colonnes :

| Colonne | Statuts affichés |
|---|---|
| Nouvelles | `confirmed` |
| En cours | `preparing` |
| Prêtes à servir | `ready` |

Chaque carte affiche les articles avec leur statut individuel. Les boutons d'action permettent de faire progresser chaque article dans le flux. Un dialog de confirmation est affiché avant toute annulation.

### `/dashboard/menu`
- Pills de catégories draggables pour réordonner
- Grille d'articles draggable pour réordonner
- Filtre par catégorie au clic sur une pill
- Création/édition/suppression d'articles via dialog
- Toggle de disponibilité dans le formulaire d'édition
- Validation des doublons (nom unique par article et par catégorie)
- Création/édition/suppression de catégories

### `/dashboard/tables`
- Grille de cartes par table
- Création/édition avec numéro, libellé et capacité
- Toggle actif/inactif
- Génération et téléchargement du QR code (PNG)

### `/dashboard/history`
- Filtres par date (du/au), statut de paiement
- Liste des commandes avec détail dépliable
- Total encaissé affiché sur la sélection filtrée

### `/dashboard/accounts`
- Liste de tous les comptes clients enregistrés
- Recherche par nom ou email en temps réel

---

## 9. Temps réel

La page des commandes est mise à jour en temps réel grâce aux **Supabase Realtime Channels**.

```typescript
// order.service.ts
subscribeToOrders(callback: () => void) {
  const supabase = createClient()
  const channel = supabase
    .channel('orders-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, callback)
    .subscribe()

  return () => supabase.removeChannel(channel)
}
```

Le hook `useOrders` souscrit au channel au montage du composant et invalide le cache React Query à chaque changement, déclenchant un re-fetch automatique.

Un indicateur visuel dans la sidebar affiche l'état de la connexion Realtime (point vert = connecté, gris = déconnecté).

---

## 10. Conventions de code

### Principes

- **SOLID** : chaque service a une seule responsabilité, les composants sont ouverts à l'extension via les props
- **DRY** : les types sont centralisés dans `database.types.ts`, les clés de cache sont exportées depuis les hooks, les composants réutilisables sont dans `shared/`
- **KISS** : logique minimale dans les composants, délégation aux services et hooks

### Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composants | PascalCase | `OrderCard.tsx` |
| Hooks | camelCase avec préfixe `use` | `useOrders.ts` |
| Services | camelCase avec suffixe `Service` | `order.service.ts` |
| Types | PascalCase | `OrderItem` |
| Constantes | SCREAMING_SNAKE_CASE | `ORDERS_QUERY_KEY` |

### Structure d'un composant

```typescript
'use client'

// 1. Imports React
// 2. Imports composants UI
// 3. Imports hooks/services
// 4. Imports types

// 5. Types/interfaces locaux
interface Props { ... }

// 6. Constantes locales
const CONFIG = { ... }

// 7. Composant
export function MyComponent({ prop }: Props) {
  // 8. Hooks
  // 9. État local
  // 10. Handlers
  // 11. JSX
}
```

---

## 11. Conventions Git

Le projet suit la convention **Conventional Commits** :

| Préfixe | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Tâches de maintenance (deps, config) |
| `perf` | Amélioration de performance |
| `refactor` | Refactoring sans changement de comportement |
| `style` | Changements de style/CSS |
| `docs` | Documentation |

### Exemples

```bash
feat(orders): add realtime kanban with per-item status management
fix(auth): fix middleware matcher to protect dashboard routes
chore: install shadcn/ui components
perf: add optimistic updates on order status change
```

### Versioning

```bash
# Taguer une version
git tag -a v1.0.0 -m "feat: first complete version of Lux Café admin app"
git push origin main --tags
```

---

## 12. Installation & démarrage

### Prérequis

- Node.js 18+
- npm 9+
- Compte Supabase avec le schema SQL appliqué

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd cafe-admin

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Remplir les valeurs dans .env.local

# Lancer en développement
npm run dev
```

### Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Compile pour la production |
| `npm run start` | Démarre le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |

---

## 13. Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# URL de l'app cliente (pour la génération des QR codes)
NEXT_PUBLIC_CLIENT_APP_URL=http://localhost:8100
```

### Obtenir les clés Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Ouvrir le projet → **Settings → API**
3. Copier **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copier **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> ⚠️ Ne jamais commiter `.env.local` dans Git. Le fichier est déjà dans `.gitignore` par défaut avec Next.js.