import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useRealtimeSync } from "./hooks/useRealtimeSync";
import type { UserRole } from "./data/products";

/* ─── Sahifalar alohida bo'laklarda yuklanadi (lazy loading) ─── */
const HomePage = lazy(() => import("./pages/HomePage"));
const AddProductPage = lazy(() => import("./pages/AddProductPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const EditedPage = lazy(() => import("./pages/EditedPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

/* ─── Loading spinner ─── */
const FullPageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-gray-950">
    <div className="w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

/* ─── Sahifa o'tish animatsiyasi ─── */
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
};

/* ─── Route guard: login kerak ─── */
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/* ─── Route guard: ma'lum rollar uchun ─── */
const Guard = ({
  children,
  allowed,
}: {
  children: React.ReactNode;
  allowed: UserRole[];
}) => {
  const { role, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!role || !allowed.includes(role)) return <Navigate to="/products" replace />;
  return <>{children}</>;
};

/* ─── Boshqa foydalanuvchilarning o'zgarishlarini jonli kuzatish ─── */
const RealtimeSync = () => {
  const { user } = useAuth();
  useRealtimeSync(!!user);
  return null;
};

const AppContent = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-950 text-white" : "bg-slate-50 text-gray-800"
      }`}
    >
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          {/* Login — header yo'q, auth shart emas */}
          <Route path="/login" element={<LoginPage />} />

          {/* Asosiy app — header bilan, login shart */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <>
                  <RealtimeSync />
                  <Header />
                  <PageTransition>
                    <Suspense fallback={<PageSpinner />}>
                      <Routes>
                        {/* Barcha loginli foydalanuvchilar */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<HomePage />} />
                        <Route path="/profile" element={<ProfilePage />} />

                        {/* Faqat ega va pro_admin */}
                        <Route
                          path="/add-product"
                          element={
                            <Guard allowed={["ega", "pro_admin"]}>
                              <AddProductPage />
                            </Guard>
                          }
                        />

                        {/* Faqat ega, pro_admin, admin */}
                        <Route
                          path="/edited"
                          element={
                            <Guard allowed={["ega", "pro_admin", "admin"]}>
                              <EditedPage />
                            </Guard>
                          }
                        />

                        {/* Statistika endi ega profilida — eski havolalar uchun */}
                        <Route path="/dashboard" element={<Navigate to="/profile?tab=stats" replace />} />

                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </PageTransition>
                </>
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
