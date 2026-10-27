import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useCategories } from "../hooks/useCategories";
import { useCreateProduct } from "../hooks/useProducts";
import { toLocalDateTimeString } from "../lib/format";
import {
  Image,
  Package,
  FileText,
  Tag,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";


interface FormState {
  name: string;
  description: string;
  category: string;
  image_url: string;
  cost_price: string;
  selling_price: string;
  created_at: string;
}

const AddProductPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { data: dbCategories = [] } = useCategories();


  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    category: "",
    image_url: "",
    cost_price: "",
    selling_price: "",
    created_at: toLocalDateTimeString(new Date()),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const submitting = createProduct.isPending;
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  /* ─── helpers ─── */
  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const profit = () => {
    const cost = parseFloat(form.cost_price);
    const sell = parseFloat(form.selling_price);
    if (!isNaN(cost) && !isNaN(sell) && cost > 0) {
      const diff = sell - cost;
      const pct = Math.round((diff / cost) * 100);
      return { diff, pct };
    }
    return null;
  };

  /* ─── validation ─── */
  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Nomi majburiy";
    if (!form.category) e.category = "Tur tanlang";
    if (!form.cost_price || isNaN(Number(form.cost_price)) || Number(form.cost_price) <= 0)
      e.cost_price = "To'g'ri narx kiriting";
    if (!form.selling_price || isNaN(Number(form.selling_price)) || Number(form.selling_price) <= 0)
      e.selling_price = "To'g'ri narx kiriting";
    if (!form.created_at) e.created_at = "Vaqt majburiy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ─── submit ─── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createProduct.mutate(
      {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        image_url: form.image_url.trim() || null,
        cost_price: Number(form.cost_price),
        selling_price: Number(form.selling_price),
        created_at: new Date(form.created_at).toISOString(),
      },
      {
        onError: (error) => {
          setToast({ type: "error", msg: `Xatolik: ${error.message}` });
          setTimeout(() => setToast(null), 5000);
        },
        onSuccess: () => {
          setToast({ type: "success", msg: "Mahsulot muvaffaqiyatli qo'shildi!" });
          setTimeout(() => {
            setToast(null);
            navigate("/products");
          }, 1500);
        },
      }
    );
  };

  /* ─── input class ─── */
  const inputCls = (field: keyof FormState) =>
    `w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all duration-200
    ${isDark
      ? "bg-gray-900 text-white placeholder-gray-500"
      : "bg-gray-50 text-gray-800 placeholder-gray-400"
    }
    ${errors[field]
      ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
      : isDark
        ? "border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
    }`;

  const labelCls = `flex items-center gap-1.5 text-sm font-medium mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`;
  const profitData = profit();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-3
            transition-all duration-300
            ${toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          {toast.type === "success"
            ? <CheckCircle size={18} className="shrink-0" />
            : <XCircle size={18} className="shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className={`flex items-center gap-2 text-2xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>
          <Package size={26} className="text-blue-500" />
          Mahsulot qo'shish
        </h1>
        <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Yangi mahsulot ma'lumotlarini to'ldiring
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

        {/* ── Card wrapper ── */}
        <div className={`rounded-2xl p-6 shadow-sm border flex flex-col gap-5
          ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >

          {/* Image URL */}
          <div>
            <label className={labelCls}>
              <Image size={15} />
              Rasm URL
              <span className={`text-xs font-normal ml-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                (ixtiyoriy)
              </span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.image_url}
              onChange={(e) => { set("image_url", e.target.value); setImagePreviewError(false); }}
              className={inputCls("image_url")}
            />
            {form.image_url && !imagePreviewError && (
              <div className="mt-3 rounded-xl overflow-hidden h-40 border border-gray-200">
                <img
                  src={form.image_url}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreviewError(true)}
                />
              </div>
            )}
            {form.image_url && imagePreviewError && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                <X size={13} /> Rasm yuklanmadi — URL ni tekshiring
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className={labelCls}>
              <Package size={15} />
              Nomi <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Mahsulot nomi"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>
              <FileText size={15} />
              Tavsif
              <span className={`text-xs font-normal ml-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                (ixtiyoriy)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="Mahsulot haqida qisqacha ma'lumot..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputCls("description")} resize-none`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>
              <Tag size={15} />
              Tur <span className="text-red-400">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={`${inputCls("category")} cursor-pointer`}
            >
              <option value="">— Kategoriya tanlang —</option>
              {dbCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
          </div>
        </div>

        {/* ── Pricing card ── */}
        <div className={`rounded-2xl p-6 shadow-sm border flex flex-col gap-5
          ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >
          <p className={`flex items-center gap-2 text-sm font-semibold -mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <DollarSign size={16} className="text-emerald-500" />
            Narxlar
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Cost price */}
            <div>
              <label className={labelCls}>Tan narxi (so'm) <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.cost_price}
                  onChange={(e) => set("cost_price", e.target.value)}
                  className={`${inputCls("cost_price")} pr-14`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  so'm
                </span>
              </div>
              {errors.cost_price && <p className="mt-1 text-xs text-red-400">{errors.cost_price}</p>}
            </div>

            {/* Selling price */}
            <div>
              <label className={labelCls}>Sotilish narxi (so'm) <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.selling_price}
                  onChange={(e) => set("selling_price", e.target.value)}
                  className={`${inputCls("selling_price")} pr-14`}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  so'm
                </span>
              </div>
              {errors.selling_price && <p className="mt-1 text-xs text-red-400">{errors.selling_price}</p>}
            </div>
          </div>

          {/* Live profit indicator */}
          {profitData && (
            <div className={`rounded-xl px-4 py-3 flex items-center justify-between
              ${profitData.diff >= 0
                ? isDark ? "bg-emerald-900/30 border border-emerald-800" : "bg-emerald-50 border border-emerald-100"
                : isDark ? "bg-red-900/30 border border-red-800" : "bg-red-50 border border-red-100"
              }`}
            >
              <span className={`flex items-center gap-1.5 text-sm font-medium ${profitData.diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {profitData.diff >= 0
                  ? <TrendingUp size={16} />
                  : <TrendingDown size={16} />
                }
                {profitData.diff >= 0 ? "Foyda" : "Zarar"}
              </span>
              <div className="text-right">
                <p className={`font-bold text-sm ${profitData.diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {profitData.diff >= 0 ? "+" : ""}{profitData.diff.toLocaleString("uz-UZ")} so'm
                </p>
                <p className={`text-xs ${profitData.diff >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                  {profitData.diff >= 0 ? "+" : ""}{profitData.pct}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Date card ── */}
        <div className={`rounded-2xl p-6 shadow-sm border
          ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >
          <label className={labelCls}>
            <Clock size={15} />
            Qo'shilgan vaqti <span className="text-red-400">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.created_at}
            onChange={(e) => set("created_at", e.target.value)}
            className={inputCls("created_at")}
          />
          {errors.created_at && <p className="mt-1 text-xs text-red-400">{errors.created_at}</p>}
          <button
            type="button"
            onClick={() => set("created_at", toLocalDateTimeString(new Date()))}
            className={`mt-2 flex items-center gap-1 text-xs hover:underline ${isDark ? "text-blue-400" : "text-blue-600"}`}
          >
            <RotateCcw size={12} />
            Hozirgi vaqtni tiklash
          </button>
        </div>

        {/* ── Submit ── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-colors
              ${isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            <ArrowLeft size={16} />
            Bekor qilish
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200
              flex items-center justify-center gap-2
              ${submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/30"
              }`}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Check size={16} />
                Saqlash
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductPage;
