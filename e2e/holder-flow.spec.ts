import { test, expect } from "@playwright/test";
import { registerFailureScreenshot } from "./helpers/screenshots";

const SCREENSHOT_DIR = "e2e/screenshots/holder-flow";
const AUTH_STATE = "./e2e/.auth/holder.json";

registerFailureScreenshot(test, SCREENSHOT_DIR);

test.describe("holder flow — overview", () => {
  test.use({ storageState: AUTH_STATE });

  test("overview page renders with welcome heading", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/overview/overview-page-with-welcome.png`,
      fullPage: true,
    });
  });

  test("overview page shows credential counts card", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByText(/kredensial|credential/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/overview/overview-credential-counts.png`,
      fullPage: true,
    });
  });
});

test.describe("holder flow — credential list", () => {
  test.use({ storageState: AUTH_STATE });

  test("credential list page renders", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/credential-list/credential-list-page.png`,
      fullPage: true,
    });
  });

  test("credential list shows search input", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page.getByPlaceholder(/cari|search/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/credential-list/credential-list-search.png`,
      fullPage: true,
    });
  });

  test("credential list shows verify button for holder", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page.getByRole("button", { name: /verifikasi|verify/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/credential-list/credential-list-verify-button.png`,
      fullPage: true,
    });
  });

  test("credential list shows filter menus", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page.getByRole("button", { name: /semua|all|aktif|active/i }).first()).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/credential-list/credential-list-filters.png`,
      fullPage: true,
    });
  });
});

test.describe("holder flow — profile", () => {
  test.use({ storageState: AUTH_STATE });

  test("profile page renders with page header", async ({ page }) => {
    await page.goto("/account/profile");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/profile/profile-page.png`,
      fullPage: true,
    });
  });

  test("profile page shows user avatar section", async ({ page }) => {
    await page.goto("/account/profile");
    // Avatar images use src="/logo-icon.svg" or dicebear data URIs
    await expect(page.getByRole("img", { name: "" }).first()).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/profile/profile-avatar-section.png`,
      fullPage: true,
    });
  });
});

test.describe("holder flow — email", () => {
  test.use({ storageState: AUTH_STATE });

  test("email page renders with page header", async ({ page }) => {
    await page.goto("/account/email");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/email/email-page.png`,
      fullPage: true,
    });
  });

  test("email page shows current email input", async ({ page }) => {
    await page.goto("/account/email");
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeDisabled();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/email/email-current-email-input.png`,
      fullPage: true,
    });
  });
});

test.describe("holder flow — sidebar", () => {
  test.use({ storageState: AUTH_STATE });

  test("sidebar renders with navigation items", async ({ page }) => {
    await page.goto("/overview");
    const sidebar = page.getByRole("navigation", { name: /Main navigation/i });
    await expect(sidebar).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/sidebar/sidebar-navigation.png`,
      fullPage: true,
    });
  });

  test("sidebar shows credentials link for holder", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("link", { name: /kredensial|credentials/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/sidebar/sidebar-credentials-link.png`,
      fullPage: true,
    });
  });

  test("sidebar hides users link from holder", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("link", { name: /pengguna|users/i })).toHaveCount(0);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/sidebar/sidebar-no-users-link.png`,
      fullPage: true,
    });
  });
});

test.describe("holder flow — logout", () => {
  test.use({ storageState: AUTH_STATE });

  test("logout button is visible in sidebar", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("button", { name: /keluar|log out|sign out/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/logout/logout-button-visible.png`,
      fullPage: true,
    });
  });

  test("logout redirects to landing page", async ({ page }) => {
    await page.goto("/overview");
    await page.getByRole("button", { name: /keluar|log out|sign out/i }).click();
    await expect(page.getByRole("button", { name: /batal|cancel/i })).toBeVisible();
    await page.getByRole("button", { name: /batal|cancel/i }).click();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/logout/logout-confirm-dialog.png`,
      fullPage: true,
    });
  });
});

test.describe("holder flow — role escalation", () => {
  test.use({ storageState: AUTH_STATE });

  test("holder cannot access /users route", async ({ page }) => {
    await page.goto("/users");
    await page.waitForURL("**/overview");
    await expect(page).toHaveURL(/\/overview/);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/logout/holder-blocked-from-users.png`,
      fullPage: true,
    });
  });

  test("holder cannot access /credentials/issue route", async ({ page }) => {
    await page.goto("/credentials/issue");
    await page.waitForURL("**/overview");
    await expect(page).toHaveURL(/\/overview/);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/logout/holder-blocked-from-issue.png`,
      fullPage: true,
    });
  });
});
