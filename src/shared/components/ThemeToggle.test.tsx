import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { ThemeToggle } from "./ThemeToggle";
import { useStore } from "@app/store";

describe("ThemeToggle", () => {
  beforeEach(() => {
    useStore.setState({ theme: "system" });
  });

  it("renders trigger button", () => {
    render(<ThemeToggle />, { wrapper: TestProviders });
    expect(screen.getByRole("button", { name: /change theme/i })).toBeInTheDocument();
  });

  it("clicking light option sets theme to light", async () => {
    render(<ThemeToggle />, { wrapper: TestProviders });
    await userEvent.click(screen.getByRole("button", { name: /change theme/i }));
    await userEvent.click(await screen.findByText("Light"));
    expect(useStore.getState().theme).toBe("light");
  });

  it("clicking dark option sets theme to dark", async () => {
    render(<ThemeToggle />, { wrapper: TestProviders });
    await userEvent.click(screen.getByRole("button", { name: /change theme/i }));
    await userEvent.click(await screen.findByText("Dark"));
    expect(useStore.getState().theme).toBe("dark");
  });

  it("shows checkmark on active option", async () => {
    useStore.setState({ theme: "dark" });
    render(<ThemeToggle />, { wrapper: TestProviders });
    await userEvent.click(screen.getByRole("button", { name: /change theme/i }));
    const item = (await screen.findByText("Dark")).closest("[role='menuitem']");
    expect(item?.textContent).toContain("✓");
  });
});
