import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, Mail, Phone, Wallet } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { MonoId } from "@shared/components/MonoId";
import { formatDate, truncateAddress } from "@shared/lib/format";
import { Card } from "@ui/card";
import { CopyInlineButton } from "@shared/components/CopyInlineButton";
import { UserAvatar } from "@shared/components/UserAvatar";
import type { CredentialDTO, UserDTO } from "@shared/types/api";
import { CredentialStatusBadge } from "./CredentialStatusBadge";

interface CredentialCardProps {
  credential: CredentialDTO;
  isSelected?: boolean;
  selectionMode?: "revoke" | "reextract" | null;
  onSelect?: () => void;
}

const INTERACTIVE_SELECTORS = "a,button,[role='button'],input,textarea,select";

export function CredentialCard({
  credential,
  isSelected,
  selectionMode,
  onSelect,
}: CredentialCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const revoked = credential.revoked_at !== null;

  const isSelectable =
    selectionMode === "revoke"
      ? !revoked
      : selectionMode === "reextract"
        ? credential.extract_status === "failed"
        : false;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTORS)) return;
    if (selectionMode) {
      if (isSelectable) onSelect?.();
      return;
    }
    navigate(`/credentials/${credential.id}`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (selectionMode) {
      if (isSelectable) onSelect?.();
      return;
    }
    navigate(`/credentials/${credential.id}`);
  };

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={cn(
        "relative cursor-pointer p-5 transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
        revoked
          ? "border-error/20 bg-error/5"
          : "border-gray-100 hover:border-gold/50 hover:shadow-md",
      )}
      aria-label={revoked ? t("cred.status.revoked") : t("cred.status.active")}
    >
      {selectionMode && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isSelectable) onSelect?.();
          }}
          disabled={!isSelectable}
          className={cn(
            "absolute top-4 right-4 z-10 h-5 w-5 rounded border-2 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
            !isSelectable && "cursor-not-allowed opacity-30",
            isSelected ? "border-gold bg-gold" : "border-gray-300 hover:border-gold",
          )}
          aria-pressed={isSelected}
          aria-label={isSelected ? t("cred.card.deselect") : t("cred.card.select")}
        />
      )}

      <div className="pr-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <CredentialStatusBadge revoked={revoked} />
          {credential.extract_status !== "succeeded" && (
            <CredentialStatusBadge
              revoked={false}
              extractStatus={credential.extract_status}
              showExtractStatus
            />
          )}
        </div>

        <div className="mb-4">
          <h3 className="truncate font-sans text-base font-bold text-navy">{credential.name}</h3>
          <div className="mt-0.5 flex items-center gap-1">
            <MonoId value={credential.id} mode="id" />
            <CopyInlineButton
              value={credential.id}
              ariaLabel={t("cred.copy.credentialId")}
              className="shrink-0"
            />
          </div>
        </div>

        <div className="space-y-3">
          <UserContactBlock
            labelType="full"
            user={credential.holder}
            fallbackId={credential.holder_user_id}
            copyPrefix="holder"
          />

          <UserContactBlock
            labelType="compact"
            user={credential.issuer}
            fallbackId={credential.issuer_user_id}
            copyPrefix="issuer"
          />

          {revoked && credential.revoker && (
            <UserContactBlock
              labelType="compact"
              user={credential.revoker}
              fallbackId={credential.revoker_user_id ?? ""}
              copyPrefix="revoker"
              tone="error"
            />
          )}
        </div>

        <div className="mt-4 space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <span>
              {t("cred.card.issued")} {formatDate(credential.issued_at)}
            </span>
          </div>
          {credential.revoked_at && (
            <div className="flex items-center gap-1.5 text-error">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {t("cred.card.revoked")} {formatDate(credential.revoked_at)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface UserContactBlockProps {
  user?: UserDTO;
  fallbackId: string;
  copyPrefix: "holder" | "issuer" | "revoker";
  labelType: "full" | "compact";
  tone?: "default" | "error";
}

function UserContactBlock({
  user,
  fallbackId,
  copyPrefix,
  labelType,
  tone = "default",
}: UserContactBlockProps) {
  const { t } = useTranslation();

  const name = user?.name ?? user?.email ?? fallbackId;
  const userId = user?.id ?? fallbackId;
  const roleLabel = user?.role ? t(`user.edit.role.${user.role}`) : undefined;
  const isDeleted = user?.deleted_at !== null;

  const textColor = tone === "error" ? "text-error" : "text-navy";
  const nameWeight = labelType === "full" ? "font-bold" : "font-semibold";

  return (
    <div className="flex items-start gap-3">
      <UserAvatar user={user ?? null} size="sm" className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-col space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/users/${userId}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "truncate text-left text-sm hover:underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
              nameWeight,
              textColor,
            )}
          >
            {name}
          </Link>
          {isDeleted && (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
              {t("user.status.trashed")}
            </span>
          )}
        </div>

        {roleLabel && <span className="text-sm text-gray-500">{roleLabel}</span>}

        {labelType === "full" && (
          <>
            {user?.email && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Mail className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                <span className="truncate">{user.email}</span>
                <CopyInlineButton
                  value={user.email}
                  ariaLabel={t(`cred.copy.${copyPrefix}Email`)}
                  className="shrink-0"
                />
              </div>
            )}

            {user?.phone_number && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                <span className="truncate">{user.phone_number}</span>
                <CopyInlineButton
                  value={user.phone_number}
                  ariaLabel={t(`cred.copy.${copyPrefix}Phone`)}
                  className="shrink-0"
                />
              </div>
            )}

            {user?.wallet_address && (
              <div className="flex items-center gap-1 font-mono text-xs text-gray-500">
                <Wallet className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                <span className="truncate" title={user.wallet_address}>
                  {truncateAddress(user.wallet_address)}
                </span>
                <CopyInlineButton
                  value={user.wallet_address}
                  ariaLabel={t(`cred.copy.${copyPrefix}Wallet`)}
                  className="shrink-0"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
