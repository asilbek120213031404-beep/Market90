import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Sun, Moon, Menu, X, Users, Tag } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { can } from "../lib/roles";
import { NAV_ITEMS } from "./header/navItems";
import ManageUsersModal from "./header/ManageUsersModal";
import ManageCategoriesModal from "./header/ManageCategoriesModal";
import UserMenu, { type UserInfo } from "./header/UserMenu";
import MobileMenu from "./header/MobileMenu";

/* ─── HEADER ─── */
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [manageModal, setManageModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isDark = theme === "dark";
  const canManageUsers = can.manageUsers(role);
  const isEga = role === "ega";
  const visibleLinks = NAV_ITEMS.filter((link) => role && link.roles.includes(role));

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    navigate("/login");
  };

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Foydalanuvchi";
  const info: UserInfo = {
    avatarUrl: user?.user_metadata?.avatar_url as string | undefined,
    displayName,
    initials: displayName.slice(0, 2).toUpperCase(),
    email: user?.email,
  };

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 shadow-lg backdrop-blur-md transition-colors duration-300
          ${isDark ? "bg-gray-900/95 border-b border-gray-700" : "bg-blue-700/92 border-b border-blue-600"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="text-white text-2xl font-extrabold tracking-widest select-none hover:opacity-90 transition-opacity"
            >
              MARKET
              <span className={isDark ? "text-blue-400" : "text-blue-200"}>90</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {visibleLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 text-white text-sm font-medium transition-all duration-200 hover:text-blue-200
                    ${isActive ? "border-b-2 border-blue-200 pb-0.5" : ""}`
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}

              {/* Kategoriyalar — faqat ega */}
              {isEga && (
                <button
                  id="manage-categories-button"
                  onClick={() => setCategoryModal(true)}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all
                    ${isDark
                      ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-600/40"
                      : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                    }`}
                >
                  <Tag size={15} />
                  Kategoriyalar
                </button>
              )}

              {canManageUsers && (
                <button
                  id="manage-users-button"
                  onClick={() => setManageModal(true)}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all
                    ${isDark
                      ? "bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 border border-blue-600/40"
                      : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                    }`}
                >
                  <Users size={15} />
                  Foydalanuvchilar
                </button>
              )}

              <button
                id="theme-toggle"
                onClick={toggleTheme}
                aria-label="Mavzuni almashtirish"
                title={isDark ? "Light mode" : "Dark mode"}
                className="text-white hover:text-blue-200 transition-colors duration-200 cursor-pointer"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <UserMenu info={info} isDark={isDark} onSignOut={handleSignOut} />
            </nav>

            {/* Mobile: theme toggle + hamburger */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Mavzuni almashtirish"
                className="text-white hover:text-blue-200 transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                id="mobile-menu-toggle"
                onClick={() => setMenuOpen((o) => !o)}
                className="text-white hover:text-blue-200 transition-colors"
                aria-label="Menyu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        <MobileMenu
          open={menuOpen}
          isDark={isDark}
          links={visibleLinks}
          canManageUsers={canManageUsers}
          info={info}
          onClose={() => setMenuOpen(false)}
          onManageUsers={() => setManageModal(true)}
          onSignOut={handleSignOut}
        />
      </header>

      {manageModal && <ManageUsersModal isDark={isDark} onClose={() => setManageModal(false)} />}
      {categoryModal && <ManageCategoriesModal isDark={isDark} onClose={() => setCategoryModal(false)} />}
    </>
  );
};

export default Header;
