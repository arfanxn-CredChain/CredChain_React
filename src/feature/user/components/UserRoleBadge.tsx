import { Badge } from "@ui/badge";
import { Role, type Role as RoleType } from "@shared/auth/role";

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
  return (
    <Badge tone={roleToneMap[role]}>
      {role.replace("_", " ")}
    </Badge>
  );
}
