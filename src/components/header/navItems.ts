import { ShoppingBag, PackagePlus, ClipboardEdit, User, type LucideIcon } from "lucide-react";
import type { UserRole } from "../../data/products";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: readonly UserRole[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/products", label: "Mahsulotlar", icon: ShoppingBag, roles: ["ega", "pro_admin", "admin", "mehmon"] },
  { to: "/add-product", label: "Mahsulot qo'shish", icon: PackagePlus, roles: ["ega", "pro_admin"] },
  { to: "/edited", label: "Tahrirlanganlar", icon: ClipboardEdit, roles: ["ega", "pro_admin", "admin"] },
  { to: "/profile", label: "Profil", icon: User, roles: ["ega", "pro_admin", "admin", "mehmon"] },
];
