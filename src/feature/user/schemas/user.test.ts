import { describe, expect, it } from "vitest";
import { Role } from "@shared/auth/role";
import {
  genderSchema,
  userBatchStoreSchema,
  userSelfEmailSchema,
  userSelfProfileSchema,
  userStoreSchema,
  userUpdateSchema,
} from "./user";

describe("userStoreSchema - phone validation (strictE164)", () => {
  it("accepts valid international phone numbers", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      phone_number: "+6281234567890",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(true);
  });

  it("rejects phone without + prefix", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      phone_number: "6281234567890",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone starting with +0", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      phone_number: "+0281234567890",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone with letters", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      phone_number: "+62812abc4567",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });

  it("treats empty phone string as undefined (optional)", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      phone_number: "",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(true);
  });
});

describe("userStoreSchema - email validation", () => {
  it("accepts valid emails", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "not-an-email",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });

  it("rejects email longer than 256 chars", () => {
    const longLocal = "a".repeat(250);
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: `${longLocal}@example.com`,
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });
});

describe("userStoreSchema - name validation", () => {
  it("rejects empty name", () => {
    const result = userStoreSchema.safeParse({
      name: "",
      email: "jane@example.com",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 256 chars", () => {
    const result = userStoreSchema.safeParse({
      name: "a".repeat(257),
      email: "jane@example.com",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });
});

describe("userStoreSchema - birth_date validation", () => {
  it("accepts ISO date format", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      birth_date: "1990-05-15",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-ISO date format", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      birth_date: "15/05/1990",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(false);
  });

  it("treats empty birth_date as undefined", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      birth_date: "",
      role: Role.HOLDER,
    });
    expect(result.success).toBe(true);
  });
});

describe("userStoreSchema - role validation", () => {
  it("accepts holder, issuer, admin", () => {
    for (const role of [Role.HOLDER, Role.ISSUER, Role.ADMIN]) {
      const result = userStoreSchema.safeParse({
        name: "Jane",
        email: "jane@example.com",
        role,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects super_admin (cannot be created via API)", () => {
    const result = userStoreSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      role: Role.SUPER_ADMIN,
    });
    expect(result.success).toBe(false);
  });
});

describe("userBatchStoreSchema", () => {
  it("requires at least one user", () => {
    const result = userBatchStoreSchema.safeParse({ users: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 100 users", () => {
    const users = Array.from({ length: 101 }, (_, i) => ({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: Role.HOLDER,
    }));
    const result = userBatchStoreSchema.safeParse({ users });
    expect(result.success).toBe(false);
  });

  it("accepts valid batch", () => {
    const result = userBatchStoreSchema.safeParse({
      users: [
        { name: "Jane", email: "jane@example.com", role: Role.HOLDER },
        { name: "John", email: "john@example.com", role: Role.ISSUER },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("userSelfProfileSchema", () => {
  it("accepts empty object (phone is optional)", () => {
    const result = userSelfProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid E.164 phone number", () => {
    const result = userSelfProfileSchema.safeParse({ phone_number: "+6281234567890" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone format", () => {
    const result = userSelfProfileSchema.safeParse({ phone_number: "08123456789" });
    expect(result.success).toBe(false);
  });

  it("treats empty string phone as undefined", () => {
    const result = userSelfProfileSchema.safeParse({ phone_number: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone_number).toBeUndefined();
  });
});

describe("userSelfEmailSchema", () => {
  it("requires both email and id_token", () => {
    expect(userSelfEmailSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
    expect(userSelfEmailSchema.safeParse({ id_token: "abc" }).success).toBe(false);
  });

  it("accepts valid payload", () => {
    const result = userSelfEmailSchema.safeParse({
      email: "new@example.com",
      id_token: "google-id-token",
    });
    expect(result.success).toBe(true);
  });
});

describe("genderSchema", () => {
  it.each(["male", "female", "other"] as const)("accepts %s", (value) => {
    expect(genderSchema.parse(value)).toBe(value);
  });

  it("rejects unknown values", () => {
    expect(() => genderSchema.parse("unknown")).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => genderSchema.parse("")).toThrow();
  });
});

describe("userStoreSchema gender field", () => {
  const baseValid = {
    name: "Test",
    email: "test@example.com",
    role: "holder" as const,
  };

  it("accepts gender: undefined", () => {
    expect(userStoreSchema.safeParse(baseValid).success).toBe(true);
  });

  it("accepts gender: null", () => {
    expect(userStoreSchema.safeParse({ ...baseValid, gender: null }).success).toBe(true);
  });

  it("accepts valid gender values", () => {
    for (const g of ["male", "female", "other"] as const) {
      expect(userStoreSchema.safeParse({ ...baseValid, gender: g }).success).toBe(true);
    }
  });

  it("rejects invalid gender values", () => {
    expect(userStoreSchema.safeParse({ ...baseValid, gender: "invalid" }).success).toBe(false);
  });
});

describe("userUpdateSchema gender field", () => {
  const baseValid = { id: "u1" };

  it("accepts gender: null (clear)", () => {
    expect(userUpdateSchema.safeParse({ ...baseValid, gender: null }).success).toBe(true);
  });

  it("accepts valid gender values", () => {
    expect(userUpdateSchema.safeParse({ ...baseValid, gender: "male" }).success).toBe(true);
  });

  it("rejects invalid gender values", () => {
    expect(userUpdateSchema.safeParse({ ...baseValid, gender: "x" }).success).toBe(false);
  });
});
