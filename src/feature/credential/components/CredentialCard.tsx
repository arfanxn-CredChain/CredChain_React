import { Link } from "react-router-dom";
import { Calendar, FileBadge, ShieldAlert, User } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { MonoId } from "@shared/components/MonoId";
import { formatDate } from "@shared/lib/format";
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
  const { id, type, title, description, hash, holder_id, issued_at, valid_until, revoked } =
    credential;

  return (
    <div
      className={cn(
        "relative bg-surface rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md flex flex-col h-full",
        revoked
          ? "border-error/20 bg-error/5"
          : "border-gray-100 hover:border-gold/50",
        isSelected && !revoked && "ring-2 ring-gold border-transparent",
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
            "absolute top-4 right-4 w-5 h-5 rounded border-2 transition-colors z-10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
            isSelected
              ? "bg-gold border-gold"
              : "border-gray-300 hover:border-gold",
          )}
          aria-pressed={isSelected}
          aria-label={isSelected ? "Deselect credential" : "Select credential"}
        />
      )}

      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            "flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center",
            revoked ? "bg-error/10 text-error" : "bg-navy/5 text-navy",
          )}
        >
          {revoked ? (
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          ) : (
            <FileBadge className="h-6 w-6" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-display text-sm font-bold text-navy truncate">
            {title || type}
          </h3>
          <MonoId value={id} className="mt-0.5 truncate block" />
        </div>
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {description || "No description provided."}
        </p>

        <div className="space-y-2">
          <Detail icon={User} text={`Holder: ${holderLabel ?? holder_id}`} />
          <Detail icon={Calendar} text={`Issued: ${formatDate(issued_at)}`} />
          {valid_until && (
            <Detail icon={Calendar} text={`Expires: ${formatDate(valid_until)}`} />
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          to={`/credentials/${id}`}
          className="text-sm font-bold text-gold hover:text-navy transition-colors block w-full text-center"
          onClick={(e) => {
            if (selectable && isSelected) e.preventDefault();
          }}
        >
          View Details
        </Link>
      </div>

      {/* Hidden but indexable for search */}
      <span className="sr-only">{hash}</span>
    </div>
  );
}

function Detail({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center text-xs text-gray-500">
      <Icon className="w-4 h-4 mr-2 text-gray-400" aria-hidden="true" />
      <span className="truncate">{text}</span>
    </div>
  );
}
