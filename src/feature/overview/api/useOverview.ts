import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { OverviewDTO } from "@shared/types/api";
import { overviewKeys } from "./keys";

export interface UseOverviewParams {
  filters?: string[];
}

export function useOverview(params?: UseOverviewParams) {
  return useQuery({
    queryKey: overviewKeys.all(params?.filters),
    queryFn: async () => {
      const q: Record<string, unknown> = {};
      if (params?.filters && params.filters.length > 0) {
        q.filters = params.filters;
      }
      const response = await api.get<OverviewDTO>("/overview", { params: q });
      return response.data;
    },
  });
}
