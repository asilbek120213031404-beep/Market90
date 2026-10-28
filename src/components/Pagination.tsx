import { ChevronLeft, ChevronRight } from "lucide-react";

/** 1 … 4 5 [6] 7 8 … 20 */
const pageList = (page: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
};

/* ─── Sahifalash ─── */
const Pagination = ({
  page,
  totalPages,
  isDark,
  onChange,
}: {
  page: number;
  totalPages: number;
  isDark: boolean;
  onChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const base = "min-w-9 h-9 px-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center";
  const idle = isDark
    ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100";

  const go = (p: number) => {
    onChange(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Sahifalar" className="flex flex-wrap items-center justify-center gap-1.5 mt-6">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Oldingi sahifa"
        className={`${base} ${idle} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronLeft size={16} />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className={`px-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : idle}`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="Keyingi sahifa"
        className={`${base} ${idle} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
