import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { X, User, Hash, Phone, Calendar, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Role } from "@shared/auth/role";
import { useConfirm } from "@ui/confirm-dialog";
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
import { UserAvatar } from "@shared/components/UserAvatar";
import { notify } from "@shared/lib/notify";
import { isApiError } from "@shared/api/envelope";
import { setServerErrors } from "@shared/lib/forms";
import type { UserDTO } from "@shared/types/api";
import { cn } from "@shared/lib/cn";
import { useUpdateUsers } from "../api/useUpdateUsers";
import {
  userInlineEditFormSchema,
  type UserInlineEditFormInput,
  type UserUpdateInput,
} from "../schemas/user";
import { splitMeta, mergeMeta, metaEqual } from "../lib/meta";
import { MetaEditor } from "./MetaEditor";

interface UserEditDrawerProps {
  user: UserDTO | null;
  onClose: () => void;
}

export function UserEditDrawer({ user, onClose }: UserEditDrawerProps) {
  const { t } = useTranslation();
  const { confirm, dialog } = useConfirm();
  const update = useUpdateUsers();

  const form = useForm<UserInlineEditFormInput>({
    resolver: zodResolver(userInlineEditFormSchema),
    mode: "onBlur",
    defaultValues: {
      id: "",
      name: "",
      role: Role.HOLDER,
      meta_entries: [],
    },
  });

  // Track dirty state explicitly — RHF's isDirty/dirtyFields are unreliable with useFieldArray after reset
  const [hasDirty, setHasDirty] = useState(false);

  useEffect(() => {
    if (user) {
      setHasDirty(false);
      const { entries } = splitMeta(user.meta);
      form.reset({
        id: user.id,
        name: user.name ?? "",
        number: user.number ?? undefined,
        phone_number: user.phone_number ?? undefined,
        birth_date: user.birth_date ? user.birth_date.slice(0, 10) : undefined,
        email: user.email,
        role: user.role,
        meta_entries: entries,
      });
    }
  }, [user, form]);

  // Mark dirty on any user-initiated change
  useEffect(() => {
    const subscription = form.watch((_, { type }) => {
      if (type === "change") setHasDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Layer 2: beforeunload guard while drawer is open and dirty
  useEffect(() => {
    if (!user || !hasDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [user, hasDirty]);

  const handleSave = form.handleSubmit(async (data) => {
    const ok = await confirm({
      title: t("user.update.confirm.title"),
      description: t("user.update.confirm.body", {
        name: user?.name ?? user?.email ?? "user",
      }),
      confirmLabel: t("user.update.confirm.action"),
      cancelLabel: t("common.cancel"),
    });
    if (!ok) return;

    const dirty = form.formState.dirtyFields;
    const original = user ? splitMeta(user.meta) : { entries: [], preserved: {} };
    const payload: UserUpdateInput = { id: data.id };

    if (dirty.name) payload.name = data.name;
    if (dirty.number) payload.number = data.number ?? null;
    if (dirty.phone_number) payload.phone_number = data.phone_number ?? null;
    if (dirty.birth_date) payload.birth_date = data.birth_date ?? null;
    if (dirty.email) payload.email = data.email;
    if (dirty.role) payload.role = data.role;
    if (dirty.meta_entries) {
      const merged = mergeMeta(data.meta_entries ?? [], original.preserved);
      if (!metaEqual(merged, user?.meta ?? null)) payload.meta = merged;
    }

    if (Object.keys(payload).length <= 1) {
      onClose();
      return;
    }

    try {
      await update.mutateAsync({ users: [payload] });
      onClose();
    } catch (error) {
      if (isApiError(error) && error.fieldErrors) {
        setServerErrors(form, error.fieldErrors);
      } else if (isApiError(error)) {
        notify.error(error.messageKey);
      }
    }
  });

  const handleClose = async () => {
    // Deep dirty check: dirtyFields can have empty array keys after reset (useFieldArray quirk)
    const hasDirty = Object.values(form.formState.dirtyFields).some((v) => {
      if (Array.isArray(v)) return v.some((item) => item && Object.keys(item).length > 0);
      return v === true;
    });
    if (!hasDirty) {
      onClose();
      return;
    }
    const ok = await confirm({
      title: t("user.edit.discard.title"),
      description: t("user.edit.discard.body", { name: user?.name ?? "user" }),
      confirmLabel: t("user.edit.discard.action"),
      cancelLabel: t("common.cancel"),
      tone: "destructive",
    });
    if (ok) {
      onClose();
      form.reset();
    }
  };

  const errors = form.formState.errors;

  return (
    <Drawer.Root
      open={!!user}
      onOpenChange={(o) => {
        if (!o) void handleClose();
      }}
      direction="right"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex max-w-md flex-col bg-surface shadow-2xl",
            "sm:max-w-lg md:max-w-xl",
          )}
        >
          <Drawer.Title className="sr-only">Edit user</Drawer.Title>
          <Drawer.Description className="sr-only">Update user fields</Drawer.Description>

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div>
                <h2 className="font-bold text-fg">{user?.name ?? "User"}</h2>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleClose()}
              aria-label="Close"
              className="rounded-md p-1 text-gray-400 hover:text-fg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form className="space-y-6" onSubmit={handleSave}>
              <Field label="Full name" error={errors.name?.message}>
                <Input leadingIcon={User} {...form.register("name")} />
              </Field>
              <Field label="Number / ID" error={errors.number?.message} optional>
                <Input leadingIcon={Hash} {...form.register("number")} />
              </Field>
              <Field label="Phone" error={errors.phone_number?.message} optional>
                <Input type="tel" leadingIcon={Phone} {...form.register("phone_number")} />
              </Field>
              <Field label="Birth date" error={errors.birth_date?.message} optional>
                <Input type="date" leadingIcon={Calendar} {...form.register("birth_date")} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <Input type="email" leadingIcon={Mail} {...form.register("email")} />
                {form.formState.dirtyFields.email && (
                  <p className="text-xs text-warning mt-1" role="alert">
                    {t("user.email.update.warning")}
                  </p>
                )}
              </Field>
              <Field label="Role" error={errors.role?.message}>
                <Select
                  value={form.watch("role")}
                  onValueChange={(v) => form.setValue("role", v as Role, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.HOLDER}>Holder</SelectItem>
                    <SelectItem value={Role.ISSUER}>Issuer</SelectItem>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <MetaEditor control={form.control} />
            </form>
          </div>

          <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => void handleClose()}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleSave()}
              disabled={update.isPending || !form.formState.isDirty}
            >
              {update.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
      {dialog}
    </Drawer.Root>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, optional, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label>
        {label}
        {optional && <span className="ml-1 text-gray-400 font-normal">(optional)</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-error mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
