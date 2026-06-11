import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, ExternalLink, Hash, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { useCredential } from "./api/useCredential";
import { useUser } from "@feature/user/api/useUser";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { CredentialStatusBadge } from "./components/CredentialStatusBadge";
import { formatDate, formatDateTime } from "@shared/lib/format";

export function CredentialDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: cred, isLoading, isError } = useCredential(id ?? "");
  const { data: holder } = useUser(cred?.holder_id ?? "");
  const { data: issuer } = useUser(cred?.issuer_id ?? "");

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
      <PageHeader title={cred?.title ?? t("cred.detail.title")} description={cred?.type} onBack />

      {isLoading || !cred ? (
        <Card className="space-y-6 p-8">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : (
        <>
          <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
            <div>
              <EyebrowLabel>{t("cred.detail.status")}</EyebrowLabel>
              <CredentialStatusBadge revoked={cred.revoked} />
              <p className="mt-3 text-sm text-gray-500">
                {t("cred.detail.issued")} {formatDate(cred.issued_at)}
                {cred.valid_until &&
                  ` · ${t("cred.detail.expires")} ${formatDate(cred.valid_until)}`}
              </p>
            </div>
            <Button asChild variant="primary">
              <Link to={`/credentials/verify/${cred.id}`}>
                <ShieldCheck className="h-4 w-4 text-gold" />
                {t("cred.detail.publicVerify")}
              </Link>
            </Button>
          </Card>

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-4">{t("cred.detail.subjectAuthority")}</EyebrowLabel>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("cred.detail.holder")}
                </p>
                <p className="text-sm font-bold break-all text-navy">
                  {holder?.name ?? holder?.email ?? cred.holder_id}
                </p>
                <MonoId value={cred.holder_id} className="mt-1 block" />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("cred.detail.issuer")}
                </p>
                <p className="text-sm font-bold break-all text-navy">
                  {issuer?.name ?? issuer?.email ?? cred.issuer_id}
                </p>
                <MonoId value={cred.issuer_id} className="mt-1 block" />
              </div>
            </div>
          </Card>

          {cred.description && (
            <Card className="p-6 sm:p-8">
              <EyebrowLabel className="mb-2">{t("cred.detail.description")}</EyebrowLabel>
              <p className="text-sm leading-relaxed text-navy">{cred.description}</p>
            </Card>
          )}

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-2 flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" aria-hidden="true" />
              {t("cred.detail.cryptoHash")}
            </EyebrowLabel>
            <code className="block rounded-xl border border-gray-100 bg-gray-50 p-4 font-mono text-xs break-all text-gray-700 sm:text-sm">
              {cred.hash}
            </code>
          </Card>

          {cred.uri && (
            <Card className="p-6 sm:p-8">
              <EyebrowLabel className="mb-2 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {t("cred.detail.metadataAttachment")}
              </EyebrowLabel>
              <a
                href={
                  cred.uri.startsWith("ipfs://")
                    ? `https://ipfs.io/ipfs/${cred.uri.slice(7)}`
                    : cred.uri
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold break-all text-gold transition-colors hover:text-navy"
              >
                {cred.uri}
                <ExternalLink
                  className="ml-1 h-3 w-3 shrink-0 opacity-70"
                  aria-hidden="true"
                />
              </a>
            </Card>
          )}

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-4">{t("cred.detail.audit")}</EyebrowLabel>
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("cred.detail.created")}
                </dt>
                <dd className="text-sm text-navy">{formatDateTime(cred.created_at)}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {t("cred.detail.lastUpdated")}
                </dt>
                <dd className="text-sm text-navy">{formatDateTime(cred.updated_at)}</dd>
              </div>
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}
