const pad = (n: number) => String(n).padStart(2, "0");

/** `<input type="datetime-local">` uchun qiymat */
export const toLocalDateTimeString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;

/** dd.mm.yyyy hh:mm */
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

/** Foyda (so'm va %) yoki null */
export const calcProfit = (cost: number, sell: number) => {
  if (isNaN(cost) || isNaN(sell) || cost <= 0) return null;
  const diff = sell - cost;
  return { diff, pct: Math.round((diff / cost) * 100) };
};

export const profitBadgeClass = (pct: number) =>
  pct >= 20
    ? "bg-emerald-100 text-emerald-700"
    : pct >= 10
    ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-600";

export const CATEGORY_COLORS: Record<string, string> = {
  Ichimliklar: "bg-blue-100 text-blue-700",
  Shirinliklar: "bg-pink-100 text-pink-700",
  Shokoladlar: "bg-amber-100 text-amber-800",
  "Bolalar uchun": "bg-purple-100 text-purple-700",
  "Go'shtli mahsulotlar": "bg-red-100 text-red-700",
  "Sut mahsulotlari": "bg-cyan-100 text-cyan-700",
  "Non va unli mahsulotlar": "bg-orange-100 text-orange-700",
  "Mevalar va sabzavotlar": "bg-green-100 text-green-700",
  "Oziq-ovqat": "bg-lime-100 text-lime-700",
  Boshqa: "bg-gray-100 text-gray-600",
};

export const categoryClass = (category: string) =>
  CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-600";
