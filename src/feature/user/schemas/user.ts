import { z } from "zod";
import { Role } from "@shared/auth/role";

import { metaEntriesSchema } from "@shared/lib/meta";
export { metaEntrySchema, metaEntriesSchema } from "@shared/lib/meta";

const STRICT_E164 = /^\+[1-9]\d{6,14}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const optionalEmptyToNull = (schema: z.ZodString) =>
  schema.optional().or(z.literal("").transform(() => undefined));

/**
 * For update payloads where a field can be:
 * - a valid string  → keep
 * - undefined       → no change (field absent from payload)
 * - null            → explicit clear
 * - empty string "" → coerce to undefined (treat blank input as "no change")
 *
 * Uses preprocess so the empty-string coercion runs BEFORE the inner schema's
 * validation. A union like `schema.nullable().optional().or(z.literal(""))`
 * does not work for schemas that accept empty strings (e.g. `z.string().max(256)`)
 * because the first branch short-circuits.
 */
const nullableOptionalEmptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === "" ? undefined : val), schema.nullable().optional());

export const phoneSchema = z
  .string()
  .max(19, "zod.user.phoneTooLong")
  .regex(STRICT_E164, "zod.user.phoneFormat");

export const birthDateSchema = z.string().regex(ISO_DATE, "zod.user.dateFormat");

export const metaSchema = z.record(z.string(), z.unknown());

export const genderSchema = z.enum(["male", "female", "other"]);

const baseUserFields = {
  name: z.string().min(1, "zod.user.nameRequired").max(256, "zod.user.nameTooLong"),
  number: nullableOptionalEmptyToUndefined(z.string().max(256, "zod.user.numberTooLong")),
  phone_number: optionalEmptyToNull(phoneSchema),
  email: z
    .string()
    .min(1, "zod.user.emailRequired")
    .max(256, "zod.user.emailTooLong")
    .email("zod.user.emailInvalid"),
  birth_date: optionalEmptyToNull(birthDateSchema),
  gender: genderSchema.nullable().optional(),
  meta: metaSchema.nullable().optional(),
};

export const userStoreSchema = z.object({
  ...baseUserFields,
  role: z.enum([Role.HOLDER, Role.ISSUER, Role.ADMIN], {
    message: "zod.user.roleRequired",
  }),
});

export type UserStoreInput = z.infer<typeof userStoreSchema>;

export const userBatchStoreSchema = z.object({
  users: z.array(userStoreSchema).min(1, "zod.batch.minOne").max(100, "zod.batch.maxHundred"),
});

export type UserBatchStoreInput = z.infer<typeof userBatchStoreSchema>;

export const userUpdateSchema = z.object({
  id: z.string().min(1, "zod.user.idRequired"),
  name: z.string().min(1, "zod.user.nameRequired").max(256, "zod.user.nameTooLong").optional(),
  number: nullableOptionalEmptyToUndefined(z.string().max(256, "zod.user.numberTooLong")),
  phone_number: nullableOptionalEmptyToUndefined(phoneSchema),
  birth_date: nullableOptionalEmptyToUndefined(birthDateSchema),
  gender: genderSchema.nullable().optional(),
  meta: metaSchema.nullable().optional(),
  email: z.string().max(256, "zod.user.emailTooLong").email("zod.user.emailInvalid").optional(),
  role: z
    .enum([Role.HOLDER, Role.ISSUER, Role.ADMIN], { message: "zod.user.roleRequired" })
    .optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export const userBatchUpdateSchema = z.object({
  users: z.array(userUpdateSchema).min(1, "zod.batch.minOne").max(100, "zod.batch.maxHundred"),
});

export type UserBatchUpdateInput = z.infer<typeof userBatchUpdateSchema>;

export const userBatchUpdateRoleSchema = z.object({
  users: z
    .array(
      z.object({
        id: z.string().min(1, "zod.user.idRequired"),
        role: z.enum([Role.HOLDER, Role.ISSUER, Role.ADMIN], {
          message: "zod.user.roleRequired",
        }),
      }),
    )
    .min(1, "zod.batch.minOne")
    .max(100, "zod.batch.maxHundred"),
});

export type UserBatchUpdateRoleInput = z.infer<typeof userBatchUpdateRoleSchema>;

export const userBatchDeleteSchema = z.object({
  ids: z
    .array(z.string().min(1, "zod.user.idRequired"))
    .min(1, "zod.batch.deleteMinOne")
    .max(100, "zod.batch.maxHundred"),
});

export type UserBatchDeleteInput = z.infer<typeof userBatchDeleteSchema>;

export const userSelfProfileSchema = z.object({
  phone_number: optionalEmptyToNull(phoneSchema),
});

export type UserSelfProfileInput = z.infer<typeof userSelfProfileSchema>;

export const userSelfEmailSchema = z.object({
  email: z
    .string()
    .min(1, "zod.user.emailRequired")
    .max(256, "zod.user.emailTooLong")
    .email("zod.user.emailInvalid"),
  id_token: z.string().min(1, "zod.user.idTokenRequired"),
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
    gender: undefined,
    meta: null,
    role: Role.HOLDER,
  };
}

export const userStoreFormSchema = userStoreSchema
  .omit({ meta: true })
  .extend({ meta_entries: metaEntriesSchema.optional() });

export type UserStoreFormInput = z.infer<typeof userStoreFormSchema>;

export const userBatchStoreFormSchema = z.object({
  users: z.array(userStoreFormSchema).min(1, "zod.batch.minOne").max(100, "zod.batch.maxHundred"),
});

export type UserBatchStoreFormInput = z.infer<typeof userBatchStoreFormSchema>;

export function defaultUserStoreFormRow(): UserStoreFormInput {
  return {
    name: "",
    number: undefined,
    phone_number: undefined,
    email: "",
    birth_date: undefined,
    gender: undefined,
    meta_entries: [],
    role: Role.HOLDER,
  };
}
