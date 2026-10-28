import { useState } from "react";
import type { Product, ProductFields } from "../../data/products";
import { toLocalDateTimeString } from "../../lib/format";

export interface ProductFormState {
  name: string;
  description: string;
  category: string;
  image_url: string;
  cost_price: string;   // faqat raqamlar: "12500"
  selling_price: string;
  created_at: string;   // datetime-local qiymati
}

export type ProductFormErrors = Partial<Record<keyof ProductFormState, string>>;

const validPrice = (v: string) => /^\d+$/.test(v) && Number(v) > 0;

const initialState = (product?: Product): ProductFormState =>
  product
    ? {
        name: product.name,
        description: product.description ?? "",
        category: product.category,
        image_url: product.image_url ?? "",
        cost_price: String(Math.round(product.cost_price)),
        selling_price: String(Math.round(product.selling_price)),
        created_at: toLocalDateTimeString(new Date(product.created_at)),
      }
    : {
        name: "",
        description: "",
        category: "",
        image_url: "",
        cost_price: "",
        selling_price: "",
        created_at: toLocalDateTimeString(new Date()),
      };

/** Qo'shish va tahrirlash formalari uchun umumiy holat va validatsiya */
export const useProductForm = (product?: Product) => {
  const [form, setForm] = useState<ProductFormState>(() => initialState(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});

  const set = (field: keyof ProductFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: ProductFormErrors = {};
    if (!form.name.trim()) e.name = "Nomi majburiy";
    if (!form.category) e.category = "Tur tanlang";
    if (!validPrice(form.cost_price)) e.cost_price = "To'g'ri narx kiriting";
    if (!validPrice(form.selling_price)) e.selling_price = "To'g'ri narx kiriting";
    if (!form.created_at) e.created_at = "Vaqt majburiy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toFields = (): ProductFields => ({
    name: form.name.trim(),
    description: form.description.trim() || null,
    category: form.category,
    image_url: form.image_url.trim() || null,
    cost_price: Number(form.cost_price),
    selling_price: Number(form.selling_price),
    created_at: new Date(form.created_at).toISOString(),
  });

  return { form, errors, set, validate, toFields };
};
