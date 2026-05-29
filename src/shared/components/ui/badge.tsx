import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@shared/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider",
  {
    variants: {
      tone: {
        navy: "bg-navy/10 text-navy",
        gold: "bg-gold/20 text-navy",
        error: "bg-error/10 text-error",
        green: "bg-green-100 text-green-700",
        gray: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: { tone: "navy" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
