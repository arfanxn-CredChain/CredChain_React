import { z } from "zod";

const CREDENTIAL_TYPES = [
  "AcademicDegree",
  "EmploymentCertificate",
  "TrainingCertificate",
  "ProfessionalLicense",
  "MembershipCertificate",
  "Other",
] as const;

export const credentialIssueRowSchema = z.object({
  holder_id: z.string().min(1, "Select a recipient"),
  type: z.string().min(1, "Type is required").max(256, "Type too long"),
  title: z.string().min(1, "Title is required").max(256, "Title too long"),
  description: z.string().max(1024, "Description too long").optional(),
  uri: z
    .string()
    .min(1, "Metadata URI is required")
    .max(512, "URI too long")
    .refine((v) => v.startsWith("ipfs://") || v.startsWith("https://"), {
      message: "URI must start with ipfs:// or https://",
    }),
  valid_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
    .nullable()
    .optional(),
});

export type CredentialIssueRowInput = z.infer<typeof credentialIssueRowSchema>;

export const credentialBatchIssueSchema = z.object({
  credentials: z
    .array(credentialIssueRowSchema)
    .min(1, "Add at least one credential")
    .max(50, "Maximum 50 credentials per batch"),
});

export type CredentialBatchIssueInput = z.infer<typeof credentialBatchIssueSchema>;

export const credentialBatchRevokeSchema = z.object({
  ids: z
    .array(z.string().min(1))
    .min(1, "Select at least one credential")
    .max(50, "Maximum 50 at a time"),
});

export type CredentialBatchRevokeInput = z.infer<typeof credentialBatchRevokeSchema>;

export const credentialVerifySchema = z.object({
  credential_id: z.string().min(1, "Credential ID is required"),
  hash: z
    .string()
    .min(1, "Hash is required")
    .regex(/^0x[0-9a-fA-F]{64}$/, "Must be a valid 0x-prefixed SHA-256 hex hash"),
});

export type CredentialVerifyInput = z.infer<typeof credentialVerifySchema>;

export const CREDENTIAL_TYPE_OPTIONS = CREDENTIAL_TYPES.map((t) => ({
  value: t,
  label: t.replace(/([A-Z])/g, " $1").trim(),
}));

export function defaultCredentialIssueRow(): CredentialIssueRowInput {
  return {
    holder_id: "",
    type: "AcademicDegree",
    title: "",
    description: "",
    uri: "",
    valid_until: null,
  };
}
