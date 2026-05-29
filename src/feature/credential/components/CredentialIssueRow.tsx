import type { UseFormReturn } from "react-hook-form";
import { Calendar, FileText, Hash, Link as LinkIcon, Trash2, Type } from "lucide-react";
import type { UserDTO } from "@shared/types/api";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  CREDENTIAL_TYPE_OPTIONS,
  type CredentialBatchIssueInput,
} from "../schemas/credential";
import { cn } from "@shared/lib/cn";

interface CredentialIssueRowProps {
  index: number;
  form: UseFormReturn<CredentialBatchIssueInput>;
  holders: UserDTO[];
  onRemove?: () => void;
}

export function CredentialIssueRow({ index, form, holders, onRemove }: CredentialIssueRowProps) {
  const errors = form.formState.errors.credentials?.[index];
  const holderId = form.watch(`credentials.${index}.holder_id`);
  const type = form.watch(`credentials.${index}.type`);

  return (
    <div className="flex flex-col gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100 transition-all focus-within:border-gold/50 focus-within:bg-white relative">
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute top-4 right-4 text-gray-400 hover:text-error hover:bg-error/10"
          aria-label={`Remove row ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pr-8">
        <Field label="Recipient (holder)" error={errors?.holder_id?.message}>
          <Select
            value={holderId}
            onValueChange={(value) =>
              form.setValue(`credentials.${index}.holder_id`, value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recipient..." />
            </SelectTrigger>
            <SelectContent>
              {holders.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No holders found.</div>
              ) : (
                holders.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name ?? h.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Credential type" error={errors?.type?.message}>
          <Select
            value={type}
            onValueChange={(value) =>
              form.setValue(`credentials.${index}.type`, value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {CREDENTIAL_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Title" error={errors?.title?.message}>
          <Input
            leadingIcon={Type}
            placeholder="Bachelor of Science in Computer Science"
            {...form.register(`credentials.${index}.title`)}
          />
        </Field>

        <Field label="Description" error={errors?.description?.message} optional>
          <Input
            leadingIcon={FileText}
            placeholder="Awarded for completing the undergraduate degree requirements."
            {...form.register(`credentials.${index}.description`)}
          />
        </Field>

        <Field
          label="Metadata URI"
          hint="ipfs:// or https:// link to credential metadata"
          error={errors?.uri?.message}
        >
          <Input
            leadingIcon={LinkIcon}
            placeholder="ipfs://Qm..."
            inputMode="url"
            autoCapitalize="off"
            {...form.register(`credentials.${index}.uri`)}
          />
        </Field>

        <Field label="Valid until" error={errors?.valid_until?.message} optional>
          <Input
            type="date"
            leadingIcon={Calendar}
            {...form.register(`credentials.${index}.valid_until`)}
          />
        </Field>
      </div>

      <div className="flex items-center text-xs font-mono text-gray-400">
        <Hash className="w-3 h-3 mr-1" aria-hidden="true" />
        Hash will be computed and committed on-chain when issued.
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

function Field({ label, hint, error, optional, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label>
        {label}
        {optional && <span className="ml-1 text-gray-400 font-normal">(optional)</span>}
      </Label>
      {children}
      {error ? (
        <p className={cn("text-xs text-error mt-1")} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
