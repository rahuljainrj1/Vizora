create extension if not exists pgcrypto;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Vizora Fabrication Studio',
  logo_path text,
  logo_url text,
  contact_name text,
  phone text,
  email text,
  website text,
  address text,
  brand_color text not null default '#ffffff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  sku text not null,
  name text not null,
  material_type text,
  finish_color text,
  description text,
  tags text[] not null default '{}',
  ai_metadata jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, sku)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_options (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  finish_color text,
  image_id uuid references public.product_images(id) on delete set null,
  linked_product_id uuid references public.products(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalogs (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  title text not null,
  cover_title text,
  contact_snapshot jsonb not null default '{}'::jsonb,
  product_order jsonb not null default '[]'::jsonb,
  options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_sessions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  catalog_id uuid not null references public.catalogs(id) on delete cascade,
  open_count integer not null default 0,
  revisit_count integer not null default 0,
  total_time_seconds integer not null default 0,
  last_opened_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_session_visits (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.catalog_sessions(id) on delete cascade,
  visitor_key text not null,
  opened_at timestamptz not null default now(),
  last_seen_at timestamptz,
  time_spent_seconds integer not null default 0
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  catalog_id uuid references public.catalogs(id) on delete set null,
  title text not null,
  customer_name text,
  share_token text not null unique,
  open_count integer not null default 0,
  last_opened_at timestamptz,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.session_products (
  session_id uuid not null references public.sessions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (session_id, product_id)
);

create table if not exists public.session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'session_opened',
      'product_viewed',
      'product_shortlisted',
      'compare_opened',
      'note_added',
      'discussed',
      'revisit'
    )
  ),
  product_id uuid references public.products(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists categories_vendor_sort_idx on public.categories(vendor_id, sort_order);
create index if not exists products_vendor_order_idx on public.products(vendor_id, display_order);
create index if not exists products_vendor_tags_idx on public.products using gin(tags);
create index if not exists product_images_product_sort_idx on public.product_images(product_id, sort_order);
create index if not exists product_options_product_sort_idx on public.product_options(product_id, sort_order);
create index if not exists catalog_sessions_catalog_idx on public.catalog_sessions(catalog_id);
create index if not exists catalog_session_visits_session_visitor_idx on public.catalog_session_visits(session_id, visitor_key);
create index if not exists sessions_vendor_status_idx on public.sessions(vendor_id, status, updated_at);
create index if not exists sessions_share_token_idx on public.sessions(share_token);
create index if not exists session_products_session_sort_idx on public.session_products(session_id, sort_order);
create index if not exists session_events_session_created_idx on public.session_events(session_id, created_at);
create index if not exists session_events_session_type_idx on public.session_events(session_id, event_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vendors_set_updated_at on public.vendors;
create trigger vendors_set_updated_at
before update on public.vendors
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists product_options_set_updated_at on public.product_options;
create trigger product_options_set_updated_at
before update on public.product_options
for each row execute function public.set_updated_at();

drop trigger if exists catalogs_set_updated_at on public.catalogs;
create trigger catalogs_set_updated_at
before update on public.catalogs
for each row execute function public.set_updated_at();

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('catalog-assets', 'catalog-assets', true)
on conflict (id) do update set public = excluded.public;

alter table public.vendors disable row level security;
alter table public.categories disable row level security;
alter table public.products disable row level security;
alter table public.product_images disable row level security;
alter table public.product_options disable row level security;
alter table public.catalogs disable row level security;
alter table public.catalog_sessions disable row level security;
alter table public.catalog_session_visits disable row level security;
alter table public.sessions disable row level security;
alter table public.session_products disable row level security;
alter table public.session_events disable row level security;
