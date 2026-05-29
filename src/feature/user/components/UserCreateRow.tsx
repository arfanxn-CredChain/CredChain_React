import type { UseFormReturn } from "react-hook-form";
import { Briefcase, Calendar, Hash, Mail, Phone, Trash2, User } from "lucide-react";

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
import { Role } from "@shared/auth/role";
import { cn } from "@shared/lib/cn";

import type { UserBatchStoreInput } from "../schemas/user";

interface UserCreateRowProps {
  index: number;
  form: UseFormReturn<UserBatchStoreInput>;
  onRemove?: () => void;
}

const ROLE_OPTIONS = [
  { value: Role.HOLDER, label: "Holder" },
  { value: Role.ISSUER, label: "Issuer" },
  { value: Role.ADMIN, label: "Admin" },
];

export function UserCreateRow({ index, form, onRemove }: UserCreateRowProps) {
  const errors = form.formState.errors.users?.[index];
  const role = form.watch(`users.${index}.role`);

  return (
    <div className="flex flex-col gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100 transition-all focus-within:border-gold/50 focus-within:bg-white relative">
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute top-4 right-4 text-gray-400 hover:text-error hover:bg-error/10"
          aria-label={`Remove entity ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pr-8">
        <FormField
          label="Full name"
          error={errors?.name?.message}
        >
          <Input
            leadingIcon={User}
            placeholder="Jane Doe"
            autoComplete="name"
            {...form.register(`users.${index}.name`)}
          />
        </FormField>

        <FormField
          label="Email address"
          error={errors?.email?.message}
        >
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            leadingIcon={Mail}
            placeholder="user@credchain.demo"
            {...form.register(`users.${index}.email`)}
          />
        </FormField>

        <FormField
          label="Phone number"
          hint="Use international format, e.g. +6281234567890"
          error={errors?.phone_number?.message}
          optional
        >
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            leadingIcon={Phone}
            placeholder="+6281234567890"
            {...form.register(`users.${index}.phone_number`)}
          />
        </FormField>

        <FormField
          label="Number / ID"
          hint="Employee ID, student number, etc."
          error={errors?.number?.message}
          optional
        >
          <Input
            leadingIcon={Hash}
            placeholder="EMP-12345"
            {...form.register(`users.${index}.number`)}
          />
        </FormField>

        <FormField
          label="Birth date"
          error={errors?.birth_date?.message}
          optional
        >
          <Input
            type="date"
            leadingIcon={Calendar}
            {...form.register(`users.${index}.birth_date`)}
          />
        </FormField>

        <FormField
          label="Network role"
          error={errors?.role?.message}
        >
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
                <SelectValue placeholder="Select a role" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

function FormField({ label, hint, error, optional, children }: FormFieldProps) {
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
