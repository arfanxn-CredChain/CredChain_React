import { cn } from "@shared/lib/cn";

export interface CopyrightFooterProps {
  className?: string;
}

export function CopyrightFooter({ className }: CopyrightFooterProps) {
  return (
    <footer
      className={cn(
        "safe-area-bottom no-print mx-auto mt-auto max-w-7xl bg-transparent py-4 text-center text-xs text-gray-400",
        className,
      )}
    >
      <span>{new Date().getFullYear()}</span> · CredChain · All rights reserved
    </footer>
  );
}
