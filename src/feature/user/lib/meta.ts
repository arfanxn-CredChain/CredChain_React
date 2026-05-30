export type MetaEntry = { key: string; value: string };

export function splitMeta(meta: Record<string, unknown> | null): {
  entries: MetaEntry[];
  preserved: Record<string, unknown>;
} {
  const entries: MetaEntry[] = [];
  const preserved: Record<string, unknown> = {};
  if (!meta) return { entries, preserved };

  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string") {
      entries.push({ key, value });
    } else {
      preserved[key] = value;
    }
  }
  return {
    entries: entries.sort((a, b) => a.key.localeCompare(b.key)),
    preserved,
  };
}

export function mergeMeta(
  entries: MetaEntry[],
  preserved: Record<string, unknown>,
): Record<string, unknown> | null {
  const result: Record<string, unknown> = { ...preserved };
  for (const { key, value } of entries) {
    if (key) result[key] = value;
  }
  return Object.keys(result).length > 0 ? result : null;
}

export function metaEqual(
  a: Record<string, unknown> | null,
  b: Record<string, unknown> | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k, i) => k === bKeys[i] && a[k] === b[k]);
}
