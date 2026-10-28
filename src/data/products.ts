import type { TableRow, ViewRow } from "../types/helpers";

export type UserRole = "ega" | "pro_admin" | "admin" | "mehmon";

export type Profile = Omit<TableRow<"profiles">, "role"> & { role: UserRole };

/** To'liq mahsulot (cost_price bilan) — faqat xodimlar uchun */
export type Product = TableRow<"products">;

/** Ro'yxatdagi mahsulot: mehmonlar uchun cost_price bo'lmaydi */
export type ProductListItem = ViewRow<"products_public"> & { cost_price?: number };

/** Formadan yuboriladigan maydonlar (updated_by/updated_at ni server to'ldiradi) */
export interface ProductFields {
  name: string;
  description: string | null;
  category: string;
  image_url: string | null;
  cost_price: number;
  selling_price: number;
  created_at: string;
}

export type HistoryAction = "insert" | "update" | "delete";

export interface ProductHistoryEntry {
  id: number;
  product_id: string;
  product_name: string;
  action: HistoryAction;
  changes: Record<string, { old: unknown; new: unknown }>;
  changed_by: string | null;
  changed_by_name: string | null;
  changed_at: string;
}

export interface AdminActivity {
  user_id: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  edit_count: number;
  last_edits: { name: string; action: HistoryAction; changed_at: string }[];
}
