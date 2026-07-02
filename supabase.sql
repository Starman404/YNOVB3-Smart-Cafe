-- =============================================
-- LUX CAFÉ — Script d'initialisation complet
-- À exécuter une seule fois à la création du projet
-- =============================================


-- =============================================
-- RESET COMPLET
-- =============================================

drop table if exists favorites cascade;
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists menu_items cascade;
drop table if exists categories cascade;
drop table if exists restaurant_tables cascade;
drop table if exists accounts cascade;

drop type if exists item_status cascade;
drop type if exists payment_status cascade;

drop function if exists get_or_create_open_order(bigint, uuid) cascade;
drop function if exists recalculate_order_total() cascade;
drop function if exists update_updated_at() cascade;


-- =============================================
-- CATÉGORIES & MENU
-- =============================================

create table categories (
  category_id bigint generated always as identity primary key,
  category_name varchar(50) not null,
  category_sort int
);

create table menu_items (
  menu_id bigint generated always as identity primary key,
  menu_name varchar(100) not null,
  menu_description varchar(300),
  category_id bigint references categories(category_id) on delete set null,
  price decimal(10,2) not null,
  menu_sort int,
  is_available boolean default true
);


-- =============================================
-- COMPTES CLIENTS
-- =============================================

create table accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  user_name varchar(50) not null,
  user_email varchar(100),
  created_at timestamptz default now()
);


-- =============================================
-- TABLES DU RESTAURANT
-- =============================================

create table restaurant_tables (
  table_id bigint generated always as identity primary key,
  table_number int not null unique,
  table_label varchar(50),
  capacity int default 2,
  is_active boolean default true
);


-- =============================================
-- COMMANDES
-- =============================================

create type item_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'cancelled'
);

create type payment_status as enum (
  'unpaid',
  'pending',
  'paid',
  'refunded',
  'failed'
);

