import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { UserSelfProfile } from "./UserSelfProfile";
import { useStore } from "@app/store";
import { mockUserWithMeta } from "@/test/fixtures";

describe("UserSelfProfile birth_date handling", () => {
  beforeEach(() => {
    useStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it("slices full ISO datetime to YYYY-MM-DD", async () => {
    useStore.setState({
      user: mockUserWithMeta({ birth_date: "2003-07-21T00:00:00Z" }),
      isAuthenticated: true,
    });
    render(<UserSelfProfile />, { wrapper: TestProviders });

    await waitFor(() => {
      const input = screen.getByLabelText(/birth date/i) as HTMLInputElement;
      expect(input.value).toBe("2003-07-21");
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows no error when birth_date is null", async () => {
    useStore.setState({
      user: mockUserWithMeta({ birth_date: null }),
      isAuthenticated: true,
    });
    render(<UserSelfProfile />, { wrapper: TestProviders });

    await waitFor(() => {
      const input = screen.getByLabelText(/birth date/i) as HTMLInputElement;
      expect(input.value).toBe("");
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("passes through partial ISO date unchanged", async () => {
    useStore.setState({
      user: mockUserWithMeta({ birth_date: "1990-01-15" }),
      isAuthenticated: true,
    });
    render(<UserSelfProfile />, { wrapper: TestProviders });

    await waitFor(() => {
      const input = screen.getByLabelText(/birth date/i) as HTMLInputElement;
      expect(input.value).toBe("1990-01-15");
    });
  });
});
