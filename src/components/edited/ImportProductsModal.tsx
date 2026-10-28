import { useRef, useState } from "react";
import { AlertTriangle, Check, FileUp, Loader2, Upload, X } from "lucide-react";
import type { Product } from "../../data/products";
import { useCategories } from "../../hooks/useCategories";
import { useImportProducts } from "../../hooks/useProducts";
import { useEscape } from "../../hooks/useEscape";
import { planImport, type ImportResult } from "../../lib/productCsv";

/* ─── CSV/Excel'dan import (tekshiruv → tasdiqlash → yuborish) ─── */
const ImportProductsModal = ({
  isDark,
  products,
  onClose,
  onDone,
}: {
  isDark: boolean;
  products: Product[];
  onClose: () => void;
  onDone: (msg: string) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: categories = [] } = useCategories();
  const importProducts = useImportProducts();
  const [fileName, setFileName] = useState<string | null>(null);
  const [plan, setPlan] = useState<ImportResult | null>(null);

  const busy = importProducts.isPending;
  useEscape(() => !busy && onClose());

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    importProducts.reset();
    setPlan(planImport(await file.text(), products, categories.map((c) => c.name)));
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = () => {
    if (!plan) return;
    importProducts.mutate(
      { inserts: plan.inserts, updates: plan.updates },
      {
        onSuccess: () => {
          onDone(`Import tugadi: ${plan.inserts.length} ta qo'shildi, ${plan.updates.length} ta yangilandi`);
          onClose();
        },
      }
    );
  };

  const muted = isDark ? "text-gray-400" : "text-gray-500";
  const canImport = plan && plan.errors.length === 0 && (plan.inserts.length > 0 || plan.updates.length > 0);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !busy && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]
          ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}
      >
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-400 via-teal-500 to-cyan-500 shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <h2 id="import-title" className={`text-lg font-extrabold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            <FileUp size={20} className="text-emerald-500" />
            Mahsulotlarni import qilish
          </h2>
          <button
            onClick={onClose}
            disabled={busy}
            title="Yopish"
            className={`p-1.5 rounded-xl transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 flex flex-col gap-4 text-sm">
          <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${isDark ? "bg-gray-700/50 text-gray-300" : "bg-gray-50 text-gray-600"}`}>
            <p className="font-semibold mb-1">Fayl formati (CSV, Excel'dan "CSV UTF-8" sifatida saqlang):</p>
            <ul className="list-disc pl-4 flex flex-col gap-0.5">
              <li>Eng oson yo'l — avval <b>Eksport</b> qiling, faylni tahrirlang va qayta yuklang.</li>
              <li><b>ID</b> bor qator — mavjud mahsulot yangilanadi (masalan, faqat narxlar).</li>
              <li><b>ID</b> bo'sh qator — yangi mahsulot: Nomi, Kategoriya, Tan narxi, Sotish narxi majburiy.</li>
              <li>Kategoriya tizimda mavjud bo'lishi kerak.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className={`flex items-center justify-center gap-2 py-6 rounded-2xl border-2 border-dashed font-semibold transition-colors
              ${isDark
                ? "border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-emerald-400"
                : "border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-600"
              }`}
          >
            <Upload size={18} />
            {fileName ?? "CSV faylni tanlang"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {plan && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Yangi", value: plan.inserts.length, cls: "text-emerald-500" },
                  { label: "Yangilanadi", value: plan.updates.length, cls: "text-blue-500" },
                  { label: "O'zgarmagan", value: plan.unchanged, cls: muted },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl py-3 ${isDark ? "bg-gray-700/50" : "bg-gray-50"}`}>
                    <p className={`text-xl font-extrabold ${s.cls}`}>{s.value}</p>
                    <p className={`text-xs ${muted}`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {plan.errors.length > 0 && (
                <div className="rounded-xl px-4 py-3 bg-red-50 text-red-600 text-xs flex flex-col gap-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {plan.errors.length} ta xato — tuzatib, qayta yuklang:
                  </p>
                  {plan.errors.slice(0, 10).map((e) => (
                    <p key={e}>{e}</p>
                  ))}
                  {plan.errors.length > 10 && <p>… va yana {plan.errors.length - 10} ta</p>}
                </div>
              )}

              {plan.updates.length > 0 && plan.errors.length === 0 && (
                <p className={`text-xs ${muted}`}>
                  Yangilanadi: {plan.updates.slice(0, 5).map((u) => u.name).join(", ")}
                  {plan.updates.length > 5 && ` va yana ${plan.updates.length - 5} ta`}
                </p>
              )}
            </div>
          )}

          {importProducts.error && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertTriangle size={13} /> Xatolik: {importProducts.error.message}. Qisman saqlangan bo'lishi mumkin —
              ro'yxatni tekshiring.
            </p>
          )}

          <button
            type="button"
            onClick={handleImport}
            disabled={!canImport || busy}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white
              bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {busy ? "Import qilinmoqda..." : "Tasdiqlash va import qilish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportProductsModal;
