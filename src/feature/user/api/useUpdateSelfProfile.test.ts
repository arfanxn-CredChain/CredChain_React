import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { TestProviders } from "@/test/TestProviders";
import { useUpdateSelfProfile } from "./useUpdateSelfProfile";

describe("useUpdateSelfProfile lockdown", () => {
  let capturedBody: unknown = null;

  beforeEach(() => {
    capturedBody = null;
    server.use(
      http.put("*/api/users/self/profile", async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          code: 100202,
          message: "ok",
          data: {
            id: "u1",
            name: "Test",
            number: null,
            phone_number: "+628123456789",
            email: "test@example.com",
            birth_date: null,
            gender: null,
            role: "holder",
            meta: null,
            wallet_address: "0x" + "0".repeat(40),
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
            deleted_at: null,
          },
        });
      }),
    );
  });

  it("sends only phone_number in request body", async () => {
    const { result } = renderHook(() => useUpdateSelfProfile(), {
      wrapper: TestProviders,
    });

    result.current.mutate({ phone_number: "+628123456789" });

    await waitFor(() => expect(capturedBody).not.toBeNull());

    const body = capturedBody as Record<string, unknown>;
    expect(body).toEqual({ phone_number: "+628123456789" });
  });
});
