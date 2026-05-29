import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type {
  CredentialDTO,
  PaginatedResponse,
  PaginationParams,
} from "@shared/types/api";
import { credentialKeys } from "./keys";

export interface CredentialListParams extends PaginationParams {
  holder_id?: string;
  issuer_id?: string;
  revoked?: boolean;
  type?: string;
}

export function useCredentials(params?: CredentialListParams) {
  return useQuery({
    queryKey: credentialKeys.list(params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<CredentialDTO>>("/credentials", {
        params: params as Record<string, unknown>,
      });
      return response.data;
    },
  });
}
