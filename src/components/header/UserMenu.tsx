import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

export interface UserInfo {
  avatarUrl?: string;
  displayName: string;
  initials: string;
  email?: string;
}

export const Avatar = ({ info, className }: { info: UserInfo; className: string }) =>
  info.avatarUrl ? (
    <img src={info.avatarUrl} alt={info.displayName} className={`${className} object-cover`} />
  ) : (
    <div className={`${className} bg-blue-400 flex items-center justify-center text-xs font-bold text-white`}>
      {info.initials}
    </div>
  );

/* ─── Desktop: avatar + dropdown ─── */
const UserMenu = ({
  info,
  isDark,
  onSignOut,
}: {
  info: UserInfo;
  isDark: boolean;
  onSignOut: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        id="user-menu-button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 hover:opacity-85 transition-opacity"
      >
        <Avatar info={info} className="w-8 h-8 rounded-full border-2 border-white/50" />
        <span className="text-white text-sm font-medium max-w-24 truncate hidden lg:block">
          {info.displayName.split(" ")[0]}
        </span>
        <ChevronDown size={14} className={`text-white/70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className={`absolute right-0 top-11 w-52 rounded-2xl shadow-xl border overflow-hidden z-50
          ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >
          <div className={`px-4 py-3 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <p className={`text-xs font-semibold truncate ${isDark ? "text-white" : "text-gray-800"}`}>
              {info.displayName}
            </p>
            <p className={`text-xs truncate mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{info.email}</p>
          </div>
          <button
            id="sign-out-button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors
              ${isDark ? "text-red-400 hover:bg-gray-700" : "text-red-500 hover:bg-red-50"}`}
          >
            <LogOut size={15} />
            Chiqish
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
