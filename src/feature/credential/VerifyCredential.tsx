import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Calendar,
  HelpCircle,
  Loader2,
  Minus,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useVerifyCredential } from "./api/useVerifyCredential";
import { getVerdictTier, getMethodLabel } from "./lib/verdict";
import type { CredentialVerifyDTO } from "@shared/types/api";
import { useStore } from "@app/store";
import { canAccess, Role } from "@shared/auth/role";
import { DecorBlob } from "@shared/components/DecorBlob";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { CredentialStatusBadge } from "@shared/components/CredentialStatusBadge";
import { UserContactBlock } from "@shared/components/UserContactBlock";
import { MonoId } from "@shared/components/MonoId";
import { CopyInlineButton } from "@shared/components/CopyInlineButton";
import { formatDate } from "@shared/lib/format";
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

export function VerifyCredential() {
  const { t } = useTranslation();
  const [state, setState] = useState<"idle" | "verifying" | "done">("idle");
  const [result, setResult] = useState<CredentialVerifyDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, isAuthenticated } = useStore();
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

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        <div role="status" aria-live="polite">
          <Card className="overflow-hidden">
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

                  {/* Name + ID */}
                  <h4 className="text-base font-bold text-navy">
                    {result.credential!.name}
                  </h4>
                  <div className="mt-0.5 mb-4 flex items-center gap-1.5">
                    <MonoId value={result.credential!.id} mode="id" />
                    <CopyInlineButton
                      value={result.credential!.id}
                      ariaLabel={t("cred.copy.credentialId")}
                      className="shrink-0"
                    />
                  </div>

                  {/* Holder (auth-aware) */}
                  {canViewCredential && (
                    <div className="mb-3">
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

                  {/* Token ID (issuer+ only) */}
                  {isIssuerOrAbove && result.credential!.token_id && (
                    <div className="mb-3 flex items-center gap-3 border-t border-gray-100 pt-3 text-xs">
                      <span className="font-bold tracking-wider uppercase text-gray-400">
                        Token ID
                      </span>
                      <span className="font-mono text-navy">
                        # {result.credential!.token_id}
                      </span>
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
