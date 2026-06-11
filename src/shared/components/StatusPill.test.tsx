import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Activity } from "lucide-react";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("renders navy tone with correct classes", () => {
    render(<StatusPill tone="navy">Active</StatusPill>);
    const pill = screen.getByText("Active");
    expect(pill.className).toContain("bg-navy/10");
    expect(pill.className).toContain("text-navy");
  });

  it("renders gold tone with correct classes", () => {
    render(<StatusPill tone="gold">Premium</StatusPill>);
    const pill = screen.getByText("Premium");
    expect(pill.className).toContain("bg-gold/20");
    expect(pill.className).toContain("text-navy");
  });

  it("renders error tone with correct classes", () => {
    render(<StatusPill tone="error">Failed</StatusPill>);
    const pill = screen.getByText("Failed");
    expect(pill.className).toContain("bg-error/10");
    expect(pill.className).toContain("text-error");
  });

  it("renders green tone with correct classes", () => {
    render(<StatusPill tone="green">Success</StatusPill>);
    const pill = screen.getByText("Success");
    expect(pill.className).toContain("bg-green-100");
    expect(pill.className).toContain("text-green-700");
  });

  it("renders gray tone with correct classes", () => {
    render(<StatusPill tone="gray">Inactive</StatusPill>);
    const pill = screen.getByText("Inactive");
    expect(pill.className).toContain("bg-gray-100");
    expect(pill.className).toContain("text-gray-600");
  });

  it("renders optional icon", () => {
    render(
      <StatusPill tone="navy" icon={Activity}>
        With Icon
      </StatusPill>,
    );
    const pill = screen.getByText("With Icon");
    const icon = pill.parentElement?.querySelector("svg");
    expect(icon).toBeDefined();
  });

  it("has rounded-md styling", () => {
    render(<StatusPill tone="navy">Test</StatusPill>);
    const pill = screen.getByText("Test");
    expect(pill.className).toContain("rounded-md");
  });

  it("applies uppercase and tracking-wider font styling", () => {
    render(<StatusPill tone="navy">Test</StatusPill>);
    const pill = screen.getByText("Test");
    expect(pill.className).toContain("uppercase");
    expect(pill.className).toContain("tracking-wider");
  });
});
