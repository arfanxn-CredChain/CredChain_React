import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { useStore } from "@app/store";
import { makeUser } from "@/test/fixtures";
import { Role } from "@shared/auth/role";
import { i18n } from "@shared/i18n/config";
import { Overview } from "./Overview";

function renderOverview() {
  return render(<Overview />, { wrapper: TestProviders });
}

describe("Overview", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    useStore.setState({ isAuthenticated: true, user: null });
  });

  it("renders PageHeader with user name", async () => {
    useStore.setState({
      user: makeUser({ name: "Arfan", role: Role.ISSUER }),
    });
    renderOverview();
    await waitFor(() =>
      expect(screen.getByText("Welcome, Arfan")).toBeDefined(),
    );
  });

  it("renders credential counts section", async () => {
    useStore.setState({ user: makeUser({ role: Role.HOLDER }) });
    renderOverview();
    await waitFor(() => {
      expect(screen.getByText("Credentials")).toBeDefined();
    });
    expect(screen.getByText("450")).toBeDefined();
    expect(screen.getByText("500")).toBeDefined();
  });

  it("renders user counts for Issuer+", async () => {
    useStore.setState({ user: makeUser({ role: Role.ISSUER }) });
    renderOverview();
    await waitFor(() => {
      expect(screen.getAllByText("Users").length).toBe(2);
      expect(screen.getAllByText("Holders").length).toBe(2);
    });
  });

  it("hides user counts for Holder", async () => {
    useStore.setState({ user: makeUser({ role: Role.HOLDER }) });
    renderOverview();
    await waitFor(() =>
      expect(screen.getByText("Credentials")).toBeDefined(),
    );
    expect(screen.queryByText("Users")).toBeNull();
  });

  it("renders chain details for Issuer+", async () => {
    useStore.setState({ user: makeUser({ role: Role.ISSUER }) });
    renderOverview();
    await waitFor(() => {
      expect(screen.getAllByText("Chain Info").length).toBe(2);
    });
  });

  it("hides chain details for Holder", async () => {
    useStore.setState({ user: makeUser({ role: Role.HOLDER }) });
    renderOverview();
    await waitFor(() =>
      expect(screen.getByText("Credentials")).toBeDefined(),
    );
    expect(screen.queryByText("Chain Info")).toBeNull();
  });

  it("shows recent activity section", async () => {
    useStore.setState({ user: makeUser({ role: Role.HOLDER }) });
    renderOverview();
    await waitFor(() => {
      expect(screen.getByText("Recent Activity")).toBeDefined();
      expect(screen.getByText("Recently Issued")).toBeDefined();
    });
  });
});
