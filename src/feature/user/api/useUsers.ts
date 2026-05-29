import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { PaginatedResponse, PaginationParams, UserDTO } from "@shared/types/api";
import { userKeys } from "./keys";

export interface UserListParams extends PaginationParams {
  role?: string;
  deleted?: boolean;
}

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<UserDTO>>("/users", {
        params: params as Record<string, unknown>,
      });
      return response.data;
    },
  });
}
