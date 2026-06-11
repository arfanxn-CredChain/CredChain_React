import { describe, it, expect, beforeEach } from "vitest";
import { server } from "@/test/msw/server";
import { http, HttpResponse } from "msw";
import { api, configureAuthHandler } from "./client";

describe("axios interceptor — 401 handling", () => {
  let unauthCalled = false;

  beforeEach(() => {
    unauthCalled = false;
    configureAuthHandler(() => {
      unauthCalled = true;
    });
  });

  it("retries /users/self after silent refresh succeeds", async () => {
    let selfCallCount = 0;
    server.use(
      http.get("/api/users/self", () => {
        selfCallCount++;
        if (selfCallCount === 1) {
          return HttpResponse.json({ code: 401100, message: "Unauthorized" }, { status: 401 });
        }
        return HttpResponse.json({
          code: 100200,
          message: "OK",
          data: { id: "1", email: "a@b.com" },
        });
      }),
      http.post("/api/auth/refresh", () => HttpResponse.json({ code: 100000, message: "OK" })),
    );

    const response = await api.get("/users/self");
    expect(selfCallCount).toBe(2);
    expect(unauthCalled).toBe(false);
    expect(response.data).toMatchObject({ id: "1" });
  });

  it("calls onUnauthenticated when refresh fails on /users/self 401", async () => {
    server.use(
      http.get("/api/users/self", () =>
        HttpResponse.json({ code: 401100, message: "Unauthorized" }, { status: 401 }),
      ),
      http.post("/api/auth/refresh", () =>
        HttpResponse.json({ code: 401100, message: "Unauthorized" }, { status: 401 }),
      ),
    );

    await expect(api.get("/users/self")).rejects.toThrow();
    expect(unauthCalled).toBe(true);
  });

  it("does NOT retry /auth/refresh on 401 (would loop)", async () => {
    let refreshCount = 0;
    server.use(
      http.post("/api/auth/refresh", () => {
        refreshCount++;
        return HttpResponse.json({ code: 401100, message: "Unauthorized" }, { status: 401 });
      }),
    );

    await expect(api.post("/auth/refresh")).rejects.toThrow();
    expect(refreshCount).toBe(1);
  });

  it("maps 429 to system.rate_limited", async () => {
    server.use(
      http.get("/api/users", () =>
        HttpResponse.json({ code: 429000, message: "Too many requests" }, { status: 429 }),
      ),
    );

    await expect(api.get("/users")).rejects.toMatchObject({
      messageKey: "system.rate_limited",
    });
  });

  it("maps 429 with Retry-After to system.rate_limited_with_retry", async () => {
    server.use(
      http.get(
        "/api/users",
        () =>
          new HttpResponse(JSON.stringify({ code: 429000, message: "Too many requests" }), {
            status: 429,
            headers: { "Retry-After": "30" },
          }),
      ),
    );

    await expect(api.get("/users")).rejects.toMatchObject({
      messageKey: "system.rate_limited_with_retry",
    });
  });
});
