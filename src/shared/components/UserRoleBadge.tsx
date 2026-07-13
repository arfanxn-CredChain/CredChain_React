import { useTranslation } from "react-i18next";
import { Badge } from "@ui/badge";
import { Role, ROLE_LABEL_KEY, type Role as RoleType } from "@shared/auth/role";

const roleToneMap = {
  [Role.SUPER_ADMIN]: "error",
  [Role.ADMIN]: "navy",
  [Role.ISSUER]: "gold",
  [Role.HOLDER]: "gray",
} as const;

interface UserRoleBadgeProps {
  role: RoleType;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const { t } = useTranslation();
  return <Badge tone={roleToneMap[role]}>{t(ROLE_LABEL_KEY[role])}</Badge>;
}
