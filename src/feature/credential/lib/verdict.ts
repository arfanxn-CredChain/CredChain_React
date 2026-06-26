export type VerdictTier = "green" | "orange" | "red" | "amber" | "gray" | "light-gray";

const VERDICT_TIER_MAP: Record<number, VerdictTier> = {
  400401: "green",      // authentic
  400402: "orange",     // revoked
  400403: "orange",     // integrity_warning
  400404: "red",        // tampered
  400405: "amber",      // suspicious
  400406: "gray",       // low_similarity
  400407: "light-gray", // not_similar
  400408: "light-gray", // no_identifiers
  400409: "light-gray", // no_match
  400410: "red",        // holder_disabled
  400411: "red",        // issuer_disabled
  400412: "red",        // party_disabled
};

const EXACT_HASH_CODES = new Set([400401, 400402, 400403]);

export function getVerdictTier(verdictCode: number): VerdictTier {
  return VERDICT_TIER_MAP[verdictCode] ?? "light-gray";
}

export function getMethodLabel(similarityScore: number | null): "hash" | "fuzzy" {
  return similarityScore != null ? "fuzzy" : "hash";
}

export function isExactHashMatch(verdictCode: number): boolean {
  return EXACT_HASH_CODES.has(verdictCode);
}
