import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { UserEditDrawer } from "./UserEditDrawer";
import { mockUserWithMeta } from "@/test/fixtures";
import { makeUser } from "@/test/fixtures";
import { i18n } from "@shared/i18n/config";
import { Role } from "@shared/auth/role";
import { useStore } from "@app/store";

// Minimal vaul mock — jsdom doesn't fully support vaul's portal/animation
vi.mock("vaul", () => ({
  Drawer: {
    Root: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open ? <div role="dialog">{children}</div> : null,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Overlay: () => null,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    Description: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  },
}));

const mockMutate = vi.fn();
vi.mock("../api/useUpdateUsers", () => ({
  useUpdateUsers: () => ({ mutateAsync: mockMutate, isPending: false }),
}));

describe("UserEditDrawer", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    void i18n.changeLanguage("en");
  });

  it("does not render when user is null", () => {
    render(<UserEditDrawer user={null} onClose={() => {}} />, { wrapper: TestProviders });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with prefilled values when user is provided", async () => {
    const user = mockUserWithMeta({ name: "Alice", email: "alice@x.com" });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });
    await waitFor(() => {
      expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();
      expect(screen.getByDisplayValue("alice@x.com")).toBeInTheDocument();
    });
  });

  it("birth_date sliced from full ISO datetime", async () => {
    const user = mockUserWithMeta({ birth_date: "2003-07-21T00:00:00Z" });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });
    await waitFor(() => {
      expect(screen.getByDisplayValue("2003-07-21")).toBeInTheDocument();
    });
  });

  it("close button calls onClose with no dirty state", async () => {
    const onClose = vi.fn();
    // Use user with no meta to avoid useFieldArray dirty-state edge case after reset
    const user = mockUserWithMeta({ name: "Test User", meta: null });
    render(<UserEditDrawer user={user} onClose={onClose} />, { wrapper: TestProviders });
    // Wait for form to be reset (isDirty = false) before clicking
    await waitFor(() => expect(screen.getByDisplayValue("Test User")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("UserEditDrawer with SuperAdmin", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    void i18n.changeLanguage("en");
    useStore.setState({
      user: makeUser({ id: "usr_sa", role: Role.SUPER_ADMIN }),
      isAuthenticated: true,
    });
  });

  it("shows role as read-only text for super admin users", async () => {
    const user = makeUser({
      id: "usr_sa",
      name: "Super Admin",
      email: "sa@credchain.demo",
      role: Role.SUPER_ADMIN,
    });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });

    await waitFor(() => {
      expect(screen.getAllByDisplayValue("Super Admin").length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.queryByRole("combobox", { name: /role/i })).not.toBeInTheDocument();
  });

  it("disables email field for super admin users", async () => {
    const user = makeUser({
      id: "usr_sa",
      name: "Super Admin",
      email: "sa@credchain.demo",
      role: Role.SUPER_ADMIN,
    });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });

    await waitFor(() => {
      const emailInput = screen.getByDisplayValue("sa@credchain.demo");
      expect(emailInput).toBeDisabled();
    });
  });

  it("shows email locked message for super admin users", async () => {
    const user = makeUser({
      id: "usr_sa",
      name: "Super Admin",
      email: "sa@credchain.demo",
      role: Role.SUPER_ADMIN,
    });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });

    await waitFor(() => {
      expect(screen.getByText(/super admin email cannot be changed here/i)).toBeInTheDocument();
      expect(screen.getByText(/update email instead/i)).toBeInTheDocument();
    });
  });

  it("shows role locked message for super admin users", async () => {
    const user = makeUser({
      id: "usr_sa",
      name: "Super Admin",
      email: "sa@credchain.demo",
      role: Role.SUPER_ADMIN,
    });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });

    await waitFor(() => {
      expect(screen.getByText(/super admin role is locked/i)).toBeInTheDocument();
      expect(screen.getByText(/target becomes super admin/i)).toBeInTheDocument();
    });
  });

  it("enables Admin option in role dropdown when auth is super admin", async () => {
    const user = makeUser({ id: "usr_holder", role: Role.HOLDER });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Note should NOT be visible for SA auth
    expect(
      screen.queryByText(/only super admin can assign the admin role/i),
    ).not.toBeInTheDocument();
  });
});

describe("UserEditDrawer with Admin auth", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    void i18n.changeLanguage("en");
    useStore.setState({
      user: makeUser({ id: "usr_admin", role: Role.ADMIN }),
      isAuthenticated: true,
    });
  });

  it("disables Admin option in role dropdown when auth is admin", async () => {
    const user = makeUser({ id: "usr_holder", role: Role.HOLDER });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    // Admin-disabled note should be visible for Admin auth
    expect(screen.getByText(/only super admin can assign the admin role/i)).toBeInTheDocument();
  });

  it("shows admin role disabled note when auth is admin", async () => {
    const user = makeUser({ id: "usr_holder", role: Role.HOLDER });
    render(<UserEditDrawer user={user} onClose={() => {}} />, { wrapper: TestProviders });

    await waitFor(() => {
      expect(screen.getByText(/only super admin can assign the admin role/i)).toBeInTheDocument();
    });
  });
});
