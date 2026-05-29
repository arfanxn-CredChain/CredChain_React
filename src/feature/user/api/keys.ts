export const userKeys = {
  all: () => ["users"] as const,
  list: (params?: unknown) => ["users", "list", params] as const,
  detail: (id: string) => ["users", "detail", id] as const,
  self: () => ["users", "self"] as const,
};
