import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Check, AlertTriangle, RefreshCw, SearchX, Search, Download, FileUp } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDeleteProduct, useStaffProducts, useUpdateProduct } from "../hooks/useProducts";
import { useToast } from "../hooks/useToast";
import { useDebounce } from "../hooks/useDebounce";
import { can } from "../lib/roles";
import { downloadFile } from "../lib/csv";
import { productsToCSV } from "../lib/productCsv";
import type { Product, ProductFields } from "../data/products";
import EditProductForm from "../components/edited/EditProductForm";
import { ProductViewRow, SkeletonProductRow } from "../components/edited/ProductViewRow";
import ImportProductsModal from "../components/edited/ImportProductsModal";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 20;

/* ─── EDITED PAGE ─── */
const EditedPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { products, loading, error, refetch } = useStaffProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { role } = useAuth();
  const { toast, showToast } = useToast(4000);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // Qidiruv va sahifa URL'da saqlanadi
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("q") ?? "");
  const search = useDebounce(searchInput.trim().toLowerCase());
  const page = Math.max(1, Number(params.get("page")) || 1);

  const canEdit = can.editProduct(role);

  const filtered = useMemo(
    () =>
      search
        ? products.filter(
            (p) =>
              p.name.toLowerCase().includes(search) ||
              (p.description ?? "").toLowerCase().includes(search) ||
              p.category.toLowerCase().includes(search)
          )
        : products,
    [products, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateParams = (patch: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(patch)) {
          if (v) next.set(k, v);
          else next.delete(k);
        }
        return next;
      },
      { replace: true }
    );

  const handleSearch = (value: string) => {
    setSearchInput(value);
    updateParams({ q: value.trim() || null, page: null });
  };

  const handleSave = (product: Product, changes: ProductFields) =>
    updateProduct.mutate(
      { id: product.id, changes },
      {
        onSuccess: () => {
          showToast({ type: "success", msg: `"${changes.name}" muvaffaqiyatli tahrirlandi!` });
          setEditingId(null);
        },
        onError: (e) => showToast({ type: "error", msg: `Xatolik: ${e.message}` }),
      }
    );

  const handleDelete = () => {
    if (!deleting) return;
    const { id, name } = deleting;
    deleteProduct.mutate(id, {
      onSuccess: () => {
        showToast({ type: "success", msg: `"${name}" o'chirildi` });
        setDeleting(null);
      },
      onError: (e) => {
        showToast({ type: "error", msg: `Xatolik: ${e.message}` });
        setDeleting(null);
      },
    });
  };

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(productsToCSV(filtered), `mahsulotlar-${stamp}.csv`);
  };

  const toolBtn = `flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isDark ? "border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <div
          role="status"
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold
            flex items-center gap-3 transition-all duration-300
            ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
        >
          {toast.type === "success" ? <Check size={17} className="shrink-0" /> : <AlertTriangle size={17} className="shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className={`text-2xl font-extrabold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <Pencil size={24} className="text-blue-500" />
          Tahrirlanganlar
        </h1>
        <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Mahsulotlarni ko'rish, tahrirlash va o'zgarishlar tarixi
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Nomi, tavsifi yoki kategoriyasi bo'yicha qidirish..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border transition-colors ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500"
            }`}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} disabled={loading || filtered.length === 0} className={toolBtn} title="CSV (Excel) faylga yuklab olish">
            <Download size={15} /> Eksport
          </button>
          {canEdit && (
            <button onClick={() => setImportOpen(true)} disabled={loading} className={toolBtn} title="CSV fayldan import">
              <FileUp size={15} /> Import
            </button>
          )}
        </div>
      </div>

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <AlertTriangle size={52} className="text-red-400" />
          <p className="text-red-400 font-semibold text-lg">Xatolik yuz berdi</p>
          <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>{error}</p>
          <button
            onClick={refetch}
            className="mt-2 flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <RefreshCw size={15} /> Qayta urinish
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <SearchX size={56} className="text-gray-300" />
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {search ? "Mahsulot topilmadi" : "Mahsulotlar yo'q"}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <p className={`text-xs mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{filtered.length} ta mahsulot</p>
      )}

      <div className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonProductRow key={i} isDark={isDark} />)
          : !error &&
            visible.map((product) =>
              editingId === product.id ? (
                <EditProductForm
                  key={product.id}
                  product={product}
                  isDark={isDark}
                  saving={updateProduct.isPending}
                  onSave={(changes) => handleSave(product, changes)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ProductViewRow
                  key={product.id}
                  product={product}
                  isDark={isDark}
                  canEdit={canEdit}
                  onEdit={() => setEditingId(product.id)}
                  onDelete={() => setDeleting(product)}
                />
              )
            )}
      </div>

      {!loading && !error && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          isDark={isDark}
          onChange={(p) => updateParams({ page: p > 1 ? String(p) : null })}
        />
      )}

      {deleting && (
        <ConfirmDialog
          isDark={isDark}
          danger
          title="Mahsulotni o'chirish"
          message={
            <>
              <b>"{deleting.name}"</b> butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi
              (o'zgarishlar tarixida yozuv qoladi).
            </>
          }
          confirmLabel="O'chirish"
          loading={deleteProduct.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {importOpen && (
        <ImportProductsModal
          isDark={isDark}
          products={products}
          onClose={() => setImportOpen(false)}
          onDone={(msg) => showToast({ type: "success", msg })}
        />
      )}
    </section>
  );
};

export default EditedPage;
