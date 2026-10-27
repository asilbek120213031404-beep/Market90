import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Profile } from "../data/products";
import {
  User,
  Mail,
  Shield,
  Crown,
  Users,
  Package,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

/* ─── Role badge config ─── */
const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  ega: {
    label: "Ega",
    color: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    icon: <Crown size={13} />,
  },
  pro_admin: {
    label: "Pro Admin",
    color: "bg-purple-100 text-purple-700 border border-purple-200",
    icon: <Shield size={13} />,
  },
  admin: {
    label: "Admin",
    color: "bg-blue-100 text-blue-700 border border-blue-200",
    icon: <Shield size={13} />,
  },
  mehmon: {
    label: "Mehmon",
    color: "bg-gray-100 text-gray-600 border border-gray-200",
    icon: <User size={13} />,
  },
};

/* ─── Tahrirlash statistikasi ─── */
interface AdminStat {
  profile: Profile;
  editCount: number;
  lastEdited: { name: string; updated_at: string }[];
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

/* ─── Admin Card (faqat ega uchun) ─── */
const AdminCard = ({
  stat,
  isDark,
  index,
}: {
  stat: AdminStat;
  isDark: boolean;
  index: number;
}) => {
  const role = ROLE_CONFIG[stat.profile.role] ?? ROLE_CONFIG.admin;
  const avatarInitials = stat.profile.full_name.slice(0, 2).toUpperCase();

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-4
        ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0
            ${
              index % 4 === 0
                ? "bg-blue-500"
                : index % 4 === 1
                ? "bg-purple-500"
                : index % 4 === 2
                ? "bg-emerald-500"
                : "bg-orange-500"
            }`}
        >
          {avatarInitials}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold text-sm truncate ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {stat.profile.full_name}
          </p>
          <p
            className={`text-xs truncate ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {stat.profile.email ?? "—"}
          </p>
        </div>

        {/* Role badge */}
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${role.color}`}
        >
          {role.icon}
          {role.label}
        </span>
      </div>

      {/* Edit count */}
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl
          ${isDark ? "bg-gray-700/60" : "bg-gray-50"}`}
      >
        <Package size={16} className="text-blue-500 shrink-0" />
        <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Tahrirlangan mahsulotlar:
        </span>
        <span
          className={`ml-auto font-bold text-sm ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {stat.editCount} ta
        </span>
      </div>

      {/* Last 5 edited */}
      {stat.lastEdited.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <p
            className={`flex items-center gap-1.5 text-xs font-semibold mb-0.5 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <Clock size={12} /> Oxirgi tahrirlangan mahsulotlar
          </p>
          {stat.lastEdited.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs
                ${isDark ? "bg-gray-700/40" : "bg-gray-50"}`}
            >
              <span
                className={`truncate font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {item.name}
              </span>
              <span
                className={`shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {formatDate(item.updated_at)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p
          className={`text-xs text-center py-2 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Hali hech narsa tahrirlanmagan
        </p>
      )}
    </div>
  );
};

/* ─── PROFILE PAGE ─── */
const ProfilePage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStat[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ─── Profilni yuklash ─── */
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      const { data, error: sbError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at, updated_at")
        .eq("id", user.id)
        .single();

      if (sbError) {
        setError(sbError.message);
      } else {
        setProfile(data as Profile);
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  /* ─── Adminlar statistikasini yuklash (faqat ega uchun) ─── */
  useEffect(() => {
    if (!profile || profile.role !== "ega") return;

    const fetchAdminStats = async () => {
      setLoadingAdmins(true);

      // Barcha adminlarni olish (ega o'zini ham ko'rsin)
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at, updated_at")
        .in("role", ["admin", "pro_admin", "ega"]);

      if (profilesError || !allProfiles) {
        setLoadingAdmins(false);
        return;
      }

      // Har bir admin uchun tahrirlash statistikasini olish
      const stats: AdminStat[] = await Promise.all(
        (allProfiles as Profile[]).map(async (p) => {
          // Tahrirlangan mahsulotlar soni
          const { count } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("updated_by", p.id);

          // Oxirgi 5 ta tahrirlagan mahsulot
          const { data: lastProducts } = await supabase
            .from("products")
            .select("name, updated_at")
            .eq("updated_by", p.id)
            .order("updated_at", { ascending: false })
            .limit(5);

          return {
            profile: p,
            editCount: count ?? 0,
            lastEdited: (lastProducts ?? []) as {
              name: string;
              updated_at: string;
            }[],
          };
        })
      );

      // Eng ko'p tahrirlagan tepada
      stats.sort((a, b) => b.editCount - a.editCount);
      setAdminStats(stats);
      setLoadingAdmins(false);
    };

    fetchAdminStats();
  }, [profile]);

  /* ─── Loading ─── */
  if (authLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertTriangle size={48} className="text-red-400" />
        <p className="text-red-400 font-semibold">Profil yuklanmadi</p>
        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {error ?? "Profil topilmadi"}
        </p>
      </div>
    );
  }

  const role = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.mehmon;
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials = profile.full_name.slice(0, 2).toUpperCase();

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Profile Card ── */}
      <div
        className={`rounded-3xl border overflow-hidden mb-8
          ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-md"}`}
      >
        {/* Top accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
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

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <h1
                className={`text-2xl font-extrabold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {profile.full_name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full w-fit mx-auto sm:mx-0 ${role.color}`}
              >
                {role.icon}
                {role.label}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Email */}
              <div
                className={`flex items-center gap-2 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <Mail size={15} className="text-blue-500 shrink-0" />
                {profile.email ?? user?.email ?? "—"}
              </div>

              {/* Role detail */}
              <div
                className={`flex items-center gap-2 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <Shield size={15} className="text-indigo-500 shrink-0" />
                <span>
                  Rol:{" "}
                  <span className="font-semibold">{role.label}</span>
                </span>
              </div>

              {/* Joined date */}
              <div
                className={`flex items-center gap-2 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Clock size={15} className="text-gray-400 shrink-0" />
                Qo'shilgan: {formatDate(profile.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Adminlar ro'yxati (faqat ega) ── */}
      {profile.role === "ega" && (
        <div>
          <h2
            className={`flex items-center gap-2 text-lg font-extrabold mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <Users size={20} className="text-blue-500" />
            Adminlar faoliyati
          </h2>

          {loadingAdmins ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border p-5 animate-pulse
                    ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl shrink-0 ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div
                        className={`h-4 w-36 rounded ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-3 w-48 rounded ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      />
                    </div>
                  </div>
                  <div
                    className={`h-10 rounded-xl ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  />
                </div>
              ))}
            </div>
          ) : adminStats.length === 0 ? (
            <div
              className={`text-center py-12 rounded-2xl border ${
                isDark
                  ? "border-gray-700 text-gray-500"
                  : "border-gray-100 text-gray-400"
              }`}
            >
              Adminlar topilmadi
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {adminStats.map((stat, i) => (
                <AdminCard
                  key={stat.profile.id}
                  stat={stat}
                  isDark={isDark}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
