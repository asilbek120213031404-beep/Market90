import { useState } from "react";
import { Loader2, AlertTriangle, Check, ChevronDown, RefreshCw, Search } from "lucide-react";
import { useUsers, useUpdateUserRole } from "../../hooks/useUsers";
import { ROLE_COLORS, ROLE_LABELS } from "../../lib/roles";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import type { Profile, UserRole } from "../../data/products";
import ConfirmDialog from "../ConfirmDialog";

const ROLE_OPTIONS: UserRole[] = ["mehmon", "admin", "pro_admin", "ega"];

/* ─── Foydalanuvchilar va rollarni boshqarish (faqat ega, profil sahifasida) ─── */
const UsersPanel = ({ isDark }: { isDark: boolean }) => {
  const { user: currentUser } = useAuth();
  const { data: allUsers = [], isPending, isFetching, error, refetch } = useUsers();
  const updateRole = useUpdateUserRole();
  const { toast, showToast } = useToast();
  const [search, setSearch] = useState("");
  // Rol o'zgarishi tasdiqlanguncha shu yerda turadi
  const [pending, setPending] = useState<{ user: Profile; role: UserRole } | null>(null);

  // Ro'yxatda eganing o'zi ko'rinmasin
  const q = search.trim().toLowerCase();
  const users = allUsers.filter(
    (u) =>
      u.id !== currentUser?.id &&
      (!q || u.full_name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q))
  );

  const handleRoleChange = () => {
    if (!pending) return;
    updateRole.mutate(
      { userId: pending.user.id, role: pending.role },
      {
        onSuccess: () => showToast({ type: "success", msg: "Rol muvaffaqiyatli yangilandi!" }),
        onError: (e) => showToast({ type: "error", msg: `Xatolik: ${e.message}` }),
      }
    );
    setPending(null);
  };

  const updatingId = updateRole.isPending ? updateRole.variables?.userId : null;

  const fieldCls = `rounded-xl text-sm outline-none border transition-all
    ${isDark
      ? "bg-gray-900 text-white border-gray-700 focus:border-blue-500 placeholder-gray-500"
      : "bg-gray-50 text-gray-800 border-gray-200 focus:border-blue-500 placeholder-gray-400"
    }`;

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div
          role="status"
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2
          ${toast.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
        >
          {toast.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism yoki email bo'yicha qidirish..."
            className={`${fieldCls} w-full pl-9 pr-3 py-2.5`}
          />
        </div>
        <button
          onClick={() => refetch()}
          title="Yangilash"
          aria-label="Yangilash"
          className={`px-3 rounded-xl border transition-colors
            ${isDark ? "border-gray-700 text-gray-400 hover:bg-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-100"}`}
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <AlertTriangle size={36} className="text-red-400" />
          <p className="text-red-400 text-sm font-semibold">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      ) : users.length === 0 ? (
        <p className={`text-center py-12 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Foydalanuvchilar topilmadi
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{users.length} ta foydalanuvchi</p>
          {users.map((u) => (
            <div
              key={u.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors
                ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {u.full_name.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                  {u.full_name}
                </p>
                <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {u.email ?? "—"}
                </p>
              </div>

              <div className="relative shrink-0">
                {updatingId === u.id ? (
                  <div className="w-32 flex items-center justify-center py-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={u.role}
                      onChange={(e) => setPending({ user: u, role: e.target.value as UserRole })}
                      aria-label={`${u.full_name} roli`}
                      className={`${fieldCls} w-32 px-3 py-2 pr-7 appearance-none cursor-pointer`}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                    <span
                      className={`absolute -top-1.5 -right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full leading-none
                      ${ROLE_COLORS[u.role]}`}
                    >
                      {ROLE_LABELS[u.role].slice(0, 1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pending && (
        <ConfirmDialog
          isDark={isDark}
          danger={pending.role === "ega"}
          title="Rolni o'zgartirish"
          message={
            <>
              <b>{pending.user.full_name}</b> roli <b>{ROLE_LABELS[pending.user.role]}</b> →{" "}
              <b>{ROLE_LABELS[pending.role]}</b> ga o'zgartiriladi.
              {pending.role === "ega" && (
                <span className="block mt-2 text-red-500">
                  Diqqat: "Ega" barcha huquqlarga ega bo'ladi — foydalanuvchilar rollarini, jumladan sizniki ham,
                  o'zgartira oladi.
                </span>
              )}
            </>
          }
          confirmLabel="O'zgartirish"
          onConfirm={handleRoleChange}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
};

export default UsersPanel;
