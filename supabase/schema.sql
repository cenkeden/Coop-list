-- Coop list: run this once in Supabase → SQL Editor.

-- Who may use the list. Add one row per family member (their sign-in email).
create table if not exists public.members (
  email text primary key,
  display_name text not null default ''
);

create table if not exists public.items (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  done boolean not null default true,      -- true = in the cart / have it, false = to buy
  ord double precision not null default 0, -- order inside an aisle
  aisle text not null default 'other',
  bought text[] not null default '{}',      -- purchase dates, YYYY-MM-DD
  updated_by text,                          -- email of whoever changed it last
  updated_at timestamptz not null default now()
);

-- Only signed-in people listed in members can read or change anything.
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.members where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

alter table public.members enable row level security;
alter table public.items enable row level security;

drop policy if exists "members can read members" on public.members;
create policy "members can read members" on public.members
  for select to authenticated using (public.is_member());

drop policy if exists "members can do everything with items" on public.items;
create policy "members can do everything with items" on public.items
  for all to authenticated using (public.is_member()) with check (public.is_member());

-- Live updates between phones.
alter table public.items replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then null; end $$;
