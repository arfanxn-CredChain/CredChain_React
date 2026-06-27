import { describe, it, expect } from "vitest";
import { verifyFileSchema } from "./credential";

function makeFile(name: string, type: string, size = 1024): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("verifyFileSchema", () => {
  it("accepts a valid PDF file", () => {
    const file = makeFile("doc.pdf", "application/pdf");
    const result = verifyFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("accepts a valid JPEG file", () => {
    const file = makeFile("photo.jpg", "image/jpeg");
    const result = verifyFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("accepts a valid PNG file", () => {
    const file = makeFile("image.png", "image/png");
    const result = verifyFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("accepts a valid WebP file", () => {
    const file = makeFile("image.webp", "image/webp");
    const result = verifyFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("accepts a valid TIFF file", () => {
    const file = makeFile("scan.tiff", "image/tiff");
    const result = verifyFileSchema.safeParse(file);
    expect(result.success).toBe(true);
  });

  it("rejects file exceeding 10 MB", () => {
    const file = makeFile("large.pdf", "application/pdf", 11 * 1024 * 1024);
    const result = verifyFileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("zod.credential.fileTooLarge");
    }
  });

  it("rejects unsupported MIME type", () => {
    const file = makeFile("script.exe", "application/x-executable");
    const result = verifyFileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("zod.credential.fileTypeInvalid");
    }
  });

  it("rejects file with empty type", () => {
    const file = makeFile("unknown", "");
    const result = verifyFileSchema.safeParse(file);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("zod.credential.fileTypeInvalid");
    }
  });
});
