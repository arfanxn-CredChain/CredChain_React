import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { useStore } from "./store";

function ThemeConsumer() {
  const { theme, resolvedTheme } = useTheme();
  return <div data-theme={theme} data-resolved={resolvedTheme} />;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    useStore.setState({ theme: "system" });
  });

  it("applies dark class when theme is dark", () => {
    useStore.setState({ theme: "dark" });
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class when theme is light", () => {
    document.documentElement.classList.add("dark");
    useStore.setState({ theme: "light" });
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("resolves system theme from matchMedia", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (q: string) => ({
        matches: q.includes("dark"),
        media: q,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
    useStore.setState({ theme: "system" });
    const { container } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.dataset.resolved).toBe("dark");
  });

  it("throws when useTheme used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow();
    spy.mockRestore();
  });
});
