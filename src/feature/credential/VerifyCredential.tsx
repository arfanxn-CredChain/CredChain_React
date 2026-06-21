import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileBadge, Loader2, ShieldAlert, ShieldCheck, Upload } from "lucide-react";
import { useVerifyCredential } from "./api/useVerifyCredential";
import type { CredentialVerifyDTO } from "@shared/types/api";
import { DecorBlob } from "@shared/components/DecorBlob";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { formatDateTime } from "@shared/lib/format";
import { cn } from "@shared/lib/cn";

export function VerifyCredential() {
  const { t } = useTranslation();
  const [state, setState] = useState<"idle" | "verifying" | "done">("idle");
  const [result, setResult] = useState<CredentialVerifyDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const verify = useVerifyCredential();

  const handleFile = async (file: File) => {
    setState("verifying");
    setError(null);
    setResult(null);
    try {
      const resp = await verify.mutateAsync(file);
      setResult(resp);
      setState("done");
    } catch {
      setError(t("cred.verify.failed"));
      setState("idle");
    }
  };

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

      <Card className="overflow-hidden p-6 sm:p-10">
        <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
          <DecorBlob tone="gold" position="top-right" size="md" />
          <Upload className="relative z-10 mx-auto mb-4 h-12 w-12 text-gold" aria-hidden="true" />
          <h3 className="relative z-10 font-display text-lg font-bold text-navy">
            {t("cred.verify.verifyDoc")}
          </h3>
          <p className="relative z-10 mt-2 mb-6 text-sm text-gray-500">
            {t("cred.verify.verifyDocDesc")}
          </p>
          <div className="relative z-10 w-full max-w-sm">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              id="file-upload"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
              aria-label={t("cred.verify.uploadAriaLabel")}
            />
            <Button asChild variant="primary" size="lg" className="w-full">
              <label htmlFor="file-upload" className="cursor-pointer">
                {state === "verifying" ? (
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

          {error && (
            <p className="relative z-10 mt-4 text-sm text-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </Card>

      {result && state === "done" && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "flex flex-col gap-4 rounded-2xl p-6 shadow-lg md:p-8",
            result.verdict_code === 400401
              ? "bg-success text-surface shadow-success/20"
              : "bg-navy text-surface shadow-navy/20",
          )}
        >
          <div className="flex items-start gap-4">
            {result.verdict_code === 400401 ? (
              <ShieldCheck className="mt-1 h-8 w-8 shrink-0" aria-hidden="true" />
            ) : (
              <ShieldAlert className="mt-1 h-8 w-8 shrink-0" aria-hidden="true" />
            )}
            <div>
              <h3 className="mb-1 font-display text-xl font-extrabold tracking-tight">
                {result.description}
              </h3>
              {result.similarity_score != null && (
                <p className="text-sm text-white/80">
                  {t("cred.verify.similarityLabel")}: {result.similarity_percent}
                </p>
              )}
            </div>
          </div>

          {result.credential && (
            <div className="rounded-xl bg-white/10 p-4">
              <p className="mb-2 text-xs font-bold tracking-wider text-white/70 uppercase">
                {t("cred.verify.matchedCredential")}
              </p>
              <div className="flex items-center gap-3">
                <FileBadge className="h-5 w-5 text-gold" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold">{result.credential.name}</p>
                  <p className="text-xs text-white/60">
                    {t("cred.detail.issued")}: {formatDateTime(result.credential.issued_at)}
                  </p>
                </div>
              </div>
              <Link
                to={`/credentials/${result.credential.id}`}
                className="mt-2 inline-flex items-center text-sm font-bold text-gold transition-colors hover:text-surface"
              >
                {t("cred.verify.viewCredential")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}