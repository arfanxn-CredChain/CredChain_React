import { useTranslation } from "react-i18next";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { StatusPill } from "@shared/components/StatusPill";

interface CredentialStatusBadgeProps {
  revoked: boolean;
}

export function CredentialStatusBadge({ revoked }: CredentialStatusBadgeProps) {
  const { t } = useTranslation();
  return revoked ? (
    <StatusPill tone="error" icon={ShieldAlert}>
      {t("cred.status.revoked")}
    </StatusPill>
  ) : (
    <StatusPill tone="green" icon={ShieldCheck}>
      {t("cred.status.active")}
    </StatusPill>
  );
}
