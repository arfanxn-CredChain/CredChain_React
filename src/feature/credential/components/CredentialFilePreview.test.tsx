import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { i18n } from "@shared/i18n/config";
import { CredentialFilePreview } from "./CredentialFilePreview";

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

function makeImageFile(name = "photo.jpg"): File {
  return new File(["fake-image-data"], name, { type: "image/jpeg" });
}

describe("CredentialFilePreview", () => {
  it("renders drop zone when no file selected", () => {
    const onExpand = vi.fn();
    const onRemove = vi.fn();
    render(
      <CredentialFilePreview
        file={null}
        onExpand={onExpand}
        onRemove={onRemove}
      />,
      { wrapper: TestProviders },
    );
    expect(screen.getByText(/drag/i)).toBeInTheDocument();
  });

  it("renders filename when file selected", () => {
    const file = makeImageFile("transcript.pdf");
    render(
      <CredentialFilePreview
        file={file}
        onExpand={() => {}}
        onRemove={() => {}}
      />,
      { wrapper: TestProviders },
    );
    expect(screen.getByText("transcript.pdf")).toBeInTheDocument();
  });

  it("calls onRemove when remove button clicked", async () => {
    const onRemove = vi.fn();
    const file = makeImageFile();
    render(
      <CredentialFilePreview
        file={file}
        onExpand={() => {}}
        onRemove={onRemove}
      />,
      { wrapper: TestProviders },
    );
    const removeButton = screen.getByRole("button", { name: /remove file/i });
    await userEvent.click(removeButton);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("calls onExpand when expand button clicked", async () => {
    const onExpand = vi.fn();
    const file = makeImageFile();
    render(
      <CredentialFilePreview
        file={file}
        onExpand={onExpand}
        onRemove={() => {}}
      />,
      { wrapper: TestProviders },
    );
    const expandButton = screen.getByRole("button", { name: /view file/i });
    await userEvent.click(expandButton);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("shows file size in human-readable format", () => {
    const file = makeImageFile("big.pdf");
    Object.defineProperty(file, "size", { value: 2.4 * 1024 * 1024 });
    render(
      <CredentialFilePreview
        file={file}
        onExpand={() => {}}
        onRemove={() => {}}
      />,
      { wrapper: TestProviders },
    );
    expect(screen.getByText(/2\.4 MB/)).toBeInTheDocument();
  });
});
