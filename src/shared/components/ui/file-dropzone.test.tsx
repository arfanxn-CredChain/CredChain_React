import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileDropzone, formatFileSize } from "./file-dropzone";
import { TestProviders } from "@/test/TestProviders";

function renderDropzone(props: Partial<React.ComponentProps<typeof FileDropzone>> = {}) {
  const defaultProps = {
    file: null,
    onChange: vi.fn(),
    accept: ".csv,.xlsx",
    emptyLabel: "Drag & drop or click to browse",
    ...props,
  };
  return render(<FileDropzone {...defaultProps} />, { wrapper: TestProviders });
}

describe("formatFileSize", () => {
  it("formats bytes under 1024", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1024 * 1024 - 1)).toBe("1024.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});

describe("FileDropzone", () => {
  it("renders empty state with dropzone when no file", () => {
    renderDropzone();
    expect(screen.getByText("Drag & drop or click to browse")).toBeDefined();
  });

  it("renders file card when file is provided", () => {
    const file = new File(["test"], "report.csv", { type: "text/csv" });
    renderDropzone({ file });
    expect(screen.getByText("report.csv")).toBeDefined();
    expect(screen.getByText(/KB|B/)).toBeDefined();
  });

  it("calls onChange with null when remove button is clicked", () => {
    const onChange = vi.fn();
    const file = new File(["test"], "data.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    renderDropzone({ file, onChange });
    fireEvent.click(screen.getByRole("button", { name: "Remove file" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("calls onChange with file when a file is selected via input", () => {
    const onChange = vi.fn();
    renderDropzone({ onChange });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["a,b"], "test.csv", { type: "text/csv" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("renders hint text when no file and hint is provided", () => {
    renderDropzone({ hint: "CSV or XLSX only" });
    expect(screen.getByText("CSV or XLSX only")).toBeDefined();
  });

  it("does not render hint when file is present", () => {
    const file = new File(["x"], "f.csv", { type: "text/csv" });
    renderDropzone({ file, hint: "CSV or XLSX only" });
    expect(screen.queryByText("CSV or XLSX only")).toBeNull();
  });

  it("renders error text with alert role", () => {
    renderDropzone({ error: "File too large" });
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("File too large");
  });

  it("applies custom className", () => {
    const { container } = renderDropzone({ className: "my-custom" });
    expect((container.firstChild as HTMLElement).className).toContain("my-custom");
  });

  it("shows drag-over styling on dragenter", () => {
    renderDropzone();
    const dropzone = screen.getByText("Drag & drop or click to browse").parentElement!;
    fireEvent.dragEnter(dropzone);
    expect(dropzone.className).toContain("border-gold");
  });

  it("resets drag-over styling on dragleave", () => {
    renderDropzone();
    const dropzone = screen.getByText("Drag & drop or click to browse").parentElement!;
    fireEvent.dragEnter(dropzone);
    fireEvent.dragLeave(dropzone);
    expect(dropzone.className).toContain("border-gray-200");
  });

  it("handles file drop", () => {
    const onChange = vi.fn();
    renderDropzone({ onChange });
    const dropzone = screen.getByText("Drag & drop or click to browse").parentElement!;
    const file = new File(["data"], "dropped.csv", { type: "text/csv" });
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith(file);
  });
});
