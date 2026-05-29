import { describe, expect, it } from "vitest";
import { sha256File, sha256Text } from "./hash";

describe("sha256Text", () => {
  it("produces 0x-prefixed 64-char hex hash", async () => {
    const hash = await sha256Text("hello world");
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("matches known SHA-256 of empty string", async () => {
    const hash = await sha256Text("");
    expect(hash).toBe(
      "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("matches known SHA-256 of 'hello world'", async () => {
    const hash = await sha256Text("hello world");
    expect(hash).toBe(
      "0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    );
  });

  it("produces different hashes for different inputs", async () => {
    const a = await sha256Text("foo");
    const b = await sha256Text("bar");
    expect(a).not.toBe(b);
  });
});

describe("sha256File", () => {
  it("hashes a File and returns hex format", async () => {
    const blob = new Blob(["hello world"], { type: "text/plain" });
    const file = new File([blob], "test.txt", { type: "text/plain" });
    const hash = await sha256File(file);
    expect(hash).toBe(
      "0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    );
  });
});
