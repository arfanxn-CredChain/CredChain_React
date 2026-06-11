import { ArrowUpDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

interface SortMenuProps {
  sort: string;
  order: "asc" | "desc";
  onChange: (sort: string, order: "asc" | "desc") => void;
}

export function SortMenu({ sort, order, onChange }: SortMenuProps) {
  const { t } = useTranslation();

  const options: { key: string; sort: string; order: "asc" | "desc"; label: string }[] = [
    { key: "newest", sort: "created_at", order: "desc", label: t("user.sort.option.newest") },
    { key: "oldest", sort: "created_at", order: "asc", label: t("user.sort.option.oldest") },
    { key: "nameAZ", sort: "name", order: "asc", label: t("user.sort.option.nameAZ") },
    { key: "nameZA", sort: "name", order: "desc", label: t("user.sort.option.nameZA") },
    { key: "role", sort: "role", order: "asc", label: t("user.sort.option.role") },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {t("user.sort.label")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {options.map((opt) => {
          const active = opt.sort === sort && opt.order === order;
          return (
            <DropdownMenuItem
              key={opt.key}
              onClick={() => onChange(opt.sort, opt.order)}
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
