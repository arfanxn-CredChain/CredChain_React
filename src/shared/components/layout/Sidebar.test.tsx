import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { Sidebar } from "./Sidebar";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { mockUserWithMeta } from "@/test/fixtures";

const mockMutate = vi.fn();
vi.mock("@feature/auth/api/useLogout", () => ({
  useLogout: () => ({ mutate: mockMutate, isPending: false }),
}));

function renderSidebar() {
  return render(<Sidebar />, { wrapper: TestProviders });
}

describe("Sidebar logout confirmation", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    useStore.setState({
      user: mockUserWithMeta({ role: Role.ADMIN }),
      isAuthenticated: true,
    });
  });

  it("shows confirm dialog on logout click", async () => {
    renderSidebar();
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls logout mutate when confirmed", async () => {
    renderSidebar();
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    const dialog = await screen.findByRole("alertdialog");
    const confirm = dialog.querySelectorAll("button")[1] as HTMLElement;
    await userEvent.click(confirm);
    expect(mockMutate).toHaveBeenCalled();
  });

  it("does not call logout when cancelled", async () => {
    renderSidebar();
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    await screen.findByRole("alertdialog");
    await userEvent.keyboard("{Escape}");
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
