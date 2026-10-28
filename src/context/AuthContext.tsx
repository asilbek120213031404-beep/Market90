import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Profile, UserRole } from "../data/products";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;       // auth + profile ikkalasi ham tugadi
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  loading: true,
  signInWithGoogle: async () => { },
  signOut: async () => { },
  refreshProfile: async () => { },
});

const PROFILE_COLUMNS = "id, full_name, email, role, created_at, updated_at";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // true bo'lib qoladi — profil ham yuklanguncha

  const lastUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string, userMeta?: { full_name?: string; email?: string }) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[Auth] Profil yuklash xatosi:", error.message);
      }

      // Agar trigger ishlamagan bo'lsa, fallback: app tomondan yaratamiz
      // (RLS faqat o'ziga va faqat 'mehmon' roli bilan ruxsat beradi — 03_improvements.sql)
      if (!data && userMeta) {
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: userMeta.full_name || userMeta.email?.split("@")[0] || "Foydalanuvchi",
            email: userMeta.email ?? null,
            role: "mehmon",
          })
          .select(PROFILE_COLUMNS)
          .maybeSingle();

        if (insertError) console.error("[Auth] Profil yaratish xatosi:", insertError.message);
        setProfile((inserted as Profile | null) ?? null);
      } else {
        setProfile((data as Profile | null) ?? null);
      }
    } catch (e) {
      console.error("[Auth] Profil yuklash xatosi:", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  /** Profil o'zgargandan keyin (masalan ism) qayta yuklash */
  const refreshProfile = useCallback(async () => {
    const uid = lastUserId.current;
    if (!uid) return;
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", uid)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    // onAuthStateChange birinchi bo'lib INITIAL_SESSION hodisasini yuboradi,
    // shuning uchun alohida getSession() chaqiruvi shart emas.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      const uid = newSession?.user?.id ?? null;
      if (uid) {
        // Token yangilanganda profilni qayta yuklamaymiz
        if (uid !== lastUserId.current) {
          lastUserId.current = uid;
          const meta = newSession?.user?.user_metadata;
          // Supabase callback ichida await qilmaslik tavsiya etiladi
          setTimeout(() => fetchProfile(uid, {
            full_name: meta?.full_name ?? meta?.name,
            email: newSession?.user?.email,
          }), 0);
        }

      } else {
        lastUserId.current = null;
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const redirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) console.error("[Auth] Google sign-in error:", error.message);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role ?? null,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
