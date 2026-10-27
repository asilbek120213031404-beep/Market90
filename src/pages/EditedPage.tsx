import { useMemo, useState } from "react";
import { Pencil, Check, AlertTriangle, RefreshCw, SearchX } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useStaffProducts, useUpdateProduct } from "../hooks/useProducts";
import { can } from "../lib/roles";
import type { Product } from "../data/products";
import EditProductForm, { type ProductChanges } from "../components/edited/EditProductForm";
import { ProductViewRow, SkeletonProductRow } from "../components/edited/ProductViewRow";

interface Toast {
  type: "success" | "error";
  msg: string;
}

/* ─── EDITED PAGE ─── */
const EditedPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { products, loading, error, refetch } = useStaffProducts();
  const updateProduct = useUpdateProduct();
  const { user, role } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const canEdit = can.editProduct(role);

  // Eng yangi tepada
  const sorted = useMemo(
    () => [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [products]
  );

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = (product: Product, changes: ProductChanges) =>
    updateProduct.mutate(
      {
        id: product.id,
        changes: { ...changes, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
      },
      {
        onSuccess: () => {
          showToast({ type: "success", msg: `"${changes.name}" muvaffaqiyatli tahrirlandi!` });
          setEditingId(null);
        },
        onError: (e) => showToast({ type: "error", msg: `Xatolik: ${e.message}` }),
      }
    );

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
          Mahsulotlarni ko'rish va tahrirlash
        </p>
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

      {!loading && !error && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <SearchX size={56} className="text-gray-300" />
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mahsulotlar yo'q</p>
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <p className={`text-xs mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{sorted.length} ta mahsulot</p>
      )}

      <div className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonProductRow key={i} isDark={isDark} />)
          : sorted.map((product) =>
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
                />
              )
            )}
      </div>
    </section>
  );
};

export default EditedPage;
