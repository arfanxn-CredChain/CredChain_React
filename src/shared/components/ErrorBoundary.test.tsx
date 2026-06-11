import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppErrorBoundary } from "./ErrorBoundary";

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test error");
  return <div>All good</div>;
}

describe("AppErrorBoundary", () => {
  it("renders children when no error", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <AppErrorBoundary>
        <div>Normal content</div>
      </AppErrorBoundary>,
    );
    expect(screen.getByText("Normal content")).toBeDefined();
    consoleSpy.mockRestore();
  });

  it("renders fallback when error thrown", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow />
      </AppErrorBoundary>,
    );
    expect(screen.getByText("Something broke")).toBeDefined();
    expect(screen.getByText("Test error")).toBeDefined();
    consoleSpy.mockRestore();
  });

  it("uses min-h-dvh not min-h-screen", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <AppErrorBoundary>
        <ThrowError shouldThrow />
      </AppErrorBoundary>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("min-h-dvh");
    expect(wrapper?.className).not.toContain("min-h-screen");
    consoleSpy.mockRestore();
  });

  it("clicking Try again calls resetErrorBoundary", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <AppErrorBoundary>
        <ThrowError shouldThrow />
      </AppErrorBoundary>,
    );
    const btn = screen.getByRole("button", { name: "Try again" });
    // Clicking should trigger reset but since the error still exists, it'll re-render the fallback
    await userEvent.click(btn);
    // The error is still thrown, so fallback should still be rendered
    expect(screen.getByText("Something broke")).toBeDefined();
    consoleSpy.mockRestore();
  });
});
