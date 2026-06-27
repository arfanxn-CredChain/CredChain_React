import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { i18n } from "@shared/i18n/config";
import { useStore } from "@app/store";
import { VerifyCredential } from "./VerifyCredential";

vi.mock("./api/useVerifyCredential", () => ({
  useVerifyCredential: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

function renderVerify(initialEntries?: string[]) {
  return render(<VerifyCredential />, {
    wrapper: ({ children }) => (
      <TestProviders initialEntries={initialEntries ?? ["/credentials/verify"]}>
        {children}
      </TestProviders>
    ),
  });
}

describe("VerifyCredential", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await i18n.changeLanguage("en");
    useStore.setState({ user: null, isAuthenticated: false });
  });

  it("renders upload form initially", () => {
    renderVerify();
    expect(screen.getByText("Credential Verification")).toBeInTheDocument();
    expect(screen.getByText("Verify Source Document")).toBeInTheDocument();
  });

  it("renders file upload input with correct accept attributes", () => {
    renderVerify();
    const input = screen.getByLabelText("Upload file for verification");
    expect(input).toHaveAttribute("accept", ".pdf,.jpg,.jpeg,.png,.webp,.tiff");
  });

  it("renders the page heading and description", () => {
    renderVerify();
    expect(screen.getByText("Credential Verification")).toBeInTheDocument();
    expect(
      screen.getByText(/Cryptographically verify the authenticity/),
    ).toBeInTheDocument();
  });
});
