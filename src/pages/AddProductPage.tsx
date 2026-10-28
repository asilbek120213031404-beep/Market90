import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useCreateProduct } from "../hooks/useProducts";
import { useToast } from "../hooks/useToast";
import { toLocalDateTimeString } from "../lib/format";
import { useProductForm, type ProductFormState } from "../components/product/useProductForm";
import ImageField from "../components/product/ImageField";
import PriceInput from "../components/product/PriceInput";
import ProfitIndicator from "../components/product/ProfitIndicator";
import CategorySelect from "../components/product/CategorySelect";
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
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

const AddProductPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { form, errors, set, validate, toFields } = useProductForm();
  const { toast, showToast } = useToast(1500);
  const submitting = createProduct.isPending;

  /* ─── submit ─── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createProduct.mutate(toFields(), {
      onError: (error) => showToast({ type: "error", msg: `Xatolik: ${error.message}` }),
      // Toast tugagach o'tamiz; sahifadan oldin chiqib ketilsa taymer bekor bo'ladi
      onSuccess: () =>
        showToast({ type: "success", msg: "Mahsulot muvaffaqiyatli qo'shildi!" }, () => navigate("/products")),
    });
  };

  /* ─── input class ─── */
  const inputCls = (field: keyof ProductFormState) =>
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
  const unitCls = `absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
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

          {/* Image */}
          <div>
            <label htmlFor="add-image" className={labelCls}>
              <Image size={15} />
              Rasm
              <span className={`text-xs font-normal ml-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                (ixtiyoriy — URL yoki fayl)
              </span>
            </label>
            <ImageField
              id="add-image"
              value={form.image_url}
              onChange={(url) => set("image_url", url)}
              inputClassName={inputCls("image_url")}
              isDark={isDark}
              showPreview
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="add-name" className={labelCls}>
              <Package size={15} />
              Nomi <span className="text-red-400">*</span>
            </label>
            <input
              id="add-name"
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
            <label htmlFor="add-description" className={labelCls}>
              <FileText size={15} />
              Tavsif
              <span className={`text-xs font-normal ml-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                (ixtiyoriy)
              </span>
            </label>
            <textarea
              id="add-description"
              rows={3}
              placeholder="Mahsulot haqida qisqacha ma'lumot..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${inputCls("description")} resize-none`}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="add-category" className={labelCls}>
              <Tag size={15} />
              Tur <span className="text-red-400">*</span>
            </label>
            <CategorySelect
              id="add-category"
              value={form.category}
              onChange={(name) => set("category", name)}
              className={inputCls("category")}
            />
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
            <div>
              <label htmlFor="add-cost" className={labelCls}>Tan narxi (so'm) <span className="text-red-400">*</span></label>
              <PriceInput
                id="add-cost"
                value={form.cost_price}
                onChange={(v) => set("cost_price", v)}
                className={inputCls("cost_price")}
                unitClassName={unitCls}
              />
              {errors.cost_price && <p className="mt-1 text-xs text-red-400">{errors.cost_price}</p>}
            </div>

            <div>
              <label htmlFor="add-sell" className={labelCls}>Sotilish narxi (so'm) <span className="text-red-400">*</span></label>
              <PriceInput
                id="add-sell"
                value={form.selling_price}
                onChange={(v) => set("selling_price", v)}
                className={inputCls("selling_price")}
                unitClassName={unitCls}
              />
              {errors.selling_price && <p className="mt-1 text-xs text-red-400">{errors.selling_price}</p>}
            </div>
          </div>

          <ProfitIndicator cost={form.cost_price} sell={form.selling_price} isDark={isDark} />
        </div>

        {/* ── Date card ── */}
        <div className={`rounded-2xl p-6 shadow-sm border
          ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >
          <label htmlFor="add-date" className={labelCls}>
            <Clock size={15} />
            Qo'shilgan vaqti <span className="text-red-400">*</span>
          </label>
          <input
            id="add-date"
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
