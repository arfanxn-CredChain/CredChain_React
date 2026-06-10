import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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

  const { data: holdersData } = useUsers({
    role: Role.HOLDER,
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
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Issue Credentials"
        description="Generate and distribute verifiable records to network entities."
        onBack
      />

      <Card className="p-0">
        <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-8">
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

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="dashed"
              onClick={() => append(defaultCredentialIssueRow())}
              disabled={fields.length >= 50}
            >
              <Plus className="h-4 w-4" />
              Add another record
            </Button>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={issue.isPending}
            >
              <Save className="h-5 w-5" />
              {issue.isPending ? "Issuing..." : "Issue Credentials"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
