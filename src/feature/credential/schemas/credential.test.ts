import { describe, expect, it } from "vitest";
import {
  credentialBatchIssueSchema,
  credentialBatchRevokeSchema,
  credentialIssueRowSchema,
  defaultCredentialIssueRow,
} from "./credential";

function makeFile(size = 1024, type = "application/pdf", name = "test.pdf"): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("credentialIssueRowSchema", () => {
  it("accepts a valid row with file", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Bachelor's Degree",
      file: makeFile(),
    });
    expect(result.success).toBe(true);
  });

  it("requires holder_user_id", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "",
      name: "Test",
      file: makeFile(),
    });
    expect(result.success).toBe(false);
  });

  it("requires name", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "",
      file: makeFile(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects name over 256 chars", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "x".repeat(257),
      file: makeFile(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects file over 10 MB", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(11 * 1024 * 1024),
    });
    expect(result.success).toBe(false);
  });

  it("allows null file", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid json meta string", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      meta: '{"key":"value"}',
      file: makeFile(),
    });
    expect(result.success).toBe(true);
  });

  it("allows empty meta string", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      meta: "",
      file: makeFile(),
    });
    expect(result.success).toBe(true);
  });
});

describe("credentialBatchIssueSchema", () => {
  it("requires at least one credential", () => {
    const result = credentialBatchIssueSchema.safeParse({ credentials: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 100 credentials", () => {
    const credentials = Array.from({ length: 101 }, () => ({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(),
    }));
    const result = credentialBatchIssueSchema.safeParse({ credentials });
    expect(result.success).toBe(false);
  });

  it("accepts 100 credentials", () => {
    const credentials = Array.from({ length: 100 }, () => ({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(),
    }));
    const result = credentialBatchIssueSchema.safeParse({ credentials });
    expect(result.success).toBe(true);
  });
});

describe("credentialBatchRevokeSchema", () => {
  it("rejects empty array", () => {
    const result = credentialBatchRevokeSchema.safeParse({ ids: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 100 ids", () => {
    const ids = Array.from({ length: 101 }, (_, i) => `cred_${i}`);
    const result = credentialBatchRevokeSchema.safeParse({ ids });
    expect(result.success).toBe(false);
  });

  it("accepts valid batch", () => {
    const result = credentialBatchRevokeSchema.safeParse({ ids: ["cred_1", "cred_2"] });
    expect(result.success).toBe(true);
  });

  it("rejects empty inner id", () => {
    const result = credentialBatchRevokeSchema.safeParse({ ids: [""] });
    expect(result.success).toBe(false);
  });
});

describe("defaultCredentialIssueRow", () => {
  it("returns a valid default row", () => {
    const row = defaultCredentialIssueRow();
    const result = credentialIssueRowSchema.safeParse(row);
    expect(result.success).toBe(true);
  });
});