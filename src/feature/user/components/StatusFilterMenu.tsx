import { Filter, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

type DeletedFilter = "all" | "only" | "none";

interface StatusFilterMenuProps {
  value: DeletedFilter;
  onChange: (value: DeletedFilter) => void;
}

export function StatusFilterMenu({ value, onChange }: StatusFilterMenuProps) {
  const { t } = useTranslation();

  const options: { key: DeletedFilter; label: string }[] = [
    { key: "all", label: t("user.filter.all") },
    { key: "none", label: t("user.filter.active") },
    { key: "only", label: t("user.filter.trashed") },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          {t("user.filter.status")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {options.map((opt) => {
          const active = opt.key === value;
          return (
            <DropdownMenuItem
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className="flex cursor-pointer items-center justify-between"
            >
              <span className={active ? "font-bold" : ""}>{opt.label}</span>
              {active && <Check className="h-4 w-4 text-gold" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
