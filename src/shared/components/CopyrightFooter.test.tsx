import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CopyrightFooter } from "./CopyrightFooter";

describe("CopyrightFooter", () => {
  it("renders with footer role", () => {
    render(<CopyrightFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders dynamic current year", () => {
    render(<CopyrightFooter />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(year)).toBeInTheDocument();
  });

  it("renders CredChain wordmark in the copyright line", () => {
    render(<CopyrightFooter />);
    expect(screen.getByText(/CredChain/)).toBeInTheDocument();
  });

  it("renders the 'All rights reserved' phrase", () => {
    render(<CopyrightFooter />);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it("includes safe-area-bottom class for iOS safe area", () => {
    render(<CopyrightFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toContain("safe-area-bottom");
  });

  it("includes no-print class to hide from print", () => {
    render(<CopyrightFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toContain("no-print");
  });

  it("uses font-sans (DM Sans) for the copyright text", () => {
    render(<CopyrightFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.className).not.toContain("font-mono");
    expect(footer.className).not.toContain("font-display");
  });

  it("renders with a transparent background so the page background shows through", () => {
    render(<CopyrightFooter />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toContain("bg-transparent");
  });

  it("applies custom className when provided", () => {
    render(<CopyrightFooter className="custom-class" />);
    const footer = screen.getByRole("contentinfo");
    expect(footer.className).toContain("custom-class");
  });
});
