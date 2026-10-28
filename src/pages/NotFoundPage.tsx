import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ─── 404 ─── */
const NotFoundPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <SearchX size={56} className="text-gray-300" />
      <h1 className={`text-5xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>404</h1>
      <p className={isDark ? "text-gray-400" : "text-gray-500"}>Bunday sahifa topilmadi</p>
      <Link
        to="/products"
        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
      >
        Mahsulotlarga qaytish
      </Link>
    </section>
  );
};

export default NotFoundPage;
