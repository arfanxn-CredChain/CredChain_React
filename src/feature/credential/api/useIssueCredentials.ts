import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/api/client";
import { notify } from "@shared/lib/notify";
import { isApiError } from "@shared/api/envelope";
import { setServerErrors } from "@shared/lib/forms";
import { mergeMeta } from "@shared/lib/meta";
import type { AxiosResponse } from "axios";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import type { CredentialIssueRowInput } from "../schemas/credential";
import type { ApiResponse } from "@shared/api/envelope";
import { credentialKeys } from "./keys";

const BACKEND_TO_FRONTEND_PATH: Record<string, string> = {
  Credentials: "credentials",
  HolderUserID: "holder_user_id",
  Name: "name",
  File: "file",
  Meta: "meta_entries",
};

function normalizeBatchErrorPaths(errors: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [path, messages] of Object.entries(errors)) {
    const parts = path.split(".");
    const normalized = parts.map((p) => BACKEND_TO_FRONTEND_PATH[p] ?? p).join(".");
    out[normalized] = messages;
  }
  return out;
}

export function useIssueCredentials<T extends FieldValues>(form?: UseFormReturn<T>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: CredentialIssueRowInput[]) => {
      const formData = new FormData();
      rows.forEach((row, i) => {
        formData.append(`items[${i}][holder_user_id]`, row.holder_user_id);
        formData.append(`items[${i}][name]`, row.name);
        if (row.meta_entries && row.meta_entries.length > 0) {
          const metaObj = mergeMeta(row.meta_entries, {});
          if (metaObj) {
            formData.append(`items[${i}][meta]`, JSON.stringify(metaObj));
          }
        }
        if (row.file) {
          formData.append(`items[${i}][file]`, row.file);
        }
      });
      const response = await api.post("/credentials/batch/issue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const enveloped = response as AxiosResponse<ApiResponse> & {
        __envelope?: { errors?: Record<string, string[]> };
      };
      return {
        data: response.data,
        fieldErrors: enveloped.__envelope?.errors ?? {},
      };
    },
    onSuccess: (result: { data: unknown; fieldErrors: Record<string, string[]> }) => {
      void queryClient.invalidateQueries({ queryKey: credentialKeys.all() });
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        if (form) {
          setServerErrors(form, normalizeBatchErrorPaths(result.fieldErrors));
        }
      } else {
        notify.success("credential.issue.success");
      }
    },
    onError: (error) => {
      if (isApiError(error) && error.fieldErrors && form) {
        setServerErrors(form, normalizeBatchErrorPaths(error.fieldErrors));
        void queryClient.invalidateQueries({ queryKey: credentialKeys.all() });
      } else if (isApiError(error)) {
        notify.error(error.messageKey);
      } else {
        notify.error("credential.issue.submitError");
      }
    },
  });
}
