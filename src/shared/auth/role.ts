/**
 * Role enum + hierarchy. Single source of truth.
 * Mirrors backend domain.Role and Solidity Role enum.
 */

export const Role = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ISSUER: "issuer",
  HOLDER: "holder",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_LEVEL: Record<Role, number> = {
  [Role.HOLDER]: 1,
  [Role.ISSUER]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPER_ADMIN]: 4,
};

export function canAccess(userRole: Role | undefined, minRole: Role): boolean {
  if (!userRole) return false;
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole];
}

export function canAccessAny(userRole: Role | undefined, allowed: Role[]): boolean {
  if (!userRole) return false;
  if (allowed.length === 0) return true;
  const minLevel = Math.min(...allowed.map((r) => ROLE_LEVEL[r]));
  return ROLE_LEVEL[userRole] >= minLevel;
}

export function formatRole(role: Role): string {
  return role.replace("_", " ");
}
