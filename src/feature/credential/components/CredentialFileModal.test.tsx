import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { i18n } from "@shared/i18n/config";
import { CredentialFileModal } from "./CredentialFileModal";

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

function makeImageFile(name = "diploma.jpg"): File {
  return new File(["fake-image-data"], name, { type: "image/jpeg" });
}

function makePdfFile(name = "transcript.pdf"): File {
  return new File(["%PDF-fake-content"], name, { type: "application/pdf" });
}

describe("CredentialFileModal", () => {
  it("renders nothing when closed", () => {
    const file = makeImageFile();
    render(
      <CredentialFileModal file={file} open={false} onClose={() => {}} />,
      { wrapper: TestProviders },
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders image in dialog when open", () => {
    const file = makeImageFile("diploma.jpg");
    render(
      <CredentialFileModal file={file} open={true} onClose={() => {}} />,
      { wrapper: TestProviders },
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("diploma.jpg")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const file = makeImageFile();
    render(
      <CredentialFileModal file={file} open={true} onClose={onClose} />,
      { wrapper: TestProviders },
    );
    const closeButton = screen.getByRole("button", { name: "Close" });
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows zoom controls for images", () => {
    const file = makeImageFile();
    render(
      <CredentialFileModal file={file} open={true} onClose={() => {}} />,
      { wrapper: TestProviders },
    );
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
  });

  it("shows file metadata in footer", () => {
    const file = makeImageFile("photo.png");
    render(
      <CredentialFileModal file={file} open={true} onClose={() => {}} />,
      { wrapper: TestProviders },
    );
    expect(screen.getAllByText(/image\/jpeg/).length).toBeGreaterThan(0);
  });

  it("renders PDF filename in dialog when open", () => {
    const file = makePdfFile();
    render(
      <CredentialFileModal file={file} open={true} onClose={() => {}} />,
      { wrapper: TestProviders },
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("transcript.pdf")).toBeInTheDocument();
  });

  it("does not show zoom controls for PDF files", () => {
    const file = makePdfFile();
    render(
      <CredentialFileModal file={file} open={true} onClose={() => {}} />,
      { wrapper: TestProviders },
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /zoom/i })).not.toBeInTheDocument();
  });
});
