import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Mail } from "lucide-react";
import { DetailRow } from "./DetailRow";

describe("DetailRow", () => {
  it("renders label and value", () => {
    render(<DetailRow label="Email" value="test@example.com" />);
    expect(screen.getByText("Email")).toBeDefined();
    expect(screen.getByText("test@example.com")).toBeDefined();
  });

  it("renders optional icon", () => {
    const { container } = render(<DetailRow label="Email" value="test@example.com" icon={Mail} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeDefined();
  });

  it("renders default tone with navy text", () => {
    render(<DetailRow label="Email" value="test@example.com" />);
    const value = screen.getByText("test@example.com");
    expect(value.className).toContain("text-navy");
  });

  it("renders error tone with error text", () => {
    render(<DetailRow label="Status" value="Deleted" tone="error" />);
    const value = screen.getByText("Deleted");
    expect(value.className).toContain("text-error");
    const label = screen.getByText("Status");
    expect(label.className).toContain("text-error");
  });

  it("applies correct dt styling", () => {
    render(<DetailRow label="Email" value="test@example.com" />);
    const label = screen.getByText("Email");
    expect(label.className).toContain("text-xs");
    expect(label.className).toContain("font-bold");
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("tracking-wider");
  });
});
