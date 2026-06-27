import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  Hash,
  HelpCircle,
  Loader2,
  Minus,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useVerifyCredential } from "./api/useVerifyCredential";
import { getVerdictTier, getMethodLabel } from "./lib/verdict";
import { verifyFileSchema } from "./schemas/credential";
import type { CredentialVerifyDTO } from "@shared/types/api";
import { useStore } from "@app/store";
import { canAccess, Role } from "@shared/auth/role";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { CredentialFileInput } from "./components/CredentialFileInput";
import { CredentialFileModal } from "./components/CredentialFileModal";
import { CredentialStatusBadge } from "@shared/components/CredentialStatusBadge";
import { UserContactBlock } from "@shared/components/UserContactBlock";
import { CopyInlineButton } from "@shared/components/CopyInlineButton";
import { formatDate, truncateId } from "@shared/lib/format";
import { cn } from "@shared/lib/cn";

const VERDICT_GRADIENT: Record<string, string> = {
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
  amber: "from-amber-500 to-amber-600",
  gray: "from-gray-400 to-gray-500",
  "light-gray": "from-gray-300 to-gray-400",
};

const VERDICT_ICON: Record<string, typeof ShieldCheck> = {
  green: ShieldCheck,
  orange: ShieldAlert,
  red: AlertTriangle,
  amber: HelpCircle,
  gray: Minus,
  "light-gray": Minus,
};

const VERDICT_ICON_BG: Record<string, string> = {
  green: "bg-white/20",
  orange: "bg-white/20",
  red: "bg-white/20",
  amber: "bg-white/20",
  gray: "bg-white/15",
  "light-gray": "bg-white/15",
};

const SIMILARITY_BAR_COLOR: Record<string, string> = {
  red: "from-red-400 to-red-500",
  amber: "from-amber-400 to-amber-500",
  gray: "from-gray-400 to-gray-500",
  "light-gray": "from-gray-300 to-gray-400",
};

type VerifyState = "idle" | "verifying" | "done";

