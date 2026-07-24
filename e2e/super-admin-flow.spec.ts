import { test, expect } from "@playwright/test";
import { registerFailureScreenshot } from "./helpers/screenshots";

const SCREENSHOT_DIR = "e2e/screenshots/super-admin-flow";
const AUTH_STATE = "./e2e/.auth/super_admin.json";

registerFailureScreenshot(test, SCREENSHOT_DIR);

test.describe("super admin flow — overview", () => {
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

test.describe("super admin flow — transfer super admin", () => {
  test.use({ storageState: AUTH_STATE });

  test("transfer super admin option is visible in user list", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByRole("button", { name: /transfer|alihkan|super admin/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/transfer-super-admin/transfer-super-admin-option.png`,
      fullPage: true,
    });
  });
});

test.describe("super admin flow — create user", () => {
  test.use({ storageState: AUTH_STATE });

  test("create user page renders with heading", async ({ page }) => {
    await page.goto("/users/create");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/create-user/create-user-page.png`,
      fullPage: true,
    });
  });

  test("create user form shows input fields", async ({ page }) => {
    await page.goto("/users/create");
    await expect(page.getByText(/nama|name|email/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/create-user/create-user-form-fields.png`,
      fullPage: true,
    });
  });
});

test.describe("super admin flow — update user", () => {
  test.use({ storageState: AUTH_STATE });

  test("user list shows edit action for super admin", async ({ page }) => {
    await page.goto("/users");
    const editButton = page.getByRole("button", { name: /edit|ubah/i });
    await expect(editButton.first()).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/update-user/update-user-edit-action.png`,
      fullPage: true,
    });
  });
});

test.describe("super admin flow — delete user", () => {
  test.use({ storageState: AUTH_STATE });

  test("user list shows delete action for super admin", async ({ page }) => {
    await page.goto("/users");
    const deleteButton = page.getByRole("button", { name: /hapus|delete/i });
    await expect(deleteButton.first()).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/delete-user/delete-user-action.png`,
      fullPage: true,
    });
  });
});

test.describe("super admin flow — sidebar", () => {
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

  test("sidebar shows settings link for super admin", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("link", { name: /pengaturan|settings/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/sidebar/sidebar-settings-link.png`,
      fullPage: true,
    });
  });
});

test.describe("super admin flow — logout", () => {
  test.use({ storageState: AUTH_STATE });

  test("logout button is visible in sidebar", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("button", { name: /keluar|log out|sign out/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/logout/logout-button-visible.png`,
      fullPage: true,
    });
  });
});
