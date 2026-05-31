import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import { notify } from "@shared/lib/notify";
import { isApiError } from "@shared/api/envelope";
import { userKeys } from "./keys";

export function useTransferSuperAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post("/users/self/transfer-super-admin", { id });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all() });
      void queryClient.invalidateQueries({ queryKey: userKeys.self() });
      notify.success("user.transfer.success");
    },
    onError: (error) => {
      if (isApiError(error)) notify.error(error.messageKey);
    },
  });
}
