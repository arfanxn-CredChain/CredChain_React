import { describe, expect, it } from "vitest";
import { canAccess, canAccessAny, formatRole, Role, ROLE_LEVEL } from "./role";

describe("ROLE_LEVEL", () => {
  it("assigns correct numeric levels", () => {
    expect(ROLE_LEVEL[Role.HOLDER]).toBe(1);
    expect(ROLE_LEVEL[Role.ISSUER]).toBe(2);
    expect(ROLE_LEVEL[Role.ADMIN]).toBe(3);
    expect(ROLE_LEVEL[Role.SUPER_ADMIN]).toBe(4);
  });
});

describe("canAccess", () => {
  it("returns true when user role meets minimum", () => {
    expect(canAccess(Role.ADMIN, Role.ISSUER)).toBe(true);
    expect(canAccess(Role.SUPER_ADMIN, Role.SUPER_ADMIN)).toBe(true);
    expect(canAccess(Role.HOLDER, Role.HOLDER)).toBe(true);
  });

  it("returns false when user role is below minimum", () => {
    expect(canAccess(Role.HOLDER, Role.ISSUER)).toBe(false);
    expect(canAccess(Role.ISSUER, Role.ADMIN)).toBe(false);
    expect(canAccess(Role.ADMIN, Role.SUPER_ADMIN)).toBe(false);
  });

  it("returns false for undefined role", () => {
    expect(canAccess(undefined, Role.HOLDER)).toBe(false);
  });
});

describe("canAccessAny", () => {
  it("returns true when user meets any allowed role level", () => {
    expect(canAccessAny(Role.ADMIN, [Role.ISSUER, Role.ADMIN])).toBe(true);
    expect(canAccessAny(Role.SUPER_ADMIN, [Role.ADMIN])).toBe(true);
    expect(canAccessAny(Role.ISSUER, [Role.ISSUER])).toBe(true);
  });

  it("returns false when user is below all allowed roles", () => {
    expect(canAccessAny(Role.HOLDER, [Role.ISSUER, Role.ADMIN])).toBe(false);
    expect(canAccessAny(Role.ISSUER, [Role.ADMIN, Role.SUPER_ADMIN])).toBe(false);
  });

  it("returns true for empty allowed list", () => {
    expect(canAccessAny(Role.HOLDER, [])).toBe(true);
  });

  it("returns false for undefined role", () => {
    expect(canAccessAny(undefined, [Role.HOLDER])).toBe(false);
  });
});

describe("formatRole", () => {
  it("replaces underscore with space", () => {
    expect(formatRole(Role.SUPER_ADMIN)).toBe("super admin");
    expect(formatRole(Role.HOLDER)).toBe("holder");
  });
});
