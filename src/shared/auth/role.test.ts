import { describe, expect, it } from "vitest";
import {
  canAccess,
  canAccessAny,
  canDeleteUser,
  canEditUser,
  canTransferTo,
  formatRole,
  Role,
  ROLE_LEVEL,
} from "./role";

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

describe("canEditUser", () => {
  it("returns true when Admin targets a Holder", () => {
    expect(canEditUser({ id: "admin", role: Role.ADMIN }, { id: "h1", role: Role.HOLDER })).toBe(
      true,
    );
  });

  it("returns true when Admin targets an Issuer", () => {
    expect(canEditUser({ id: "admin", role: Role.ADMIN }, { id: "i1", role: Role.ISSUER })).toBe(
      true,
    );
  });

  it("returns false when Admin targets a SuperAdmin", () => {
    expect(
      canEditUser({ id: "admin", role: Role.ADMIN }, { id: "sa", role: Role.SUPER_ADMIN }),
    ).toBe(false);
  });

  it("returns true when SuperAdmin targets a SuperAdmin", () => {
    expect(
      canEditUser({ id: "sa", role: Role.SUPER_ADMIN }, { id: "sa2", role: Role.SUPER_ADMIN }),
    ).toBe(true);
  });

  it("returns false when Issuer targets a Holder (below Admin+)", () => {
    expect(canEditUser({ id: "issuer", role: Role.ISSUER }, { id: "h1", role: Role.HOLDER })).toBe(
      false,
    );
  });

  it("returns false when Holder targets a Holder (below Admin+)", () => {
    expect(canEditUser({ id: "holder", role: Role.HOLDER }, { id: "h2", role: Role.HOLDER })).toBe(
      false,
    );
  });

  it("returns false when Admin targets self (no self-edit for non-SA)", () => {
    expect(canEditUser({ id: "admin", role: Role.ADMIN }, { id: "admin", role: Role.ADMIN })).toBe(
      false,
    );
  });

  it("returns true when SuperAdmin targets self", () => {
    expect(
      canEditUser({ id: "sa", role: Role.SUPER_ADMIN }, { id: "sa", role: Role.SUPER_ADMIN }),
    ).toBe(true);
  });

  it("returns false when Admin targets another Admin (peer)", () => {
    expect(
      canEditUser({ id: "admin1", role: Role.ADMIN }, { id: "admin2", role: Role.ADMIN }),
    ).toBe(false);
  });

  it("returns false when currentUser is null", () => {
    expect(canEditUser(null, { id: "h1", role: Role.HOLDER })).toBe(false);
  });

  it("returns false when currentUser is undefined", () => {
    expect(canEditUser(undefined, { id: "h1", role: Role.HOLDER })).toBe(false);
  });
});

describe("canTransferTo", () => {
  it("returns true when SuperAdmin targets a non-SA live user", () => {
    expect(
      canTransferTo(
        { id: "sa", role: Role.SUPER_ADMIN },
        { id: "admin1", role: Role.ADMIN, deleted_at: null },
      ),
    ).toBe(true);
  });

  it("returns false when currentUser is not SuperAdmin", () => {
    expect(
      canTransferTo(
        { id: "admin", role: Role.ADMIN },
        { id: "issuer1", role: Role.ISSUER, deleted_at: null },
      ),
    ).toBe(false);
  });

  it("returns false for self-target", () => {
    expect(
      canTransferTo(
        { id: "sa", role: Role.SUPER_ADMIN },
        { id: "sa", role: Role.ISSUER, deleted_at: null },
      ),
    ).toBe(false);
  });

  it("returns false when target is SuperAdmin", () => {
    expect(
      canTransferTo(
        { id: "sa", role: Role.SUPER_ADMIN },
        { id: "sa2", role: Role.SUPER_ADMIN, deleted_at: null },
      ),
    ).toBe(false);
  });

  it("returns false when target is trashed", () => {
    expect(
      canTransferTo(
        { id: "sa", role: Role.SUPER_ADMIN },
        { id: "issuer1", role: Role.ISSUER, deleted_at: "2026-01-01T00:00:00Z" },
      ),
    ).toBe(false);
  });

  it("returns false when currentUser is null", () => {
    expect(canTransferTo(null, { id: "issuer1", role: Role.ISSUER, deleted_at: null })).toBe(false);
  });

  it("returns false when currentUser is undefined", () => {
    expect(canTransferTo(undefined, { id: "issuer1", role: Role.ISSUER, deleted_at: null })).toBe(
      false,
    );
  });
});

describe("canDeleteUser", () => {
  it("returns true when Admin targets a Holder", () => {
    expect(canDeleteUser({ id: "admin", role: Role.ADMIN }, { id: "h1", role: Role.HOLDER })).toBe(
      true,
    );
  });

  it("returns true when Admin targets an Issuer", () => {
    expect(canDeleteUser({ id: "admin", role: Role.ADMIN }, { id: "i1", role: Role.ISSUER })).toBe(
      true,
    );
  });

  it("returns false when Admin targets another Admin", () => {
    expect(
      canDeleteUser({ id: "admin1", role: Role.ADMIN }, { id: "admin2", role: Role.ADMIN }),
    ).toBe(false);
  });

  it("returns false when Admin targets a SuperAdmin", () => {
    expect(
      canDeleteUser({ id: "admin", role: Role.ADMIN }, { id: "sa", role: Role.SUPER_ADMIN }),
    ).toBe(false);
  });

  it("returns true when SuperAdmin targets an Admin", () => {
    expect(
      canDeleteUser({ id: "sa", role: Role.SUPER_ADMIN }, { id: "admin", role: Role.ADMIN }),
    ).toBe(true);
  });

  it("returns true when SuperAdmin targets a SuperAdmin", () => {
    expect(
      canDeleteUser({ id: "sa", role: Role.SUPER_ADMIN }, { id: "sa2", role: Role.SUPER_ADMIN }),
    ).toBe(true);
  });

  it("returns false for self-delete", () => {
    expect(
      canDeleteUser({ id: "admin", role: Role.ADMIN }, { id: "admin", role: Role.ADMIN }),
    ).toBe(false);
  });

  it("returns false when below Admin", () => {
    expect(
      canDeleteUser({ id: "issuer", role: Role.ISSUER }, { id: "h1", role: Role.HOLDER }),
    ).toBe(false);
  });

  it("returns false when currentUser is null", () => {
    expect(canDeleteUser(null, { id: "h1", role: Role.HOLDER })).toBe(false);
  });

  it("returns false when currentUser is undefined", () => {
    expect(canDeleteUser(undefined, { id: "h1", role: Role.HOLDER })).toBe(false);
  });
});
