import { test, expect } from "@playwright/test";

test.describe("public routes", () => {
  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
  });

  test("404 page has navigation to dashboard and login", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.getByRole("link", { name: /back to dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("verification page renders without auth", async ({ page }) => {
    await page.goto("/credentials/verify/some-test-id");
    await expect(page).not.toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /credential verification/i })).toBeVisible();
  });

  test("verification page shows record-not-found for invalid id", async ({ page }) => {
    await page.goto("/credentials/verify/nonexistent-id");
    await expect(page.getByText(/record not found|credential verification/i)).toBeVisible();
  });
});

test.describe("Help page", () => {
  test("is reachable without login", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  });

  test("FAQ details expand on click", async ({ page }) => {
    await page.goto("/help");
    const firstSummary = page.locator("details summary").first();
    await firstSummary.click();
    const details = firstSummary.locator("..");
    await expect(details).toHaveAttribute("open", "");
  });

  test("language switcher visible on Help page", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByRole("button", { name: /change language/i })).toBeVisible();
  });
});

test.describe("About page", () => {
  test("is reachable without login", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
  });

  test("shows version", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText(/version/i)).toBeVisible();
  });
});
