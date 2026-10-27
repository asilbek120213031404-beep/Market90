import { useState } from "react";
import {
  Check, X, ImageOff, Loader2, TrendingUp, TrendingDown,
  Image, Package, FileText, Tag, DollarSign, RotateCcw,
} from "lucide-react";
import { type Product } from "../../data/products";
import { useCategories } from "../../hooks/useCategories";
import { calcProfit, toLocalDateTimeString } from "../../lib/format";

interface FormState {
  name: string;
  description: string;
  category: string;
  image_url: string;
  cost_price: string;
  selling_price: string;
  created_at: string;
}

export interface ProductChanges {
  name: string;
  description: string | null;
  category: string;
  image_url: string | null;
  cost_price: number;
  selling_price: number;
  created_at: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const validPrice = (v: string) => !!v && !isNaN(Number(v)) && Number(v) > 0;

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
  onSave: (changes: ProductChanges) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<FormState>({
    name: product.name,
    description: product.description ?? "",
    category: product.category,
    image_url: product.image_url ?? "",
    cost_price: String(product.cost_price),
    selling_price: String(product.selling_price),
    created_at: toLocalDateTimeString(new Date(product.created_at)),
  });
  const [errors, setErrors] = useState<Errors>({});
  const [imgError, setImgError] = useState(false);
  const { data: dbCategories = [] } = useCategories();


  const set = (field: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Nomi majburiy";
    if (!form.category) e.category = "Tur tanlang";
    if (!validPrice(form.cost_price)) e.cost_price = "To'g'ri narx kiriting";
    if (!validPrice(form.selling_price)) e.selling_price = "To'g'ri narx kiriting";
    if (!form.created_at) e.created_at = "Vaqt majburiy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category,
      image_url: form.image_url.trim() || null,
      cost_price: Number(form.cost_price),
      selling_price: Number(form.selling_price),
      created_at: new Date(form.created_at).toISOString(),
    });
  };

  const inputCls = (field: keyof FormState) =>
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
  const err = (f: keyof FormState) => errors[f] && <p className="mt-0.5 text-xs text-red-400">{errors[f]}</p>;

  const pd = calcProfit(parseFloat(form.cost_price), parseFloat(form.selling_price));
  const id = (f: string) => `edit-${product.id}-${f}`;

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
            {form.image_url && !imgError ? (
              <img src={form.image_url} alt="preview" className="w-full h-full object-cover" onError={() => setImgError(true)} />
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
          <Image size={13} /> Rasm URL <span className={hintCls}>(ixtiyoriy)</span>
        </label>
        <input
          id={id("image")}
          type="url"
          value={form.image_url}
          onChange={(e) => {
            set("image_url", e.target.value);
            setImgError(false);
          }}
          placeholder="https://example.com/image.jpg"
          className={inputCls("image_url")}
        />
        {form.image_url && imgError && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-red-400">
            <X size={12} /> Rasm yuklanmadi
          </p>
        )}
      </div>

      <div>
        <label htmlFor={id("category")} className={labelCls}>
          <Tag size={13} /> Tur <span className="text-red-400">*</span>
        </label>
        <select
          id={id("category")}
          value={form.category}
          onChange={(e) => set("category", e.target.value)}
          className={`${inputCls("category")} cursor-pointer`}
        >
          <option value="">— Kategoriya tanlang —</option>
          {dbCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        {err("category")}
      </div>

      <div>
        <span className={labelCls}>
          <DollarSign size={13} /> Narxlar
        </span>
        <div className="grid grid-cols-2 gap-3">
          {(["cost_price", "selling_price"] as const).map((f) => (
            <div key={f}>
              <div className="relative">
                <input
                  id={id(f)}
                  type="number"
                  min="0"
                  aria-label={f === "cost_price" ? "Tan narxi" : "Sotish narxi"}
                  placeholder={f === "cost_price" ? "Tan narxi" : "Sotish narxi"}
                  value={form[f]}
                  onChange={(e) => set(f, e.target.value)}
                  className={`${inputCls(f)} pr-12`}
                />
                <span className={unitCls}>so'm</span>
              </div>
              {err(f)}
            </div>
          ))}
        </div>

        {pd && (
          <div
            className={`mt-2 rounded-xl px-3 py-2 flex items-center justify-between text-sm border
              ${
                pd.diff >= 0
                  ? isDark ? "bg-emerald-900/30 border-emerald-800" : "bg-emerald-50 border-emerald-100"
                  : isDark ? "bg-red-900/30 border-red-800" : "bg-red-50 border-red-100"
              }`}
          >
            <span className={`flex items-center gap-1 font-medium ${pd.diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {pd.diff >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {pd.diff >= 0 ? "Foyda" : "Zarar"}
            </span>
            <span className={`font-bold ${pd.diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {pd.diff >= 0 ? "+" : ""}
              {pd.diff.toLocaleString("uz-UZ")} so'm ({pd.diff >= 0 ? "+" : ""}
              {pd.pct}%)
            </span>
          </div>
        )}
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
