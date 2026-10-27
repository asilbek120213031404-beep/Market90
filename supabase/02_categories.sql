-- ============================================================
-- categories jadvali
-- Supabase Dashboard -> SQL Editor da ishga tushiring
-- ============================================================

create table if not exists public.categories (
  id   serial primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Boshlangich kategoriyalar
insert into public.categories (name) values
  ('Ichimliklar'),
  ('Shirinliklar'),
  ('Shokoladlar'),
  ('Bolalar uchun'),
  ('Go''shtli mahsulotlar'),
  ('Sut mahsulotlari'),
  ('Non va unli mahsulotlar'),
  ('Mevalar va sabzavotlar'),
  ('Oziq-ovqat'),
  ('Boshqa')
on conflict (name) do nothing;

-- RLS
alter table public.categories enable row level security;

-- Barcha login bo'lgan foydalanuvchilar o'qiy oladi
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
  for select using (auth.uid() is not null);

-- Faqat ega qo'sha oladi
drop policy if exists "categories_insert" on public.categories;
create policy "categories_insert" on public.categories
  for insert with check (public.app_role() = 'ega');

-- Faqat ega o'chira oladi
drop policy if exists "categories_delete" on public.categories;
create policy "categories_delete" on public.categories
  for delete using (public.app_role() = 'ega');
