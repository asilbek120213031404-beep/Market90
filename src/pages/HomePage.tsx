import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { type ProductListItem } from "../data/products";
import { useCategories } from "../hooks/useCategories";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import { can } from "../lib/roles";
import { calcProfit, categoryClass, formatPct, formatPrice, groupDigits, profitBadgeClass } from "../lib/format";
import Pagination from "../components/Pagination";
import {
  Search,
  ImageOff,
  AlertTriangle,
  RefreshCw,
  SearchX,
  ArrowUpDown,
  X,
} from "lucide-react";
import clsx from "clsx";

const PAGE_SIZE = 25;

type SortKey = "new" | "old" | "name" | "price_asc" | "price_desc" | "profit_desc" | "profit_asc";

const SORT_OPTIONS: { value: SortKey; label: string; staffOnly?: boolean }[] = [
  { value: "new", label: "Eng yangilari" },
  { value: "old", label: "Eng eskilari" },
  { value: "name", label: "Nomi (A–Z)" },
  { value: "price_asc", label: "Arzonroq" },
  { value: "price_desc", label: "Qimmatroq" },
  { value: "profit_desc", label: "Foyda: ko'pi oldin", staffOnly: true },
  { value: "profit_asc", label: "Foyda: kami oldin", staffOnly: true },
];

const profitPct = (p: ProductListItem) => calcProfit(p.cost_price ?? 0, p.selling_price)?.pct ?? 0;

const SORTERS: Record<SortKey, (a: ProductListItem, b: ProductListItem) => number> = {
  new: (a, b) => b.created_at.localeCompare(a.created_at),
  old: (a, b) => a.created_at.localeCompare(b.created_at),
  name: (a, b) => a.name.localeCompare(b.name, "uz"),
  price_asc: (a, b) => a.selling_price - b.selling_price,
  price_desc: (a, b) => b.selling_price - a.selling_price,
  profit_desc: (a, b) => profitPct(b) - profitPct(a),
  profit_asc: (a, b) => profitPct(a) - profitPct(b),
};

