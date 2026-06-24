import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import { credentialKeys } from "./keys";

export function useCredentialFile(id: string, enabled: boolean) {
  return useQuery({
    queryKey: credentialKeys.file(id),
    queryFn: async () => {
      const response = await api.get<Blob>(`/credentials/${id}/file`, {
        responseType: "blob",
      });
      return response.data;
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
