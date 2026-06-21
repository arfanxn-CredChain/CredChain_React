import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CredentialFileInput } from "./CredentialFileInput";

function makeFile(name = "test.pdf"): File {
  return new File(["content"], name, { type: "application/pdf" });
}

describe("CredentialFileInput", () => {
  it("renders placeholder when no file selected", () => {
    render(
      <CredentialFileInput file={null} onChange={() => {}} placeholder="Select a file..." />
    );
    expect(screen.getByText("Select a file...")).toBeInTheDocument();
  });

  it("shows filename when file is selected", () => {
    const file = makeFile("transcript.pdf");
    render(
      <CredentialFileInput file={file} onChange={() => {}} placeholder="Select..." />
    );
    expect(screen.getByText("transcript.pdf")).toBeInTheDocument();
  });

  it("shows clear button when file is selected", () => {
    const file = makeFile();
    render(
      <CredentialFileInput file={file} onChange={() => {}} placeholder="Select..." removeLabel="Remove file" />
    );
    expect(screen.getByRole("button", { name: "Remove file" })).toBeInTheDocument();
  });

  it("calls onChange with null when clear button clicked", async () => {
    const onChange = vi.fn();
    const file = makeFile();
    render(
      <CredentialFileInput file={file} onChange={onChange} placeholder="Select..." removeLabel="Remove file" />
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove file" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("calls onChange with file when file selected", () => {
    const onChange = vi.fn();
    render(
      <CredentialFileInput file={null} onChange={onChange} placeholder="Select..." />
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile();
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("shows error border when error prop is set", () => {
    render(
      <CredentialFileInput file={null} onChange={() => {}} error="File too large" placeholder="Select..." />
    );
    const button = screen.getByText("Select...").closest("button");
    expect(button?.className).toContain("border-error");
  });
});
