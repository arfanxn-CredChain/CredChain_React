import { cn } from "@shared/lib/cn";
import { truncateAddress, truncateHash } from "@shared/lib/format";

type MonoIdMode = "truncate" | "address" | "full";

interface MonoIdProps {
  value: string;
  mode?: MonoIdMode;
  className?: string;
}

export function MonoId({ value, mode = "truncate", className }: MonoIdProps) {
  const display =
    mode === "full"
      ? value
      : mode === "address"
        ? truncateAddress(value)
        : truncateHash(value);

  return (
    <span
      className={cn("font-mono text-xs text-gray-500", className)}
      title={value}
    >
      {display}
    </span>
  );
}
