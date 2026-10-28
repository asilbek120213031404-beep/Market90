import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package, Tag, TrendingUp, TrendingDown, AlertTriangle, History, Loader2,
} from "lucide-react";
import { useRecentHistory, useStaffProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { calcProfit, categoryClass, formatDate, formatPct, formatPrice, profitBadgeClass } from "../../lib/format";
import { ACTION_LABELS } from "../../lib/history";
import type { Product } from "../../data/products";

const LOW_PROFIT_PCT = 10;

const pctOf = (p: Product) => calcProfit(p.cost_price, p.selling_price)?.pct ?? 0;

/* ─── Statistika paneli (faqat ega, profil sahifasida) ─── */
const StatsPanel = ({ isDark }: { isDark: boolean }) => {
  const { products, loading, error } = useStaffProducts();
  const { data: categories = [] } = useCategories();
  const recent = useRecentHistory(10);

  const stats = useMemo(() => {
    const pcts = products.map(pctOf);
    const avgPct = pcts.length ? Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length) : 0;
    const loss = products.filter((p) => p.selling_price < p.cost_price);
    const low = products
      .filter((p) => p.selling_price >= p.cost_price && pctOf(p) < LOW_PROFIT_PCT)
      .sort((a, b) => pctOf(a) - pctOf(b));

    const byCategory = new Map<string, { count: number; pctSum: number }>();
    for (const p of products) {
      const c = byCategory.get(p.category) ?? { count: 0, pctSum: 0 };
      c.count++;
      c.pctSum += pctOf(p);
      byCategory.set(p.category, c);
    }
    const categoryRows = [...byCategory.entries()]
      .map(([name, c]) => ({ name, count: c.count, avgPct: Math.round(c.pctSum / c.count) }))
      .sort((a, b) => b.count - a.count);

    return { avgPct, loss, low, categoryRows };
  }, [products]);

  const card = `rounded-2xl border p-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`;
  const title = `flex items-center gap-2 font-extrabold mb-4 ${isDark ? "text-white" : "text-gray-900"}`;
  const muted = isDark ? "text-gray-400" : "text-gray-500";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
        <AlertTriangle size={44} />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const maxCount = Math.max(1, ...stats.categoryRows.map((c) => c.count));

  const tiles = [
    { label: "Mahsulotlar", value: products.length, icon: Package, cls: "text-blue-500" },
    { label: "Kategoriyalar", value: categories.length, icon: Tag, cls: "text-emerald-500" },
    { label: "O'rtacha foyda", value: formatPct(stats.avgPct), icon: TrendingUp, cls: "text-indigo-500" },
    { label: "Zarardagi", value: stats.loss.length, icon: TrendingDown, cls: "text-red-500" },
    { label: `Kam foydali (<${LOW_PROFIT_PCT}%)`, value: stats.low.length, icon: AlertTriangle, cls: "text-amber-500" },
  ];

  const productList = (list: Product[], empty: string) =>
    list.length === 0 ? (
      <p className={`text-sm py-4 text-center ${muted}`}>{empty}</p>
    ) : (
      <ul className="flex flex-col gap-1.5">
        {list.slice(0, 10).map((p) => (
          <li
            key={p.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${isDark ? "bg-gray-700/40" : "bg-gray-50"}`}
          >
            <span className={`flex-1 min-w-0 truncate font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {p.name}
            </span>
            <span className={`text-xs whitespace-nowrap ${muted}`}>
              {formatPrice(p.cost_price)} → {formatPrice(p.selling_price)}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${profitBadgeClass(pctOf(p))}`}>
              {formatPct(pctOf(p))}
            </span>
          </li>
        ))}
        {list.length > 10 && <li className={`text-xs text-center ${muted}`}>… va yana {list.length - 10} ta</li>}
      </ul>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tiles.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={card}>
            <Icon size={18} className={cls} />
            <p className={`mt-2 text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
            <p className={`text-xs ${muted}`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className={title}><Tag size={18} className="text-emerald-500" /> Kategoriyalar bo'yicha</h2>
          {stats.categoryRows.length === 0 ? (
            <p className={`text-sm py-4 text-center ${muted}`}>Ma'lumot yo'q</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.categoryRows.map((c) => (
                <li key={c.name}>
                  <div className="flex items-center justify-between gap-2 text-sm mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryClass(c.name)}`}>{c.name}</span>
                    <span className={`text-xs ${muted}`}>
                      {c.count} ta · o'rtacha <b>{formatPct(c.avgPct)}</b>
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={card}>
          <h2 className={title}><History size={18} className="text-amber-500" /> So'nggi o'zgarishlar</h2>
          {recent.isPending ? (
            <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-blue-500" /></div>
          ) : recent.error ? (
            <p className="text-sm text-red-400">{recent.error.message}</p>
          ) : !recent.data?.length ? (
            <p className={`text-sm py-4 text-center ${muted}`}>Hali o'zgarishlar yo'q</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {recent.data.map((h) => (
                <li
                  key={h.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${isDark ? "bg-gray-700/40" : "bg-gray-50"}`}
                >
                  <span className={`shrink-0 font-semibold px-1.5 py-0.5 rounded-full ${ACTION_LABELS[h.action].cls}`}>
                    {ACTION_LABELS[h.action].label}
                  </span>
                  <span className={`flex-1 min-w-0 truncate font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                    {h.product_name}
                  </span>
                  <span className={`hidden sm:inline truncate max-w-28 ${muted}`}>{h.changed_by_name ?? "—"}</span>
                  <span className={`shrink-0 ${muted}`}>{formatDate(h.changed_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={card}>
          <h2 className={title}><TrendingDown size={18} className="text-red-500" /> Zarardagi mahsulotlar</h2>
          {productList(stats.loss, "Zarardagi mahsulot yo'q 🎉")}
        </div>

        <div className={card}>
          <h2 className={title}><AlertTriangle size={18} className="text-amber-500" /> Kam foydali mahsulotlar</h2>
          {productList(stats.low, `Foydasi ${LOW_PROFIT_PCT}% dan past mahsulot yo'q`)}
        </div>
      </div>

      <p className={`text-xs text-center ${muted}`}>
        Narxlarni tuzatish uchun <Link to="/edited" className="text-blue-500 hover:underline">Tahrirlanganlar</Link> sahifasiga o'ting.
      </p>
    </div>
  );
};

export default StatsPanel;
