import { Role, type Role as RoleType } from "@shared/auth/role";
import type { CredentialDTO, UserDTO } from "@shared/types/api";

export function makeUser(overrides: Partial<UserDTO> = {}): UserDTO {
  const role: RoleType = overrides.role ?? Role.HOLDER;
  return {
    id: overrides.id ?? "usr_test_1",
    name: "Test User",
    number: null,
    phone_number: "+6281234567890",
    email: "test@credchain.demo",
    birth_date: null,
    role,
    meta: null,
    wallet_address: "0x" + "0".repeat(40),
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

export function makeCredential(overrides: Partial<CredentialDTO> = {}): CredentialDTO {
  return {
    id: "cred_test_1",
    holder_id: "usr_test_1",
    issuer_id: "usr_test_2",
    hash: "0x" + "1".repeat(64),
    uri: "ipfs://test",
    title: "Test Credential",
    description: "Test description",
    type: "AcademicDegree",
    issued_at: "2026-01-01T00:00:00Z",
    valid_until: null,
    revoked: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

export const mockUsers: UserDTO[] = [
  makeUser({ id: "usr_1", email: "superadmin@credchain.demo", role: Role.SUPER_ADMIN, name: "Super Admin" }),
  makeUser({ id: "usr_2", email: "admin@credchain.demo", role: Role.ADMIN, name: "Platform Admin" }),
  makeUser({ id: "usr_3", email: "issuer@credchain.demo", role: Role.ISSUER, name: "Default Issuer" }),
  makeUser({ id: "usr_4", email: "holder@credchain.demo", role: Role.HOLDER, name: "Jane Doe" }),
];

export const mockCredentials: CredentialDTO[] = [
  makeCredential({ id: "cred_1", title: "Bachelor of Science" }),
  makeCredential({ id: "cred_2", title: "Senior Software Engineer", revoked: false }),
  makeCredential({ id: "cred_3", title: "Workshop Completion", revoked: true }),
];

export function mockUserWithMeta(overrides: Partial<UserDTO> = {}): UserDTO {
  return makeUser({
    id: "usr_meta_1",
    number: "EMP-001",
    birth_date: "1990-01-01",
    meta: { department: "Engineering", level: "L3" },
    ...overrides,
  });
}

export function mockDeletedUser(overrides: Partial<UserDTO> = {}): UserDTO {
  return mockUserWithMeta({
    id: "usr_deleted_1",
    deleted_at: "2026-02-01T00:00:00Z",
    ...overrides,
  });
}

export function mockUserNoPhone(overrides: Partial<UserDTO> = {}): UserDTO {
  return mockUserWithMeta({
    id: "usr_nophone_1",
    phone_number: null,
    ...overrides,
  });
}
