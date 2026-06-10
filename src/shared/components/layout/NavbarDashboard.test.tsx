import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { NavbarDashboard } from "./NavbarDashboard";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { mockUserWithMeta } from "@/test/fixtures";
import { i18n } from "@shared/i18n/config";

const mockMutate = vi.fn();
vi.mock("@feature/auth/api/useLogout", () => ({
  useLogout: () => ({ mutate: mockMutate, isPending: false }),
}));

function renderNavbar() {
  return render(<NavbarDashboard onMenuClick={() => {}} />, { wrapper: TestProviders });
}

describe("NavbarDashboard logout confirmation", () => {
  beforeEach(() => {
    void i18n.changeLanguage("en");
    mockMutate.mockClear();
    useStore.setState({
      user: mockUserWithMeta({ role: Role.ADMIN }),
      isAuthenticated: true,
    });
  });

  it("shows confirm dialog from user menu logout", async () => {
    renderNavbar();
    await userEvent.click(screen.getByRole("button", { name: /user menu/i }));
    await userEvent.click(await screen.findByText(/log out/i));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});

describe("NavbarDashboard search", () => {
  beforeEach(() => {
    void i18n.changeLanguage("en");
    useStore.setState({
      user: mockUserWithMeta({ role: Role.ADMIN }),
      isAuthenticated: true,
    });
  });

  it("shows dropdown results when typing a matching query", async () => {
    renderNavbar();
    const input = screen.getByRole("searchbox");
    await userEvent.type(input, "user");
    expect(await screen.findByText("Users")).toBeInTheDocument();
  });

  it("shows no dropdown when query is empty", async () => {
    renderNavbar();
    const input = screen.getByRole("searchbox");
    await userEvent.clear(input);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("clears query on Escape", async () => {
    renderNavbar();
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    await userEvent.type(input, "user");
    await userEvent.keyboard("{Escape}");
    expect(input.value).toBe("");
  });
});