export function VerifyCredential() {
  const { t } = useTranslation();
  const [state, setState] = useState<VerifyState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<CredentialVerifyDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { user, isAuthenticated } = useStore();
  const verify = useVerifyCredential();

  const handleFileChange = (f: File | null) => {
    if (!f) {
      setFile(null);
      setFileError(null);
      return;
    }
    const parsed = verifyFileSchema.safeParse(f);
    if (!parsed.success) {
      setFileError(parsed.error.issues[0].message);
      return;
    }
    setFile(f);
    setFileError(null);
  };

  const handleVerify = async () => {
    if (!file) return;
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

  const handleReset = () => {
    setState("idle");
    setFile(null);
    setFileError(null);
    setResult(null);
    setError(null);
  };

  const tier = result ? getVerdictTier(result.verdict_code) : "light-gray";
  const method = result ? getMethodLabel(result.similarity_score) : "hash";
  const hasCredential = result?.credential != null;

  const isHolderOfCredential =
    isAuthenticated && hasCredential && user?.id === result.credential!.holder_user_id;
  const isIssuerOrAbove = isAuthenticated && canAccess(user?.role, Role.ISSUER);
  const canViewCredential = isIssuerOrAbove || isHolderOfCredential;

  const VerdictIcon = VERDICT_ICON[tier];
  const showSimilarity = result?.similarity_score != null;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-64px-48px)] max-w-4xl flex-col items-center justify-center space-y-6 px-4 py-8">
      {/* Page Header — no logo */}
      <div className="space-y-4 text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance text-navy sm:text-4xl md:text-5xl">
          {t("cred.verify.title")}
        </h2>
        <p className="mx-auto max-w-xl text-lg text-pretty text-gray-500">
          {t("cred.verify.description")}
        </p>
      </div>

      {/* Upload Card */}
      <Card className="mx-auto max-w-[560px] overflow-hidden">
        <div className="p-5 md:p-6">
          <CredentialFileInput
            file={file}
            onChange={handleFileChange}
            onExpand={() => setPreviewOpen(true)}
            error={fileError ?? undefined}
          />

          {error && (
            <p className="mt-4 text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            className="mt-5 w-full"
            disabled={!file || state === "verifying"}
            onClick={handleVerify}
          >
            {state === "verifying" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                {t("cred.verify.processing")}
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" aria-hidden="true" />
                {t("cred.verify.verifyNow")}
              </>
            )}
          </Button>
        </div>

        {file && (
          <CredentialFileModal
            file={file}
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
          />
        )}
      </Card>

      {/* Result Card */}
      {result && state === "done" && (
        <div role="status" aria-live="polite">
          <Card className="mx-auto max-w-[560px] overflow-hidden">
            {/* Verdict Banner */}
            <div
              className={cn(
                "bg-gradient-to-br p-6 text-center text-white md:p-8",
                VERDICT_GRADIENT[tier],
              )}
            >
              <div
                className={cn(
                  "mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full",
                  VERDICT_ICON_BG[tier],
                )}
              >
                <VerdictIcon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight">
                {result.description}
              </h3>
            </div>

            <div className="p-5 md:p-6">
              {/* Similarity Bar (fuzzy only) */}
              {showSimilarity && (
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {t("cred.verify.similarityLabel")}
                    </span>
                    <span
                      className="font-bold"
                      style={{
                        color:
                          tier === "red"
                            ? "#EF4444"
                            : tier === "amber"
                              ? "#D97706"
                              : "#6B7280",
                      }}
                    >
                      {result.similarity_percent}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r",
                        SIMILARITY_BAR_COLOR[tier] ?? "from-gray-400 to-gray-500",
                      )}
                      style={{ width: `${(result.similarity_score ?? 0) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {/* Method Badge */}
              <div
                className={cn(
                  "mb-5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                  method === "hash"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700",
                )}
              >
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-bold",
                    method === "hash"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700",
                  )}
                >
                  {method === "hash" ? "HASH" : "AI"}
                </span>
                {t(`cred.verify.method.${method}`)}
              </div>

              {/* Credential Section */}
              {hasCredential && (
                <div className="border-t border-gray-100 pt-5">
                  {/* Status Badge */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <CredentialStatusBadge
                      revoked={result.credential!.revoked_at !== null}
                    />
                  </div>

                  {/* Name */}
                  <h4 className="text-base font-bold text-navy">
                    {result.credential!.name}
                  </h4>

                  {/* Credential ULID — shield icon */}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    <span className="shrink-0 truncate font-mono text-gray-500">
                      {truncateId(result.credential!.id)}
                    </span>
                    <CopyInlineButton
                      value={result.credential!.id}
                      ariaLabel={t("cred.copy.credentialId")}
                      className="shrink-0"
                    />
                  </div>

                  {/* ID Token — credit card icon (issuer+ only) */}
                  {isIssuerOrAbove && result.credential!.token_id && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/></svg>
                      <span className="shrink-0 truncate font-mono text-gray-500">
                        {truncateId(result.credential!.token_id)}
                      </span>
                      <CopyInlineButton
                        value={result.credential!.token_id}
                        ariaLabel={t("cred.verify.tokenId")}
                        className="shrink-0"
                      />
                    </div>
                  )}

                  {/* File Hash — hash icon */}
                  {result.credential!.file_hash && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs">
                      <Hash className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                      <span className="shrink-0 truncate font-mono text-gray-500">
                        {truncateId(result.credential!.file_hash)}
                      </span>
                      <CopyInlineButton
                        value={result.credential!.file_hash}
                        ariaLabel={t("cred.verify.fileHash")}
                        className="shrink-0"
                      />
                    </div>
                  )}

                  {/* Holder (auth-aware) */}
                  {canViewCredential && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <UserContactBlock
                        labelType="full"
                        user={result.credential!.holder}
                        fallbackId={result.credential!.holder_user_id}
                        copyPrefix="holder"
                      />
                    </div>
                  )}

                  {/* Issuer (name + role badge only) */}
                  {canViewCredential && (
                    <div className="mb-3 border-t border-gray-100 pt-3">
                      <UserContactBlock
                        labelType="compact"
                        user={result.credential!.issuer}
                        fallbackId={result.credential!.issuer_user_id}
                        copyPrefix="issuer"
                      />
                    </div>
                  )}

                  {/* Revoker (conditional: revoked + auth-aware) */}
                  {canViewCredential &&
                    result.credential!.revoked_at !== null &&
                    result.credential!.revoker && (
                      <div className="mb-3 border-t border-gray-100 pt-3">
                        <UserContactBlock
                          labelType="compact"
                          user={result.credential!.revoker}
                          fallbackId={result.credential!.revoker_user_id ?? ""}
                          copyPrefix="revoker"
                          tone="error"
                        />
                      </div>
                    )}

                  {/* Issued Date */}
                  <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                    {t("cred.card.issued")} {formatDate(result.credential!.issued_at)}
                  </div>
                </div>
              )}

              {/* No Match Guidance */}
              {!hasCredential && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1.5 text-sm font-semibold text-navy">
                    {t("cred.verify.whatThisMeans")}
                  </p>
                  <ul className="space-y-1 text-xs text-gray-500">
                    <li>{t("cred.verify.noMatchReason1")}</li>
                    <li>{t("cred.verify.noMatchReason2")}</li>
                    <li>{t("cred.verify.noMatchReason3")}</li>
                  </ul>
                </div>
              )}

              {/* Sign-in Nudge (unauthed + credential found) */}
              {!isAuthenticated && hasCredential && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                  <p className="text-sm font-bold text-amber-800">
                    {t("cred.verify.signInNudge")}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-600">
                    {t("cred.verify.signInNudgeDesc")}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 flex gap-3">
                {canViewCredential && (
                  <Button asChild variant="primary" className="flex-1">
                    <Link to={`/credentials/${result.credential!.id}`}>
                      {t("cred.verify.viewCredential")}
                    </Link>
                  </Button>
                )}
                <Button
                  variant={canViewCredential ? "outline" : "primary"}
                  className={canViewCredential ? "flex-1" : "w-full"}
                  onClick={handleReset}
                >
                  {t("cred.verify.verifyAnother")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
