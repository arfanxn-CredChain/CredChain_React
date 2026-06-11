import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@shared/lib/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: LucideIcon;
  trailingAction?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leadingIcon: Icon, trailingAction, className, type = "text", ...props }, ref) => (
    <div className="relative">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          "block w-full rounded-xl border border-gray-200 py-3 pr-3 shadow-sm",
          "bg-gray-50 text-sm text-navy placeholder-gray-400",
          "focus:border-transparent focus:bg-white focus:ring-2 focus:ring-gold focus:outline-none",
          "transition-all",
          "disabled:cursor-not-allowed disabled:opacity-60",
          Icon ? "pl-10" : "pl-4",
          trailingAction && "pr-10",
          className,
        )}
        {...props}
      />
      {trailingAction && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">{trailingAction}</div>
      )}
    </div>
  ),
);
Input.displayName = "Input";
