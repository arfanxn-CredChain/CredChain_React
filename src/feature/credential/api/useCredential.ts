import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { CredentialDTO } from "@shared/types/api";
import { credentialKeys } from "./keys";

export function useCredential(id: string, includes?: string[]) {
  return useQuery({
    queryKey: credentialKeys.detail(id, includes),
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (includes?.length) params.includes = includes;
      const response = await api.get<CredentialDTO>(`/credentials/${id}`, { params });
      return response.data;
    },
    enabled: !!id,
  });
}