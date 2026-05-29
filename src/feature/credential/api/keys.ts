export const credentialKeys = {
  all: () => ["credentials"] as const,
  list: (params?: unknown) => ["credentials", "list", params] as const,
  detail: (id: string) => ["credentials", "detail", id] as const,
  mine: () => ["credentials", "mine"] as const,
};
