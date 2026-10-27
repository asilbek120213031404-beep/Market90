import { NavLink } from "react-router-dom";
import { LogOut, Users } from "lucide-react";
import type { NavItem } from "./navItems";
import { Avatar, type UserInfo } from "./UserMenu";

/* ─── Mobil menyu ─── */
const MobileMenu = ({
  open,
  isDark,
  links,
  canManageUsers,
  info,
  onClose,
  onManageUsers,
  onSignOut,
}: {
  open: boolean;
  isDark: boolean;
  links: readonly NavItem[];
  canManageUsers: boolean;
  info: UserInfo;
  onClose: () => void;
  onManageUsers: () => void;
  onSignOut: () => void;
}) => (
  <div
    className={`md:hidden overflow-hidden transition-all duration-300 ${
      open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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

      {canManageUsers && (
        <button
          onClick={() => {
            onManageUsers();
            onClose();
          }}
          className="flex items-center gap-2 text-blue-200 text-sm font-semibold hover:text-white transition-colors w-fit"
        >
          <Users size={15} />
          Foydalanuvchilar
        </button>
      )}

      <div
        className={`px-4 py-3 rounded-xl border flex items-center gap-3
        ${isDark ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-blue-100"}`}
      >
        <Avatar info={info} className="w-8 h-8 rounded-full border border-white/40" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{info.displayName.split(" ")[0]}</p>
          <p className="text-white/60 text-xs truncate">{info.email}</p>
        </div>
        <button
          onClick={() => {
            onClose();
            onSignOut();
          }}
          className="text-red-400 hover:text-red-300 transition-colors"
          title="Chiqish"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  </div>
);

export default MobileMenu;
