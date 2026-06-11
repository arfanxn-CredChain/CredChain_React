import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Ban, Loader2, ShieldAlert, ShieldCheck, Upload } from "lucide-react";
import { useCredential } from "./api/useCredential";
import { useUser } from "@feature/user/api/useUser";
import { sha256File } from "@shared/lib/hash";
import { DecorBlob } from "@shared/components/DecorBlob";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { CredentialStatusBadge } from "./components/CredentialStatusBadge";
import { formatDate, formatDateTime } from "@shared/lib/format";
import { cn } from "@shared/lib/cn";

type VerifyState = "idle" | "hashing" | "match" | "mismatch";

export function VerifyCredential() {
  const { t } = useTranslation();
  const { credentialId } = useParams<{ credentialId: string }>();
  const { data: cred, isLoading, isError } = useCredential(credentialId ?? "");
  const { data: issuer } = useUser(cred?.issuer_id ?? "");

  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [prevId, setPrevId] = useState(credentialId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (prevId !== credentialId) {
    setPrevId(credentialId);
    setVerifyState("idle");
    setComputedHash(null);
  }

  const handleFile = async (file: File) => {
    setVerifyState("hashing");
    setComputedHash(null);
    try {
      const hash = await sha256File(file);
      setComputedHash(hash);
      setVerifyState(hash === cred?.hash ? "match" : "mismatch");
    } catch {
      setVerifyState("idle");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" aria-label={t("cred.verify.loading")} />
      </div>
    );
  }

  if (isError || !cred) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <ShieldAlert className="mb-4 h-16 w-16 text-error" aria-hidden="true" />
        <h2 className="mb-2 font-display text-3xl font-extrabold tracking-tight text-navy">
          {t("cred.verify.notFound.title")}
        </h2>
        <p className="mb-8 max-w-md text-gray-500">{t("cred.verify.notFound.body")}</p>
        <Link
          to="/login"
          className="inline-flex items-center font-bold text-gold transition-colors hover:text-navy"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("cred.verify.notFound.returnHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-4 text-center">
        <div className="mb-2 inline-flex items-center justify-center rounded-2xl bg-navy p-3 shadow-lg shadow-navy/20">
          <ShieldCheck className="h-10 w-10 text-gold" aria-hidden="true" />
        </div>
        <h2 className="font-display text-4xl font-extrabold tracking-tight text-balance text-navy md:text-5xl">
          {t("cred.verify.title")}
        </h2>
        <p className="mx-auto max-w-xl text-lg text-pretty text-gray-500">
          {t("cred.verify.description")}
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-gray-50 p-6 sm:flex-row sm:items-center sm:p-10">
          <div>
            <EyebrowLabel>{t("cred.verify.credentialType")}</EyebrowLabel>
            <div className="mt-1 font-display text-2xl font-bold text-navy">{cred.type}</div>
            {cred.title && <p className="mt-1 text-sm text-gray-500">{cred.title}</p>}
          </div>
          <CredentialStatusBadge revoked={cred.revoked} />
        </div>

        <div className="grid grid-cols-1 gap-8 bg-gray-50/50 p-6 sm:p-10 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <EyebrowLabel>{t("cred.verify.blockchainHash")}</EyebrowLabel>
              <code className="mt-1 block rounded-xl border border-gray-200 bg-white p-3 font-mono text-xs break-all text-navy shadow-sm">
                {cred.hash}
              </code>
            </div>
            <div>
              <EyebrowLabel>{t("cred.verify.issuingAuthority")}</EyebrowLabel>
              <p className="mt-1 text-sm font-bold text-navy">
                {issuer?.name ?? issuer?.email ?? ""}
              </p>
              <MonoId value={cred.issuer_id} className="mt-0.5 block" />
            </div>
            <div>
              <EyebrowLabel>{t("cred.verify.dateOfIssuance")}</EyebrowLabel>
              <p className="mt-1 text-sm font-bold text-navy">{formatDateTime(cred.issued_at)}</p>
            </div>
            {cred.valid_until && (
              <div>
                <EyebrowLabel>{t("cred.verify.validUntil")}</EyebrowLabel>
                <p className="mt-1 text-sm font-bold text-navy">{formatDate(cred.valid_until)}</p>
              </div>
            )}
          </div>

          <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            {cred.revoked ? (
              <div className="flex flex-col items-center">
                <Ban className="mb-4 h-16 w-16 text-error/20" aria-hidden="true" />
                <p className="text-sm font-bold text-error">
                  {t("cred.verify.verificationDisabled")}
                </p>
                <p className="mt-2 px-4 text-xs text-error/70">{t("cred.verify.revokedDesc")}</p>
              </div>
            ) : (
              <>
                <DecorBlob tone="gold" position="top-right" size="md" />
                <Upload
                  className="relative z-10 mx-auto mb-4 h-12 w-12 text-gold"
                  aria-hidden="true"
                />
                <h3 className="relative z-10 font-display text-lg font-bold text-navy">
                  {t("cred.verify.verifyDoc")}
                </h3>
                <p className="relative z-10 mt-2 mb-6 text-sm text-gray-500">
                  {t("cred.verify.verifyDocDesc")}
                </p>
                <div className="relative z-10 w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFile(file);
                    }}
                    aria-label={t("cred.verify.uploadAriaLabel")}
                  />
                  <Button asChild variant="primary" size="lg" className="w-full">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {verifyState === "hashing" ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                          {t("cred.verify.processing")}
                        </>
                      ) : (
                        t("cred.verify.selectFile")
                      )}
                    </label>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {(verifyState === "match" || verifyState === "mismatch") && !cred.revoked && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-start gap-4 rounded-2xl p-6 shadow-lg md:p-8",
            verifyState === "match"
              ? "bg-success text-surface shadow-success/20"
              : "bg-error text-surface shadow-error/20",
          )}
        >
          {verifyState === "match" ? (
            <ShieldCheck className="mt-1 h-8 w-8 shrink-0" aria-hidden="true" />
          ) : (
            <ShieldAlert className="mt-1 h-8 w-8 shrink-0" aria-hidden="true" />
          )}
          <div>
            <h3 className="mb-2 font-display text-xl font-extrabold tracking-tight">
              {verifyState === "match" ? t("cred.verify.success") : t("cred.verify.failed")}
            </h3>
            <p className="max-w-2xl text-sm leading-relaxed text-white/90">
              {verifyState === "match" ? t("cred.verify.successDesc") : t("cred.verify.failedDesc")}
            </p>
            {computedHash && (
              <div className="mt-4">
                <span className="mb-1 block text-xs font-bold tracking-wider text-white/70 uppercase">
                  {t("cred.verify.computedHash")}
                </span>
                <code className="font-mono text-sm break-all opacity-90">{computedHash}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
