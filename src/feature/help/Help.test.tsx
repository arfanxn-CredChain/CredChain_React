import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { Help } from "./Help";

describe("Help", () => {
  it("renders page title", () => {
    render(<Help />, { wrapper: TestProviders });
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders all four FAQ group headings", () => {
    render(<Help />, { wrapper: TestProviders });
    expect(screen.getByText(/getting started/i)).toBeInTheDocument();
    expect(screen.getByText(/credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/account/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy/i)).toBeInTheDocument();
  });

  it("FAQ items are collapsed by default", () => {
    render(<Help />, { wrapper: TestProviders });
    const details = document.querySelectorAll("details");
    details.forEach((d) => expect(d.open).toBe(false));
  });

  it("FAQ item expands on click", async () => {
    render(<Help />, { wrapper: TestProviders });
    const firstSummary = document.querySelector("details summary") as HTMLElement;
    await userEvent.click(firstSummary);
    expect((firstSummary.closest("details") as HTMLDetailsElement).open).toBe(true);
  });

  it("renders contact card", () => {
    render(<Help />, { wrapper: TestProviders });
    expect(screen.getByText(/need more help/i)).toBeInTheDocument();
  });
});
