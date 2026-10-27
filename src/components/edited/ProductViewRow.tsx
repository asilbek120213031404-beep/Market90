import { ImageOff, Pencil } from "lucide-react";
import type { Product } from "../../data/products";
import { calcProfit, categoryClass, formatDate, profitBadgeClass } from "../../lib/format";

/* ─── Mahsulot qatori (ko'rish rejimi) ─── */
export const ProductViewRow = ({
  product,
  isDark,
  canEdit,
  onEdit,
}: {
  product: Product;
  isDark: boolean;
  canEdit: boolean;
  onEdit: () => void;
}) => {
  const pct = calcProfit(product.cost_price, product.selling_price)?.pct ?? 0;

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-colors group
        ${isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"}`}
    >
      <div
        className={`w-14 h-14 shrink-0 rounded-xl overflow-hidden flex items-center justify-center
          ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <ImageOff size={20} className="text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`font-semibold text-sm leading-snug truncate ${isDark ? "text-white" : "text-gray-900"}`}>
              {product.name}
            </p>
            {product.description && (
              <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {product.description}
              </p>
            )}
          </div>

          {canEdit && (
            <button
              onClick={onEdit}
              title="Tahrirlash"
              aria-label={`${product.name} — tahrirlash`}
              className={`shrink-0 p-2 rounded-xl transition-colors cursor-pointer
                ${isDark ? "text-gray-400 hover:text-blue-400 hover:bg-gray-700" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
            >
              <Pencil size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryClass(product.category)}`}>
            {product.category}
          </span>
          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Tan: <span className="font-medium">{product.cost_price.toLocaleString("uz-UZ")} so'm</span>
          </span>
          <span className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Sotish: <span>{product.selling_price.toLocaleString("uz-UZ")} so'm</span>
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${profitBadgeClass(pct)}`}>
            {pct >= 0 ? "+" : ""}
            {pct}%
          </span>
          <span className={`text-xs ml-auto ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {formatDate(product.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─── Skeleton ─── */
export const SkeletonProductRow = ({ isDark }: { isDark: boolean }) => {
  const bar = isDark ? "bg-gray-700" : "bg-gray-200";
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 rounded-2xl border animate-pulse
      ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
    >
      <div className={`w-14 h-14 rounded-xl shrink-0 ${bar}`} />
      <div className="flex-1 flex flex-col gap-2">
        <div className={`h-4 w-48 rounded ${bar}`} />
        <div className={`h-3 w-32 rounded ${bar}`} />
        <div className="flex gap-2">
          <div className={`h-5 w-20 rounded-full ${bar}`} />
          <div className={`h-5 w-28 rounded ${bar}`} />
          <div className={`h-5 w-24 rounded ${bar}`} />
        </div>
      </div>
    </div>
  );
};
