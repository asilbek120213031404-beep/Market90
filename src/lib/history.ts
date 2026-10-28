import type { HistoryAction } from "../data/products";

/** product_history.changes dagi maydon nomlari */
export const FIELD_LABELS: Record<string, string> = {
  name: "Nomi",
  description: "Tavsif",
  category: "Kategoriya",
  image_url: "Rasm",
  cost_price: "Tan narxi",
  selling_price: "Sotish narxi",
  created_at: "Qo'shilgan vaqti",
};

export const ACTION_LABELS: Record<HistoryAction, { label: string; cls: string }> = {
  insert: { label: "Qo'shildi", cls: "bg-emerald-100 text-emerald-700" },
  update: { label: "Tahrirlandi", cls: "bg-blue-100 text-blue-700" },
  delete: { label: "O'chirildi", cls: "bg-red-100 text-red-600" },
};
