import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Save } from "lucide-react";

import { BackLink } from "@shared/components/BackLink";
import { PageHeader } from "@shared/components/PageHeader";
import { Button } from "@ui/button";
import { Card } from "@ui/card";

import { useCreateUsers } from "./api/useCreateUsers";
import {
  type UserBatchStoreFormInput,
  defaultUserStoreFormRow,
  userBatchStoreFormSchema,
} from "./schemas/user";
import { mergeMeta } from "./lib/meta";
import { UserCreateRow } from "./components/UserCreateRow";

export function UserCreate() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const form = useForm<UserBatchStoreFormInput>({
    resolver: zodResolver(userBatchStoreFormSchema),
    defaultValues: { users: [defaultUserStoreFormRow()] },
    mode: "onBlur",
  });

  const createUsers = useCreateUsers(form);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "users",
  });

  const onSubmit = form.handleSubmit((data) => {
    const payload = {
      users: data.users.map(({ meta_entries, ...row }) => ({
        ...row,
        meta: mergeMeta(meta_entries ?? [], {}),
      })),
    };
    createUsers.mutate(payload, {
      onSuccess: () => navigate("/users"),
    });
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BackLink />

      <PageHeader title={t("userCreate.title")} description={t("userCreate.description")} />

      <Card className="p-0">
        <form onSubmit={onSubmit} className="space-y-8 p-6 sm:p-8">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <UserCreateRow
                key={field.id}
                index={index}
                form={form}
                onRemove={fields.length > 1 ? () => remove(index) : undefined}
              />
            ))}
          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="dashed"
              onClick={() => append(defaultUserStoreFormRow())}
              disabled={fields.length >= 100}
            >
              <Plus className="h-4 w-4" />
              {t("userCreate.addAnother")}
            </Button>

            <Button type="submit" variant="primary" size="lg" disabled={createUsers.isPending}>
              <Save className="h-5 w-5" />
              {createUsers.isPending ? t("userCreate.submitting") : t("userCreate.submit")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
