import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import { notify } from "@shared/lib/notify";
import { isApiError } from "@shared/api/envelope";
import { setServerErrors } from "@shared/lib/forms";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import type { CredentialIssueRowInput } from "../schemas/credential";
import { credentialKeys } from "./keys";

export function useIssueCredentials<T extends FieldValues>(form?: UseFormReturn<T>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: CredentialIssueRowInput[]) => {
      const formData = new FormData();
      rows.forEach((row, i) => {
        formData.append(`items[${i}][holder_user_id]`, row.holder_user_id);
        formData.append(`items[${i}][name]`, row.name);
        if (row.meta && row.meta !== "") {
          formData.append(`items[${i}][meta]`, row.meta);
        }
        if (row.file) {
          formData.append(`items[${i}][file]`, row.file);
        }
      });
      const response = await api.post("/credentials/batch/issue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: credentialKeys.all() });
      notify.success("credential.issue.success");
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