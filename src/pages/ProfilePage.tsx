import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { formatDate } from "../lib/format";
import { ROLE_LABELS } from "../lib/roles";
import { useAdminActivity } from "../hooks/useProducts";
import { useToast } from "../hooks/useToast";
import type { AdminActivity, UserRole } from "../data/products";
import { ACTION_LABELS } from "../lib/history";
import StatsPanel from "../components/profile/StatsPanel";
import UsersPanel from "../components/profile/UsersPanel";
import {
  User,
  Mail,
  Shield,
  Crown,
  Users,
  BarChart3,
  Activity,
  Package,
  Clock,
  AlertTriangle,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";

/* ─── Role badge config ─── */
const ROLE_BADGE: Record<UserRole, { color: string; icon: React.ReactNode }> = {
  ega: { color: "bg-yellow-100 text-yellow-700 border border-yellow-200", icon: <Crown size={13} /> },
  pro_admin: { color: "bg-purple-100 text-purple-700 border border-purple-200", icon: <Shield size={13} /> },
  admin: { color: "bg-blue-100 text-blue-700 border border-blue-200", icon: <Shield size={13} /> },
  mehmon: { color: "bg-gray-100 text-gray-600 border border-gray-200", icon: <User size={13} /> },
};

const roleBadge = (role: string) => ROLE_BADGE[role as UserRole] ?? ROLE_BADGE.mehmon;
const roleLabel = (role: string) => ROLE_LABELS[role as UserRole] ?? role;

/* ─── Ega uchun profil bo'limlari (?tab=...) ─── */
type EgaTab = "activity" | "stats" | "users";

const EGA_TABS: { key: EgaTab; label: string; icon: typeof Users }[] = [
  { key: "activity", label: "Adminlar faoliyati", icon: Activity },
  { key: "stats", label: "Statistika", icon: BarChart3 },
  { key: "users", label: "Foydalanuvchilar", icon: Users },
];

const AVATAR_COLORS =["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500"];

/* ─── Admin Card (faqat ega uchun) ─── */
const AdminCard = ({
  stat,
  isDark,
  index,
}: {
  stat: AdminActivity;
  isDark: boolean;
  index: number;
}) => {
  const badge = roleBadge(stat.role);

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-4
        ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0
            ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
        >
          {stat.full_name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
            {stat.full_name}
          </p>
          <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {stat.email ?? "—"}
          </p>
        </div>

        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
          {badge.icon}
          {roleLabel(stat.role)}
        </span>
      </div>

      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${isDark ? "bg-gray-700/60" : "bg-gray-50"}`}>
        <Package size={16} className="text-blue-500 shrink-0" />
        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Jami o'zgarishlar:
        </span>
        <span className={`ml-auto font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
          {stat.edit_count} ta
        </span>
      </div>

      {stat.last_edits.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p className={`flex items-center gap-1.5 text-xs font-semibold mb-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <Clock size={12} /> Oxirgi o'zgarishlar
          </p>
          {stat.last_edits.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs
                ${isDark ? "bg-gray-700/40" : "bg-gray-50"}`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className={`shrink-0 font-semibold px-1.5 py-0.5 rounded-full ${ACTION_LABELS[item.action].cls}`}>
                  {ACTION_LABELS[item.action].label}
                </span>
                <span className={`truncate font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  {item.name}
                </span>
              </span>
              <span className={`shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {formatDate(item.changed_at)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-xs text-center py-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          Hali hech narsa o'zgartirilmagan
        </p>
      )}
    </div>
  );
};

/* ─── PROFILE PAGE ─── */
const ProfilePage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user, profile, loading, refreshProfile } = useAuth();
  const isEga = profile?.role === "ega";
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const tab: EgaTab = EGA_TABS.some((t) => t.key === tabParam) ? (tabParam as EgaTab) : "activity";
  const activity = useAdminActivity(isEga && tab === "activity");
  const { toast, showToast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  const startEditName = () => {
    setNameDraft(profile?.full_name ?? "");
    setEditingName(true);
  };

  const saveName = async () => {
    const name = nameDraft.trim();
    if (!profile || !name) return;
    if (name === profile.full_name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", profile.id);
    if (error) {
      showToast({ type: "error", msg: `Xatolik: ${error.message}` });
    } else {
      await refreshProfile().catch(() => undefined);
      showToast({ type: "success", msg: "Ism saqlandi" });
      setEditingName(false);
    }
    setSavingName(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle size={48} className="text-red-400" />
        <p className="text-red-400 font-semibold">Profil yuklanmadi</p>
        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Profil topilmadi</p>
      </div>
    );
  }

  const badge = roleBadge(profile.role);
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials = profile.full_name.slice(0, 2).toUpperCase();

  return (
    <section className={`${isEga ? "max-w-5xl" : "max-w-3xl"} mx-auto px-4 sm:px-6 lg:px-8 py-10`}>
      {toast && (
        <div
          role="status"
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-3
            ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.type === "success" ? <Check size={17} /> : <AlertTriangle size={17} />}
          {toast.msg}
        </div>
      )}

      {/* ── Profile Card ── */}
      <div
        className={`rounded-3xl border overflow-hidden mb-8
          ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-md"}`}
      >
        <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameDraft}
                    maxLength={80}
                    aria-label="Ism"
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className={`min-w-0 flex-1 px-3 py-1.5 rounded-xl text-lg font-bold outline-none border focus:border-blue-500
                      ${isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                  />
                  <button
                    onClick={saveName}
                    disabled={savingName || !nameDraft.trim()}
                    title="Saqlash"
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                  >
                    {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    disabled={savingName}
                    title="Bekor qilish"
                    className={`p-2 rounded-xl ${isDark ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <h1 className={`flex items-center justify-center sm:justify-start gap-2 text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {profile.full_name}
                  <button
                    onClick={startEditName}
                    title="Ismni o'zgartirish"
                    aria-label="Ismni o'zgartirish"
                    className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-gray-500 hover:text-blue-400 hover:bg-gray-700" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
                  >
                    <Pencil size={15} />
                  </button>
                </h1>
              )}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full w-fit mx-auto sm:mx-0 ${badge.color}`}
              >
                {badge.icon}
                {roleLabel(profile.role)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <Mail size={15} className="text-blue-500 shrink-0" />
                {profile.email ?? user?.email ?? "—"}
              </div>
              <div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <Shield size={15} className="text-indigo-500 shrink-0" />
                <span>
                  Rol: <span className="font-semibold">{roleLabel(profile.role)}</span>
                </span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <Clock size={15} className="text-gray-400 shrink-0" />
                Qo'shilgan: {formatDate(profile.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ega bo'limlari: faoliyat, statistika, foydalanuvchilar ── */}
      {isEga && (
        <div
          role="tablist"
          aria-label="Ega bo'limlari"
          className={`flex gap-1 p-1 mb-6 rounded-2xl border overflow-x-auto
            ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}
        >
          {EGA_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setParams(key === "activity" ? {} : { tab: key }, { replace: true })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors
                ${tab === key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : isDark
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}

      {isEga && tab === "stats" && <StatsPanel isDark={isDark} />}
      {isEga && tab === "users" && <UsersPanel isDark={isDark} />}

      {isEga && tab === "activity" && (
        <div>
          {activity.isPending ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-5 animate-pulse h-36
                    ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                />
              ))}
            </div>
          ) : activity.error ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-red-400">
              <AlertTriangle size={18} /> {activity.error.message}
            </div>
          ) : !activity.data?.length ? (
            <div
              className={`text-center py-12 rounded-2xl border ${
                isDark ? "border-gray-700 text-gray-500" : "border-gray-100 text-gray-400"
              }`}
            >
              Adminlar topilmadi
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activity.data.map((stat, i) => (
                <AdminCard key={stat.user_id} stat={stat} isDark={isDark} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
