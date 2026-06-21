import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, Hash, RotateCw } from "lucide-react";
import { useCredential } from "./api/useCredential";
import { useReExtractCredentials } from "./api/useReExtractCredentials";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { DetailRow } from "@shared/components/DetailRow";
import { MonoId } from "@shared/components/MonoId";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { CredentialStatusBadge } from "./components/CredentialStatusBadge";
import { formatDateTime } from "@shared/lib/format";
import { cn } from "@shared/lib/cn";

export function CredentialDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: cred, isLoading, isError } = useCredential(id ?? "", [
    "holder",
    "issuer",
    "revoker",
  ]);
  const reExtract = useReExtractCredentials();

  const revoked = cred?.revoked_at !== null;
  const extractFailed = cred?.extract_status === "failed";

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title={t("cred.detail.title")} onBack />
        <EmptyState
          icon={AlertCircle}
          title={t("cred.detail.notFound.title")}
          description={t("cred.detail.notFound.body")}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={cred?.name ?? t("cred.detail.title")}
        description={cred?.id ?? undefined}
        onBack
      />

      {isLoading || !cred ? (
        <Card className="space-y-6 p-8">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : (
        <>
          {/* Status Card */}
          <Card className={cn("flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8")}>
            <div>
              <DetailRow
                label={t("cred.detail.status")}
                value={<CredentialStatusBadge revoked={revoked} />}
              />
              <div className="mt-3">
                <DetailRow
                  label={t("cred.detail.extractionStatus")}
                  value={
                    <CredentialStatusBadge
                      revoked={false}
                      extractStatus={cred.extract_status}
                      showExtractStatus
                    />
                  }
                />
                {cred.extract_error && (
                  <p className="mt-1 text-xs text-error">{cred.extract_error}</p>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-500">
                {t("cred.detail.issued")} {formatDateTime(cred.issued_at)}
                {cred.revoked_at && ` · ${formatDateTime(cred.revoked_at)}`}
              </p>
            </div>
            {extractFailed && (
              <Button
                variant="outline"
                onClick={() => cred.id && reExtract.mutate([cred.id])}
                disabled={reExtract.isPending}
              >
                <RotateCw className="h-4 w-4" />
                {t("cred.detail.reExtract")}
              </Button>
            )}
          </Card>

          {/* Holder/Issuer/Revoker */}
          <Card className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DetailRow
                label={t("cred.detail.holder")}
                value={
                  <>
                    <p className="text-sm font-bold break-all text-navy">
                      {cred.holder?.name ?? cred.holder?.email ?? cred.holder_user_id}
                    </p>
                    <MonoId value={cred.holder_user_id} className="mt-0.5 block" />
                  </>
                }
              />
              <DetailRow
                label={t("cred.detail.issuer")}
                value={
                  <>
                    <p className="text-sm font-bold break-all text-navy">
                      {cred.issuer?.name ?? cred.issuer?.email ?? cred.issuer_user_id}
                    </p>
                    <MonoId value={cred.issuer_user_id} className="mt-0.5 block" />
                  </>
                }
              />
              {cred.revoker && (
                <DetailRow
                  label={t("cred.detail.revoker")}
                  value={
                    <>
                      <p className="text-sm font-bold break-all text-navy">
                        {cred.revoker.name ?? cred.revoker.email ?? cred.revoker_user_id ?? ""}
                      </p>
                      <MonoId value={cred.revoker_user_id ?? ""} className="mt-0.5 block" />
                    </>
                  }
                />
              )}
            </div>
          </Card>

          {/* File Hash */}
          <Card className="p-6 sm:p-8">
            <DetailRow
              label={t("cred.detail.fileHash")}
              icon={Hash}
              value={
                <code className="block rounded-xl border border-gray-100 bg-gray-50 p-4 font-mono text-xs break-all text-gray-700 sm:text-sm">
                  {cred.file_hash}
                </code>
              }
            />
          </Card>

          {/* Token ID */}
          {cred.token_id && (
            <Card className="p-6 sm:p-8">
              <DetailRow
                label={t("cred.detail.tokenId")}
                value={<MonoId value={cred.token_id} mode="full" />}
              />
            </Card>
          )}

          {/* File URI */}
          {cred.file_uri && (
            <Card className="p-6 sm:p-8">
              <DetailRow
                label={t("cred.detail.fileUri")}
                value={<code className="font-mono text-xs break-all text-gray-600">{cred.file_uri}</code>}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}