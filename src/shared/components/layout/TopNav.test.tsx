import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { TopNav } from "./TopNav";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { mockUserWithMeta } from "@/test/fixtures";

const mockMutate = vi.fn();
vi.mock("@feature/auth/api/useLogout", () => ({
  useLogout: () => ({ mutate: mockMutate, isPending: false }),
}));

function renderTopNav() {
  return render(<TopNav onMenuClick={() => {}} />, { wrapper: TestProviders });
}

describe("TopNav logout confirmation", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    useStore.setState({
      user: mockUserWithMeta({ role: Role.ADMIN }),
      isAuthenticated: true,
    });
  });

  it("shows confirm dialog from user menu logout", async () => {
    renderTopNav();
    await userEvent.click(screen.getByRole("button", { name: /user menu/i }));
    await userEvent.click(await screen.findByText(/log out/i));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
