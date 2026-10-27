import type { UserRole } from "../data/products";

export const ROLE_LABELS: Record<UserRole, string> = {
  ega: "Ega",
  pro_admin: "Pro Admin",
  admin: "Admin",
  mehmon: "Mehmon",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ega: "bg-yellow-100 text-yellow-700",
  pro_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  mehmon: "bg-gray-100 text-gray-600",
};

/** Ruxsatlar — interfeys uchun. Server tomonida RLS (supabase/rls.sql) majburlaydi. */
export const can = {
  seeCost: (r: UserRole | null) => r === "ega" || r === "pro_admin" || r === "admin",
  addProduct: (r: UserRole | null) => r === "ega" || r === "pro_admin",
  editProduct: (r: UserRole | null) => r === "ega" || r === "pro_admin",
  manageUsers: (r: UserRole | null) => r === "ega",
};
