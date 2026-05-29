import { http, HttpResponse } from "msw";
import type { CredentialDTO, UserDTO } from "@shared/types/api";
import { mockCredentials, mockUsers } from "../fixtures";

const envelope = <T>(code: number, message: string, data?: T) =>
  HttpResponse.json({ code, message, ...(data !== undefined ? { data } : {}) });

export const handlers = [
  http.get("*/api/health", () => envelope(100000, "OK", { status: "ok" })),

  http.get("*/api/users/self", () => envelope(100200, "OK", mockUsers[0])),

  http.get("*/api/users", () =>
    envelope(100200, "OK", {
      items: mockUsers,
      total: mockUsers.length,
      page: 1,
      limit: 10,
      last_page: 1,
      from: 1,
      to: mockUsers.length,
      first_page_url: null,
      last_page_url: null,
      next_page_url: null,
      prev_page_url: null,
    }),
  ),

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
