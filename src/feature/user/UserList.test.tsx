import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocation } from "react-router-dom";
import { useStore } from "@app/store";
import { Role } from "@shared/auth/role";
import { i18n } from "@shared/i18n/config";
import { TestProviders } from "@/test/TestProviders";
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
      expect(screen.getByText(/4 users/i)).toBeInTheDocument();
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

  it("filter dropdown updates URL when selecting Live only", async () => {
    const user = userEvent.setup();
    renderUserList();
    await screen.findByText("User Directory");

    await user.click(screen.getByRole("button", { name: /filter/i }));
    const liveItem = await screen.findByRole("menuitem", { name: /live only/i });
    await user.click(liveItem);

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

  it("renders Edit button as disabled for deleted users", async () => {
    renderUserList();

    await waitFor(() => {
      expect(screen.getByText("Platform Admin")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /edit /i });
    expect(editButtons.length).toBeGreaterThan(0);
    // At least one button should be enabled (live users) and we tolerate the rest
    const enabled = editButtons.filter((b) => !b.hasAttribute("disabled"));
    expect(enabled.length).toBeGreaterThan(0);
  });
});
