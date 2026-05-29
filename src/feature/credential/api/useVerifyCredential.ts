import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { CredentialVerifyInput } from "../schemas/credential";

export interface VerifyResult {
  match: boolean;
  credential_id: string;
  hash: string;
}

export function useVerifyCredential() {
  return useMutation({
    mutationFn: async (data: CredentialVerifyInput) => {
      const response = await api.post<VerifyResult>("/credentials/verify", data);
      return response.data;
    },
  });
}
