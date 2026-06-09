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
  holder_id: z.string().min(1, "zod.credential.holderRequired"),
  type: z
    .string()
    .min(1, "zod.credential.typeRequired")
    .max(256, "zod.credential.typeTooLong"),
  title: z
    .string()
    .min(1, "zod.credential.titleRequired")
    .max(256, "zod.credential.titleTooLong"),
  description: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().max(1024, "zod.credential.descriptionTooLong").optional(),
  ),
  uri: z
    .string()
    .min(1, "zod.credential.uriRequired")
    .max(512, "zod.credential.uriTooLong")
    .refine((v) => v.startsWith("ipfs://") || v.startsWith("https://"), {
      message: "zod.credential.uriPrefix",
    }),
  valid_until: z.preprocess(
    (v) => (v === "" ? null : v),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "zod.user.dateFormat").nullable().optional(),
  ),
});

export type CredentialIssueRowInput = z.infer<typeof credentialIssueRowSchema>;

export const credentialBatchIssueSchema = z.object({
  credentials: z
    .array(credentialIssueRowSchema)
    .min(1, "zod.credential.batchMinOne")
    .max(50, "zod.credential.batchMaxFifty"),
});

export type CredentialBatchIssueInput = z.infer<typeof credentialBatchIssueSchema>;

export const credentialBatchRevokeSchema = z.object({
  ids: z
    .array(z.string().min(1, "zod.credential.idRequired"))
    .min(1, "zod.credential.revokeMinOne")
    .max(50, "zod.credential.revokeMaxFifty"),
});

export type CredentialBatchRevokeInput = z.infer<typeof credentialBatchRevokeSchema>;

export const credentialVerifySchema = z.object({
  credential_id: z.string().min(1, "zod.credential.idRequired"),
  hash: z
    .string()
    .min(1, "zod.credential.hashRequired")
    .regex(/^0x[0-9a-fA-F]{64}$/, "zod.credential.hashFormat"),
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
