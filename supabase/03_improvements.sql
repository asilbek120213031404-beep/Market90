-- ============================================================
-- 03_improvements.sql
-- rls.sql va 02_categories.sql dan KEYIN ishga tushiring.
-- Supabase Dashboard -> SQL Editor. Qayta ishga tushirish xavfsiz.
-- ============================================================

-- ============================================================
-- 1. PROFILES: o'z profilini yaratish (faqat mehmon) va ismini tahrirlash
-- ============================================================

-- Trigger ishlamay qolsa, ilova profilni o'zi yaratadi — faqat 'mehmon' roli bilan
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid() and role = 'mehmon');

-- Har kim o'z profilini (ismini) tahrirlay oladi; rolni trigger himoya qiladi
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Ega bo'lmaganlar rol, email va created_at ni o'zgartira olmaydi
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(public.app_role(), '') <> 'ega' then
    if new.role is distinct from old.role then
      raise exception 'Only ega can change roles';
    end if;
    new.email := old.email;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end $$;

-- ============================================================
-- 2. CATEGORIES: mahsulotlarga bog'lash (FK) va nomini o'zgartirish
-- ============================================================

-- Mahsulotlardagi, lekin jadvalda yo'q kategoriyalarni qo'shamiz (FK uchun shart)
insert into public.categories (name)
select distinct category from public.products where category is not null
on conflict (name) do nothing;

-- Nomi o'zgarsa mahsulotlarda ham o'zgaradi; mahsuloti bor kategoriyani o'chirib bo'lmaydi
alter table public.products drop constraint if exists products_category_fkey;
alter table public.products add constraint products_category_fkey
  foreign key (category) references public.categories (name)
  on update cascade on delete restrict;

drop policy if exists "categories_update" on public.categories;
create policy "categories_update" on public.categories
  for update using (public.app_role() = 'ega')
  with check (public.app_role() = 'ega');

-- ============================================================
-- 3. PRODUCTS: updated_by / updated_at ni server to'ldiradi
-- ============================================================

create or replace function public.products_set_meta()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_products_set_meta on public.products;
create trigger trg_products_set_meta
  before insert or update on public.products
  for each row execute function public.products_set_meta();

-- ============================================================
-- 4. PRODUCT_HISTORY: o'zgarishlar tarixi (audit log)
-- ============================================================

create table if not exists public.product_history (
  id              bigint generated always as identity primary key,
  product_id      uuid not null,              -- FK yo'q: mahsulot o'chsa ham tarix qoladi
  product_name    text not null,
  action          text not null check (action in ('insert', 'update', 'delete')),
  changes         jsonb not null default '{}', -- { "maydon": { "old": ..., "new": ... } }
  changed_by      uuid references public.profiles (id) on delete set null,
  changed_by_name text,
  changed_at      timestamptz not null default now()
);

create index if not exists product_history_product_idx on public.product_history (product_id, changed_at desc);
create index if not exists product_history_user_idx on public.product_history (changed_by, changed_at desc);

alter table public.product_history enable row level security;

-- Faqat xodimlar o'qiydi; yozishni faqat trigger qiladi (insert/update/delete policy yo'q)
drop policy if exists "product_history_select" on public.product_history;
create policy "product_history_select" on public.product_history
  for select using (public.app_role() in ('ega', 'pro_admin', 'admin'));

create or replace function public.log_product_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  diff  jsonb := '{}';
  o     jsonb;
  n     jsonb;
  k     text;
  uname text;
begin
  select full_name into uname from public.profiles where id = auth.uid();

  if tg_op = 'INSERT' then
    insert into public.product_history (product_id, product_name, action, changed_by, changed_by_name)
    values (new.id, new.name, 'insert', auth.uid(), uname);
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.product_history (product_id, product_name, action, changed_by, changed_by_name)
    values (old.id, old.name, 'delete', auth.uid(), uname);
    return old;
  end if;

  o := to_jsonb(old);
  n := to_jsonb(new);
  for k in select jsonb_object_keys(n) loop
    if k not in ('updated_at', 'updated_by') and (o -> k) is distinct from (n -> k) then
      diff := diff || jsonb_build_object(k, jsonb_build_object('old', o -> k, 'new', n -> k));
    end if;
  end loop;

  if diff <> '{}'::jsonb then
    insert into public.product_history (product_id, product_name, action, changes, changed_by, changed_by_name)
    values (new.id, new.name, 'update', diff, auth.uid(), uname);
  end if;
  return new;
end $$;

drop trigger if exists trg_log_product_change on public.products;
create trigger trg_log_product_change
  after insert or update or delete on public.products
  for each row execute function public.log_product_change();

-- Ega uchun: har bir xodimning faoliyati (o'zgarishlar soni + oxirgi 5 tasi)
create or replace function public.admin_activity()
returns table (
  user_id    uuid,
  full_name  text,
  email      text,
  role       text,
  edit_count bigint,
  last_edits jsonb
)
language sql stable security definer set search_path = public as $$
  select
    p.id,
    p.full_name::text,
    p.email::text,
    p.role::text,
    (select count(*) from public.product_history h where h.changed_by = p.id),
    coalesce((
      select jsonb_agg(x)
      from (
        select h.product_name as name, h.action, h.changed_at
        from public.product_history h
        where h.changed_by = p.id
        order by h.changed_at desc
        limit 5
      ) x
    ), '[]'::jsonb)
  from public.profiles p
  where p.role in ('ega', 'pro_admin', 'admin')
    and public.app_role() = 'ega'
  order by 5 desc;
$$;

revoke execute on function public.admin_activity() from public, anon;
grant execute on function public.admin_activity() to authenticated;

-- ============================================================
-- 5. STORAGE: mahsulot rasmlari
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_insert" on storage.objects;
create policy "product_images_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.app_role() in ('ega', 'pro_admin'));

drop policy if exists "product_images_update" on storage.objects;
create policy "product_images_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.app_role() in ('ega', 'pro_admin'));

drop policy if exists "product_images_delete" on storage.objects;
create policy "product_images_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.app_role() in ('ega', 'pro_admin'));

-- ============================================================
-- 6. REALTIME: o'zgarishlar boshqa foydalanuvchilarga darhol yetib boradi
-- ============================================================

do $$
begin
  begin
    alter publication supabase_realtime add table public.products;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.categories;
  exception when duplicate_object then null;
  end;
end $$;
