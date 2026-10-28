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

/** 12500 → "12 500" */
export const groupDigits = (value: string | number) =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** 12500 → "12 500 so'm" */
export const formatPrice = (value: number) => `${groupDigits(Math.round(value))} so'm`;

/** "+12%" / "-5%" / "0%" */
export const formatPct = (pct: number) => `${pct > 0 ? "+" : ""}${pct}%`;

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

/** Kategoriyalar bazada dinamik — rang nomdan barqaror tanlanadi */
const CATEGORY_PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-amber-100 text-amber-800",
  "bg-purple-100 text-purple-700",
  "bg-red-100 text-red-700",
  "bg-cyan-100 text-cyan-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-lime-100 text-lime-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
];

export const categoryClass = (category: string) => {
  let hash = 0;
  for (const ch of category) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length];
};
