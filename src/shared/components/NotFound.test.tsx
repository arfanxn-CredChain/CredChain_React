import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { i18n } from "@shared/i18n/config";
import { NotFound } from "./NotFound";

describe("NotFound", () => {
  beforeEach(() => {
    void i18n.changeLanguage("en");
  });

  it("renders 404 code", () => {
    render(<NotFound />, { wrapper: TestProviders });
    expect(screen.getByText("404")).toBeDefined();
  });

  it("renders Page not found heading", () => {
    render(<NotFound />, { wrapper: TestProviders });
    expect(screen.getByText("Page not found")).toBeDefined();
  });

  it("uses min-h-dvh not min-h-screen", () => {
    const { container } = render(<NotFound />, { wrapper: TestProviders });
    const root = container.firstElementChild;
    expect(root?.className).toContain("min-h-dvh");
    expect(root?.className).not.toContain("min-h-screen");
  });

  it("renders Dashboard CTA button", () => {
    render(<NotFound />, { wrapper: TestProviders });
    expect(screen.getByRole("link", { name: /Back to Dashboard/ })).toBeDefined();
  });

  it("renders Sign in CTA button", () => {
    render(<NotFound />, { wrapper: TestProviders });
    expect(screen.getByRole("link", { name: "Sign in" })).toBeDefined();
  });

  it("has exactly one DecorBlob (not two)", () => {
    const { container } = render(<NotFound />, { wrapper: TestProviders });
    const blobs = [...container.querySelectorAll(".absolute.pointer-events-none.rounded-full")];
    expect(blobs.length).toBe(1);
  });
});
