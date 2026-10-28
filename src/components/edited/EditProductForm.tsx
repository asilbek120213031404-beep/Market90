import { useState } from "react";
import {
  Check, X, ImageOff, Loader2,
  Image, Package, FileText, Tag, DollarSign, RotateCcw,
} from "lucide-react";
import type { Product, ProductFields } from "../../data/products";
import { toLocalDateTimeString } from "../../lib/format";
import { useProductForm, type ProductFormState } from "../product/useProductForm";
import ImageField from "../product/ImageField";
import PriceInput from "../product/PriceInput";
import ProfitIndicator from "../product/ProfitIndicator";
import CategorySelect from "../product/CategorySelect";

/* ─── Inline tahrirlash formasi ─── */
const EditProductForm = ({
  product,
  isDark,
  saving,
  onSave,
  onCancel,
}: {
  product: Product;
  isDark: boolean;
  saving: boolean;
  onSave: (changes: ProductFields) => void;
  onCancel: () => void;
}) => {
  const { form, errors, set, validate, toFields } = useProductForm(product);
  // Rasm URL o'zgarganda xato holati qayta boshlanadi
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  const handleSave = () => {
    if (validate()) onSave(toFields());
  };

  const inputCls = (field: keyof ProductFormState) =>
    `w-full px-3 py-2 rounded-xl text-sm outline-none border transition-all duration-200
    ${isDark ? "bg-gray-900 text-white placeholder-gray-500" : "bg-gray-50 text-gray-800 placeholder-gray-400"}
    ${
      errors[field]
        ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
        : isDark
        ? "border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
    }`;

  const labelCls = `flex items-center gap-1.5 text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`;
  const hintCls = `font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`;
  const unitCls = `absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`;
  const err = (f: keyof ProductFormState) => errors[f] && <p className="mt-0.5 text-xs text-red-400">{errors[f]}</p>;

  const id = (f: string) => `edit-${product.id}-${f}`;
  const showThumb = form.image_url && brokenUrl !== form.image_url;

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-4 transition-colors
        ${isDark ? "bg-gray-800/80 border-blue-700/50" : "bg-blue-50/60 border-blue-200"}`}
    >
      <div className="flex gap-4">
        <div className="shrink-0">
          <div
            className={`w-20 h-20 rounded-xl overflow-hidden border flex items-center justify-center
              ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"}`}
          >
            {showThumb ? (
              <img
                src={form.image_url}
                alt="preview"
                className="w-full h-full object-cover"
                onError={() => setBrokenUrl(form.image_url)}
              />
            ) : (
              <ImageOff size={22} className="text-gray-400" />
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div>
            <label htmlFor={id("name")} className={labelCls}>
              <Package size={13} /> Nomi <span className="text-red-400">*</span>
            </label>
            <input
              id={id("name")}
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Mahsulot nomi"
              className={inputCls("name")}
            />
            {err("name")}
          </div>

          <div>
            <label htmlFor={id("description")} className={labelCls}>
              <FileText size={13} /> Tavsif <span className={hintCls}>(ixtiyoriy)</span>
            </label>
            <textarea
              id={id("description")}
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Qisqacha ma'lumot..."
              className={`${inputCls("description")} resize-none`}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={id("image")} className={labelCls}>
          <Image size={13} /> Rasm <span className={hintCls}>(ixtiyoriy — URL yoki fayl)</span>
        </label>
        <ImageField
          id={id("image")}
          value={form.image_url}
          onChange={(url) => set("image_url", url)}
          inputClassName={inputCls("image_url")}
          isDark={isDark}
        />
      </div>

      <div>
        <label htmlFor={id("category")} className={labelCls}>
          <Tag size={13} /> Tur <span className="text-red-400">*</span>
        </label>
        <CategorySelect
          id={id("category")}
          value={form.category}
          onChange={(name) => set("category", name)}
          className={inputCls("category")}
        />
        {err("category")}
      </div>

      <div>
        <span className={labelCls}>
          <DollarSign size={13} /> Narxlar
        </span>
        <div className="grid grid-cols-2 gap-3">
          {(["cost_price", "selling_price"] as const).map((f) => (
            <div key={f}>
              <PriceInput
                id={id(f)}
                ariaLabel={f === "cost_price" ? "Tan narxi" : "Sotish narxi"}
                placeholder={f === "cost_price" ? "Tan narxi" : "Sotish narxi"}
                value={form[f]}
                onChange={(v) => set(f, v)}
                className={inputCls(f)}
                unitClassName={unitCls}
              />
              {err(f)}
            </div>
          ))}
        </div>

        <ProfitIndicator cost={form.cost_price} sell={form.selling_price} isDark={isDark} compact />
      </div>

      <div>
        <label htmlFor={id("date")} className={labelCls}>
          Sana va vaqt *
        </label>
        <input
          id={id("date")}
          type="datetime-local"
          value={form.created_at}
          onChange={(e) => set("created_at", e.target.value)}
          className={inputCls("created_at")}
        />
        <button
          type="button"
          onClick={() => set("created_at", toLocalDateTimeString(new Date()))}
          className={`mt-1 flex items-center gap-1 text-xs hover:underline ${isDark ? "text-blue-400" : "text-blue-600"}`}
        >
          <RotateCcw size={11} /> Hozirgi vaqt
        </button>
        {err("created_at")}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors
            ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-100"}`}
        >
          <X size={15} /> Bekor qilish
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200
            ${saving
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/25"
            }`}
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Saqlanmoqda...
            </>
          ) : (
            <>
              <Check size={15} /> Saqlash
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditProductForm;
