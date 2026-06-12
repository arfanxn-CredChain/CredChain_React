import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

const ALLOWED_LIMITS = [10, 20, 50, 100] as const;

interface PageSizeMenuProps {
  value: number;
  onChange: (value: number) => void;
}

export function PageSizeMenu({ value, onChange }: PageSizeMenuProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t("user.list.limitLabel")}>
          {value}
          <ChevronDown className="ml-1 h-3 w-3 text-gray-400" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 min-w-0">
        {ALLOWED_LIMITS.map((limit) => {
          const active = limit === value;
          return (
            <DropdownMenuItem
              key={limit}
              onClick={() => onChange(limit)}
              className="flex cursor-pointer items-center justify-between"
            >
              <span className={active ? "font-bold" : ""}>{limit}</span>
              {active && <Check className="h-4 w-4 text-gold" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
