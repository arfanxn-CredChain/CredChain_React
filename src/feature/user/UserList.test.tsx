import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocation } from "react-router-dom";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { i18n } from "@shared/i18n/config";
import { TestProviders } from "@/test/TestProviders";
import { mockUsers } from "@/test/fixtures";
import { UserList } from "./UserList";

function LocationSentinel() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderUserList() {
  return render(
    <>
      <UserList />
      <LocationSentinel />
    </>,
    { wrapper: TestProviders },
  );
}

beforeEach(async () => {
  await i18n.changeLanguage("en");
  // Reset store with admin user so the component renders the manage UI
  useStore.setState({
    user: {
      id: "usr_admin_test",
      name: "Test Admin",
      number: null,
      phone_number: null,
      email: "admin@test.com",
      birth_date: null,
      gender: null,
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
      expect(screen.getByText(/5 users$/i)).toBeInTheDocument();
    });
  });

  it("shows the Register User CTA for admin role", async () => {
    renderUserList();

    expect(await screen.findByRole("link", { name: /register user/i })).toBeInTheDocument();
  });

  it("hides Register User CTA for issuer role", async () => {
    useStore.setState((s) => ({
      ...s,
      user: s.user ? { ...s.user, role: Role.ISSUER } : null,
    }));

    renderUserList();
    await screen.findByText("User Directory");

    expect(screen.queryByRole("link", { name: /register user/i })).not.toBeInTheDocument();
  });

  it("debounces the search input (does not crash on rapid typing)", async () => {
    const user = userEvent.setup();
    renderUserList();

    const search = await screen.findByPlaceholderText(/search by name/i);
    await user.type(search, "admin");

    expect(search).toHaveValue("admin");
  });

  it("filter dropdown updates URL when selecting Active only", async () => {
    const user = userEvent.setup();
    renderUserList();
    await screen.findByText("User Directory");

    await user.click(screen.getByRole("button", { name: /status/i }));
    const activeItem = await screen.findByRole("menuitem", { name: /active only/i });
    await user.click(activeItem);

    await waitFor(() => {
      expect(screen.getByTestId("location-search").textContent).toContain("deleted=none");
    });
  });

  it("clicking a sort option updates the URL", async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText("Platform Admin")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /sort/i }));
    const item = await screen.findByRole("menuitem", { name: /name a→z/i });
    await user.click(item);

    await waitFor(() => {
      expect(screen.getByTestId("location-search").textContent).toContain("sort=name");
      expect(screen.getByTestId("location-search").textContent).toContain("order=asc");
    });
  });

  it("renders Edit menu item enabled for deleted users (opens Restore dialog)", async () => {
    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText("Trashed User")).toBeInTheDocument();
    });

    const menuButtons = screen.getAllByRole("button", { name: /actions/i });
    // Trashed user is the 5th row (index 4)
    await user.click(menuButtons[4]);
    const editItem = await screen.findByRole("menuitem", { name: /edit/i });
    expect(editItem).toBeInTheDocument();
    expect(editItem).not.toHaveAttribute("data-disabled");
  });

  it("shows actions dropdown menu for each row", async () => {
    renderUserList();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /actions/i }).length).toBeGreaterThan(0),
    );
  });

  it("shows transfer super admin option when auth is super admin and target qualifies", async () => {
    useStore.setState({
      user: { ...mockUsers[0] },
      isAuthenticated: true,
    });

    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => expect(screen.getByText("Default Issuer")).toBeInTheDocument());

    const menuButtons = screen.getAllByRole("button", { name: /actions/i });
    await user.click(menuButtons[2]);

    expect(await screen.findByText(/Transfer Super Admin/i)).toBeInTheDocument();
  });

  it("hides transfer super admin option when auth is admin (not super admin)", async () => {
    useStore.setState({
      user: { ...mockUsers[1] },
      isAuthenticated: true,
    });

    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => expect(screen.getByText("Default Issuer")).toBeInTheDocument());

    const menuButtons = screen.getAllByRole("button", { name: /actions/i });
    await user.click(menuButtons[2]);

    await screen.findByRole("menuitem", { name: /edit/i });
    expect(screen.queryByText(/Transfer Super Admin/i)).not.toBeInTheDocument();
  });

  it("hides transfer super admin option on own row (self)", async () => {
    useStore.setState({
      user: { ...mockUsers[0] },
      isAuthenticated: true,
    });

    const user = userEvent.setup();
    renderUserList();

    await waitFor(() => expect(screen.getByText("Super Admin")).toBeInTheDocument());

    const menuButtons = screen.getAllByRole("button", { name: /actions/i });
    await user.click(menuButtons[0]);

    await screen.findByRole("menuitem", { name: /edit/i });
    expect(screen.queryByText(/Transfer Super Admin/i)).not.toBeInTheDocument();
  });

  it("renders gender inline in the User cell, not as a separate column", async () => {
    renderUserList();
    await waitFor(() =>
      expect(screen.queryByRole("columnheader", { name: /gender/i })).not.toBeInTheDocument(),
    );
  });

  it("does not render a Phone column header", async () => {
    renderUserList();
    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    expect(screen.queryByRole("columnheader", { name: /^phone$/i })).not.toBeInTheDocument();
  });

  it("renders copy buttons for email in each row", async () => {
    renderUserList();
    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: /copy email/i }).length).toBeGreaterThan(0);
  });

  it("renders copy button for phone when phone exists", async () => {
    renderUserList();
    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: /copy phone/i }).length).toBeGreaterThan(0);
  });

  it("renders copy buttons for wallet address in each row", async () => {
    renderUserList();
    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: /copy wallet address/i }).length).toBeGreaterThan(
      0,
    );
  });

  it("selecting a role filter updates the URL with role param", async () => {
    const user = userEvent.setup();
    renderUserList();
    await screen.findByText("User Directory");

    await user.click(screen.getByRole("button", { name: /^role:/i }));
    const adminItem = await screen.findByRole("menuitem", { name: /^admin$/i });
    await user.click(adminItem);

    await waitFor(() => {
      expect(screen.getByTestId("location-search").textContent).toContain("role=admin");
    });
  });

  it("shows Delete option for an active user", async () => {
    const user = userEvent.setup();
    renderUserList();
    await waitFor(() => expect(screen.getByText("Default Issuer")).toBeInTheDocument());

    const menuButtons = screen.getAllByRole("button", { name: /actions/i });
    await user.click(menuButtons[2]);

    expect(await screen.findByRole("menuitem", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows Restore option for a trashed user", async () => {
    const user = userEvent.setup();
    renderUserList();
    await waitFor(() => expect(screen.getByText("Trashed User")).toBeInTheDocument());

    const menuButtons = screen.getAllByRole("button", { name: /actions/i });
    await user.click(menuButtons[4]);

    expect(await screen.findByRole("menuitem", { name: /restore/i })).toBeInTheDocument();
  });

  it("clicking Delete opens a confirm dialog", async () => {
    const user = userEvent.setup();
    renderUserList();
    await waitFor(() => expect(screen.getByText("Default Issuer")).toBeInTheDocument());

    const menuButtons = screen.getAllByRole("button", { name: /actions/i });
    await user.click(menuButtons[2]);
    await user.click(await screen.findByRole("menuitem", { name: /delete/i }));

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
  });
});
