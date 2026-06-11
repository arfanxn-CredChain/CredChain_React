import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, FileBadge, ShieldAlert, User } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { MonoId } from "@shared/components/MonoId";
import { formatDate } from "@shared/lib/format";
import { Card } from "@ui/card";
import type { CredentialDTO } from "@shared/types/api";

interface CredentialCardProps {
  credential: CredentialDTO;
  holderLabel?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

export function CredentialCard({
  credential,
  holderLabel,
  isSelected,
  onSelect,
  selectable,
}: CredentialCardProps) {
  const { t } = useTranslation();
  const { id, type, title, description, hash, holder_id, issued_at, valid_until, revoked } =
    credential;

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col p-5",
        revoked
          ? "border-error/20 bg-error/5"
          : "border-gray-100 hover:border-gold/50 hover:shadow-md",
        isSelected && !revoked && "border-transparent ring-2 ring-gold",
      )}
    >
      {selectable && !revoked && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onSelect?.();
          }}
          className={cn(
            "absolute top-4 right-4 z-10 h-5 w-5 rounded border-2 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
            isSelected ? "border-gold bg-gold" : "border-gray-300 hover:border-gold",
          )}
          aria-pressed={isSelected}
          aria-label={isSelected ? t("cred.card.deselect") : t("cred.card.select")}
        />
      )}

      <div className="mb-4 flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            revoked ? "bg-error/10 text-error" : "bg-navy/5 text-navy",
          )}
        >
          {revoked ? (
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          ) : (
            <FileBadge className="h-6 w-6" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h3 className="truncate font-sans text-sm font-bold text-navy">{title || type}</h3>
          <MonoId value={id} className="mt-0.5 block truncate" />
        </div>
      </div>

      <div className="flex-1">
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {description || t("cred.card.noDescription")}
        </p>

        <div className="space-y-2">
          <Detail icon={User} text={`${t("cred.card.holder")} ${holderLabel ?? holder_id}`} />
          <Detail icon={Calendar} text={`${t("cred.card.issued")} ${formatDate(issued_at)}`} />
          {valid_until && (
            <Detail icon={Calendar} text={`${t("cred.card.expires")} ${formatDate(valid_until)}`} />
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <Link
          to={`/credentials/${id}`}
          className="block w-full text-center text-sm font-bold text-gold transition-colors hover:text-navy"
          onClick={(e) => {
            if (selectable && isSelected) e.preventDefault();
          }}
        >
          {t("cred.card.viewDetails")}
        </Link>
      </div>

      <span className="sr-only">{hash}</span>
    </Card>
  );
}

function Detail({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center text-xs text-gray-500">
      <Icon className="mr-2 h-4 w-4 text-gray-400" aria-hidden="true" />
      <span className="truncate">{text}</span>
    </div>
  );
}
