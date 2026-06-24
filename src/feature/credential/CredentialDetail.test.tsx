import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestProviders } from "@/test/TestProviders";
import { i18n } from "@shared/i18n/config";
import { CredentialDetail } from "./CredentialDetail";

describe("CredentialDetail", () => {
  beforeAll(() => i18n.changeLanguage("en"));
  afterAll(() => i18n.changeLanguage("id"));

  const renderPage = () =>
    render(
      <TestProviders initialEntries={["/credentials/cred_01HX"]} routePath="/credentials/:id">
        <CredentialDetail />
      </TestProviders>,
    );

  it("renders the back link", async () => {
    renderPage();
    expect(await screen.findByText("Back")).toBeDefined();
  });

  it("renders the credential name as page title", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { level: 2, name: "Bachelor's Degree" })).toBeDefined();
  });

  it("renders the credential ID", async () => {
    renderPage();
    expect((await screen.findAllByText(/cred_01HX/)).length).toBeGreaterThan(0);
  });

  it("renders the active status badge", async () => {
    renderPage();
    expect((await screen.findAllByText("Active")).length).toBeGreaterThan(0);
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
