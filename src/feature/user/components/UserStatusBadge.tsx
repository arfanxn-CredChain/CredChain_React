import { useTranslation } from "react-i18next";
import { Activity, XOctagon } from "lucide-react";
import { StatusPill } from "@shared/components/StatusPill";

interface UserStatusBadgeProps {
  deletedAt: string | null;
}

export function UserStatusBadge({ deletedAt }: UserStatusBadgeProps) {
  const { t } = useTranslation();

  if (deletedAt) {
    return (
      <StatusPill tone="error" icon={XOctagon}>
        {t("user.status.trashed")}
      </StatusPill>
    );
  }
  return (
    <StatusPill tone="green" icon={Activity}>
      {t("user.status.active")}
    </StatusPill>
  );
}
