import { cn } from "@shared/lib/cn";

export interface CopyrightFooterProps {
  className?: string;
}

export function CopyrightFooter({ className }: CopyrightFooterProps) {
  return (
    <footer
      className={cn(
        "mx-auto max-w-7xl safe-area-bottom no-print mt-auto bg-transparent py-4 text-center text-xs text-gray-400",
        className,
      )}
    >
      <span>{new Date().getFullYear()}</span> · CredChain · All rights reserved
    </footer>
  );
}
