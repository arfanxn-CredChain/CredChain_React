import { cn } from "@shared/lib/cn";

type BlobTone = "gold" | "navy" | "blue" | "error";
type BlobPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";
type BlobSize = "md" | "lg" | "xl";

interface DecorBlobProps {
  tone?: BlobTone;
  position?: BlobPosition;
  size?: BlobSize;
  className?: string;
}

const toneMap: Record<BlobTone, string> = {
  gold: "bg-gold/10",
  navy: "bg-navy/10",
  blue: "bg-info/10",
  error: "bg-error/10",
};

const positionMap: Record<BlobPosition, string> = {
  "top-right": "top-0 right-0 -translate-y-12 translate-x-12",
  "top-left": "top-0 left-0 -translate-y-12 -translate-x-12",
  "bottom-right": "bottom-0 right-0 translate-y-24 translate-x-12",
  "bottom-left": "bottom-0 left-0 translate-y-24 -translate-x-12",
};

const sizeMap: Record<BlobSize, string> = {
  md: "w-32 h-32 blur-2xl",
  lg: "w-64 h-64 blur-3xl",
  xl: "w-96 h-96 blur-3xl",
};

export function DecorBlob({
  tone = "gold",
  position = "top-right",
  size = "lg",
  className,
}: DecorBlobProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full",
        toneMap[tone],
        positionMap[position],
        sizeMap[size],
        className,
      )}
    />
  );
}
