import { createContext, useContext, useEffect, useRef, useState } from "react";
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  loading: true,
  signInWithGoogle: async () => { },
  signOut: async () => { },
});

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
        .select("id, full_name, email, role, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("[Auth] Profil yuklash xatosi:", error.message);
      }

      // Agar trigger ishlamagan bo'lsa, fallback: app tomondan yaratamiz
      if (!data && userMeta) {
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            full_name: userMeta.full_name ?? null,
            email: userMeta.email ?? null,
            role: "mehmon",
          }, { onConflict: "id" })
          .select("id, full_name, email, role, created_at, updated_at")
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
    const redirectTo = `${window.location.origin}/products`;
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

  console.log(user)

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
