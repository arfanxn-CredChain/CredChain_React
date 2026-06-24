import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { CredentialDetail } from "./CredentialDetail";

describe("CredentialDetail", () => {
  const renderPage = () =>
    render(
      <TestProviders initialEntries={["/credentials/cred_01HX"]}>
        <CredentialDetail />
      </TestProviders>,
    );

  it("renders the back link", async () => {
    renderPage();
    expect(await screen.findByText("Back")).toBeDefined();
  });

  it("renders the credential name as page title", async () => {
    renderPage();
    expect(await screen.findByText("Bachelor's Degree")).toBeDefined();
  });

  it("renders the credential ID", async () => {
    renderPage();
    expect(await screen.findByText(/cred_01HX/)).toBeDefined();
  });

  it("renders the active status badge", async () => {
    renderPage();
    expect(await screen.findByText("Active")).toBeDefined();
  });

  it("renders the file hash", async () => {
    renderPage();
    expect(await screen.findByText(/0xabcd1234/)).toBeDefined();
  });

  it("renders the holder with full display", async () => {
    renderPage();
    expect(await screen.findByText("John Doe")).toBeDefined();
  });

  it("renders the issuer with full display", async () => {
    renderPage();
    expect(await screen.findByText("University Admin")).toBeDefined();
  });

  it("renders the token ID", async () => {
    renderPage();
    expect(await screen.findByText("123456")).toBeDefined();
  });
});
