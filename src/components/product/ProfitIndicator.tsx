import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { calcProfit, formatPct, groupDigits } from "../../lib/format";

/** Jonli foyda/zarar ko'rsatkichi; sotish narxi tan narxidan past bo'lsa ogohlantiradi */
const ProfitIndicator = ({
  cost,
  sell,
  isDark,
  compact = false,
}: {
  cost: string;
  sell: string;
  isDark: boolean;
  compact?: boolean;
}) => {
  const pd = calcProfit(parseFloat(cost), parseFloat(sell));
  if (!pd) return null;

  const ok = pd.diff >= 0;
  const tone = ok ? "text-emerald-600" : "text-red-500";
  const amount = `${pd.diff > 0 ? "+" : pd.diff < 0 ? "-" : ""}${groupDigits(Math.abs(pd.diff))} so'm`;

  return (
    <div
      className={`rounded-xl border ${compact ? "mt-2 px-3 py-2" : "px-4 py-3"}
        ${ok
          ? isDark ? "bg-emerald-900/30 border-emerald-800" : "bg-emerald-50 border-emerald-100"
          : isDark ? "bg-red-900/30 border-red-800" : "bg-red-50 border-red-100"
        }`}
    >
      <div className="flex items-center justify-between text-sm">
        <span className={`flex items-center gap-1.5 font-medium ${tone}`}>
          {ok ? <TrendingUp size={compact ? 14 : 16} /> : <TrendingDown size={compact ? 14 : 16} />}
          {ok ? "Foyda" : "Zarar"}
        </span>
        <span className={`font-bold ${tone}`}>
          {amount} ({formatPct(pd.pct)})
        </span>
      </div>
      {!ok && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
          <AlertTriangle size={12} className="shrink-0" />
          Diqqat: sotish narxi tan narxidan past — mahsulot zararga sotiladi
        </p>
      )}
    </div>
  );
};

export default ProfitIndicator;
