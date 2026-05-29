import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import { useStore } from "@app/store";
import { notify } from "@shared/lib/notify";
import { isApiError } from "@shared/api/envelope";
import { setServerErrors } from "@shared/lib/forms";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import type { UserDTO } from "@shared/types/api";
import type { UserSelfProfileInput } from "../schemas/user";
import { userKeys } from "./keys";

export function useUpdateSelfProfile<T extends FieldValues>(form?: UseFormReturn<T>) {
  const queryClient = useQueryClient();
  const setUser = useStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: UserSelfProfileInput) => {
      const response = await api.put<UserDTO>("/users/self/profile", data);
      return response.data;
    },
    onSuccess: (user) => {
      setUser(user);
      void queryClient.invalidateQueries({ queryKey: userKeys.self() });
      notify.success("user.update.success");
    },
    onError: (error) => {
      if (isApiError(error) && error.fieldErrors && form) {
        setServerErrors(form, error.fieldErrors);
      } else if (isApiError(error)) {
        notify.error(error.messageKey);
      }
    },
  });
}
