import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { TestProviders } from "@/test/TestProviders";
import { useTransferSuperAdmin } from "./useTransferSuperAdmin";

describe("useTransferSuperAdmin", () => {
  it("succeeds on 200", async () => {
    const { result } = renderHook(() => useTransferSuperAdmin(), {
      wrapper: TestProviders,
    });

    result.current.mutate("target-id");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("fails on 500", async () => {
    server.use(
      http.post("*/api/users/self/transfer-super-admin", () =>
        HttpResponse.json(
          { code: 300645, message: "blockchain sync failed", data: null },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => useTransferSuperAdmin(), {
      wrapper: TestProviders,
    });

    result.current.mutate("target-id");

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
