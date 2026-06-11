import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import { useStore } from "@app/store";
import type { CredentialDTO, PaginatedResponse } from "@shared/types/api";
import { credentialKeys } from "./keys";

export function useMyCredentials() {
  const userId = useStore((s) => s.user?.id);

  return useQuery({
    queryKey: credentialKeys.mine(),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<CredentialDTO>>("/credentials", {
        params: { holder_id: userId, limit: 100 },
      });
      return response.data;
    },
    enabled: !!userId,
  });
}
