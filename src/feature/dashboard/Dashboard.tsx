import { useTranslation } from "react-i18next";
import { useStore } from "@app/store";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { FileBadge } from "lucide-react";

export function Dashboard() {
  const user = useStore((s) => s.user);
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={t("dashboard.welcome", { name: user?.name?.split(" ")[0] ?? t("dashboard.fallbackName") })}
        description={t("dashboard.overview")}
      />

      <EmptyState
        icon={FileBadge}
        title={t("dashboard.comingSoon.title")}
        description={t("dashboard.comingSoon.body")}
      />
    </div>
  );
}
