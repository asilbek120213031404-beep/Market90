import { NavLink } from "react-router-dom";
import { LogOut, Tag } from "lucide-react";
import type { NavItem } from "./navItems";
import { Avatar, type UserInfo } from "./UserMenu";

/* ─── Mobil menyu ─── */
const MobileMenu = ({
  open,
  isDark,
  links,
  canManageCategories,
  info,
  onClose,
  onManageCategories,
  onSignOut,
}: {
  open: boolean;
  isDark: boolean;
  links: readonly NavItem[];
  canManageCategories: boolean;
  info: UserInfo;
  onClose: () => void;
  onManageCategories: () => void;
  onSignOut: () => void;
}) => (
  <div
    className={`lg:hidden overflow-hidden transition-all duration-300 ${
      open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
    } ${isDark ? "bg-gray-800/97" : "bg-blue-800/95"} backdrop-blur-sm`}
  >
    <nav className="flex flex-col px-6 py-4 gap-4">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2 text-white text-sm font-medium hover:text-blue-200 transition-colors ${
              isActive ? "text-blue-200 font-bold" : ""
            }`
          }
        >
          <Icon size={15} />
          {label}
        </NavLink>
      ))}

      {canManageCategories && (
        <button
          onClick={() => {
            onManageCategories();
            onClose();
          }}
          className="flex items-center gap-2 text-emerald-200 text-sm font-semibold hover:text-white transition-colors w-fit"
        >
          <Tag size={15} />
          Kategoriyalar
        </button>
      )}

      <div
        className={`px-4 py-3 rounded-xl border flex items-center gap-3
        ${isDark ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-100"}`}
      >
        <Avatar info={info} className="w-8 h-8 rounded-full border border-white/40" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-800"}`}>
            {info.displayName.split(" ")[0]}
          </p>
          <p className={`text-xs truncate ${isDark ? "text-white/60" : "text-gray-500"}`}>{info.email}</p>
        </div>
        <button
          onClick={() => {
            onClose();
            onSignOut();
          }}
          className="text-red-400 hover:text-red-300 transition-colors"
          title="Chiqish"
          aria-label="Chiqish"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  </div>
);

export default MobileMenu;
