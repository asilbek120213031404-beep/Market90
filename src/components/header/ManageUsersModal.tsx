import { useState } from "react";
import { Users, Loader2, AlertTriangle, Check, ChevronDown, RefreshCw, X } from "lucide-react";
import { useUsers, useUpdateUserRole } from "../../hooks/useUsers";
import { ROLE_COLORS, ROLE_LABELS } from "../../lib/roles";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../data/products";

type Toast = { type: "success" | "error"; msg: string };

const ROLE_OPTIONS: UserRole[] = ["mehmon", "admin", "pro_admin"];


/* ─── Foydalanuvchilarni boshqarish modali (faqat ega) ─── */
const ManageUsersModal = ({ isDark, onClose }: { isDark: boolean; onClose: () => void }) => {
  const { user: currentUser } = useAuth();
  const { data: allUsers = [], isPending, isFetching, error, refetch } = useUsers();
  // Ro'yxatda eganing o'zi ko'rinmasin
  const users = allUsers.filter((u) => u.id !== currentUser?.id);
  const updateRole = useUpdateUserRole();
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = (userId: string, role: UserRole) =>
    updateRole.mutate(
      { userId, role },
      {
        onSuccess: () => showToast({ type: "success", msg: "Rol muvaffaqiyatli yangilandi!" }),
        onError: (e) => showToast({ type: "error", msg: `Xatolik: ${e.message}` }),
      }
    );

  const updatingId = updateRole.isPending ? updateRole.variables?.userId : null;

  const iconBtn = `p-1.5 rounded-xl transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
    }`;

  const selectCls = `w-full px-3 py-2 rounded-xl text-sm outline-none border transition-all cursor-pointer
    ${isDark
      ? "bg-gray-900 text-white border-gray-700 focus:border-blue-500"
      : "bg-gray-50 text-gray-800 border-gray-200 focus:border-blue-500"
    }`;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-users-title"
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]
        ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}
      >
        <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 shrink-0" />

        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <h2
            id="manage-users-title"
            className={`text-lg font-extrabold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            <Users size={20} className="text-blue-500" />
            Foydalanuvchilarni boshqarish
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} title="Yangilash" className={iconBtn}>
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
            </button>
            <button onClick={onClose} title="Yopish" className={iconBtn}>
              <X size={18} />
            </button>
          </div>
        </div>

        {toast && (
          <div
            className={`mx-6 mb-3 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0
            ${toast.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
          >
            {toast.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
            {toast.msg}
          </div>
        )}

        <div className="overflow-y-auto px-6 pb-6 flex flex-col gap-3">
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
            users.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors
                  ${isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-100"}`}
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
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        aria-label={`${u.full_name} roli`}
                        className={`${selectCls} w-32 pr-7 appearance-none`}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsersModal;
