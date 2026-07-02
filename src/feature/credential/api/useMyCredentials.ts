import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { CredentialDTO, PaginatedResponse, PaginationParams } from "@shared/types/api";
import { credentialKeys } from "./keys";

export function useMyCredentials(params?: PaginationParams & { includes?: string[] }) {
  return useQuery({
    queryKey: credentialKeys.mine(params),
    queryFn: async () => {
      const q: Record<string, unknown> = {};
      if (params?.page) q.page = params.page;
      if (params?.limit) q.limit = params.limit;
      if (params?.search) q.search = params.search;
      if (params?.sorts && params.sorts.length) q.sorts = params.sorts;
      if (params?.includes && params.includes.length) q.includes = params.includes;

      const response = await api.get<PaginatedResponse<CredentialDTO>>("/users/self/credentials", {
        params: q,
      });
      return response.data;
    },
  });
}
