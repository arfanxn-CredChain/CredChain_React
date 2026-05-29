/**
 * Format helpers for blockchain identifiers, dates, and other display values.
 */

export function truncateAddress(address: string, lead = 10, tail = 4): string {
  if (!address) return "";
  if (address.length <= lead + tail) return address;
  return `${address.slice(0, lead)}...${address.slice(-tail)}`;
}

export function truncateHash(hash: string, length = 16): string {
  if (!hash) return "";
  if (hash.length <= length) return hash;
  return `${hash.slice(0, length)}...`;
}

export function formatDate(value: string | number | Date | null, locale = "en"): string {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | number | Date | null, locale = "en"): string {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
