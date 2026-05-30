import { test, expect } from "@playwright/test";

test.describe("auth & route guards", () => {
  test("redirects unauthenticated user from /dashboard to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("redirects unauthenticated user from /users to /login", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("redirects unauthenticated user from /credentials to /login", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("login page renders Google sign-in button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign in")).toBeVisible();
    await expect(page.getByText(/access the platform dashboard/i)).toBeVisible();
  });

  test("login page renders CredChain branding on desktop", async ({ page, viewport }) => {
    await page.goto("/login");
    if (viewport && viewport.width >= 1024) {
      await expect(page.getByRole("heading", { name: /welcome to credchain/i })).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: /^credchain$/i })).toBeVisible();
    }
  });
});

test.describe("Root path redirect", () => {
  test("unauthenticated user redirected to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });
});
