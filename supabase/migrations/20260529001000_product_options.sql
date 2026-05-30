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

create index if not exists product_options_product_sort_idx
on public.product_options(product_id, sort_order);

drop trigger if exists product_options_set_updated_at on public.product_options;
create trigger product_options_set_updated_at
before update on public.product_options
for each row execute function public.set_updated_at();

alter table public.product_options disable row level security;
