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

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

alter table public.sessions disable row level security;
alter table public.session_products disable row level security;
alter table public.session_events disable row level security;
