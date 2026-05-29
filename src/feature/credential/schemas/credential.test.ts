import { describe, expect, it } from "vitest";
import {
  credentialBatchIssueSchema,
  credentialBatchRevokeSchema,
  credentialIssueRowSchema,
  credentialVerifySchema,
} from "./credential";

describe("credentialIssueRowSchema", () => {
  const validRow = {
    holder_id: "usr_1",
    type: "AcademicDegree",
    title: "BSc Computer Science",
    description: "Awarded for completing requirements",
    uri: "ipfs://QmYwAPJzv5CZsnA625s3Xf2bXawS5E2L1Gq5yMxb8y4LhK",
  };

  it("accepts a complete valid row", () => {
    const result = credentialIssueRowSchema.safeParse(validRow);
    expect(result.success).toBe(true);
  });

  it("requires holder_id", () => {
    const result = credentialIssueRowSchema.safeParse({ ...validRow, holder_id: "" });
    expect(result.success).toBe(false);
  });

  it("requires title", () => {
    const result = credentialIssueRowSchema.safeParse({ ...validRow, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects URI without ipfs:// or https:// prefix", () => {
    const result = credentialIssueRowSchema.safeParse({
      ...validRow,
      uri: "http://example.com/cred",
    });
    expect(result.success).toBe(false);
  });

  it("accepts https:// URI", () => {
    const result = credentialIssueRowSchema.safeParse({
      ...validRow,
      uri: "https://example.com/credential.json",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid_until in YYYY-MM-DD format", () => {
    const result = credentialIssueRowSchema.safeParse({ ...validRow, valid_until: "2030-12-31" });
    expect(result.success).toBe(true);
  });

  it("rejects valid_until in non-ISO format", () => {
    const result = credentialIssueRowSchema.safeParse({
      ...validRow,
      valid_until: "31/12/2030",
    });
    expect(result.success).toBe(false);
  });
});

describe("credentialBatchIssueSchema", () => {
  it("requires at least one credential", () => {
    const result = credentialBatchIssueSchema.safeParse({ credentials: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 50 credentials", () => {
    const credentials = Array.from({ length: 51 }, (_, i) => ({
      holder_id: `usr_${i}`,
      type: "AcademicDegree",
      title: `Title ${i}`,
      uri: "ipfs://QmTest",
    }));
    const result = credentialBatchIssueSchema.safeParse({ credentials });
    expect(result.success).toBe(false);
  });
});

describe("credentialBatchRevokeSchema", () => {
  it("rejects empty array", () => {
    const result = credentialBatchRevokeSchema.safeParse({ ids: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 50 ids", () => {
    const ids = Array.from({ length: 51 }, (_, i) => `cred_${i}`);
    const result = credentialBatchRevokeSchema.safeParse({ ids });
    expect(result.success).toBe(false);
  });

  it("accepts valid batch", () => {
    const result = credentialBatchRevokeSchema.safeParse({ ids: ["cred_1", "cred_2"] });
    expect(result.success).toBe(true);
  });
});

describe("credentialVerifySchema", () => {
  const validHash = "0x" + "a".repeat(64);

  it("accepts valid 0x-prefixed SHA-256 hash", () => {
    const result = credentialVerifySchema.safeParse({
      credential_id: "cred_1",
      hash: validHash,
    });
    expect(result.success).toBe(true);
  });

  it("rejects hash without 0x prefix", () => {
    const result = credentialVerifySchema.safeParse({
      credential_id: "cred_1",
      hash: "a".repeat(64),
    });
    expect(result.success).toBe(false);
  });

  it("rejects hash with wrong length", () => {
    const result = credentialVerifySchema.safeParse({
      credential_id: "cred_1",
      hash: "0x" + "a".repeat(63),
    });
    expect(result.success).toBe(false);
  });

  it("rejects hash with non-hex chars", () => {
    const result = credentialVerifySchema.safeParse({
      credential_id: "cred_1",
      hash: "0x" + "z".repeat(64),
    });
    expect(result.success).toBe(false);
  });
});
