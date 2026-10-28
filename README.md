# MM — Mahsulotlar katalogi (MARKET90)

React 19 + Vite + TypeScript + Tailwind 4 + Supabase.

## O'rnatish

```bash
npm install
cp .env.example .env   # Supabase URL va anon kalitni kiriting
npm run dev
```

### Supabase

SQL Editor'da quyidagi fayllarni **tartib bilan** ishga tushiring:

1. [`supabase/rls.sql`](supabase/rls.sql) — profil trigger'i, `app_role()`, RLS
2. [`supabase/02_categories.sql`](supabase/02_categories.sql) — kategoriyalar jadvali
3. [`supabase/03_improvements.sql`](supabase/03_improvements.sql) — kategoriya FK, o'zgarishlar tarixi,
   `admin_activity()`, rasm saqlash (Storage), Realtime, profil siyosatlari

Google OAuth uchun Supabase → Authentication → URL Configuration'da
sayt manzilini **Redirect URLs** ro'yxatiga qo'shing (PKCE oqimi ishlatiladi).

## Rollar

| Rol | Ko'rish | Tan narxi | Qo'shish | Tahrirlash / o'chirish | Tarix | Statistika | Rollar va kategoriyalar |
|---|---|---|---|---|---|---|---|
| `ega` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `pro_admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `admin` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `mehmon` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

`ega` boshqa foydalanuvchiga ham `ega` rolini bera oladi.

## Imkoniyatlar

- Qidiruv (nomi + tavsif), kategoriya, narx oralig'i, saralash — barchasi URL'da (`?q=&cat=&min=&max=&sort=&page=`)
- Sahifalash
- Rasmni URL orqali yoki fayl yuklab qo'shish (Supabase Storage, 5 MB gacha)
- Har bir mahsulot o'zgarishlari tarixi (kim, qachon, nima)
- CSV eksport/import (Excel bilan ochiladi; ID bo'yicha ommaviy yangilash)
- Ega profilida: adminlar faoliyati, statistika va foydalanuvchilar (rollar) bo'limlari
- Realtime: boshqa xodimning o'zgarishlari darhol ko'rinadi

## Xavfsizlik

Interfeysdagi rol tekshiruvlari faqat qulaylik uchun. Haqiqiy himoya — Supabase RLS.
`updated_by`/`updated_at` va o'zgarishlar tarixini server trigger'lari yozadi.

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
  data/         domen turlari
  lib/          supabase, queryClient, roles, format, storage, csv, productCsv, history
  hooks/        useProducts, useCategories, useUsers, useRealtimeSync, useToast, useEscape, useDebounce
  context/      Auth, Theme
  components/
    header/     ManageCategoriesModal, UserMenu, MobileMenu, navItems
    profile/    StatsPanel, UsersPanel (ega profilidagi bo'limlar)
    edited/     EditProductForm, ProductViewRow, ProductHistory, ImportProductsModal
    product/    useProductForm, ImageField, PriceInput, ProfitIndicator, CategorySelect
    ConfirmDialog, Pagination, ErrorBoundary
  pages/        Home, AddProduct, Edited, Profile, Login, NotFound
supabase/       SQL migratsiyalar
```
