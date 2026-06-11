import { http, HttpResponse } from "msw";
import type { CredentialDTO, UserDTO } from "@shared/types/api";
import { mockCredentials, mockUsers } from "../fixtures";

const envelope = <T>(code: number, message: string, data?: T) =>
  HttpResponse.json({ code, message, ...(data !== undefined ? { data } : {}) });

// Mirrors backend filter syntax: column<operator><value>.
// Supports operators used by the frontend: `_` (IS NULL), `!_` (IS NOT NULL), `=`.
function applyFilters(users: UserDTO[], filters: string[]): UserDTO[] {
  let result = users;
  for (const f of filters) {
    if (f.endsWith("!_")) {
      const col = f.slice(0, -2);
      result = result.filter((u) => (u as unknown as Record<string, unknown>)[col] != null);
    } else if (f.endsWith("_")) {
      const col = f.slice(0, -1);
      result = result.filter((u) => (u as unknown as Record<string, unknown>)[col] == null);
    } else if (f.includes("=")) {
      const [col, val] = f.split("=", 2);
      result = result.filter((u) => String((u as unknown as Record<string, unknown>)[col]) === val);
    }
  }
  return result;
}

function applySorts(users: UserDTO[], sorts: string[]): UserDTO[] {
  if (sorts.length === 0) return users;
  const out = [...users];
  out.sort((a, b) => {
    for (const s of sorts) {
      const desc = s.startsWith("-");
      const col = desc ? s.slice(1) : s.startsWith("+") ? s.slice(1) : s;
      const av = (a as unknown as Record<string, unknown>)[col];
      const bv = (b as unknown as Record<string, unknown>)[col];
      if (av === bv) continue;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av) < String(bv) ? -1 : 1;
      return desc ? -cmp : cmp;
    }
    return 0;
  });
  return out;
}

export const handlers = [
  http.get("*/api/health", () => envelope(100000, "OK", { status: "ok" })),

  http.get("*/api/users/self", () => envelope(100200, "OK", mockUsers[0])),

  http.get("*/api/users", ({ request }) => {
    const url = new URL(request.url);
    const sorts = url.searchParams.getAll("sorts");
    const filters = url.searchParams.getAll("filters");
    const search = url.searchParams.get("search") ?? "";

    let items: UserDTO[] = mockUsers;
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(
        (u) => (u.name?.toLowerCase().includes(s) ?? false) || u.email.toLowerCase().includes(s),
      );
    }
    items = applyFilters(items, filters);
    items = applySorts(items, sorts);

    return envelope(100200, "OK", {
      items,
      total: items.length,
      page: 1,
      limit: 10,
      last_page: 1,
      from: 1,
      to: items.length,
      first_page_url: null,
      last_page_url: null,
      next_page_url: null,
      prev_page_url: null,
    });
  }),

  http.get("*/api/users/:id", ({ params }) => {
    const user = mockUsers.find((u: UserDTO) => u.id === params.id);
    return user
      ? envelope(100200, "OK", user)
      : HttpResponse.json({ code: 400200, message: "Not found" }, { status: 404 });
  }),

  http.post("*/api/auth/google", () =>
    envelope(100100, "OK", {
      ...mockUsers[0],
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      access_token_expires_in: 900,
      refresh_token_expires_in: 86400,
      token_type: "Bearer",
    }),
  ),

  http.post("*/api/auth/refresh", () => envelope(100101, "OK")),
  http.post("*/api/auth/logout", () => envelope(100102, "OK")),

  http.post("*/api/users/self/transfer-super-admin", () =>
    envelope(300600, "Super admin role transferred successfully.", null),
  ),

  http.delete("*/api/users/batch", () =>
    envelope(300400, "User(s) deleted successfully.", { deleted_count: 1 }),
  ),

  http.get("*/api/credentials", () =>
    envelope(100300, "OK", {
      items: mockCredentials,
      total: mockCredentials.length,
      page: 1,
      limit: 10,
      last_page: 1,
      from: 1,
      to: mockCredentials.length,
      first_page_url: null,
      last_page_url: null,
      next_page_url: null,
      prev_page_url: null,
    }),
  ),

  http.get("*/api/credentials/:id", ({ params }) => {
    const cred = mockCredentials.find((c: CredentialDTO) => c.id === params.id);
    return cred
      ? envelope(100300, "OK", cred)
      : HttpResponse.json({ code: 400300, message: "Not found" }, { status: 404 });
  }),
];
