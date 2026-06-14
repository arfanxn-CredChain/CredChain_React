import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRestoreUsers } from "./useRestoreUsers";
import { TestProviders } from "@/test/TestProviders";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";

const envelope = <T>(code: number, message: string, data?: T) =>
  HttpResponse.json({ code, message, ...(data !== undefined ? { data } : {}) });

const mockNotify = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@shared/lib/notify", () => ({ notify: mockNotify }));

describe("useRestoreUsers", () => {
  it("sends PUT /users/batch/restore with ids and toasts success", async () => {
    server.use(
      http.put("*/api/users/batch/restore", () =>
        envelope(300900, "Restored", { restored_count: 1 }),
      ),
    );

    const { result } = renderHook(() => useRestoreUsers(), {
      wrapper: TestProviders,
    });

    await result.current.mutateAsync(["usr_1"]);

    await waitFor(() => {
      expect(mockNotify.success).toHaveBeenCalledWith("user.restore.success");
    });
  });

  it("toasts error message on failure", async () => {
    server.use(
      http.put("*/api/users/batch/restore", () =>
        HttpResponse.json(
          { code: 300943, message: "Cannot restore super admin" },
          { status: 403 },
        ),
      ),
    );

    const { result } = renderHook(() => useRestoreUsers(), {
      wrapper: TestProviders,
    });

    await expect(() => result.current.mutateAsync(["usr_1"])).rejects.toBeDefined();

    await waitFor(() => {
      expect(mockNotify.error).toHaveBeenCalled();
    });
  });
});
