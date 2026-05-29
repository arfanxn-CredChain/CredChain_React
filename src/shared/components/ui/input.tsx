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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          "block w-full py-3 pr-3 border border-gray-200 rounded-xl shadow-sm",
          "bg-gray-50 text-navy placeholder-gray-400 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent focus:bg-white",
          "transition-all",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          Icon ? "pl-10" : "pl-4",
          trailingAction && "pr-10",
          className,
        )}
        {...props}
      />
      {trailingAction && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{trailingAction}</div>
      )}
    </div>
  ),
);
Input.displayName = "Input";
