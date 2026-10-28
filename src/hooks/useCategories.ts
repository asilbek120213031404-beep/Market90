import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryKeys } from "../lib/queryClient";

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

/** Barcha kategoriyalarni Supabase dan yuklaydi */
export const useCategories = () =>
  useQuery<Category[], Error>({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, created_at")
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 60_000, // 1 daqiqa kesh
  });

/** Yangi kategoriya qo'shish (faqat ega) */
export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("categories")
        .insert({ name: name.trim() });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
};

/** Kategoriya nomini o'zgartirish (faqat ega). Mahsulotlardagi nom FK orqali avtomatik yangilanadi. */
export const useRenameCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const { error } = await supabase
        .from("categories")
        .update({ name: name.trim() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.categories }),
        qc.invalidateQueries({ queryKey: queryKeys.productsAll }),
      ]),
  });
};

/** Kategoriyani o'chirish (faqat ega). Mahsuloti bor kategoriyani baza o'chirtirmaydi. */
export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) {
        throw new Error(
          error.message.includes("products_category_fkey")
            ? "Bu kategoriyada mahsulotlar bor — avval ularni boshqa kategoriyaga o'tkazing"
            : error.message
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
};
