import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("deduplicates conflicting Tailwind classes (tailwind-merge)", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("bg-navy", "bg-gold")).toBe("bg-gold");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("handles arrays", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("handles objects", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});
