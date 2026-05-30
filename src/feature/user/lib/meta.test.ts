import { describe, it, expect } from "vitest";
import { splitMeta, mergeMeta, metaEqual } from "./meta";

describe("splitMeta", () => {
  it("returns empty entries and preserved for null", () => {
    const { entries, preserved } = splitMeta(null);
    expect(entries).toEqual([]);
    expect(preserved).toEqual({});
  });

  it("separates string values into entries", () => {
    const { entries } = splitMeta({ name: "Alice", level: "L3" });
    expect(entries).toEqual([
      { key: "level", value: "L3" },
      { key: "name", value: "Alice" },
    ]);
  });

  it("puts non-string values into preserved", () => {
    const { preserved } = splitMeta({ count: 5, active: true, nested: { a: 1 } });
    expect(preserved).toEqual({ count: 5, active: true, nested: { a: 1 } });
  });

  it("sorts entries by key", () => {
    const { entries } = splitMeta({ z: "last", a: "first" });
    expect(entries[0].key).toBe("a");
    expect(entries[1].key).toBe("z");
  });
});

describe("mergeMeta", () => {
  it("merges entries with preserved", () => {
    const result = mergeMeta([{ key: "dept", value: "Eng" }], { count: 5 });
    expect(result).toEqual({ dept: "Eng", count: 5 });
  });

  it("returns null when both empty", () => {
    expect(mergeMeta([], {})).toBeNull();
  });

  it("preserves non-string values unchanged", () => {
    const result = mergeMeta([], { nested: { a: 1 } });
    expect(result).toEqual({ nested: { a: 1 } });
  });

  it("entries override preserved on same key", () => {
    const result = mergeMeta([{ key: "x", value: "new" }], { x: "old" });
    expect(result?.x).toBe("new");
  });

  it("skips empty keys", () => {
    const result = mergeMeta([{ key: "", value: "x" }, { key: "ok", value: "y" }], {});
    expect(result).toEqual({ ok: "y" });
  });
});

describe("metaEqual", () => {
  it("null === null", () => expect(metaEqual(null, null)).toBe(true));
  it("null !== {}", () => expect(metaEqual(null, {})).toBe(false));
  it("equal objects", () => expect(metaEqual({ a: "1" }, { a: "1" })).toBe(true));
  it("different values", () => expect(metaEqual({ a: "1" }, { a: "2" })).toBe(false));
  it("different keys", () => expect(metaEqual({ a: "1" }, { b: "1" })).toBe(false));
  it("different lengths", () => expect(metaEqual({ a: "1" }, { a: "1", b: "2" })).toBe(false));
});
