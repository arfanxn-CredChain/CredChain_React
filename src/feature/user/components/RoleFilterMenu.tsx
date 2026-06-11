import { Users, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Role } from "@shared/auth/role";
import type { RoleFilter } from "../hooks/useUserListParams";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

interface RoleFilterMenuProps {
  value: RoleFilter;
  onChange: (value: RoleFilter) => void;
}

export function RoleFilterMenu({ value, onChange }: RoleFilterMenuProps) {
  const { t } = useTranslation();

  const options: { key: RoleFilter; label: string }[] = [
    { key: "all", label: t("user.role.filter.all") },
    { key: Role.SUPER_ADMIN, label: t("user.role.filter.superAdmin") },
    { key: Role.ADMIN, label: t("user.role.filter.admin") },
    { key: Role.ISSUER, label: t("user.role.filter.issuer") },
    { key: Role.HOLDER, label: t("user.role.filter.holder") },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="mr-2 h-4 w-4" />
          {t("user.role.filter.label")}
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
