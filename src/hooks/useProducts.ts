import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryKeys } from "../lib/queryClient";
import type {
  AdminActivity,
  Product,
  ProductHistoryEntry,
  ProductListItem,
} from "../data/products";
import type { TableInsert, TableUpdate } from "../types/helpers";

const STAFF_COLUMNS =
  "id, name, description, category, image_url, cost_price, selling_price, created_at, updated_by, updated_at";
const PUBLIC_COLUMNS =
  "id, name, description, category, image_url, selling_price, created_at, updated_by, updated_at";

const fetchStaffProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(STAFF_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

const fetchPublicProducts = async (): Promise<ProductListItem[]> => {
  const { data, error } = await supabase
    .from("products_public")
    .select(PUBLIC_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

interface ProductsResult<T> {
  products: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Mahsulotlar ro'yxati.
 * includeCost=false bo'lsa cost_price'siz `products_public` view'idan o'qiladi
 * (mehmonlar uchun — RLS asosiy jadvalni ularga yopadi).
 */
export const useProducts = ({ includeCost = true }: { includeCost?: boolean } = {}): ProductsResult<ProductListItem> => {
  const q = useQuery<ProductListItem[], Error>({
    queryKey: queryKeys.products(includeCost),
    queryFn: includeCost ? fetchStaffProducts : fetchPublicProducts,
    // Mehmonlarga realtime hodisalari kelmaydi (RLS) — davriy yangilaymiz
    refetchInterval: includeCost ? false : 60_000,
  });
  return {
    products: q.data ?? [],
    loading: q.isPending,
    error: q.error?.message ?? null,
    refetch: () => void q.refetch(),
  };
};

/** Xodimlar uchun: cost_price kafolatlangan */
export const useStaffProducts = (): ProductsResult<Product> => {
  const q = useQuery<Product[], Error>({
    queryKey: queryKeys.products(true),
    queryFn: fetchStaffProducts,
  });
  return {
    products: q.data ?? [],
    loading: q.isPending,
    error: q.error?.message ?? null,
    refetch: () => void q.refetch(),
  };
};

/** Mahsulot o'zgarganda unga bog'liq barcha keshlarni yangilaymiz */
export const invalidateProductData = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: queryKeys.productsAll }),
    qc.invalidateQueries({ queryKey: queryKeys.productHistoryAll }),
    qc.invalidateQueries({ queryKey: queryKeys.adminActivity }),
  ]);

/** Supabase FK xatosini tushunarli qilamiz */
const productError = (message: string) =>
  new Error(
    message.includes("products_category_fkey")
      ? "Bunday kategoriya mavjud emas"
      : message
  );

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TableInsert<"products">) => {
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw productError(error.message);
    },
    onSuccess: () => invalidateProductData(qc),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: TableUpdate<"products"> }) => {
      const { error } = await supabase.from("products").update(changes).eq("id", id);
      if (error) throw productError(error.message);
    },
    onSuccess: () => invalidateProductData(qc),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => invalidateProductData(qc),
  });
};

export interface ImportPlan {
  inserts: TableInsert<"products">[];
  updates: { id: string; changes: TableUpdate<"products"> }[];
}

/** CSV importi: yangilarini bitta so'rovda qo'shadi, mavjudlarini 5 tadan parallel yangilaydi */
export const useImportProducts = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ inserts, updates }: ImportPlan) => {
      if (inserts.length) {
        const { error } = await supabase.from("products").insert(inserts);
        if (error) throw productError(error.message);
      }
      for (let i = 0; i < updates.length; i += 5) {
        const results = await Promise.all(
          updates
            .slice(i, i + 5)
            .map(({ id, changes }) => supabase.from("products").update(changes).eq("id", id))
        );
        const failed = results.find((r) => r.error);
        if (failed?.error) throw productError(failed.error.message);
      }
    },
    onSettled: () => invalidateProductData(qc),
  });
};

/* ─── O'zgarishlar tarixi ─── */

const HISTORY_COLUMNS =
  "id, product_id, product_name, action, changes, changed_by, changed_by_name, changed_at";

export const useProductHistory = (productId: string, enabled = true) =>
  useQuery<ProductHistoryEntry[], Error>({
    queryKey: queryKeys.productHistory(productId),
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_history")
        .select(HISTORY_COLUMNS)
        .eq("product_id", productId)
        .order("changed_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return (data ?? []) as ProductHistoryEntry[];
    },
  });

export const useRecentHistory = (limit = 10) =>
  useQuery<ProductHistoryEntry[], Error>({
    queryKey: queryKeys.recentHistory,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_history")
        .select(HISTORY_COLUMNS)
        .order("changed_at", { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []) as ProductHistoryEntry[];
    },
  });

/** Ega uchun: xodimlar faoliyati (supabase/03_improvements.sql → admin_activity) */
export const useAdminActivity = (enabled = true) =>
  useQuery<AdminActivity[], Error>({
    queryKey: queryKeys.adminActivity,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_activity");
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as AdminActivity[];
    },
  });
