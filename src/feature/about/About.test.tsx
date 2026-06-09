import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { i18n } from "@shared/i18n/config";
import { About } from "./About";

describe("About", () => {
  beforeEach(() => {
    void i18n.changeLanguage("en");
  });
  it("renders page title", () => {
    render(<About />, { wrapper: TestProviders });
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders product description", () => {
    render(<About />, { wrapper: TestProviders });
    expect(screen.getByText(/decentralized credential/i)).toBeInTheDocument();
  });

  it("renders all four role descriptions", () => {
    render(<About />, { wrapper: TestProviders });
    expect(screen.getByText("Super Admin", { selector: "dt" })).toBeInTheDocument();
    expect(screen.getByText("Admin", { selector: "dt" })).toBeInTheDocument();
    expect(screen.getByText("Issuer", { selector: "dt" })).toBeInTheDocument();
    expect(screen.getByText("Holder", { selector: "dt" })).toBeInTheDocument();
  });

  it("renders version label", () => {
    render(<About />, { wrapper: TestProviders });
    expect(screen.getByText(/version/i)).toBeInTheDocument();
  });

  it("renders a link to the landing page", () => {
    render(<About />, { wrapper: TestProviders });
    const link = screen.getByRole("link", { name: /visit landing page/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
