import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import clsx from "clsx";

/* ─── Google SVG icon ─── */
const GoogleIcon = () => (
  <svg className={clsx('w-5', 'h-5')} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/* ─── Floating shapes background ─── */
const FloatingShapes = ({ isDark }: { isDark: boolean }) => (
  <div className={clsx('absolute', 'inset-0', 'overflow-hidden', 'pointer-events-none')}>
    {[
      { size: "w-72 h-72", pos: "-top-16 -left-16", opacity: "opacity-20", delay: "" },
      { size: "w-96 h-96", pos: "-bottom-24 -right-24", opacity: "opacity-15", delay: "animation-delay-2000" },
      { size: "w-48 h-48", pos: "top-1/2 left-1/3", opacity: "opacity-10", delay: "animation-delay-4000" },
    ].map((shape, i) => (
      <div
        key={i}
        className={`absolute ${shape.size} ${shape.pos} rounded-full blur-3xl
          ${isDark ? "bg-blue-500" : "bg-blue-400"} ${shape.opacity}`}
      />
    ))}
  </div>
);

const LoginPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Login bo'lsa, bosh sahifaga yo'naltiramiz
  useEffect(() => {
    if (!loading && user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className={clsx('min-h-screen', 'flex', 'items-center', 'justify-center')}>
        <div className={clsx('w-8', 'h-8', 'border-4', 'border-blue-500', 'border-t-transparent', 'rounded-full', 'animate-spin')} />
      </div>
    );
  }

  return (
    <div className={clsx('relative', 'min-h-screen', 'flex', 'items-center', 'justify-center', 'px-4', 'overflow-hidden')}>
      <FloatingShapes isDark={isDark} />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden
          ${isDark
            ? "bg-gray-900/80 border border-gray-700/60 backdrop-blur-xl"
            : "bg-white/80 border border-white/60 backdrop-blur-xl"
          }`}
      >
        {/* Top accent bar */}
        <div className={clsx('h-1.5', 'w-full', 'bg-linear-to-r', 'from-blue-500', 'via-indigo-500', 'to-purple-500')} />

        <div className={clsx('p-8', 'sm:p-10')}>
          {/* Logo */}
          <div className={clsx('text-center', 'mb-8')}>
            <h1 className={clsx('text-3xl', 'font-extrabold', 'tracking-widest')}>
              <span className={isDark ? "text-white" : "text-gray-900"}>MARKET</span>
              <span className="text-blue-500">90</span>
            </h1>
            <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Boshqaruv tizimiga xush kelibsiz
            </p>
          </div>

          {/* Divider */}
          <div className={clsx('flex', 'items-center', 'gap-3', 'mb-8')}>
            <div className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
            <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Hisobingiz orqali kiring
            </span>
            <div className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={signInWithGoogle}
            className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl
              font-semibold text-sm transition-all duration-200 active:scale-95
              shadow-md hover:shadow-lg
              ${isDark
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
              }`}
          >
            <GoogleIcon />
            Google orqali kirish
          </button>

          {/* Footer note */}
          <p className={`mt-8 text-center text-xs leading-relaxed ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Tizimga kirib, siz{" "}
            <span className={clsx('underline', 'cursor-pointer', 'hover:text-blue-500', 'transition-colors')}>
              foydalanish shartlari
            </span>
            {" "}bilan rozisizligingizni tasdiqlaysiz.
          </p>
        </div>
      </div>

      {/* Version tag */}
      <p className={`absolute bottom-4 text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
        MARKET90 v1.0
      </p>
    </div>
  );
};

export default LoginPage;
