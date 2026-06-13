import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useUserListParams } from "./useUserListParams";

function wrap(initialEntries: string[] = ["/users"]) {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
}

describe("useUserListParams", () => {
  it("returns defaults when no query params", () => {
    const { result } = renderHook(() => useUserListParams(), { wrapper: wrap() });
    expect(result.current.params).toEqual({
      page: 1,
      search: "",
      sort: "-updated_at",
      status: "all",
      role: "all",
      limit: 10,
    });
  });

  it("parses role from URL", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?role=admin"]),
    });
    expect(result.current.params.role).toBe("admin");
  });

  it("invalid role defaults to all", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?role=bogus"]),
    });
    expect(result.current.params.role).toBe("all");
  });

  it("changing role resets page to 1", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?page=4"]),
    });
    act(() => result.current.setParam("role", "admin"));
    expect(result.current.params.page).toBe(1);
    expect(result.current.params.role).toBe("admin");
  });

  it("parses limit 20 from URL", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?limit=20"]),
    });
    expect(result.current.params.limit).toBe(20);
  });

  it("disallowed limit value falls back to default", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?limit=25"]),
    });
    expect(result.current.params.limit).toBe(10);
  });

  it("parses page from URL", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?page=3"]),
    });
    expect(result.current.params.page).toBe(3);
  });

  it("setParam updates one key", () => {
    const { result } = renderHook(() => useUserListParams(), { wrapper: wrap() });
    act(() => result.current.setParam("search", "alice"));
    expect(result.current.params.search).toBe("alice");
  });

  it("changing search resets page to 1", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?page=5"]),
    });
    act(() => result.current.setParam("search", "alice"));
    expect(result.current.params.page).toBe(1);
  });

  it("changing page does NOT reset page", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?search=alice"]),
    });
    act(() => result.current.setParam("page", 3));
    expect(result.current.params.page).toBe(3);
    expect(result.current.params.search).toBe("alice");
  });

  it("invalid page defaults to 1", () => {
    const { result } = renderHook(() => useUserListParams(), {
      wrapper: wrap(["/users?page=abc"]),
    });
    expect(result.current.params.page).toBe(1);
  });

  it("setMany updates multiple", () => {
    const { result } = renderHook(() => useUserListParams(), { wrapper: wrap() });
    act(() => result.current.setMany({ sort: "name", status: "deleted_at_" }));
    expect(result.current.params.sort).toBe("name");
    expect(result.current.params.status).toBe("deleted_at_");
  });
});
