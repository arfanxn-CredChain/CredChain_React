import { z } from "zod";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const credentialIssueRowSchema = z.object({
  holder_user_id: z.string().min(1, "zod.credential.holderRequired"),
  name: z.string().min(1, "zod.credential.nameRequired").max(256, "zod.credential.nameTooLong"),
  meta: z
    .string()
    .refine(
      (v) => {
        if (v === "") return true;
        try {
          JSON.parse(v);
          return true;
        } catch {
          return false;
        }
      },
      { message: "zod.credential.metaInvalid" },
    )
    .optional()
    .or(z.literal("")),
  file: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_FILE_BYTES, { message: "zod.credential.fileTooLarge" })
    .optional()
    .nullable(),
});

export type CredentialIssueRowInput = z.infer<typeof credentialIssueRowSchema>;

export const credentialBatchIssueSchema = z.object({
  credentials: z
    .array(credentialIssueRowSchema)
    .min(1, "zod.credential.batchMinOne")
    .max(100, "zod.credential.batchMaxHundred"),
});

export type CredentialBatchIssueInput = z.infer<typeof credentialBatchIssueSchema>;

export const credentialBatchRevokeSchema = z.object({
  ids: z
    .array(z.string().min(1, "zod.credential.idRequired"))
    .min(1, "zod.credential.revokeMinOne")
    .max(100, "zod.credential.revokeMaxHundred"),
});

export type CredentialBatchRevokeInput = z.infer<typeof credentialBatchRevokeSchema>;

export function defaultCredentialIssueRow(): CredentialIssueRowInput {
  return {
    holder_user_id: "new_holder",
    name: "New Credential",
    meta: "",
    file: null,
  };
}
