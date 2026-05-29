import { cn } from "@shared/lib/cn";

type EyebrowTone = "muted" | "navy";

interface EyebrowLabelProps {
  children: React.ReactNode;
  tone?: EyebrowTone;
  className?: string;
  as?: "dt" | "p" | "span" | "div";
}

export function EyebrowLabel({
  children,
  tone = "muted",
  className,
  as: Tag = "dt",
}: EyebrowLabelProps) {
  return (
    <Tag
      className={cn(
        "text-xs font-bold uppercase tracking-wider mb-1",
        tone === "navy" ? "text-navy" : "text-gray-400",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
