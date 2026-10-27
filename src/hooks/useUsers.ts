import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { queryKeys } from "../lib/queryClient";
import type { Profile, UserRole } from "../data/products";

export const useUsers = (enabled = true) =>
  useQuery<Profile[], Error>({
    queryKey: queryKeys.users,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw new Error(error.message);
    },
    // Optimistik yangilash: ro'yxat darhol o'zgaradi
    onMutate: async ({ userId, role }) => {
      await qc.cancelQueries({ queryKey: queryKeys.users });
      const prev = qc.getQueryData<Profile[]>(queryKeys.users);
      qc.setQueryData<Profile[]>(queryKeys.users, (old) =>
        old?.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.users, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  });
};
