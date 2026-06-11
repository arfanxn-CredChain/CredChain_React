import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { SplitLayout } from "./SplitLayout";

function renderSplitLayout() {
  return render(
    <SplitLayout
      brandSlot={<div data-testid="brand-slot">Brand</div>}
      mobileBrandSlot={<div data-testid="mobile-brand-slot">Mobile Brand</div>}
    >
      <div data-testid="content">Content</div>
    </SplitLayout>,
    { wrapper: TestProviders },
  );
}

describe("SplitLayout", () => {
  it("renders with h-dvh and overflow-hidden on outer container", () => {
    renderSplitLayout();
    const outerContainer = screen.getByTestId("content").closest(".relative.flex");
    expect(outerContainer).toHaveClass("h-dvh");
    expect(outerContainer).toHaveClass("overflow-hidden");
  });

  it("renders right panel with overflow-hidden", () => {
    renderSplitLayout();
    const rightPanel = screen.getByTestId("content").closest(".h-dvh.w-full");
    expect(rightPanel).toHaveClass("overflow-hidden");
  });

  it("renders content area with min-h-0 and overflow-hidden", () => {
    renderSplitLayout();
    const contentArea = screen.getByTestId("content").parentElement?.parentElement;
    expect(contentArea).toHaveClass("min-h-0");
    expect(contentArea).toHaveClass("overflow-hidden");
  });

  it("renders mobile brand band with h-[33dvh] and shrink-0", () => {
    renderSplitLayout();
    const mobileBand = screen.getByTestId("mobile-brand-slot").closest(".safe-area-top");
    expect(mobileBand).toHaveClass("h-[33dvh]");
    expect(mobileBand).toHaveClass("shrink-0");
  });

  it("renders all slots", () => {
    renderSplitLayout();
    expect(screen.getByTestId("brand-slot")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-brand-slot")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});