create table orders (
  order_id uuid primary key default gen_random_uuid(),
  table_id bigint references restaurant_tables(table_id) on delete set null,
  customer_id uuid references accounts(user_id) on delete set null,
  payment_status payment_status default 'unpaid',
  stripe_payment_intent_id varchar(200),
  total_amount decimal(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_items (
  order_item_id bigint generated always as identity primary key,
  order_id uuid references orders(order_id) on delete cascade,
  menu_id bigint references menu_items(menu_id) on delete set null,
  menu_name varchar(100) not null,
  unit_price decimal(10,2) not null,
  quantity int not null default 1 check (quantity > 0),
  item_note varchar(300),
  item_status item_status default 'pending',
  created_at timestamptz default now()
);

-- Une seule commande ouverte (non payée) par table à la fois
create unique index one_open_order_per_table
  on orders (table_id)
  where payment_status != 'paid';


-- =============================================
-- FAVORIS
-- =============================================

create table favorites (
  favorite_id bigint generated always as identity primary key,
  user_id uuid references accounts(user_id) on delete cascade,
  menu_id bigint references menu_items(menu_id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, menu_id)
);


-- =============================================
-- FONCTIONS & TRIGGERS
-- =============================================

-- Mise à jour automatique de updated_at sur orders
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- Recalcule le total d'une commande après chaque modification d'articles
create or replace function recalculate_order_total()
returns trigger as $$
begin
  update orders
  set total_amount = (
    select coalesce(sum(unit_price * quantity), 0)
    from order_items
    where order_id = coalesce(new.order_id, old.order_id)
      and item_status != 'cancelled'
  )
  where order_id = coalesce(new.order_id, old.order_id);
  return new;
end;
$$ language plpgsql;

create trigger order_items_total_sync
  after insert or update or delete on order_items
  for each row execute function recalculate_order_total();

-- Trouve la commande ouverte d'une table ou en crée une (anti race condition)
create or replace function get_or_create_open_order(
  p_table_id bigint,
  p_customer_id uuid
)
returns orders
language plpgsql
as $$
declare
  v_order orders;
begin
  select * into v_order
  from orders
  where table_id = p_table_id
    and payment_status != 'paid'
  limit 1;

  if v_order.order_id is not null then
    return v_order;
  end if;

  insert into orders (table_id, customer_id, payment_status, total_amount)
  values (p_table_id, p_customer_id, 'unpaid', 0)
  returning * into v_order;

  return v_order;
exception
  when unique_violation then
    select * into v_order
    from orders
    where table_id = p_table_id
      and payment_status != 'paid'
    limit 1;
    return v_order;
end;
$$;


-- =============================================
-- INDEXES
-- =============================================

create index idx_orders_table    on orders(table_id);
create index idx_orders_customer on orders(customer_id);
create index idx_orders_payment  on orders(payment_status);
create index idx_order_items_order  on order_items(order_id);
create index idx_order_items_status on order_items(item_status);
create index idx_menu_items_category on menu_items(category_id);
create index idx_favorites_user  on favorites(user_id);


-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table categories         enable row level security;
alter table menu_items         enable row level security;
alter table accounts           enable row level security;
alter table restaurant_tables  enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table favorites          enable row level security;

-- Lecture publique du menu et des tables
create policy "public can read categories"
  on categories for select using (true);

create policy "public can read menu items"
  on menu_items for select using (true);

create policy "public can read restaurant tables"
  on restaurant_tables for select using (true);

-- Comptes : chacun gère uniquement le sien
create policy "users can read own account"
  on accounts for select
  using (auth.uid() = user_id);

create policy "users can insert own account"
  on accounts for insert
  with check (auth.uid() = user_id);

create policy "users can update own account"
  on accounts for update
  using (auth.uid() = user_id);

-- Commandes : accès ouvert (UUID non énumérable = sécurité par obscurité)
create policy "anyone can read orders"
  on orders for select using (true);

create policy "anyone can insert orders"
  on orders for insert with check (true);

create policy "anyone can update orders"
  on orders for update using (true) with check (true);

-- Articles de commande
create policy "anyone can read order items"
  on order_items for select using (true);

create policy "anyone can insert order items"
  on order_items for insert with check (true);

create policy "anyone can update order items"
  on order_items for update using (true) with check (true);

-- Favoris : chacun gère les siens
create policy "users can manage own favorites"
  on favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Staff : CRUD complet sur le menu, catégories, tables, comptes
create policy "staff can read all accounts"
  on accounts for select using (true);

create policy "staff can insert categories"
  on categories for insert with check (true);

create policy "staff can update categories"
  on categories for update using (true) with check (true);

create policy "staff can delete categories"
  on categories for delete using (true);

create policy "staff can insert menu items"
  on menu_items for insert with check (true);

create policy "staff can update menu items"
  on menu_items for update using (true) with check (true);

create policy "staff can delete menu items"
  on menu_items for delete using (true);

create policy "staff can insert tables"
  on restaurant_tables for insert with check (true);

create policy "staff can update tables"
  on restaurant_tables for update using (true) with check (true);

create policy "staff can delete tables"
  on restaurant_tables for delete using (true);


-- =============================================
-- GRANTS
-- =============================================

grant usage on schema public to anon, authenticated;

grant select                       on public.categories          to anon, authenticated;
grant select                       on public.menu_items           to anon, authenticated;
grant select                       on public.restaurant_tables    to anon, authenticated;
grant select, insert, update       on public.accounts             to authenticated;
grant select, insert, update       on public.orders               to anon, authenticated;
grant select, insert, update       on public.order_items          to anon, authenticated;
grant select, insert, delete       on public.favorites            to authenticated;
grant insert, update, delete       on public.categories           to authenticated;
grant insert, update, delete       on public.menu_items           to authenticated;
grant insert, update, delete       on public.restaurant_tables    to authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on function get_or_create_open_order(bigint, uuid) to anon, authenticated;


-- =============================================
-- REALTIME
-- =============================================

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;


-- =============================================
-- DONNÉES INITIALES — Tables
-- =============================================

insert into restaurant_tables (table_number, table_label, capacity, is_active) values
  (1,  'Table 1',              2, true),
  (2,  'Table 2',              2, true),
  (3,  'Table 3 — Terrasse',   4, true),
  (4,  'Table 4 — Terrasse',   4, true),
  (5,  'Table 5 — Salon privé',8, true);


-- =============================================
-- DONNÉES INITIALES — Catégories
-- =============================================

insert into categories (category_name, category_sort) values
  ('Entrées',  1),
  ('Plats',    2),
  ('Fromages', 3),
  ('Desserts', 4),
  ('Boissons', 5);


-- =============================================
-- DONNÉES INITIALES — Menu
-- =============================================

-- Entrées (category_id = 1)
insert into menu_items (menu_name, menu_description, category_id, price, menu_sort, is_available) values
  ('Velouté de châtaignes',   'Crème fraîche, copeaux de truffe',                               1, 14.50, 1, true),
  ('Tartare de Saint-Jacques', 'Agrumes, huile d''olive de Nyons, caviar d''aquitaine',          1, 22.00, 2, true),
  ('Foie gras mi-cuit',        'Chutney de figues, brioche toastée',                             1, 24.00, 3, true);

-- Plats (category_id = 2)
insert into menu_items (menu_name, menu_description, category_id, price, menu_sort, is_available) values
  ('Filet de bœuf Rossini',      'Foie gras poêlé, sauce Périgueux, pommes grenailles',         2, 42.00, 1, true),
  ('Bar de ligne rôti',           'Fenouil confit, beurre blanc au champagne',                   2, 38.00, 2, true),
  ('Risotto aux truffes noires',  'Parmesan 24 mois, huile de truffe',                           2, 34.00, 3, true),
  ('Suprême de volaille fermière','Jus aux morilles, purée de panais',                           2, 32.00, 4, true);

-- Fromages (category_id = 3)
insert into menu_items (menu_name, menu_description, category_id, price, menu_sort, is_available) values
  ('Plateau de fromages affinés', 'Sélection du jour, pain aux noix',                           3, 16.00, 1, true);

-- Desserts (category_id = 4)
insert into menu_items (menu_name, menu_description, category_id, price, menu_sort, is_available) values
  ('Soufflé au Grand Marnier',    'Glace vanille bourbon',                                       4, 16.00, 1, true),
  ('Tarte fine aux pommes',       'Caramel beurre salé, glace vanille',                          4, 14.00, 2, true),
  ('Sphère chocolat grand cru',   'Cœur coulant praliné, éclats de noisettes',                  4, 15.50, 3, true);

-- Boissons (category_id = 5)
insert into menu_items (menu_name, menu_description, category_id, price, menu_sort, is_available) values
  ('Eau minérale plate ou gazeuse','75cl',                                                       5,  7.00, 1, true),
  ('Verre de vin rouge',           'Sélection du sommelier',                                     5, 12.00, 2, true),
  ('Café gourmand',                'Expresso, mignardises',                                      5,  9.50, 3, true);


-- =============================================
-- DONNÉES DE JEU — Commandes fictives
-- Note : les accounts sont créés via Supabase Auth,
-- les commandes ci-dessous sont anonymes (customer_id null)
-- =============================================

-- Commande 1 : Table 1, payée (historique)
with o as (
  insert into orders (table_id, payment_status, total_amount, created_at)
  values (1, 'paid', 0, now() - interval '2 days')
  returning order_id
)
insert into order_items (order_id, menu_name, unit_price, quantity, item_status)
select
  o.order_id,
  v.menu_name,
  v.unit_price,
  v.quantity,
  'served'::item_status
from o,
(values
  ('Foie gras mi-cuit',         24.00, 2),
  ('Filet de bœuf Rossini',     42.00, 2),
  ('Soufflé au Grand Marnier',  16.00, 2),
  ('Verre de vin rouge',        12.00, 2)
) as v(menu_name, unit_price, quantity);

-- Commande 2 : Table 2, payée (historique)
with o as (
  insert into orders (table_id, payment_status, total_amount, created_at)
  values (2, 'paid', 0, now() - interval '1 day')
  returning order_id
)
insert into order_items (order_id, menu_name, unit_price, quantity, item_status)
select
  o.order_id,
  v.menu_name,
  v.unit_price,
  v.quantity,
  'served'::item_status
from o,
(values
  ('Velouté de châtaignes',      14.50, 1),
  ('Tartare de Saint-Jacques',   22.00, 1),
  ('Bar de ligne rôti',          38.00, 1),
  ('Plateau de fromages affinés',16.00, 1),
  ('Tarte fine aux pommes',      14.00, 1),
  ('Café gourmand',               9.50, 1)
) as v(menu_name, unit_price, quantity);

-- Commande 3 : Table 3, payée (historique)
with o as (
  insert into orders (table_id, payment_status, total_amount, created_at)
  values (3, 'paid', 0, now() - interval '3 hours')
  returning order_id
)
insert into order_items (order_id, menu_name, unit_price, quantity, item_status)
select
  o.order_id,
  v.menu_name,
  v.unit_price,
  v.quantity,
  'served'::item_status
from o,
(values
  ('Foie gras mi-cuit',          24.00, 4),
  ('Risotto aux truffes noires', 34.00, 2),
  ('Suprême de volaille fermière',32.00, 2),
  ('Sphère chocolat grand cru',  15.50, 4),
  ('Verre de vin rouge',         12.00, 4),
  ('Eau minérale plate ou gazeuse',7.00, 2)
) as v(menu_name, unit_price, quantity);

-- Commande 4 : Table 4, en cours (active — visible dans le kanban)
with o as (
  insert into orders (table_id, payment_status, total_amount, created_at)
  values (4, 'unpaid', 0, now() - interval '15 minutes')
  returning order_id
)
insert into order_items (order_id, menu_name, unit_price, quantity, item_status)
select
  o.order_id,
  v.menu_name,
  v.unit_price,
  v.quantity,
  v.status::item_status
from o,
(values
  ('Velouté de châtaignes',    14.50, 2, 'ready'),
  ('Filet de bœuf Rossini',    42.00, 1, 'preparing'),
  ('Bar de ligne rôti',        38.00, 1, 'preparing'),
  ('Verre de vin rouge',       12.00, 2, 'served'),
  ('Eau minérale plate ou gazeuse',7.00, 1, 'served')
) as v(menu_name, unit_price, quantity, status);

-- Commande 5 : Table 1, nouvelle commande (visible dans le kanban)
with o as (
  insert into orders (table_id, payment_status, total_amount, created_at)
  values (1, 'unpaid', 0, now() - interval '5 minutes')
  returning order_id
)
insert into order_items (order_id, menu_name, unit_price, quantity, item_status)
select
  o.order_id,
  v.menu_name,
  v.unit_price,
  v.quantity,
  'confirmed'::item_status
from o,
(values
  ('Foie gras mi-cuit',         24.00, 2),
  ('Risotto aux truffes noires',34.00, 1),
  ('Café gourmand',              9.50, 2)
) as v(menu_name, unit_price, quantity);