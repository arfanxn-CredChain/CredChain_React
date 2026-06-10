import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type * as RouterDom from "react-router-dom";
import { useStore } from "@app/store";
import { useSmartBack } from "./useSmartBack";

const navigateMock = vi.fn();
let locationKey = "default";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof RouterDom>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ key: locationKey }),
  };
});

describe("useSmartBack", () => {
  beforeEach(() => {
    navigateMock.mockClear();
    locationKey = "default";
    useStore.setState({ user: null, isAuthenticated: false });
  });

  it("navigates back in history when prior history exists", () => {
    locationKey = "abc123";
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("falls back to /dashboard when authenticated and no prior history", () => {
    useStore.setState({ isAuthenticated: true });
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith("/dashboard");
  });

  it("falls back to / when unauthenticated and no prior history", () => {
    useStore.setState({ isAuthenticated: false });
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("returns a stable callback across renders when deps are unchanged", () => {
    useStore.setState({ isAuthenticated: true });
    const { result, rerender } = renderHook(() => useSmartBack());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
