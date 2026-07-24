import { test, expect } from "@playwright/test";
import { registerFailureScreenshot } from "./helpers/screenshots";

const SCREENSHOT_DIR = "e2e/screenshots/guest-flow";
registerFailureScreenshot(test, SCREENSHOT_DIR);

test.describe("guest flow — public pages", () => {
  test("landing page renders without auth", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/landing/landing-page.png`, fullPage: true });
  });

  test("not-found page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page.getByRole("heading", { name: /tidak ditemukan|page not found/i })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/not-found/not-found-page.png`, fullPage: true });
  });

  test("verify credential page renders without auth", async ({ page }) => {
    await page.goto("/credentials/verify");
    await expect(page.getByRole("heading", { name: /verifikasi kredensial|verify credential/i })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/verify-credential/verify-credential-page.png`, fullPage: true });
  });

  test("verify credential form renders with input and submit button", async ({ page }) => {
    await page.goto("/credentials/verify");
    await expect(page.locator("main")).toBeVisible();
    const fileButton = page.getByRole("button", { name: /seret|drag|drop|unggah|upload/i });
    await expect(fileButton).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/verify-credential/verify-credential-form-input.png`, fullPage: true });
  });

  test("verify credential form shows verify button", async ({ page }) => {
    await page.goto("/credentials/verify");
    const verifyButton = page.getByRole("button", { name: /verifikasi|verify/i });
    await expect(verifyButton).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/verify-credential/verify-credential-form-verify-btn.png`, fullPage: true });
  });

  test("help page renders without auth", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/help/help-page.png`, fullPage: true });
  });

  test("about page renders without auth and shows version", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(page.getByText(/version|versi/i)).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/about/about-page.png`, fullPage: true });
  });
});

test.describe("guest flow — language switcher", () => {
  test("language switcher changes page language", async ({ page }) => {
    await page.goto("/help");
    await page.waitForLoadState("networkidle");

    const langButton = page.getByRole("button", { name: /change language|ganti bahasa/i });
    await expect(langButton).toBeVisible();
    await langButton.click();
    await page.waitForTimeout(300);

    const englishOption = page.getByText(/english|inggris/i);
    if (await englishOption.isVisible()) {
      await englishOption.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/lang-switcher/language-switched-to-english.png`, fullPage: true });
    }
  });
});

test.describe("guest flow — route guards", () => {
  test("unauthenticated user redirected from /overview to /login", async ({ page }) => {
    await page.goto("/overview");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /masuk|sign in/i })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/route-guards/overview-redirect-to-login.png`, fullPage: true });
  });
});

test.describe("guest flow — role escalation", () => {
  test("holder cannot access issuer-only /users route", async ({ page }) => {
    await test.step("load holder auth state", async () => {
      await page.context().addCookies(
        (await import("./.auth/holder.json", { assert: { type: "json" } })).cookies,
      );
    });
    await page.goto("/users");
    await page.waitForURL("**/overview");
    await expect(page).not.toHaveURL(/\/users/);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/role-escalation/holder-blocked-from-users.png`, fullPage: true });
  });

  test("issuer cannot access admin-only /users/create route", async ({ page }) => {
    await test.step("load issuer auth state", async () => {
      await page.context().addCookies(
        (await import("./.auth/issuer.json", { assert: { type: "json" } })).cookies,
      );
    });
    await page.goto("/users/create");
    await page.waitForURL("**/overview");
    await expect(page).not.toHaveURL(/\/users\/create/);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/role-escalation/issuer-blocked-from-create-user.png`, fullPage: true });
  });

  test("admin cannot see transfer-super-admin option on user list", async ({ page }) => {
    await test.step("load admin auth state", async () => {
      await page.context().addCookies(
        (await import("./.auth/admin.json", { assert: { type: "json" } })).cookies,
      );
    });
    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/role-escalation/admin-no-transfer-option.png`, fullPage: true });
  });
});
