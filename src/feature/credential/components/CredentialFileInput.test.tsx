import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CredentialFileInput } from "./CredentialFileInput";

function makeFile(name = "test.pdf"): File {
  return new File(["content"], name, { type: "application/pdf" });
}

describe("CredentialFileInput", () => {
  it("renders drop zone hint when no file selected", () => {
    render(<CredentialFileInput file={null} onChange={() => {}} />);
    expect(screen.getByText("credential.issue.preview.dragDrop")).toBeInTheDocument();
  });

  it("shows filename when file is selected", () => {
    const file = makeFile("transcript.pdf");
    render(<CredentialFileInput file={file} onChange={() => {}} />);
    expect(screen.getByText("transcript.pdf")).toBeInTheDocument();
  });

  it("calls onChange with null when remove button clicked", async () => {
    const onChange = vi.fn();
    const file = makeFile();
    render(<CredentialFileInput file={file} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "credential.issue.preview.remove" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("calls onChange with file when file selected via hidden input", () => {
    const onChange = vi.fn();
    render(<CredentialFileInput file={null} onChange={onChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile();
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("calls onExpand when expand button clicked", async () => {
    const onExpand = vi.fn();
    const file = makeFile("doc.pdf");
    render(<CredentialFileInput file={file} onChange={() => {}} onExpand={onExpand} />);
    await userEvent.click(screen.getByRole("button", { name: "credential.issue.preview.expand" }));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("shows error message below when error prop is set", () => {
    render(<CredentialFileInput file={null} onChange={() => {}} error="File required" />);
    const errorEl = screen.getByRole("alert");
    expect(errorEl).toBeInTheDocument();
  });
});
