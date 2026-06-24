import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import type * as RouterDom from "react-router-dom";
import { useStore } from "@app/store";
import { useSmartBack } from "./useSmartBack";

const navigateMock = vi.fn();
let locationKey = "default";
let locationPathname = "/login";
let locationState: unknown = null;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof RouterDom>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ key: locationKey, pathname: locationPathname, state: locationState }),
  };
});

describe("useSmartBack", () => {
  beforeEach(() => {
    navigateMock.mockClear();
    locationKey = "default";
    locationPathname = "/login";
    locationState = null;
    useStore.setState({ user: null, isAuthenticated: false });
  });

  it("navigates back in history when prior history exists", () => {
    locationKey = "abc123";
    locationPathname = "/about";
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("falls back to /overview when authenticated and no prior history", () => {
    locationPathname = "/about";
    useStore.setState({ isAuthenticated: true });
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith("/overview");
  });

  it("falls back to / when unauthenticated and no prior history", () => {
    locationPathname = "/about";
    useStore.setState({ isAuthenticated: false });
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("returns a stable callback across renders when deps are unchanged", () => {
    locationPathname = "/about";
    useStore.setState({ isAuthenticated: true });
    const { result, rerender } = renderHook(() => useSmartBack());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("redirects to / when on login with protected-redirect state (unauthenticated)", () => {
    locationPathname = "/login";
    locationState = { from: { pathname: "/overview" } };
    useStore.setState({ isAuthenticated: false });
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith("/");
    expect(navigateMock).not.toHaveBeenCalledWith(-1);
  });

  it("redirects to /overview when on login with protected-redirect state (authenticated)", () => {
    locationPathname = "/login";
    locationState = { from: { pathname: "/overview" } };
    useStore.setState({ isAuthenticated: true });
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith("/overview");
    expect(navigateMock).not.toHaveBeenCalledWith(-1);
  });

  it("still navigates back on /login when no redirect state is present", () => {
    locationPathname = "/login";
    locationState = null;
    locationKey = "abc123";
    useStore.setState({ isAuthenticated: false });
    const { result } = renderHook(() => useSmartBack());
    result.current();
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});
