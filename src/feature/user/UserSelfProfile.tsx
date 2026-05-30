import { useEffect, cloneElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, Hash, Calendar, Save } from "lucide-react";
import { useStore } from "@app/store";
import { PageHeader } from "@shared/components/PageHeader";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { useUpdateSelfProfile } from "./api/useUpdateSelfProfile";
import { userSelfProfileSchema, type UserSelfProfileInput } from "./schemas/user";
import { cn } from "@shared/lib/cn";

export function UserSelfProfile() {
  const user = useStore((s) => s.user);

  const form = useForm<UserSelfProfileInput>({
    resolver: zodResolver(userSelfProfileSchema),
    mode: "onBlur",
  });

  const update = useUpdateSelfProfile(form);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        number: user.number ?? undefined,
        phone_number: user.phone_number ?? undefined,
        birth_date: user.birth_date ? user.birth_date.slice(0, 10) : undefined,
        meta: user.meta ?? null,
      });
    }
  }, [user, form]);

  const onSubmit = form.handleSubmit((data) => update.mutate(data));
  const errors = form.formState.errors;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your personal information."
      />

      <Card className="p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <Field label="Full name" error={errors.name?.message}>
            <Input
              leadingIcon={User}
              placeholder="Jane Doe"
              autoComplete="name"
              {...form.register("name")}
            />
          </Field>

          <Field label="Number / ID" error={errors.number?.message} optional>
            <Input
              leadingIcon={Hash}
              placeholder="EMP-12345"
              {...form.register("number")}
            />
          </Field>

          <Field
            label="Phone number"
            hint="International format, e.g. +6281234567890"
            error={errors.phone_number?.message}
            optional
          >
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              leadingIcon={Phone}
              placeholder="+6281234567890"
              {...form.register("phone_number")}
            />
          </Field>

          <Field label="Birth date" error={errors.birth_date?.message} optional>
            <Input
              type="date"
              leadingIcon={Calendar}
              {...form.register("birth_date")}
            />
          </Field>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={update.isPending || !form.formState.isDirty}
            >
              <Save className="h-4 w-4" />
              {update.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
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
  const fieldId = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      <Label htmlFor={fieldId}>
        {label}
        {optional && <span className="ml-1 text-gray-400 font-normal">(optional)</span>}
      </Label>
      {cloneElement(children as React.ReactElement<{ id?: string }>, { id: fieldId })}
      {error ? (
        <p className={cn("text-xs text-error mt-1")} role="alert">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
