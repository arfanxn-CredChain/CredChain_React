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

export const ROLE_LABEL_KEY: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "role.superAdmin",
  [Role.ADMIN]: "role.admin",
  [Role.ISSUER]: "role.issuer",
  [Role.HOLDER]: "role.holder",
};

export function canEditUser(
  currentUser: { id: string; role: Role } | null | undefined,
  target: { id: string; role: Role },
): boolean {
  if (!currentUser) return false;
  if (ROLE_LEVEL[currentUser.role] < ROLE_LEVEL[Role.ADMIN]) return false;
  if (currentUser.id === target.id && currentUser.role !== Role.SUPER_ADMIN) return false;
  if (target.role === Role.SUPER_ADMIN && currentUser.role !== Role.SUPER_ADMIN) return false;
  if (currentUser.role === Role.ADMIN && ROLE_LEVEL[target.role] >= ROLE_LEVEL[Role.ADMIN])
    return false;
  return true;
}

export function canTransferTo(
  currentUser: { id: string; role: Role } | null | undefined,
  target: { id: string; role: Role; deleted_at: string | null },
): boolean {
  if (!currentUser) return false;
  return (
    currentUser.role === Role.SUPER_ADMIN &&
    currentUser.id !== target.id &&
    target.role !== Role.SUPER_ADMIN &&
    target.deleted_at === null
  );
}

/**
 * Can the current user delete this target user?
 * Mirrors backend DeletePreFetch / DeletePostFetch rules:
 *   - Below Admin -> blocked
 *   - Self-delete -> blocked
 *   - Admin deleting Admin+ target -> blocked
 *   - SuperAdmin can delete anyone except self
 */
export function canDeleteUser(
  currentUser: { id: string; role: Role } | null | undefined,
  target: { id: string; role: Role },
): boolean {
  if (!currentUser) return false;
  if (ROLE_LEVEL[currentUser.role] < ROLE_LEVEL[Role.ADMIN]) return false;
  if (currentUser.id === target.id) return false;
  if (currentUser.role === Role.ADMIN && ROLE_LEVEL[target.role] >= ROLE_LEVEL[Role.ADMIN])
    return false;
  return true;
}
