import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, ShieldAlert, ShieldCheck } from "lucide-react";
import { StatusPill } from "@shared/components/StatusPill";
import type { ExtractStatus } from "@shared/types/api";

interface CredentialStatusBadgeProps {
  revoked: boolean;
  extractStatus?: ExtractStatus;
  showExtractStatus?: boolean;
}

export function CredentialStatusBadge({
  revoked,
  extractStatus,
  showExtractStatus,
}: CredentialStatusBadgeProps) {
  const { t } = useTranslation();

  if (revoked) {
    return (
      <StatusPill tone="error" icon={ShieldAlert}>
        {t("cred.status.revoked")}
      </StatusPill>
    );
  }

  if (showExtractStatus) {
    if (extractStatus === "pending") {
      return (
        <StatusPill tone="gray" icon={Clock}>
          {t("cred.status.pending_extraction")}
        </StatusPill>
      );
    }
    if (extractStatus === "failed") {
      return (
        <StatusPill tone="error" icon={AlertTriangle}>
          {t("cred.status.extraction_failed")}
        </StatusPill>
      );
    }
  }

  return (
    <StatusPill tone="green" icon={ShieldCheck}>
      {t("cred.status.active")}
    </StatusPill>
  );
}
