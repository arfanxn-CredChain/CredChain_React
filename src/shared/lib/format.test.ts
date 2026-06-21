import { describe, it, expect } from "vitest";
import { truncateAddress, truncateId, truncateHash, formatDate } from "./format";

describe("format", () => {
  describe("truncateAddress", () => {
    it("returns the original string when it is short", () => {
      expect(truncateAddress("short")).toBe("short");
    });

    it("truncates to 10 leading and 4 trailing characters by default", () => {
      expect(truncateAddress("0x1234567890123456789012345678901234567890")).toBe(
        "0x12345678...7890",
      );
    });

    it("supports custom lead and tail lengths", () => {
      expect(truncateAddress("0x12345678901234567890", 4, 4)).toBe("0x12...7890");
    });
  });

  describe("truncateId", () => {
    it("returns the original string when it is short", () => {
      expect(truncateId("cred_test_1")).toBe("cred_test_1");
    });

    it("truncates to 10 leading and 4 trailing characters by default", () => {
      expect(truncateId("01J8K2M3N4P5Q6R7S8T9U0V1W")).toBe("01J8K2M3N4...0V1W");
    });

    it("supports custom lead and tail lengths", () => {
      expect(truncateId("01J8K2M3N4P5Q6R7S8T9U0V1W", 6, 6)).toBe("01J8K2...9U0V1W");
    });
  });

  describe("truncateHash", () => {
    it("returns the original string when it is short", () => {
      expect(truncateHash("short")).toBe("short");
    });

    it("truncates to the specified length with ellipsis", () => {
      expect(truncateHash("0x1234567890abcdef", 8)).toBe("0x123456...");
    });
  });

  describe("formatDate", () => {
    it("formats an ISO date in English by default", () => {
      expect(formatDate("2026-06-18", "en")).toMatch(/Jun 18, 2026/);
    });

    it("returns a dash for null values", () => {
      expect(formatDate(null)).toBe("-");
    });
  });
});
