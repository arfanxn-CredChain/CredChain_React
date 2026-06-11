import { Loader2 } from "lucide-react";
import { cn } from "@shared/lib/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-navy", sizeMap[size], className)}
      aria-label={label}
      role="status"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-base">
      <LoadingSpinner size="lg" />
    </div>
  );
}
