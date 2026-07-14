import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { MetaDTO } from "@shared/types/api";

export function useMeta() {
  return useQuery({
    queryKey: ["meta"],
    queryFn: async () => {
      const response = await api.get<MetaDTO>("/meta");
      return response.data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
