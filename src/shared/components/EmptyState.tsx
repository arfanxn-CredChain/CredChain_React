import type { LucideIcon } from "lucide-react";
import { cn } from "@shared/lib/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-surface p-12 text-center shadow-sm",
        className,
      )}
    >
      <Icon className="mx-auto mb-4 h-12 w-12 text-gray-300" aria-hidden="true" />
      <h3 className="mb-2 font-sans text-lg font-bold text-navy">{title}</h3>
      {description && <p className="mb-6 text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  );
}
