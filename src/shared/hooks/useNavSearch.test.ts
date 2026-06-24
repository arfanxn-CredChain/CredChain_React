import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNavSearch } from "./useNavSearch";
import { Role } from "@shared/auth/role";
import { useStore } from "@app/store";

const EN: Record<string, string> = {
  "nav.overview": "Overview",
  "nav.users": "Users",
  "nav.credentials": "Credentials",
  "nav.myCredentials": "My Credentials",
  "nav.settings": "Settings",
  "nav.profile": "Profile",
  "nav.help": "Help",
  "nav.about": "About",
};

const ID: Record<string, string> = {
  "nav.overview": "Dasbor",
  "nav.users": "Pengguna",
  "nav.credentials": "Kredensial",
  "nav.myCredentials": "Kredensial Saya",
  "nav.settings": "Pengaturan",
  "nav.profile": "Profil",
  "nav.help": "Bantuan",
  "nav.about": "Tentang",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => EN[key] ?? key,
    i18n: {
      getFixedT: (lng: "en" | "id") => (key: string) => (lng === "id" ? ID : EN)[key] ?? key,
    },
  }),
}));

describe("useNavSearch", () => {
  beforeEach(() => {
    useStore.setState({ user: null, isAuthenticated: false });
  });

  it("returns role-filtered set with empty query (Admin sees all admin items)", () => {
    useStore.setState({
      user: { role: Role.ADMIN } as never,
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useNavSearch(""));
    const hrefs = result.current.map((i) => i.href);
    expect(hrefs).toContain("/overview");
    expect(hrefs).toContain("/users");
    expect(hrefs).toContain("/settings");
    expect(hrefs).toContain("/help");
    expect(hrefs).toContain("/about");
  });

  it("filters items by case-insensitive substring match", () => {
    useStore.setState({
      user: { role: Role.ADMIN } as never,
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useNavSearch("USER"));
    const hrefs = result.current.map((i) => i.href);
    expect(hrefs).toContain("/users");
    expect(hrefs).not.toContain("/overview");
  });

  it("returns empty array for query with no matches", () => {
    useStore.setState({
      user: { role: Role.ADMIN } as never,
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useNavSearch("zzzzz"));
    expect(result.current).toEqual([]);
  });

  it("hides admin-only items for Holder users", () => {
    useStore.setState({
      user: { role: Role.HOLDER } as never,
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useNavSearch(""));
    const hrefs = result.current.map((i) => i.href);
    expect(hrefs).not.toContain("/users");
    expect(hrefs).not.toContain("/settings");
    expect(hrefs).toContain("/credentials/self");
    expect(hrefs).toContain("/help");
  });

  it("returns public items for unauthenticated user", () => {
    useStore.setState({ user: null, isAuthenticated: false });
    const { result } = renderHook(() => useNavSearch(""));
    const hrefs = result.current.map((i) => i.href);
    expect(hrefs).toContain("/help");
    expect(hrefs).toContain("/about");
    expect(hrefs).not.toContain("/overview");
  });

  it("matches by displayed label not raw key", () => {
    useStore.setState({
      user: { role: Role.HOLDER } as never,
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useNavSearch("my creden"));
    const hrefs = result.current.map((i) => i.href);
    expect(hrefs).toContain("/credentials/self");
  });

  it("matches English label regardless of active locale", () => {
    useStore.setState({
      user: { role: Role.ADMIN } as never,
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useNavSearch("users"));
    expect(result.current.map((i) => i.href)).toContain("/users");
  });

  it("matches Indonesian label 'dasbor' for overview", () => {
    useStore.setState({
      user: { role: Role.ADMIN } as never,
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useNavSearch("dasbor"));
    expect(result.current.map((i) => i.href)).toContain("/overview");
  });

  it("matches Indonesian label 'bantu' for help", () => {
    useStore.setState({
      user: { role: Role.ADMIN } as never,
      isAuthenticated: true,
    });
    const { result } = renderHook(() => useNavSearch("bantu"));
    expect(result.current.map((i) => i.href)).toContain("/help");
  });
});
