import { Activity, XOctagon } from "lucide-react";

interface UserStatusBadgeProps {
  deletedAt: string | null;
}

export function UserStatusBadge({ deletedAt }: UserStatusBadgeProps) {
  if (deletedAt) {
    return (
      <span className="inline-flex items-center text-xs font-bold text-error">
        <XOctagon className="w-3 h-3 mr-1" aria-hidden="true" />
        Deleted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-bold text-green-600">
      <Activity className="w-3 h-3 mr-1" aria-hidden="true" />
      Active
    </span>
  );
}
