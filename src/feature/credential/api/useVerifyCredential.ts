import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import type { CredentialVerifyDTO } from "@shared/types/api";

export function useVerifyCredential() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<CredentialVerifyDTO>("/credentials/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
  });
}
