import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { i18n } from "@shared/i18n/config";
import { RouteErrorBoundary } from "./RouteErrorBoundary";

function renderWithErrorRoute(
  element: React.ReactElement,
  error: unknown,
  initialEntries: string[] = ["/"],
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      {
        path: "/",
        element,
        errorElement: <RouteErrorBoundary />,
        loader: () => {
          throw error;
        },
      },
    ],
    { initialEntries },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

describe("RouteErrorBoundary", () => {
  it("renders 404 message when route error is 404 response", async () => {
    void i18n.changeLanguage("en");
    renderWithErrorRoute(
      <div>Page</div>,
      new Response(null, { status: 404, statusText: "Not Found" }),
    );
    expect(await screen.findByText("Page not found")).toBeDefined();
  });

  it("renders generic error for non-404 errors", async () => {
    void i18n.changeLanguage("en");
    renderWithErrorRoute(<div>Page</div>, new Error("Boom"));
    expect(await screen.findByText("Something went wrong")).toBeDefined();
  });

  it("uses min-h-dvh not min-h-screen", async () => {
    void i18n.changeLanguage("en");
    const { container } = renderWithErrorRoute(<div>Page</div>, new Error("Boom"));
    await screen.findByText("Something went wrong");
    const wrapper = container.querySelector(".min-h-dvh");
    expect(wrapper).toBeDefined();
  });

  it("renders Reload button", async () => {
    void i18n.changeLanguage("en");
    renderWithErrorRoute(<div>Page</div>, new Error("Boom"));
    expect(await screen.findByRole("button", { name: "Reload" })).toBeDefined();
  });

  it("renders Dashboard link", async () => {
    void i18n.changeLanguage("en");
    renderWithErrorRoute(<div>Page</div>, new Error("Boom"));
    expect(await screen.findByRole("link", { name: "Dashboard" })).toBeDefined();
  });
});
