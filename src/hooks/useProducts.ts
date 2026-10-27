import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryKeys } from "../lib/queryClient";
import type { Product, ProductListItem } from "../data/products";
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

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TableInsert<"products">) => {
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.productsAll }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: TableUpdate<"products"> }) => {
      const { error } = await supabase.from("products").update(changes).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.productsAll }),
  });
};
