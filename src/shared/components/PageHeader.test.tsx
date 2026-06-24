import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as RouterDom from "react-router-dom";
import { TestProviders } from "@/test/TestProviders";
import { useStore } from "@app/store";
import { i18n } from "@shared/i18n/config";
import { PageHeader } from "./PageHeader";

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

function renderHeader(props: React.ComponentProps<typeof PageHeader>) {
  return render(<PageHeader {...props} />, { wrapper: TestProviders });
}

describe("PageHeader back button", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    navigateMock.mockClear();
    locationKey = "default";
    useStore.setState({ user: null, isAuthenticated: false });
  });

  it("does not render the back button when onBack is omitted", () => {
    renderHeader({ title: "User Profile" });
    expect(screen.queryByRole("button", { name: /go back/i })).not.toBeInTheDocument();
  });

  it("renders the back button when onBack is true (smart back)", () => {
    renderHeader({ title: "User Profile", onBack: true });
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
  });

  it("uses smart back (history) when onBack is true and history exists", async () => {
    locationKey = "abc123";
    renderHeader({ title: "User Profile", onBack: true });
    await userEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("uses smart back (auth fallback) when onBack is true and no history", async () => {
    useStore.setState({ isAuthenticated: true });
    renderHeader({ title: "User Profile", onBack: true });
    await userEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(navigateMock).toHaveBeenCalledWith("/overview");
  });

  it("uses smart back (unauth fallback) when onBack is true and no history", async () => {
    useStore.setState({ isAuthenticated: false });
    renderHeader({ title: "User Profile", onBack: true });
    await userEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("uses the custom onBack callback when a function is provided", async () => {
    const customBack = vi.fn();
    renderHeader({ title: "User Profile", onBack: customBack });
    await userEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(customBack).toHaveBeenCalledTimes(1);
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
