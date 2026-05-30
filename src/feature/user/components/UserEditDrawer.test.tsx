import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { UserEditDrawer } from "./UserEditDrawer";
import { mockUserWithMeta } from "@/test/fixtures";
import { i18n } from "@shared/i18n/config";

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
    await waitFor(() =>
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
