import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import type { UserDTO } from "@shared/types/api";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { FormField } from "@ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import type { CredentialBatchIssueInput } from "../schemas/credential";

interface CredentialIssueRowProps {
  index: number;
  form: UseFormReturn<CredentialBatchIssueInput>;
  holders: UserDTO[];
  onRemove?: () => void;
}

export function CredentialIssueRow({ index, form, holders, onRemove }: CredentialIssueRowProps) {
  const { t } = useTranslation();
  const errors = form.formState.errors.credentials?.[index];
  const holderId = form.watch(`credentials.${index}.holder_user_id`);

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
        <FormField label={t("cred.field.holder")} error={errors?.holder_user_id?.message}>
          <Select
            value={holderId}
            onValueChange={(value) =>
              form.setValue(`credentials.${index}.holder_user_id`, value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("cred.field.selectHolder")} />
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

        <FormField label={t("cred.field.name")} error={errors?.name?.message}>
          <Input
            placeholder={t("cred.field.namePlaceholder")}
            {...form.register(`credentials.${index}.name`)}
          />
        </FormField>

        <FormField label={t("cred.field.file")} hint={t("cred.field.fileHint")} error={errors?.file?.message}>
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              form.setValue(`credentials.${index}.file`, file, { shouldValidate: true });
            }}
          />
        </FormField>

        <FormField label={t("cred.field.meta")} optional error={errors?.meta?.message}>
          <Input
            placeholder={t("cred.field.metaPlaceholder")}
            {...form.register(`credentials.${index}.meta`)}
          />
        </FormField>
      </div>
    </div>
  );
}
