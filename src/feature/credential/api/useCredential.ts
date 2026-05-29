import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { CredentialDTO } from "@shared/types/api";
import { credentialKeys } from "./keys";

export function useCredential(id: string) {
  return useQuery({
    queryKey: credentialKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<CredentialDTO>(`/credentials/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
