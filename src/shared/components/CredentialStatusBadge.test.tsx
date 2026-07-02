import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { i18n } from "@shared/i18n/config";
import { TestProviders } from "@/test/TestProviders";
import { CredentialStatusBadge } from "./CredentialStatusBadge";

beforeEach(() => {
  void i18n.changeLanguage("en");
});

function renderBadge(props: React.ComponentProps<typeof CredentialStatusBadge>) {
  return render(<CredentialStatusBadge {...props} />, { wrapper: TestProviders });
}

describe("CredentialStatusBadge", () => {
  it("shows revoked when revoked=true", () => {
    renderBadge({ revoked: true });
    expect(screen.getByText("Revoked")).toBeInTheDocument();
  });

  it("shows active when not revoked and no extract status", () => {
    renderBadge({ revoked: false });
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows pending extraction when extractStatus=pending and showExtractStatus=true", () => {
    renderBadge({ revoked: false, extractStatus: "pending", showExtractStatus: true });
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows extraction failed when extractStatus=failed and showExtractStatus=true", () => {
    renderBadge({ revoked: false, extractStatus: "failed", showExtractStatus: true });
    expect(screen.getByText("Extraction Failed")).toBeInTheDocument();
  });

  it("shows active when extractStatus=succeeded and showExtractStatus=true", () => {
    renderBadge({ revoked: false, extractStatus: "succeeded", showExtractStatus: true });
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("revoked takes priority over extract status", () => {
    renderBadge({ revoked: true, extractStatus: "pending", showExtractStatus: true });
    expect(screen.getByText("Revoked")).toBeInTheDocument();
  });
});
