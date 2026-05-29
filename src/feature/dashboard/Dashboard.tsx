import { useStore } from "@app/store";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { FileBadge } from "lucide-react";

export function Dashboard() {
  const user = useStore((s) => s.user);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Platform overview and recent activity."
      />

      <EmptyState
        icon={FileBadge}
        title="Dashboard coming soon"
        description="Stat cards, issuance trends, and activity feed will live here."
      />
    </div>
  );
}
