import { cn } from "@shared/lib/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-gray-200/60", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
