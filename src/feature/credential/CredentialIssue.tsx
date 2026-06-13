import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Save } from "lucide-react";

import { PageHeader } from "@shared/components/PageHeader";
import { Button } from "@ui/button";
import { Card } from "@ui/card";

import { useIssueCredentials } from "./api/useIssueCredentials";
import { useUsers } from "@feature/user/api/useUsers";
import { Role } from "@shared/auth/role";
import {
  type CredentialBatchIssueInput,
  credentialBatchIssueSchema,
  defaultCredentialIssueRow,
} from "./schemas/credential";
import { CredentialIssueRow } from "./components/CredentialIssueRow";

export function CredentialIssue() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: holdersData } = useUsers({
    filters: [`role=${Role.HOLDER}`],
    limit: 100,
  });
  const holders = holdersData?.items ?? [];

  const form = useForm<CredentialBatchIssueInput>({
    resolver: zodResolver(credentialBatchIssueSchema),
    defaultValues: { credentials: [defaultCredentialIssueRow()] },
    mode: "onBlur",
  });

  const issue = useIssueCredentials(form);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "credentials",
  });

  const onSubmit = form.handleSubmit((data) => {
    issue.mutate(data, {
      onSuccess: () => navigate("/credentials"),
    });
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("cred.issue.title")} description={t("cred.issue.description")} onBack />

      <Card className="p-0">
        <form onSubmit={onSubmit} className="space-y-8 p-6 sm:p-8">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <CredentialIssueRow
                key={field.id}
                index={index}
                form={form}
                holders={holders}
                onRemove={fields.length > 1 ? () => remove(index) : undefined}
              />
            ))}
          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="dashed"
              onClick={() => append(defaultCredentialIssueRow())}
              disabled={fields.length >= 50}
            >
              <Plus className="h-4 w-4" />
              {t("cred.issue.addAnother")}
            </Button>

            <Button type="submit" variant="primary" size="lg" disabled={issue.isPending}>
              <Save className="h-5 w-5" />
              {issue.isPending ? t("cred.issue.submitting") : t("cred.issue.submit")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
