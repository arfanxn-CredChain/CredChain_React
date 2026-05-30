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
  if (params.sort && params.order) {
    q.sort = params.order === "desc" ? `-${params.sort}` : params.sort;
  }
  if (params.role) q.role = params.role;
  if (params.deleted === "only") q["deleted_at!_"] = "";
  else if (params.deleted === "none") q["deleted_at_"] = "";
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
