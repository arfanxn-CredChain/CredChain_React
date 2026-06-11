import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Briefcase, Calendar, Hash, Mail, Phone, Trash2, User } from "lucide-react";

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { FormField } from "@ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Role } from "@shared/auth/role";

import type { UserBatchStoreFormInput } from "../schemas/user";
import { MetaEditor } from "./MetaEditor";

interface UserCreateRowProps {
  index: number;
  form: UseFormReturn<UserBatchStoreFormInput>;
  onRemove?: () => void;
}

export function UserCreateRow({ index, form, onRemove }: UserCreateRowProps) {
  const { t } = useTranslation();
  const errors = form.formState.errors.users?.[index];
  const role = form.watch(`users.${index}.role`);
  const gender = form.watch(`users.${index}.gender`);

  const roleOptions = [
    { value: Role.HOLDER, label: t("user.edit.role.holder") },
    { value: Role.ISSUER, label: t("user.edit.role.issuer") },
    { value: Role.ADMIN, label: t("user.edit.role.admin") },
  ];

  return (
    <div className="relative flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all focus-within:border-gold/50 focus-within:bg-white sm:gap-6 sm:p-6">
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute top-3 right-3 h-8 w-8 text-gray-400 hover:bg-error/10 hover:text-error sm:top-4 sm:right-4 sm:h-9 sm:w-9"
          aria-label={t("userCreate.removeAriaLabel", { n: index + 1 })}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="grid w-full grid-cols-1 gap-4 pr-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FormField label={t("user.edit.fullName")} error={errors?.name?.message}>
          <Input
            leadingIcon={User}
            placeholder={t("userCreate.field.name.placeholder")}
            autoComplete="name"
            {...form.register(`users.${index}.name`)}
          />
        </FormField>

        <FormField label={t("user.edit.email")} error={errors?.email?.message}>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            leadingIcon={Mail}
            placeholder={t("userCreate.field.email.placeholder")}
            {...form.register(`users.${index}.email`)}
          />
        </FormField>

        <FormField
          label={t("user.edit.phone")}
          hint={t("userCreate.field.phone.hint")}
          error={errors?.phone_number?.message}
          optional
        >
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            leadingIcon={Phone}
            placeholder={t("userCreate.field.phone.placeholder")}
            {...form.register(`users.${index}.phone_number`)}
          />
        </FormField>

        <FormField
          label={t("user.edit.numberId")}
          hint={t("userCreate.field.number.hint")}
          error={errors?.number?.message}
          optional
        >
          <Input
            leadingIcon={Hash}
            placeholder={t("userCreate.field.number.placeholder")}
            {...form.register(`users.${index}.number`)}
          />
        </FormField>

        <FormField label={t("user.edit.birthDate")} error={errors?.birth_date?.message} optional>
          <Input
            type="date"
            leadingIcon={Calendar}
            {...form.register(`users.${index}.birth_date`)}
          />
        </FormField>

        <FormField label={t("user.field.gender")} error={errors?.gender?.message} optional>
          <Select
            value={gender ?? "__none__"}
            onValueChange={(value) => {
              form.setValue(
                `users.${index}.gender`,
                value === "__none__" ? undefined : (value as "male" | "female" | "other"),
                { shouldValidate: true },
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("user.field.gender.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t("common.notSet")}</SelectItem>
              <SelectItem value="male">{t("user.field.gender.male")}</SelectItem>
              <SelectItem value="female">{t("user.field.gender.female")}</SelectItem>
              <SelectItem value="other">{t("user.field.gender.other")}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={t("user.edit.role")} error={errors?.role?.message}>
          <Select
            value={role}
            onValueChange={(value) => {
              if (value === Role.HOLDER || value === Role.ISSUER || value === Role.ADMIN) {
                form.setValue(`users.${index}.role`, value, {
                  shouldValidate: true,
                });
              }
            }}
          >
            <SelectTrigger>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <SelectValue placeholder={t("user.edit.role.placeholder")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <details className="mt-2 sm:mt-4">
        <summary className="cursor-pointer list-none py-2 text-sm font-medium text-gray-500 hover:text-navy">
          + {t("userCreate.customFields.toggle")}
        </summary>
        <div className="mt-4 ml-2">
          <MetaEditor control={form.control} name={`users.${index}.meta_entries`} />
        </div>
      </details>
    </div>
  );
}
