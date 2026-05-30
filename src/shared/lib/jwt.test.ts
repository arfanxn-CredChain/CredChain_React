import { describe, it, expect } from "vitest";
import { decodeJwtPayload } from "./jwt";

describe("decodeJwtPayload", () => {
  it("decodes a valid JWT payload", () => {
    // Header: {"alg":"HS256","typ":"JWT"}
    // Payload: {"email":"test@example.com","sub":"123"}
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiIxMjMifQ.signature";
    const result = decodeJwtPayload<{ email: string; sub: string }>(token);
    expect(result).toEqual({ email: "test@example.com", sub: "123" });
  });

  it("returns null for empty string", () => {
    expect(decodeJwtPayload("")).toBeNull();
  });

  it("returns null for one-segment token", () => {
    expect(decodeJwtPayload("onlyone")).toBeNull();
  });

  it("returns null for two-segment token", () => {
    expect(decodeJwtPayload("header.payload")).toBeNull();
  });

  it("handles base64url with - and _ characters", () => {
    // Payload with chars that produce - and _ in base64url
    const token = "header.eyJ0ZXN0Ijoi4oCcaGVsbG_igJ0ifQ.sig";
    const result = decodeJwtPayload<{ test: string }>(token);
    expect(result).not.toBeNull();
  });

  it("returns null for non-JSON payload", () => {
    // "notjson" base64-encoded
    const token = "header.bm90anNvbg.sig";
    expect(decodeJwtPayload(token)).toBeNull();
  });

  it("returns object even when expected type fields missing", () => {
    const token = "header.eyJvdGhlciI6InZhbHVlIn0.sig";
    const result = decodeJwtPayload<{ email: string }>(token);
    // Decode succeeds; type checking is caller's responsibility
    expect(result).toEqual({ other: "value" });
  });
});
