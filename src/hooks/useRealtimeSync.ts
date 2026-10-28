import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryKeys } from "../lib/queryClient";
import { invalidateProductData } from "./useProducts";

/**
 * Boshqa foydalanuvchi mahsulot yoki kategoriyani o'zgartirsa, keshni yangilaydi.
 * Realtime RLS'ni hisobga oladi: mehmonlar `products` hodisalarini olmaydi,
 * shuning uchun ular uchun ro'yxat davriy ravishda yangilanadi (useProducts).
 */
export const useRealtimeSync = (enabled: boolean) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel("db-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        void invalidateProductData(qc);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        void qc.invalidateQueries({ queryKey: queryKeys.categories });
        void qc.invalidateQueries({ queryKey: queryKeys.productsAll });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, qc]);
};
