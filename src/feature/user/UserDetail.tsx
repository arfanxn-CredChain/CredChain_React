import { useParams } from "react-router-dom";
import { AlertCircle, Calendar, Mail, Phone, Wallet, Hash } from "lucide-react";
import { useUser } from "./api/useUser";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { Card } from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import { UserAvatar } from "@shared/components/UserAvatar";
import { UserRoleBadge } from "./components/UserRoleBadge";
import { UserStatusBadge } from "./components/UserStatusBadge";
import { formatDate, formatDateTime } from "@shared/lib/format";

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useUser(id ?? "");

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <PageHeader title="User Profile" onBack />
        <EmptyState
          icon={AlertCircle}
          title="User not found"
          description="This user does not exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={user?.name ?? "User Profile"}
        description={user?.email}
        onBack
      />

      {isLoading || !user ? (
        <Card className="p-8 space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      ) : (
        <>
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <UserAvatar user={user} size="xl" />
                <div>
                  <EyebrowLabel>Identity</EyebrowLabel>
                  <h3 className="font-display text-xl font-bold text-navy">
                    {user.name ?? "Unnamed entity"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <UserRoleBadge role={user.role} />
                <UserStatusBadge deletedAt={user.deleted_at} />
              </div>
            </div>

            <hr className="border-gray-50 my-6" />

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field icon={Mail} label="Email" value={user.email} />
              <Field icon={Phone} label="Phone" value={user.phone_number ?? "—"} />
              <Field icon={Hash} label="Number" value={user.number ?? "—"} />
              <Field
                icon={Calendar}
                label="Birth date"
                value={user.birth_date ? formatDate(user.birth_date) : "—"}
              />
            </dl>
          </Card>

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-4">On-chain identity</EyebrowLabel>
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <MonoId value={user.wallet_address} mode="address" className="text-sm text-navy" />
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-4">Audit</EyebrowLabel>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Created
                </dt>
                <dd className="text-sm text-navy">{formatDateTime(user.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Updated
                </dt>
                <dd className="text-sm text-navy">{formatDateTime(user.updated_at)}</dd>
              </div>
              {user.deleted_at && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold text-error uppercase tracking-wider mb-1">
                    Deleted
                  </dt>
                  <dd className="text-sm text-error">{formatDateTime(user.deleted_at)}</dd>
                </div>
              )}
            </dl>
          </Card>

          {user.meta && Object.keys(user.meta).length > 0 && (
            <Card className="p-6 sm:p-8">
              <EyebrowLabel className="mb-4">Metadata</EyebrowLabel>
              <pre className="font-mono text-xs text-gray-600 bg-gray-50 p-4 rounded-xl overflow-x-auto">
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
      <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-sm text-navy break-all">{value}</dd>
    </div>
  );
}
