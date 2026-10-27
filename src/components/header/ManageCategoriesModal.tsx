import { useState } from "react";
import { Tag, Plus, Trash2, X, Loader2, AlertTriangle, Check } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory } from "../../hooks/useCategories";

type Toast = { type: "success" | "error"; msg: string };

const ManageCategoriesModal = ({
  isDark,
  onClose,
}: {
  isDark: boolean;
  onClose: () => void;
}) => {
  const { data: categories = [], isPending, error } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      showToast({ type: "error", msg: "Bu kategoriya allaqachon mavjud!" });
      return;
    }
    createCategory.mutate(name, {
      onSuccess: () => {
        setNewName("");
        showToast({ type: "success", msg: `"${name}" qo'shildi!` });
      },
      onError: (e) => showToast({ type: "error", msg: `Xatolik: ${e.message}` }),
    });
  };

  const handleDelete = (id: number, name: string) => {
    deleteCategory.mutate(id, {
      onSuccess: () => showToast({ type: "success", msg: `"${name}" o'chirildi` }),
      onError: (e) => showToast({ type: "error", msg: `Xatolik: ${e.message}` }),
    });
  };

  const inputCls = `flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border transition-all
    ${isDark
      ? "bg-gray-900 text-white placeholder-gray-500 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      : "bg-gray-50 text-gray-800 placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
    }`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-categories-title"
        className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]
        ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}
      >
        {/* Top accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-emerald-400 via-teal-500 to-cyan-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <h2
            id="manage-categories-title"
            className={`text-lg font-extrabold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            <Tag size={20} className="text-emerald-500" />
            Kategoriyalarni boshqarish
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${isDark ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mx-6 mb-3 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0
            ${toast.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
          >
            {toast.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
            {toast.msg}
          </div>
        )}

        {/* Yangi kategoriya qo'shish */}
        <div className="px-6 pb-4 shrink-0">
          <div className="flex gap-2">
            <input
              id="new-category-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Yangi kategoriya nomi..."
              className={inputCls}
              maxLength={60}
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || createCategory.isPending}
              id="add-category-btn"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400
                disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors shrink-0"
            >
              {createCategory.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Plus size={15} />
              )}
              Qo'sh
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className={`mx-6 mb-3 border-t shrink-0 ${isDark ? "border-gray-700" : "border-gray-100"}`} />

        {/* Categories list */}
        <div className="overflow-y-auto px-6 pb-6 flex flex-col gap-2">
          {isPending ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={26} className="animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-10 gap-2 text-red-400 text-sm">
              <AlertTriangle size={18} />
              {error.message}
            </div>
          ) : categories.length === 0 ? (
            <p className={`text-center py-10 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Kategoriyalar topilmadi
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-colors
                  ${isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-100"}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className={`text-sm font-medium truncate ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                    {cat.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={deleteCategory.isPending && deleteCategory.variables === cat.id}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                    hover:text-red-500 transition-colors shrink-0 disabled:opacity-40"
                  title="O'chirish"
                >
                  {deleteCategory.isPending && deleteCategory.variables === cat.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;
