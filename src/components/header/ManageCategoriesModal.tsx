import { useMemo, useState } from "react";
import { Tag, Plus, Trash2, X, Loader2, AlertTriangle, Check, Pencil } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
  type Category,
} from "../../hooks/useCategories";
import { useStaffProducts } from "../../hooks/useProducts";
import { useToast } from "../../hooks/useToast";
import { useEscape } from "../../hooks/useEscape";
import ConfirmDialog from "../ConfirmDialog";

const ManageCategoriesModal = ({
  isDark,
  onClose,
}: {
  isDark: boolean;
  onClose: () => void;
}) => {
  const { data: categories = [], isPending, error } = useCategories();
  const { products } = useStaffProducts();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const deleteCategory = useDeleteCategory();
  const { toast, showToast } = useToast();

  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  useEscape(() => (editing ? setEditing(null) : onClose()), !deleting);

  // Har bir kategoriyadagi mahsulotlar soni
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [products]);

  const exists = (name: string, exceptId?: number) =>
    categories.some((c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase());

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (exists(name)) {
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

  const handleRename = (cat: Category) => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name || name === cat.name) {
      setEditing(null);
      return;
    }
    if (exists(name, cat.id)) {
      showToast({ type: "error", msg: "Bu nomdagi kategoriya allaqachon mavjud!" });
      return;
    }
    renameCategory.mutate(
      { id: cat.id, name },
      {
        onSuccess: () => {
          setEditing(null);
          showToast({ type: "success", msg: `"${cat.name}" → "${name}"` });
        },
        onError: (e) => showToast({ type: "error", msg: `Xatolik: ${e.message}` }),
      }
    );
  };

  const handleDelete = () => {
    if (!deleting) return;
    const { id, name } = deleting;
    deleteCategory.mutate(id, {
      onSuccess: () => showToast({ type: "success", msg: `"${name}" o'chirildi` }),
      onError: (e) => showToast({ type: "error", msg: e.message }),
      onSettled: () => setDeleting(null),
    });
  };

  const inputCls = `flex-1 min-w-0 px-4 py-2.5 rounded-xl text-sm outline-none border transition-all
    ${isDark
      ? "bg-gray-900 text-white placeholder-gray-500 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      : "bg-gray-50 text-gray-800 placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
    }`;
  const iconBtn = "p-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-40";
  const deletingCount = deleting ? counts.get(deleting.name) ?? 0 : 0;

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
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
            title="Yopish"
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
            categories.map((cat) => {
              const isEditing = editing?.id === cat.id;
              const renaming = renameCategory.isPending && renameCategory.variables?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border transition-colors
                    ${isDark ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-100"}`}
                >
                  {isEditing ? (
                    <>
                      <input
                        autoFocus
                        value={editing.name}
                        maxLength={60}
                        aria-label="Kategoriya nomi"
                        onChange={(e) => setEditing({ id: cat.id, name: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(cat)}
                        className={`${inputCls} py-1.5! px-3!`}
                      />
                      <button
                        onClick={() => handleRename(cat)}
                        disabled={renaming || !editing.name.trim()}
                        title="Saqlash"
                        className={`${iconBtn} text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20`}
                      >
                        {renaming ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        disabled={renaming}
                        title="Bekor qilish"
                        className={`${iconBtn} text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600`}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className={`text-sm font-medium truncate ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                          {cat.name}
                        </span>
                        <span className={`text-xs shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {counts.get(cat.name) ?? 0} ta
                        </span>
                      </div>
                      <div className="flex items-center shrink-0">
                        <button
                          onClick={() => setEditing({ id: cat.id, name: cat.name })}
                          title="Nomini o'zgartirish"
                          className={`${iconBtn} text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleting(cat)}
                          title="O'chirish"
                          className={`${iconBtn} text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {deleting && (
        <ConfirmDialog
          isDark={isDark}
          danger
          title="Kategoriyani o'chirish"
          message={
            deletingCount > 0 ? (
              <>
                <b>"{deleting.name}"</b> kategoriyasida <b>{deletingCount} ta mahsulot</b> bor. Uni o'chirish uchun
                avval bu mahsulotlarni boshqa kategoriyaga o'tkazing.
              </>
            ) : (
              <>
                <b>"{deleting.name}"</b> kategoriyasi o'chiriladi. Unda mahsulotlar yo'q.
              </>
            )
          }
          confirmLabel="O'chirish"
          confirmDisabled={deletingCount > 0}
          loading={deleteCategory.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
};

export default ManageCategoriesModal;
