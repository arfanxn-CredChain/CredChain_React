import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileBadge } from "lucide-react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title with font-sans (not font-display)", () => {
    render(<EmptyState icon={FileBadge} title="No items found" />);
    const title = screen.getByText("No items found");
    expect(title.className).toContain("font-sans");
    expect(title.className).not.toContain("font-display");
  });

  it("renders optional description", () => {
    render(
      <EmptyState icon={FileBadge} title="No items" description="Try adjusting your search." />,
    );
    expect(screen.getByText("Try adjusting your search.")).toBeDefined();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState icon={FileBadge} title="No items" />);
    const pTags = container.querySelectorAll("p");
    expect(pTags.length).toBe(0);
  });

  it("renders optional action slot", () => {
    render(<EmptyState icon={FileBadge} title="No items" action={<button>Create first</button>} />);
    expect(screen.getByRole("button", { name: "Create first" })).toBeDefined();
  });

  it("has card styling classes", () => {
    const { container } = render(<EmptyState icon={FileBadge} title="No items" />);
    const root = container.firstElementChild;
    expect(root?.className).toContain("bg-surface");
    expect(root?.className).toContain("rounded-2xl");
    expect(root?.className).toContain("shadow-sm");
    expect(root?.className).toContain("border");
    expect(root?.className).toContain("border-gray-100");
  });

  it("renders icon", () => {
    const { container } = render(<EmptyState icon={FileBadge} title="No items" />);
    const icon = container.querySelector("svg");
    expect(icon).toBeDefined();
  });
});
