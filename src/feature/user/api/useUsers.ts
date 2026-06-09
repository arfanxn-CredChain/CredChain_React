import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { PaginatedResponse, PaginationParams, UserDTO } from "@shared/types/api";
import { userKeys } from "./keys";

export interface UserListParams extends PaginationParams {
  role?: string;
  deleted?: "all" | "only" | "none";
}

function buildQuery(params: UserListParams): Record<string, unknown> {
  const q: Record<string, unknown> = {};
  if (params.page) q.page = params.page;
  if (params.limit) q.limit = params.limit;
  if (params.search) q.search = params.search;

  const sorts: string[] = [];
  if (params.sort && params.order) {
    sorts.push(params.order === "desc" ? `-${params.sort}` : params.sort);
  }
  if (sorts.length) q.sorts = sorts;

  const filters: string[] = [];
  if (params.role) filters.push(`role=${params.role}`);
  if (params.deleted === "only") filters.push("deleted_at!_");
  else if (params.deleted === "none") filters.push("deleted_at_");
  if (filters.length) q.filters = filters;

  return q;
}

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<UserDTO>>("/users", {
        params: buildQuery(params ?? {}),
      });
      return response.data;
    },
  });
}
