-- ============================================================
-- RLS policies: enforce roles on the SERVER side
-- Run this entire file in: Supabase Dashboard -> SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- When a new user signs up (Google OAuth etc.), this trigger
-- automatically inserts a row into public.profiles
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    'mehmon'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- STEP 2: HELPER FUNCTION (get current user role)
-- SECURITY DEFINER to avoid recursion inside profiles RLS
-- ============================================================

create or replace function public.app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- STEP 3: PROFILES RLS
-- ============================================================

alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.app_role() = 'ega');

drop policy if exists "profiles_update_ega" on public.profiles;
create policy "profiles_update_ega" on public.profiles
  for update using (public.app_role() = 'ega')
  with check (public.app_role() = 'ega');

-- Prevent non-ega users from escalating their own role
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and coalesce(public.app_role(), '') <> 'ega' then
    raise exception 'Only ega can change roles';
  end if;
  return new;
end $$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ============================================================
-- STEP 4: PRODUCTS RLS
-- ============================================================

alter table public.products enable row level security;

drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products
  for select using (public.app_role() in ('ega', 'pro_admin', 'admin'));

drop policy if exists "products_insert" on public.products;
create policy "products_insert" on public.products
  for insert with check (public.app_role() in ('ega', 'pro_admin'));

drop policy if exists "products_update" on public.products;
create policy "products_update" on public.products
  for update using (public.app_role() in ('ega', 'pro_admin'))
  with check (public.app_role() in ('ega', 'pro_admin'));

drop policy if exists "products_delete" on public.products;
create policy "products_delete" on public.products
  for delete using (public.app_role() in ('ega', 'pro_admin'));

-- ============================================================
-- STEP 5: PUBLIC VIEW (hide cost_price from guests)
-- ============================================================

drop view if exists public.products_public;
create view public.products_public as
select id, name, description, category, image_url, selling_price,
       created_at, updated_by, updated_at
from public.products
where auth.uid() is not null;

revoke all on public.products_public from anon;
grant select on public.products_public to authenticated;
