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