/* ─── Product Row ─── */
const ProductRow = ({
  product,
  index,
  isDark,
  showCostPrice,
}: {
  product: ProductListItem;
  index: number;
  isDark: boolean;
  showCostPrice: boolean;
}) => {
  const cost = product.cost_price ?? 0;
  const profitPercent = profitPct(product);
  const catClass = categoryClass(product.category);

  return (
    <tr
      className={`group transition-colors duration-150 ${
        isDark
          ? index % 2 === 0 ? "bg-gray-800" : "bg-gray-800/60"
          : index % 2 === 0 ? "bg-white" : "bg-gray-50/60"
      }`}
    >
      <td className={`px-4 py-3 text-center text-xs font-mono ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        {index + 1}
      </td>

      <td className={clsx('px-3', 'py-2.5')}>
        <div className={clsx('w-8', 'h-8', 'rounded-xl', 'overflow-hidden', 'shrink-0', 'bg-gray-100')}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className={clsx('w-full', 'h-full', 'object-cover', 'group-hover:scale-110', 'transition-transform', 'duration-300')}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/80x80/e2e8f0/94a3b8?text=?";
              }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
              <ImageOff size={16} className="text-gray-300" />
            </div>
          )}
        </div>
      </td>

      <td className={clsx('px-4', 'py-3', 'min-w-40')}>
        <p className={`font-semibold text-sm leading-snug line-clamp-2 ${isDark ? "text-white" : "text-gray-800"}`}>
          {product.name}
        </p>
        {product.description && (
          <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {product.description}
          </p>
        )}
      </td>

      <td className={clsx('px-4', 'py-3')}>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${catClass}`}>
          {product.category}
        </span>
      </td>

      {showCostPrice && (
        <td className={`px-4 py-3 text-right text-sm whitespace-nowrap ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {formatPrice(cost)}
        </td>
      )}

      <td className={`px-4 py-3 text-right text-sm font-bold whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
        {formatPrice(product.selling_price)}
      </td>

      {showCostPrice && (
      <td className={clsx('px-4', 'py-3', 'text-right')}>
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${profitBadgeClass(profitPercent)}`}>
          {formatPct(profitPercent)}
        </span>
      </td>
      )}
    </tr>
  );
};

/* ─── Skeleton Row ─── */
const SkeletonRow = ({ isDark, showCostPrice }: { isDark: boolean; showCostPrice: boolean }) => (
  <tr className={`animate-pulse ${isDark ? "bg-gray-800" : "bg-white"}`}>
    <td className={clsx('px-4', 'py-3')}>
      <div className={`h-3 w-5 rounded mx-auto ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
    </td>
    <td className={clsx('px-3', 'py-2.5')}>
      <div className={`w-8 h-8 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
    </td>
    <td className={clsx('px-4', 'py-3')}>
      <div className={`h-4 w-32 rounded mb-1.5 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
      <div className={`h-3 w-20 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
    </td>
    <td className={clsx('px-4', 'py-3')}>
      <div className={`h-5 w-24 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
    </td>
    {showCostPrice && (
      <td className={clsx('px-4', 'py-3')}>
        <div className={`h-4 w-20 rounded ml-auto ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
      </td>
    )}
    <td className={clsx('px-4', 'py-3')}>
      <div className={`h-4 w-24 rounded ml-auto ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
    </td>
    {showCostPrice && (
      <td className={clsx('px-4', 'py-3')}>
        <div className={`h-5 w-14 rounded-full ml-auto ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
      </td>
    )}
  </tr>
);

/* ─── HOME PAGE ─── */
const HomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { role } = useAuth();
  const showCostPrice = can.seeCost(role);
  const { products, loading, error, refetch } = useProducts({ includeCost: showCostPrice });
  const { data: dbCategories = [] } = useCategories();

  // Filtrlar URL'da: ?q=&cat=&sort=&min=&max=&page= — havolani ulashish mumkin
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("q") ?? "");
  const search = useDebounce(searchInput.trim().toLowerCase());
  const activeCategory = params.get("cat") ?? "Barchasi";
  const sortParam = params.get("sort") as SortKey | null;
  const sort: SortKey =
    sortParam && SORT_OPTIONS.some((o) => o.value === sortParam && (!o.staffOnly || showCostPrice))
      ? sortParam
      : "new";
  const minPrice = params.get("min") ?? "";
  const maxPrice = params.get("max") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);

  const updateParams = (patch: Record<string, string | null>, resetPage = true) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(patch)) {
          if (v) next.set(k, v);
          else next.delete(k);
        }
        if (resetPage) next.delete("page");
        return next;
      },
      { replace: true }
    );

  const handleSearch = (value: string) => {
    setSearchInput(value);
    updateParams({ q: value.trim() || null });
  };

  // "Barchasi" + Supabase kategoriyalari
  const allCategories = ["Barchasi", ...dbCategories.map((c) => c.name)];

  const filtered = useMemo(() => {
    const min = Number(minPrice) || 0;
    const max = Number(maxPrice) || Infinity;
    return products
      .filter((p) => activeCategory === "Barchasi" || p.category === activeCategory)
      .filter(
        (p) =>
          !search ||
          p.name.toLowerCase().includes(search) ||
          (p.description ?? "").toLowerCase().includes(search)
      )
      .filter((p) => p.selling_price >= min && p.selling_price <= max)
      .sort(SORTERS[sort]);
  }, [products, search, activeCategory, minPrice, maxPrice, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(offset, offset + PAGE_SIZE);

  const hasFilters = !!(searchInput || activeCategory !== "Barchasi" || minPrice || maxPrice || sort !== "new");

  const fieldCls = `py-2.5 rounded-xl text-sm outline-none border transition-colors ${
    isDark
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
      : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500"
  }`;

  const priceField = (key: "min" | "max", value: string, placeholder: string) => (
    <input
      type="text"
      inputMode="numeric"
      aria-label={placeholder}
      placeholder={placeholder}
      value={groupDigits(value)}
      onChange={(e) => updateParams({ [key]: e.target.value.replace(/\D/g, "") || null })}
      className={`${fieldCls} w-full sm:w-32 px-3`}
    />
  );

  return (
    <section className={clsx('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8', 'py-8')}>

      <div className={clsx('flex', 'flex-col', 'lg:flex-row', 'gap-3', 'mb-6')}>
        <div className={clsx('relative', 'flex-1')}>
          <Search size={16} className={clsx('absolute', 'left-3', 'top-1/2', '-translate-y-1/2', 'text-gray-400')} />
          <input
            type="search"
            placeholder="Nomi yoki tavsifi bo'yicha qidirish..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className={`${fieldCls} w-full pl-10 pr-4`}
          />
        </div>

        <div className="flex gap-2 items-center">
          {priceField("min", minPrice, "Narx: dan")}
          <span className="text-gray-400">—</span>
          {priceField("max", maxPrice, "Narx: gacha")}
        </div>

        <div className="relative">
          <ArrowUpDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            aria-label="Saralash"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value === "new" ? null : e.target.value })}
            className={`${fieldCls} w-full lg:w-52 pl-9 pr-3 cursor-pointer`}
          >
            {SORT_OPTIONS.filter((o) => !o.staffOnly || showCostPrice).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={clsx('flex', 'flex-wrap', 'gap-2', 'mb-8')}>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => updateParams({ cat: cat === "Barchasi" ? null : cat })}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={() => {
              setSearchInput("");
              setParams({}, { replace: true });
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isDark ? "text-red-400 hover:bg-gray-800" : "text-red-500 hover:bg-red-50"
            }`}
          >
            <X size={14} /> Filtrlarni tozalash
          </button>
        )}
      </div>

      {!loading && error && (
        <div className={clsx('flex', 'flex-col', 'items-center', 'justify-center', 'py-24', 'gap-4', 'text-center')}>
          <AlertTriangle size={52} className="text-red-400" />
          <p className={clsx('text-red-400', 'font-semibold', 'text-lg')}>Xatolik yuz berdi</p>
          <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>{error}</p>
          <button
            onClick={refetch}
            className={clsx('mt-2', 'flex', 'items-center', 'gap-2', 'px-6', 'py-2', 'bg-blue-600', 'hover:bg-blue-500', 'text-white', 'text-sm', 'font-semibold', 'rounded-xl', 'transition-colors')}
          >
            <RefreshCw size={15} />
            Qayta urinish
          </button>
        </div>
      )}

      {!error && (
        filtered.length === 0 && !loading ? (
          <div className={clsx('flex', 'flex-col', 'items-center', 'justify-center', 'py-24', 'gap-4')}>
            <SearchX size={56} className="text-gray-300" />
            <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Mahsulot topilmadi
            </p>
          </div>
        ) : (
          <>
            {!loading && (
              <p className={`text-xs mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {filtered.length} ta mahsulot topildi
                {totalPages > 1 && ` · ${offset + 1}–${offset + visible.length} ko'rsatilmoqda`}
              </p>
            )}

            <div className={`rounded-2xl overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-200"} shadow-sm`}>
              <div className="overflow-x-auto">
                <table className={clsx('w-full', 'text-sm')}>
                  <thead>
                    <tr className={`text-xs font-semibold uppercase tracking-wide ${
                      isDark
                        ? "bg-gray-900 text-gray-400 border-b border-gray-700"
                        : "bg-gray-50 text-gray-500 border-b border-gray-200"
                    }`}>
                      <th className={clsx('px-4', 'py-3', 'text-center', 'w-10')}>#</th>
                      <th className={clsx('px-3', 'py-3', 'text-left', 'w-16')}>Rasm</th>
                      <th className={clsx('px-4', 'py-3', 'text-left')}>Nomi</th>
                      <th className={clsx('px-4', 'py-3', 'text-left')}>Kategoriya</th>
                      {showCostPrice && (
                        <th className={clsx('px-4', 'py-3', 'text-right')}>Tan narxi</th>
                      )}
                      <th className={clsx('px-4', 'py-3', 'text-right')}>Sotish narxi</th>
                      {showCostPrice && (
                        <th className={clsx('px-4', 'py-3', 'text-right')}>Foyda</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-gray-700/50" : "divide-gray-100"}`}>
                    {loading
                      ? Array.from({ length: 8 }).map((_, i) => (
                          <SkeletonRow key={i} isDark={isDark} showCostPrice={showCostPrice} />
                        ))
                      : visible.map((product, i) => (
                          <ProductRow
                            key={product.id}
                            product={product}
                            index={offset + i}
                            isDark={isDark}
                            showCostPrice={showCostPrice}
                          />
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>

            {!loading && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                isDark={isDark}
                onChange={(p) => updateParams({ page: p > 1 ? String(p) : null }, false)}
              />
            )}
          </>
        )
      )}
    </section>
  );
};

export default HomePage;
