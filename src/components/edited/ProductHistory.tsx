import { Loader2, AlertTriangle } from "lucide-react";
import { useProductHistory } from "../../hooks/useProducts";
import { formatDate, formatPrice } from "../../lib/format";
import { ACTION_LABELS, FIELD_LABELS } from "../../lib/history";

const formatValue = (field: string, value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "cost_price" || field === "selling_price") return formatPrice(Number(value));
  if (field === "created_at") return formatDate(String(value));
  return String(value);
};

/* ─── Bitta mahsulot o'zgarishlari tarixi ─── */
const ProductHistory = ({ productId, isDark }: { productId: string; isDark: boolean }) => {
  const { data = [], isPending, error } = useProductHistory(productId);
  const muted = isDark ? "text-gray-400" : "text-gray-500";

  if (isPending) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 size={18} className="animate-spin text-blue-500" />
      </div>
    );
  }
  if (error) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-red-400 py-2">
        <AlertTriangle size={13} /> {error.message}
      </p>
    );
  }
  if (data.length === 0) {
    return <p className={`text-xs py-2 ${muted}`}>Tarix hali bo'sh</p>;
  }

  return (
    <ol className="flex flex-col gap-2">
      {data.map((h) => (
        <li
          key={h.id}
          className={`rounded-xl px-3 py-2 text-xs ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-semibold px-2 py-0.5 rounded-full ${ACTION_LABELS[h.action].cls}`}>
              {ACTION_LABELS[h.action].label}
            </span>
            <span className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              {h.changed_by_name ?? "Noma'lum"}
            </span>
            <span className={`ml-auto ${muted}`}>{formatDate(h.changed_at)}</span>
          </div>
          {h.action === "update" && (
            <ul className={`mt-1.5 flex flex-col gap-0.5 ${muted}`}>
              {Object.entries(h.changes).map(([field, { old, new: next }]) => (
                <li key={field} className="wrap-break-word">
                  <span className="font-medium">{FIELD_LABELS[field] ?? field}:</span>{" "}
                  {field === "image_url" ? (
                    "yangilandi"
                  ) : (
                    <>
                      <span className="line-through opacity-70">{formatValue(field, old)}</span>
                      {" → "}
                      <span className={isDark ? "text-gray-200" : "text-gray-800"}>{formatValue(field, next)}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
};

export default ProductHistory;
