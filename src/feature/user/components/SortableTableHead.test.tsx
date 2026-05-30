import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SortableTableHead } from "./SortableTableHead";

function wrap(ui: React.ReactElement) {
  return render(
    <table><thead><tr>{ui}</tr></thead></table>
  );
}

describe("SortableTableHead", () => {
  it("renders label and calls onSort on click", async () => {
    const onSort = vi.fn();
    wrap(<SortableTableHead label="Name" sortKey="name" currentSort="other" currentOrder="asc" onSort={onSort} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Name"));
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("shows ChevronUp when active asc", () => {
    const { container } = wrap(
      <SortableTableHead label="Name" sortKey="name" currentSort="name" currentOrder="asc" onSort={() => {}} />
    );
    expect(container.querySelector(".lucide-chevron-up")).toBeInTheDocument();
  });

  it("shows ChevronDown when active desc", () => {
    const { container } = wrap(
      <SortableTableHead label="Name" sortKey="name" currentSort="name" currentOrder="desc" onSort={() => {}} />
    );
    expect(container.querySelector(".lucide-chevron-down")).toBeInTheDocument();
  });

  it("shows ChevronsUpDown when inactive", () => {
    const { container } = wrap(
      <SortableTableHead label="Name" sortKey="name" currentSort="other" currentOrder="asc" onSort={() => {}} />
    );
    expect(container.querySelector(".lucide-chevrons-up-down")).toBeInTheDocument();
  });
});
