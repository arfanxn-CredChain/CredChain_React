import { cn } from "@shared/lib/cn";
import type { LucideIcon } from "lucide-react";

const toneClasses = {
  navy: "bg-navy/10 text-navy",
  gold: "bg-gold/20 text-navy",
  error: "bg-error/10 text-error",
  green: "bg-green-100 text-green-700",
  gray: "bg-gray-100 text-gray-600",
} as const;

export type StatusTone = keyof typeof toneClasses;

interface StatusPillProps {
  tone: StatusTone;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function StatusPill({ tone, icon: Icon, children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider",
        toneClasses[tone],
        className,
      )}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" aria-hidden="true" />}
      {children}
    </span>
  );
}
