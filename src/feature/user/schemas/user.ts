import { z } from "zod";
import { Role } from "@shared/auth/role";

const STRICT_E164 = /^\+[1-9]\d{6,14}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const optionalEmptyToNull = (schema: z.ZodString) =>
  schema.optional().or(z.literal("").transform(() => undefined));

export const phoneSchema = z
  .string()
  .max(19, "Phone number too long")
  .regex(STRICT_E164, "Use international format, e.g. +6281234567890");

export const birthDateSchema = z
  .string()
  .regex(ISO_DATE, "Use YYYY-MM-DD format");

export const metaSchema = z.record(z.string(), z.unknown());

export const metaEntrySchema = z.object({
  key: z.string().min(1, "Key required").max(64, "Key too long"),
  value: z.string().max(1024, "Value too long"),
});

export const metaEntriesSchema = z
  .array(metaEntrySchema)
  .max(32, "Too many entries")
  .superRefine((entries, ctx) => {
    const seen = new Set<string>();
    entries.forEach((entry, idx) => {
      if (entry.key && seen.has(entry.key)) {
        ctx.addIssue({
          code: "custom",
          path: [idx, "key"],
          message: "Duplicate key",
        });
      }
      if (entry.key) seen.add(entry.key);
    });
  });

export type MetaEntryInput = z.infer<typeof metaEntrySchema>;

const baseUserFields = {
  name: z.string().min(1, "Name is required").max(256, "Name too long"),
  number: optionalEmptyToNull(z.string().max(256, "Number too long")),
  phone_number: optionalEmptyToNull(phoneSchema),
  email: z.string().min(1, "Email is required").max(256, "Email too long").email("Invalid email"),
  birth_date: optionalEmptyToNull(birthDateSchema),
  meta: metaSchema.nullable().optional(),
};

export const userStoreSchema = z.object({
  ...baseUserFields,
  role: z.enum([Role.HOLDER, Role.ISSUER, Role.ADMIN], {
    message: "Select a role",
  }),
});

export type UserStoreInput = z.infer<typeof userStoreSchema>;

export const userBatchStoreSchema = z.object({
  users: z.array(userStoreSchema).min(1, "Add at least one user").max(100, "Maximum 100 users per batch"),
});

export type UserBatchStoreInput = z.infer<typeof userBatchStoreSchema>;

export const userUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(256).optional(),
  number: z.string().max(256).nullable().optional(),
  phone_number: phoneSchema.nullable().optional(),
  birth_date: birthDateSchema.nullable().optional(),
  meta: metaSchema.nullable().optional(),
  email: z.string().email().max(256).optional(),
  role: z.enum([Role.HOLDER, Role.ISSUER, Role.ADMIN]).optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const userBatchUpdateSchema = z.object({
  users: z.array(userUpdateSchema).min(1).max(100),
});

export type UserBatchUpdateInput = z.infer<typeof userBatchUpdateSchema>;

export const userBatchUpdateRoleSchema = z.object({
  users: z
    .array(
      z.object({
        id: z.string().min(1),
        role: z.enum([Role.HOLDER, Role.ISSUER, Role.ADMIN]),
      }),
    )
    .min(1)
    .max(100),
});

export type UserBatchUpdateRoleInput = z.infer<typeof userBatchUpdateRoleSchema>;

export const userBatchDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one user").max(100),
});

export type UserBatchDeleteInput = z.infer<typeof userBatchDeleteSchema>;

export const userSelfProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(256),
  number: optionalEmptyToNull(z.string().max(256)),
  phone_number: optionalEmptyToNull(phoneSchema),
  birth_date: optionalEmptyToNull(birthDateSchema),
  meta: metaSchema.nullable().optional(),
});

export type UserSelfProfileInput = z.infer<typeof userSelfProfileSchema>;

export const userSelfEmailSchema = z.object({
  email: z.string().min(1, "Email is required").max(256).email("Invalid email"),
  id_token: z.string().min(1, "Google verification required"),
});

export type UserSelfEmailInput = z.infer<typeof userSelfEmailSchema>;

export const userInlineEditFormSchema = userUpdateSchema
  .omit({ meta: true })
  .extend({ meta_entries: metaEntriesSchema.optional() });

export type UserInlineEditFormInput = z.infer<typeof userInlineEditFormSchema>;

export function defaultUserStoreRow(): UserStoreInput {
  return {
    name: "",
    number: undefined,
    phone_number: undefined,
    email: "",
    birth_date: undefined,
    meta: null,
    role: Role.HOLDER,
  };
}
