import type { TableRow, ViewRow } from "../types/helpers";

export type UserRole = "ega" | "pro_admin" | "admin" | "mehmon";

export type Profile = Omit<TableRow<"profiles">, "role"> & { role: UserRole };

/** To'liq mahsulot (cost_price bilan) — faqat xodimlar uchun */
export type Product = TableRow<"products">;

/** Ro'yxatdagi mahsulot: mehmonlar uchun cost_price bo'lmaydi */
export type ProductListItem = ViewRow<"products_public"> & { cost_price?: number };

export const STAFF_ROLES: readonly UserRole[] = ["ega", "pro_admin", "admin"];

export const PRODUCT_CATEGORIES = [
  "Barchasi",
  "Ichimliklar",
  "Shirinliklar",
  "Shokoladlar",
  "Bolalar uchun",
  "Go'shtli mahsulotlar",
  "Sut mahsulotlari",
  "Non va unli mahsulotlar",
  "Mevalar va sabzavotlar",
  "Oziq-ovqat",
  "Boshqa",
];

export const FORM_CATEGORIES = PRODUCT_CATEGORIES.filter((c) => c !== "Barchasi");
