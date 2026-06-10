import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ExternalLink,
  Hash,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";
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
  const { id } = useParams<{ id: string }>();
  const { data: cred, isLoading, isError } = useCredential(id ?? "");
  const { data: holder } = useUser(cred?.holder_id ?? "");
  const { data: issuer } = useUser(cred?.issuer_id ?? "");

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader title="Credential Detail" onBack />
        <EmptyState
          icon={AlertCircle}
          title="Credential not found"
          description="This credential does not exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={cred?.title ?? "Credential Detail"}
        description={cred?.type}
        onBack
      />

      {isLoading || !cred ? (
        <Card className="p-8 space-y-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </Card>
      ) : (
        <>
          <Card className="p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <EyebrowLabel>Status</EyebrowLabel>
              <CredentialStatusBadge revoked={cred.revoked} />
              <p className="text-sm text-gray-500 mt-3">
                Issued {formatDate(cred.issued_at)}
                {cred.valid_until && ` · Expires ${formatDate(cred.valid_until)}`}
              </p>
            </div>
            <Button asChild variant="primary">
              <Link to={`/credentials/verify/${cred.id}`}>
                <ShieldCheck className="h-4 w-4 text-gold" />
                Public verification
              </Link>
            </Button>
          </Card>

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-4">Subject &amp; Authority</EyebrowLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Holder
                </p>
                <p className="text-sm font-bold text-navy break-all">
                  {holder?.name ?? holder?.email ?? cred.holder_id}
                </p>
                <MonoId value={cred.holder_id} className="mt-1 block" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Issuer
                </p>
                <p className="text-sm font-bold text-navy break-all">
                  {issuer?.name ?? issuer?.email ?? cred.issuer_id}
                </p>
                <MonoId value={cred.issuer_id} className="mt-1 block" />
              </div>
            </div>
          </Card>

          {cred.description && (
            <Card className="p-6 sm:p-8">
              <EyebrowLabel className="mb-2">Description</EyebrowLabel>
              <p className="text-sm text-navy leading-relaxed">{cred.description}</p>
            </Card>
          )}

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-2 flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" aria-hidden="true" />
              Cryptographic Hash
            </EyebrowLabel>
            <code className="block font-mono text-xs sm:text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 break-all">
              {cred.hash}
            </code>
          </Card>

          {cred.uri && (
            <Card className="p-6 sm:p-8">
              <EyebrowLabel className="mb-2 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Metadata Attachment
              </EyebrowLabel>
              <a
                href={cred.uri.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${cred.uri.slice(7)}` : cred.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold text-gold hover:text-navy transition-colors break-all"
              >
                {cred.uri}
                <ExternalLink className="w-3 h-3 ml-1 opacity-70 flex-shrink-0" aria-hidden="true" />
              </a>
            </Card>
          )}

          <Card className="p-6 sm:p-8">
            <EyebrowLabel className="mb-4">Audit</EyebrowLabel>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Created
                </dt>
                <dd className="text-sm text-navy">{formatDateTime(cred.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Last updated
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
