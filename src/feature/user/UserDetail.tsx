import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, Calendar, Mail, Phone, Wallet, Hash } from "lucide-react";
import { useUser } from "./api/useUser";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { Card } from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import { UserAvatar } from "@shared/components/UserAvatar";
import { UserRoleBadge } from "@shared/components/UserRoleBadge";
import { UserStatusBadge } from "@shared/components/UserStatusBadge";
import { formatDate, formatDateTime } from "@shared/lib/format";

export function UserDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useUser(id ?? "");

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title={t("user.detail.title")} onBack />
        <EmptyState
          icon={AlertCircle}
          title={t("user.detail.notFound.title")}
          description={t("user.detail.notFound.body")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title={user?.name ?? t("user.detail.title")} description={user?.email} onBack />

      {isLoading || !user ? (
        <Card className="space-y-6 p-8">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      ) : (
        <>
          <Card className="p-6 sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <UserAvatar user={user} size="xl" />
                <div>
                  <EyebrowLabel>{t("user.detail.identity")}</EyebrowLabel>
                  <h3 className="font-display text-xl font-bold text-navy">
                    {user.name ?? t("user.detail.unnamed")}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <UserRoleBadge role={user.role} />
                <UserStatusBadge deletedAt={user.deleted_at} />
              </div>
            </div>

            <hr className="my-6 border-gray-50" />

            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field icon={Mail} label={t("user.detail.email")} value={user.email} />
              <Field icon={Phone} label={t("user.detail.phone")} value={user.phone_number ?? "—"} />
              <Field icon={Hash} label={t("user.detail.number")} value={user.number ?? "—"} />
              <Field
                icon={Calendar}
                label={t("user.detail.birthDate")}
                value={user.birth_date ? formatDate(user.birth_date) : "—"}
              />
            </dl>
          </Card>

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-4">{t("user.detail.onChain")}</EyebrowLabel>
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <MonoId value={user.wallet_address} mode="address" className="text-sm text-navy" />
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-4">{t("user.detail.audit")}</EyebrowLabel>
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("user.detail.created")}
                </dt>
                <dd className="text-sm text-navy">{formatDateTime(user.created_at)}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("user.detail.updated")}
                </dt>
                <dd className="text-sm text-navy">{formatDateTime(user.updated_at)}</dd>
              </div>
              {user.deleted_at && (
                <div className="sm:col-span-2">
                  <dt className="mb-1 text-xs font-bold tracking-wider text-error uppercase">
                    {t("user.detail.deleted")}
                  </dt>
                  <dd className="text-sm text-error">{formatDateTime(user.deleted_at)}</dd>
                </div>
              )}
            </dl>
          </Card>

          {user.meta && Object.keys(user.meta).length > 0 && (
            <Card className="p-6 sm:p-8">
              <EyebrowLabel className="mb-4">{t("user.detail.metadata")}</EyebrowLabel>
              <pre className="overflow-x-auto rounded-xl bg-gray-50 p-4 font-mono text-xs text-gray-600">
                {JSON.stringify(user.meta, null, 2)}
              </pre>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function Field({ icon: Icon, label, value }: FieldProps) {
  return (
    <div>
      <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider text-gray-400 uppercase">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-sm break-all text-navy">{value}</dd>
    </div>
  );
}
