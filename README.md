# MM — Mahsulotlar katalogi

React 19 + Vite + TypeScript + Tailwind 4 + Supabase.

## O'rnatish

```bash
npm install
cp .env.example .env   # Supabase URL va anon kalitni kiriting
npm run dev
```

## Rollar

| Rol | Ko'rish | Tan narxi | Qo'shish | Tahrirlash | Rollarni boshqarish |
|---|---|---|---|---|---|
| `ega` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `pro_admin` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `admin` | ✅ | ✅ | ❌ | ✅ | ❌ |
| `mehmon` | ✅ | ❌ | ❌ | ❌ | ❌ |

## Xavfsizlik

Interfeysdagi rol tekshiruvlari faqat qulaylik uchun. Haqiqiy himoya —
Supabase RLS: [`supabase/rls.sql`](supabase/rls.sql) ni SQL Editor'da ishga tushiring.

Google OAuth uchun Supabase → Authentication → URL Configuration'da
sayt manzilini **Redirect URLs** ro'yxatiga qo'shing (PKCE oqimi ishlatiladi).

## Skriptlar

- `npm run dev` — ishlab chiqish serveri
- `npm run build` — production build
- `npm run lint` — oxlint
- `npm run gen:types` — Supabase sxemasidan `src/types/database.ts` ni yaratish
  (avval `npx supabase login`)

## Tuzilma

```
src/
  types/        database.ts (Supabase sxemasi), helpers.ts
  data/         domen turlari va kategoriyalar
  lib/          supabase, queryClient, roles (ruxsatlar), format (yordamchilar)
  hooks/        useProducts, useUsers — TanStack Query
  context/      Auth, Theme
  components/
    header/     ManageUsersModal, UserMenu, MobileMenu, navItems
    edited/     EditProductForm, ProductViewRow
  pages/
```
