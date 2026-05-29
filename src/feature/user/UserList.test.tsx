import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { TestProviders } from "@/test/TestProviders";
import { UserList } from "./UserList";

function renderUserList() {
  return render(<UserList />, { wrapper: TestProviders });
}

beforeEach(() => {
  // Reset store with admin user so the component renders the manage UI
  useStore.setState({
    user: {
      id: "usr_admin_test",
      name: "Test Admin",
      number: null,
      phone_number: null,
      email: "admin@test.com",
      birth_date: null,
      role: Role.ADMIN,
      meta: null,
      wallet_address: "0x" + "0".repeat(40),
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      deleted_at: null,
    },
    isAuthenticated: true,
  });
});

describe("UserList", () => {
  it("renders the page header and search input", async () => {
    renderUserList();

    expect(await screen.findByText("User Directory")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
  });

  it("renders mock users from MSW after load", async () => {
    renderUserList();

    await waitFor(
      () => {
        expect(screen.getByText("Platform Admin")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(screen.getByText("Default Issuer")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("shows entity count after load", async () => {
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText(/4 entities/i)).toBeInTheDocument();
    });
  });

  it("shows the Register Entity CTA for admin role", async () => {
    renderUserList();

    expect(await screen.findByRole("link", { name: /register entity/i })).toBeInTheDocument();
  });

  it("hides Register Entity CTA for issuer role", async () => {
    useStore.setState((s) => ({
      ...s,
      user: s.user ? { ...s.user, role: Role.ISSUER } : null,
    }));

    renderUserList();
    await screen.findByText("User Directory");

    expect(screen.queryByRole("link", { name: /register entity/i })).not.toBeInTheDocument();
  });

  it("debounces the search input (does not crash on rapid typing)", async () => {
    const user = userEvent.setup();
    renderUserList();

    const search = await screen.findByPlaceholderText(/search by name/i);
    await user.type(search, "admin");

    expect(search).toHaveValue("admin");
  });
});
