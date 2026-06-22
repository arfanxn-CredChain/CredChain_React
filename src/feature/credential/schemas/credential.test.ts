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

  it("rejects the 'new_holder' sentinel value", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "new_holder",
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

  it("rejects file with invalid MIME type", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(1024, "text/plain", "test.txt"),
    });
    expect(result.success).toBe(false);
  });

  it("accepts file with valid MIME types", () => {
    const pdf = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(1024, "application/pdf", "test.pdf"),
    });
    expect(pdf.success).toBe(true);

    const jpeg = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(1024, "image/jpeg", "test.jpg"),
    });
    expect(jpeg.success).toBe(true);

    const png = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(1024, "image/png", "test.png"),
    });
    expect(png.success).toBe(true);

    const webp = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(1024, "image/webp", "test.webp"),
    });
    expect(webp.success).toBe(true);

    const tiff = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: makeFile(1024, "image/tiff", "test.tif"),
    });
    expect(tiff.success).toBe(true);
  });

  it("rejects null file", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      file: null,
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid meta_entries array", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      meta_entries: [{ key: "dept", value: "CS" }],
      file: makeFile(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects duplicate meta_entries keys", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      meta_entries: [
        { key: "dept", value: "CS" },
        { key: "dept", value: "EE" },
      ],
      file: makeFile(),
    });
    expect(result.success).toBe(false);
  });

  it("allows empty meta_entries array", () => {
    const result = credentialIssueRowSchema.safeParse({
      holder_user_id: "usr_1",
      name: "Test",
      meta_entries: [],
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
  it("returns a row with empty name (filled by filename auto-detect) and empty holder", () => {
    const row = defaultCredentialIssueRow();
    expect(row.name).toBe("");
    expect(row.holder_user_id).toBe("");
    expect(row.meta_entries).toEqual([]);
    expect(row.file).toBeNull();
  });
});
