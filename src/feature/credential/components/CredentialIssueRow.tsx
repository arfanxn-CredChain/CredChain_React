import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Calendar, FileText, Hash, Link as LinkIcon, Trash2, Type } from "lucide-react";
import type { UserDTO } from "@shared/types/api";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { FormField } from "@ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { CREDENTIAL_TYPE_OPTIONS, type CredentialBatchIssueInput } from "../schemas/credential";

interface CredentialIssueRowProps {
  index: number;
  form: UseFormReturn<CredentialBatchIssueInput>;
  holders: UserDTO[];
  onRemove?: () => void;
}

export function CredentialIssueRow({ index, form, holders, onRemove }: CredentialIssueRowProps) {
  const { t } = useTranslation();
  const errors = form.formState.errors.credentials?.[index];
  const holderId = form.watch(`credentials.${index}.holder_id`);
  const type = form.watch(`credentials.${index}.type`);

  return (
    <div className="relative flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all focus-within:border-gold/50 focus-within:bg-white sm:gap-6 sm:p-6">
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute top-3 right-3 h-8 w-8 text-gray-400 hover:bg-error/10 hover:text-error sm:top-4 sm:right-4 sm:h-9 sm:w-9"
          aria-label={`Remove row ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="grid w-full grid-cols-1 gap-4 pr-12 sm:gap-6 md:grid-cols-2">
        <FormField label={t("cred.field.recipient")} error={errors?.holder_id?.message}>
          <Select
            value={holderId}
            onValueChange={(value) =>
              form.setValue(`credentials.${index}.holder_id`, value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("cred.field.selectRecipient")} />
            </SelectTrigger>
            <SelectContent>
              {holders.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">{t("cred.field.noHolders")}</div>
              ) : (
                holders.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name ?? h.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={t("cred.field.type")} error={errors?.type?.message}>
          <Select
            value={type}
            onValueChange={(value) =>
              form.setValue(`credentials.${index}.type`, value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("cred.field.selectType")} />
            </SelectTrigger>
            <SelectContent>
              {CREDENTIAL_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={t("cred.field.title")} error={errors?.title?.message}>
          <Input
            leadingIcon={Type}
            placeholder={t("cred.field.titlePlaceholder")}
            {...form.register(`credentials.${index}.title`)}
          />
        </FormField>

        <FormField
          label={t("cred.field.description")}
          error={errors?.description?.message}
          optional
        >
          <Input
            leadingIcon={FileText}
            placeholder={t("cred.field.descriptionPlaceholder")}
            {...form.register(`credentials.${index}.description`)}
          />
        </FormField>

        <FormField
          label={t("cred.field.uri")}
          hint={t("cred.field.uriHint")}
          error={errors?.uri?.message}
        >
          <Input
            leadingIcon={LinkIcon}
            placeholder={t("cred.field.uriPlaceholder")}
            inputMode="url"
            autoCapitalize="off"
            {...form.register(`credentials.${index}.uri`)}
          />
        </FormField>

        <FormField label={t("cred.field.validUntil")} error={errors?.valid_until?.message} optional>
          <Input
            type="date"
            leadingIcon={Calendar}
            {...form.register(`credentials.${index}.valid_until`)}
          />
        </FormField>
      </div>

      <div className="flex items-center font-mono text-xs text-gray-400">
        <Hash className="mr-1 h-3 w-3" aria-hidden="true" />
        {t("cred.field.hashNote")}
      </div>
    </div>
  );
}
