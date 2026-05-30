alter table public.products
add column if not exists ai_metadata jsonb not null default '{}'::jsonb;
