import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Barcha so'rov kalitlari bir joyda */
export const queryKeys = {
  products: (includeCost: boolean) => ["products", { includeCost }] as const,
  productsAll: ["products"] as const,
  users: ["users"] as const,
  categories: ["categories"] as const,
};

