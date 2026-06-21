import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

export type CredentialSort = "newest" | "oldest" | "nameAZ" | "nameZA";

interface CredentialSortMenuProps {
  value: CredentialSort;
  onChange: (sortString: CredentialSort) => void;
}

const OPTIONS: { key: CredentialSort; labelKey: string }[] = [
  { key: "newest", labelKey: "cred.sort.newest" },
  { key: "oldest", labelKey: "cred.sort.oldest" },
  { key: "nameAZ", labelKey: "cred.sort.nameAZ" },
  { key: "nameZA", labelKey: "cred.sort.nameZA" },
];

export function CredentialSortMenu({ value, onChange }: CredentialSortMenuProps) {
  const { t } = useTranslation();

  const activeOption = OPTIONS.find((opt) => opt.key === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {activeOption
            ? `${t("cred.sort.label")}: ${t(activeOption.labelKey)}`
            : t("cred.sort.label")}
          <ChevronDown className="ml-1 h-3 w-3 text-gray-400" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {OPTIONS.map((opt) => {
          const active = opt.key === value;
          return (
            <DropdownMenuItem
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className="flex cursor-pointer items-center justify-between"
            >
              <span className={active ? "font-bold" : ""}>{t(opt.labelKey)}</span>
              {active && <Check className="h-4 w-4 text-gold" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
