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
        "bg-surface rounded-2xl shadow-sm border border-gray-100 p-12 text-center",
        className,
      )}
    >
      <Icon className="mx-auto h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
      <h3 className="font-display text-lg font-bold text-navy mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6">{description}</p>}
      {action}
    </div>
  );
}
