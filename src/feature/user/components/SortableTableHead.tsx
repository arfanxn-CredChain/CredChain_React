import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { TableHead } from "@ui/table";

interface SortableTableHeadProps {
  label: string;
  sortKey: string;
  currentSort: string;
  currentOrder: "asc" | "desc";
  onSort: (key: string) => void;
  className?: string;
}

export function SortableTableHead({
  label,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = currentSort === sortKey;
  const Icon = !isActive
    ? ChevronsUpDown
    : currentOrder === "asc"
      ? ChevronUp
      : ChevronDown;

  return (
    <TableHead
      onClick={() => onSort(sortKey)}
      className={cn("cursor-pointer select-none hover:text-fg", className)}
    >
      <span className="flex items-center gap-1">
        {label}
        <Icon
          className={cn("h-3.5 w-3.5", isActive ? "text-fg" : "text-gray-300")}
          aria-hidden="true"
        />
      </span>
    </TableHead>
  );
}
