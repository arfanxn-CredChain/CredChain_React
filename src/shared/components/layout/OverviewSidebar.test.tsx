import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { OverviewSidebar } from "./OverviewSidebar";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { mockUserWithMeta } from "@/test/fixtures";
import { i18n } from "@shared/i18n/config";

const mockMutate = vi.fn();
vi.mock("@feature/auth/api/useLogout", () => ({
  useLogout: () => ({ mutate: mockMutate, isPending: false }),
}));

function renderOverviewSidebar() {
  return render(<OverviewSidebar />, { wrapper: TestProviders });
}

describe("OverviewSidebar logout confirmation", () => {
  beforeEach(() => {
    void i18n.changeLanguage("en");
    mockMutate.mockClear();
    useStore.setState({
      user: mockUserWithMeta({ role: Role.ADMIN }),
      isAuthenticated: true,
    });
  });

  it("shows confirm dialog on logout click", async () => {
    renderOverviewSidebar();
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls logout mutate when confirmed", async () => {
    renderOverviewSidebar();
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    const dialog = await screen.findByRole("alertdialog");
    const confirm = dialog.querySelectorAll("button")[1] as HTMLElement;
    await userEvent.click(confirm);
    expect(mockMutate).toHaveBeenCalled();
  });

  it("does not call logout when cancelled", async () => {
    renderOverviewSidebar();
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    await screen.findByRole("alertdialog");
    await userEvent.keyboard("{Escape}");
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
