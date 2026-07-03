# Documentation Fonctionnelle — Lux Café

## Table des matières

1. [Contexte & enjeux](#1-contexte--enjeux)
2. [Objectifs du projet](#2-objectifs-du-projet)
3. [Périmètre des livrables](#4-périmètre-des-livrables)
4. [Personas](#4-personas)
5. [User stories](#5-user-stories)
6. [Parcours utilisateurs](#6-parcours-utilisateurs)
7. [Fonctionnalités détaillées](#7-fonctionnalités-détaillées)
8. [Règles métier](#8-règles-métier)
9. [Accessibilité & UX](#9-accessibilité--ux)
10. [Modèle de données fonctionnel](#10-modèle-de-données-fonctionnel)
11. [Sécurité fonctionnelle](#11-sécurité-fonctionnelle)
12. [Glossaire](#12-glossaire)

---

## 1. Contexte & enjeux

### 1.1 Le retard numérique de la restauration française

La transformation numérique du secteur de la restauration est une réalité mondiale. Des pays comme les **États-Unis, le Japon ou la Corée du Sud** ont largement intégré des technologies innovantes dans leurs établissements : commandes via tablette, bornes interactives, paiement sans contact, gestion en temps réel des commandes.

En France, de nombreux établissements restent en retard sur ces pratiques, malgré une clientèle de plus en plus connectée et des attentes de plus en plus élevées en termes de fluidité et de personnalisation du service.

### 1.2 Le projet Lux Café

Dans une stratégie de diversification inspirée des grandes maisons de luxe françaises (Dior, Louis Vuitton), une marque de luxe a décidé d'ouvrir un **café-restaurant haut de gamme** : le **Lux Café**.

L'objectif est d'offrir une **expérience lifestyle immersive**, où gastronomie, élégance et technologie se rencontrent. La marque souhaite se démarquer en proposant une expérience **100 % connectée, fluide et innovante**, à la hauteur des attentes d'une clientèle exigeante, mobile et habituée aux services personnalisés.

### 1.3 La réponse technologique

Le projet Lux Café se concrétise par un **écosystème digital complet** composé de deux applications complémentaires :

- Une **application mobile** (iOS & Android) permettant aux clients de commander depuis leur table
- Une **application web d'administration** permettant au staff de gérer l'établissement en temps réel

Ces deux applications communiquent via une **base de données commune** (Supabase), garantissant une synchronisation instantanée entre la salle et la cuisine.

---

## 2. Objectifs du projet

| Objectif | Description |
|---|---|
| Expérience client premium | Parcours de commande fluide, sans friction, depuis la table |
| Efficacité opérationnelle | Suivi des commandes en temps réel pour le staff |
| Différenciation digitale | Technologie au service de l'image de marque luxe |
| Scalabilité | Architecture capable de s'adapter à plusieurs établissements |
| Sécurité | Protection des données clients et des opérations |

---

## 3. Périmètre des livrables

### 3.1 Application web — Gestion (Lux Café Admin)

Interface destinée exclusivement au **personnel de l'établissement** (staff, gérant). Elle permet de superviser et gérer l'ensemble des opérations du café en temps réel.

### 3.2 Application mobile — Commande client

Application destinée aux **clients du café**, accessible via scan d'un QR code présent sur la table. Elle permet de consulter le menu et passer commande.

---

## 4. Personas

### 4.1 Le Client — "Sophie"

> *"Je veux commander sans avoir à attendre un serveur, mais je veux quand même me sentir dans un établissement haut de gamme."*

- **Âge** : 34 ans
- **Profil** : Cadre supérieure, habituée des établissements de luxe
- **Comportement** : Mobile-first, impatiente, exigeante sur la qualité
- **Attentes** :
  - Commander rapidement depuis son smartphone
  - Suivre l'avancement de sa commande
  - Payer sans friction
  - Interface élégante, à la hauteur du lieu

---

### 4.2 Le Serveur — "Marc"

> *"J'ai besoin de savoir en un coup d'œil ce qui est prêt, ce qui est en cours et ce qui arrive de nouveau."*

- **Âge** : 28 ans
- **Profil** : Serveur expérimenté, à l'aise avec les outils numériques
- **Comportement** : Travaille debout, souvent en déplacement, consulte l'app sur tablette ou smartphone
- **Attentes** :
  - Vue claire et instantanée des commandes
  - Pouvoir marquer un plat comme servi
  - Être alerté des nouvelles commandes sans rechargement
  - Interface rapide, sans complexité inutile

---

### 4.3 Le Chef / Cuisinier — "Antoine"

> *"Je veux savoir exactement ce que j'ai à préparer et dans quel ordre."*

- **Âge** : 42 ans
- **Profil** : Chef de cuisine, peu à l'aise avec la technologie
- **Comportement** : Consulte l'app depuis un écran fixe en cuisine
- **Attentes** :
  - Liste claire des articles à préparer
  - Pouvoir cocher les plats au fur et à mesure
  - Passage automatique à "Prêt" quand tout est fait
  - Interface simple, lisible à distance

---

### 4.4 Le Gérant — "Isabelle"

> *"Je veux avoir une vue d'ensemble sur les performances de mon établissement."*

- **Âge** : 51 ans
- **Profil** : Directrice de l'établissement, orientée business
- **Comportement** : Consulte les tableaux de bord depuis son bureau sur desktop
- **Attentes** :
  - Revenus du jour en temps réel
  - Historique des commandes filtrables
  - Gestion du menu et des prix
  - Vue sur les articles les plus commandés

---

## 5. User Stories

### 5.1 Client (application mobile)

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| C01 | Client | Scanner le QR code de ma table | Accéder au menu sans télécharger d'application |
| C02 | Client | Consulter le menu par catégorie | Trouver facilement ce qui m'intéresse |
| C03 | Client | Voir la description et le prix de chaque plat | Faire mon choix en connaissance de cause |
| C04 | Client | Ajouter des articles à mon panier | Composer ma commande librement |
| C05 | Client | Ajouter une note sur un article | Préciser mes préférences (sans gluten, etc.) |
| C06 | Client | Passer ma commande | Envoyer ma commande en cuisine |
| C07 | Client | Ajouter des articles après avoir commandé | Commander un dessert ou une boisson en cours de repas |
| C08 | Client | Suivre le statut de mes articles | Savoir ce qui est en préparation, prêt ou servi |
| C09 | Client | Créer un compte | Sauvegarder mes favoris et retrouver mes commandes |
| C10 | Client | Ajouter des plats en favoris | Retrouver rapidement mes plats préférés |
| C11 | Client | Payer ma commande | Régler l'addition depuis mon téléphone |

---

### 5.2 Staff (application web admin)

| ID | En tant que | Je veux | Afin de |
|---|---|---|---|
| S01 | Staff | Me connecter avec mes identifiants | Accéder à l'interface de gestion sécurisée |
| S02 | Staff | Voir les nouvelles commandes en temps réel | Ne manquer aucune commande arrivante |
| S03 | Staff | Voir les articles par statut (nouveau, en cours, prêt) | Savoir quoi faire en priorité |
| S04 | Staff | Passer un article en "En préparation" | Informer le client que son plat est en cours |
| S05 | Staff | Cocher les articles au fur et à mesure | Suivre la progression en cuisine |
| S06 | Staff | Marquer un article comme servi | Mettre à jour le statut visible par le client |
| S07 | Staff | Annuler un article avec confirmation | Éviter les erreurs accidentelles |
| S08 | Staff | Gérer le menu (ajout, modification, suppression) | Maintenir la carte à jour |
| S09 | Staff | Activer/désactiver un article | Retirer temporairement un plat sans le supprimer |
| S10 | Staff | Réordonner les articles et catégories par drag & drop | Contrôler l'ordre d'affichage sur l'app client |
| S11 | Staff | Gérer les tables et générer les QR codes | Configurer les tables de l'établissement |
| S12 | Staff | Consulter l'historique des commandes | Retrouver une commande passée |
| S13 | Staff | Filtrer l'historique par date et statut de paiement | Analyser les données de vente |
| S14 | Staff | Voir les KPIs du jour sur le dashboard | Avoir une vue d'ensemble rapide |
| S15 | Staff | Voir le graphique des revenus sur 7 jours | Suivre les tendances |
| S16 | Staff | Voir les articles les plus commandés | Identifier les best-sellers |
| S17 | Staff | Consulter la liste des clients enregistrés | Connaître sa base clientèle |
| S18 | Staff | Me déconnecter | Sécuriser l'accès à l'interface |

---

## 6. Parcours utilisateurs

### 6.1 Parcours client — De l'arrivée à la table au paiement

```
1. ARRIVÉE À TABLE
   Le client s'installe et scanne le QR code présent sur la table
                    ↓
2. ACCÈS AU MENU
   L'app s'ouvre sur le menu du Lux Café (page /landing?table=X)
   Navigation par catégories, consultation des plats
                    ↓
3. COMPOSITION DU PANIER
   Ajout d'articles, personnalisation (notes), consultation du total
                    ↓
4. VALIDATION DE LA COMMANDE
   Connexion optionnelle (compte client) ou commande anonyme
   Envoi de la commande → statut "Confirmé"
                    ↓
5. SUIVI EN TEMPS RÉEL
   Le client voit le statut de chaque article évoluer :
   Confirmé → En préparation → Prêt → Servi
                    ↓
6. COMMANDE SUPPLÉMENTAIRE (optionnel)
   Le client peut ajouter de nouveaux articles à tout moment
   Ils s'ajoutent à la commande ouverte de sa table
                    ↓
7. PAIEMENT
   Le client paie depuis l'app via Stripe
   La commande passe en statut "Payée"
```

---

### 6.2 Parcours staff — Gestion d'une commande

```
1. CONNEXION
   Le staff se connecte sur l'interface web admin (email/mot de passe)
                    ↓
2. TABLEAU DE BORD KANBAN
   Vue temps réel des commandes actives en 3 colonnes :
   Nouvelles | En cours | Prêtes à servir
                    ↓
3. NOUVELLE COMMANDE REÇUE
   Une carte apparaît automatiquement dans "Nouvelles"
   Le staff voit la table, l'heure et les articles commandés
                    ↓
4. PRISE EN CHARGE
   Le staff clique "Préparer" sur chaque article
   L'article passe dans la colonne "En cours"
                    ↓
5. PRÉPARATION EN CUISINE
   Le cuisinier coche les articles au fur et à mesure
   Une barre de progression s'affiche
   Quand tous les articles sont cochés → passe automatiquement à "Prêt"
                    ↓
6. SERVICE
   Le serveur voit l'article dans "Prêtes à servir"
   Il apporte le plat et clique "Servi"
   L'article disparaît du kanban
```

---

### 6.3 Parcours gérant — Gestion du menu

```
1. Accès à la page Menu
2. Consultation des catégories (pills) et articles (grille)
3. Réorganisation par drag & drop si nécessaire
4. Ajout d'un nouvel article → remplissage du formulaire
5. Modification d'un article existant → édition inline
6. Désactivation temporaire d'un article (toggle disponibilité)
7. Suppression avec confirmation si nécessaire
```

---

## 7. Fonctionnalités détaillées

### 7.1 Application web admin

#### Dashboard
- Affichage des **KPIs du jour** : revenus totaux, nombre de commandes, tables actives, tables configurées
- **Graphique de revenus** sur les 7 derniers jours (courbe)
- **Top 5 des articles** les plus commandés sur la semaine (barres horizontales)
- Rafraîchissement automatique toutes les 30 secondes

#### Commandes (Kanban)
- Vue en **3 colonnes** représentant les statuts actifs des articles
- **Mise à jour en temps réel** sans rechargement de page (Supabase Realtime)
- Chaque carte affiche : numéro de table, heure, liste des articles avec statut individuel
- **Boutons d'action** par article pour faire progresser le statut
- **Checkboxes** en mode préparation avec barre de progression
- **Passage automatique à "Prêt"** quand tous les articles d'une commande sont cochés
- **Dialog de confirmation** obligatoire avant toute annulation
- **Indicateur de connexion** Realtime (point vert/gris dans la sidebar)

#### Menu
- **Filtrage** par catégorie via pills cliquables
- **Réordonnancement** des catégories et articles par glisser-déposer
- **CRUD complet** sur les articles (ajout, modification, suppression)
- **Toggle de disponibilité** dans le formulaire d'édition
- **Compteur d'articles** par catégorie
- **Validation des doublons** : nom unique par article et par catégorie
- **Limites de caractères** : nom (100 car.), description (300 car.) avec compteur visuel
- Création et édition des **catégories** directement depuis la page menu

#### Tables
- **CRUD complet** sur les tables (numéro, libellé, capacité)
- **Toggle actif/inactif** par table
- **Génération de QR code** unique par table pointant vers l'URL client
- **Téléchargement du QR code** en PNG pour impression

#### Historique
- **Filtres** : période (du/au), statut de paiement
- **Total encaissé** calculé sur la sélection filtrée
- **Détail dépliable** pour chaque commande (articles, notes, montants)

#### Clients
- Liste de tous les **comptes clients enregistrés**
- **Recherche** par nom ou email en temps réel

---

### 7.2 Application mobile client

#### Accès
- Via **scan QR code** sur la table → URL `https://lux-cafe.vercel.app/landing?table=X`
- Détection automatique du numéro de table
- Pas de téléchargement requis (PWA compatible)

#### Menu
- Navigation par **catégories**
- Affichage du **nom, description et prix** de chaque article
- Indicateur de **disponibilité**
- Gestion des **favoris** (compte requis)

#### Commande
- Ajout au **panier** avec quantité et note personnalisée
- Passage de commande en **un tap**
- Possibilité d'ajouter des articles **après la commande initiale**
- **Suivi en temps réel** du statut de chaque article

#### Compte client
- **Inscription/connexion** par email/mot de passe
- Historique des commandes
- Gestion des favoris

#### Paiement
- Intégration **Stripe** pour le paiement sécurisé
- Règlement depuis l'application sans intervention du serveur

---

## 8. Règles métier

### Commandes

| Règle | Description |
|---|---|
| RG01 | Une seule commande ouverte (non payée) peut exister par table à la fois |
| RG02 | Un client peut ajouter des articles à une commande ouverte existante |
| RG03 | Le total d'une commande est recalculé automatiquement à chaque modification d'article |
| RG04 | Les articles annulés ne sont pas comptabilisés dans le total |
| RG05 | Une commande ne peut pas être supprimée, seulement annulée article par article |

### Statuts des articles

```
pending → confirmed → preparing → ready → served
                ↓
            cancelled (depuis n'importe quel statut actif)
```

| Statut | Déclencheur | Visible dans |
|---|---|---|
| `pending` | Article ajouté au panier (non encore commandé) | App client |
| `confirmed` | Commande validée par le client | Kanban — colonne "Nouvelles" |
| `preparing` | Staff clique "Préparer" | Kanban — colonne "En cours" |
| `ready` | Tous les articles cochés OU staff clique "Prêt" | Kanban — colonne "Prêtes à servir" |
| `served` | Staff clique "Servi" | Disparaît du kanban |
| `cancelled` | Staff annule avec confirmation | Disparaît du kanban |

### Menu

| Règle | Description |
|---|---|
| RG06 | Deux articles ne peuvent pas avoir le même nom |
| RG07 | Deux catégories ne peuvent pas avoir le même nom |
| RG08 | Un article désactivé n'est pas visible sur l'app client |
| RG09 | La suppression d'une catégorie ne supprime pas ses articles (ils perdent leur catégorie) |
| RG10 | Le nom d'un article est limité à 100 caractères |
| RG11 | La description d'un article est limitée à 300 caractères |

### Tables

| Règle | Description |
|---|---|
| RG12 | Le numéro de table est unique et ne peut pas être modifié après création |
| RG13 | Une table désactivée n'accepte plus de nouvelles commandes |
| RG14 | Chaque table a un QR code unique pointant vers son numéro |

### Sécurité

| Règle | Description |
|---|---|
| RG15 | L'accès à l'interface admin est réservé aux utilisateurs authentifiés |
| RG16 | Toute route `/dashboard/*` redirige vers `/login` si non authentifié |
| RG17 | Un client ne peut voir que ses propres commandes |

---

## 9. Accessibilité & UX

### Accessibilité (normes WCAG)

- Tous les éléments interactifs ont un **attribut `aria-label`** explicite
- La navigation est **entièrement utilisable au clavier** (Tab, Entrée, Échap)
- Les liens de navigation indiquent la **page active** (`aria-current="page"`)
- Les images décoratives sont masquées aux lecteurs d'écran (`aria-hidden="true"`)
- Le **focus visible** est toujours apparent (outline doré sur les éléments actifs)
- Les rôles ARIA sont utilisés (`role="main"`, `role="navigation"`, `role="alert"`)

### Feedbacks utilisateur

| Situation | Feedback |
|---|---|
| Action en cours | Toast "chargement..." + spinner sur le bouton |
| Action réussie | Toast vert avec message de confirmation |
| Erreur | Toast rouge avec message explicite |
| Action destructive | Dialog de confirmation obligatoire |
| Données en chargement | Skeletons animés à la place du contenu |
| Mise à jour optimiste | L'UI se met à jour immédiatement, avant la réponse du serveur |
| Annulation d'une commande | Confirmation + retour arrière automatique si erreur réseau |

### Responsive Design

| Support | Adaptation |
|---|---|
| Desktop (≥ 768px) | Sidebar latérale fixe, grille 3 colonnes |
| Tablette (768px) | Sidebar réduite, grille 2 colonnes |
| Mobile (< 768px) | Navigation en bas de page (bottom nav), colonne unique |

---

## 10. Modèle de données fonctionnel

### Entités principales

**Catégorie** — Regroupe les articles du menu par famille (Entrées, Plats, Desserts…)

**Article** — Plat ou boisson proposé à la carte, avec son nom, sa description, son prix et sa disponibilité

**Table** — Table physique du restaurant, identifiée par un numéro unique et associée à un QR code

**Compte client** — Profil d'un client enregistré, lié à son compte d'authentification

**Commande** — Session de commande d'une table, regroupant tous les articles commandés lors d'un même service. Une table ne peut avoir qu'une seule commande ouverte à la fois.

**Article de commande** — Ligne de commande correspondant à un article spécifique avec sa quantité, son prix au moment de la commande et son statut de préparation individuel

**Favori** — Association entre un compte client et un article du menu

### Relations

```
Catégorie ──< Article
Table ──< Commande ──< Article de commande >── Article
Compte client ──< Commande
Compte client ──< Favori >── Article
```

---

## 11. Sécurité fonctionnelle

### Authentification

L'accès à l'interface admin est protégé par un système d'authentification email/mot de passe géré par Supabase Auth. La session est maintenue via des cookies sécurisés et vérifiée à chaque navigation.

### Autorisation

Les droits d'accès aux données sont gérés au niveau de la base de données via le système **Row Level Security (RLS)** de PostgreSQL. Chaque opération (lecture, écriture, suppression) est soumise à une politique d'accès définie selon le rôle de l'utilisateur.

| Rôle | Droits |
|---|---|
| Anonyme | Lecture du menu et des tables uniquement |
| Client authentifié | Lecture/création de ses commandes, gestion de son compte et favoris |
| Staff authentifié | Accès complet à toutes les commandes, CRUD sur le menu, les tables et les catégories |

### Protection des routes

Un proxy (middleware Next.js) intercepte toutes les requêtes vers `/dashboard/*` et vérifie la présence d'une session active. En l'absence de session, l'utilisateur est redirigé vers la page de connexion.

---

## 12. Glossaire

| Terme | Définition |
|---|---|
| **Kanban** | Tableau de bord visuel organisant les commandes par colonnes selon leur statut |
| **QR code** | Code-barres bidimensionnel scannable permettant d'accéder à l'app client depuis une table |
| **Realtime** | Technologie permettant la mise à jour automatique de l'interface sans rechargement de page |
| **RLS** | Row Level Security — mécanisme de sécurité PostgreSQL définissant qui peut accéder à quelles données |
| **Stripe** | Plateforme de paiement en ligne intégrée pour le règlement des additions |
| **Staff** | Personnel de l'établissement utilisant l'interface web admin |
| **Item status** | Statut individuel d'un article de commande (confirmé, en préparation, prêt, servi, annulé) |
| **Optimistic update** | Technique UX qui met à jour l'interface immédiatement, avant la confirmation du serveur |
| **Skeleton** | Placeholder animé affiché pendant le chargement des données |
| **Toast** | Notification temporaire apparaissant en superposition pour informer l'utilisateur |
| **Drag & drop** | Interaction permettant de réordonner des éléments par glisser-déposer |
| **PWA** | Progressive Web App — application web installable fonctionnant comme une app native |
