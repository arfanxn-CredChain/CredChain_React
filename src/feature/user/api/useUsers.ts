import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { PaginatedResponse, PaginationParams, UserDTO } from "@shared/types/api";
import { userKeys } from "./keys";

export type UserListParams = PaginationParams;

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const q: Record<string, unknown> = {};
      if (params?.page) q.page = params.page;
      if (params?.limit) q.limit = params.limit;
      if (params?.search) q.search = params.search;
      if (params?.sorts && params.sorts.length) q.sorts = params.sorts;
      if (params?.filters && params.filters.length) q.filters = params.filters;
      if (params?.includes && params.includes.length) q.includes = params.includes;

      const response = await api.get<PaginatedResponse<UserDTO>>("/users", { params: q });
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });
}
