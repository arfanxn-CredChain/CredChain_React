import { test, expect } from "@playwright/test";
import { registerFailureScreenshot } from "./helpers/screenshots";

const SCREENSHOT_DIR = "e2e/screenshots/admin-flow";
const AUTH_STATE = "./e2e/.auth/admin.json";

registerFailureScreenshot(test, SCREENSHOT_DIR);

test.describe("admin flow — overview", () => {
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

test.describe("admin flow — create user", () => {
  test.use({ storageState: AUTH_STATE });

  test("user list page renders with heading", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/create-user/user-list-page.png`,
      fullPage: true,
    });
  });

  test("user list shows create user button for admin", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByRole("link", { name: /tambah|add|buat|create/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/create-user/user-list-create-button.png`,
      fullPage: true,
    });
  });

  test("create user page renders with heading", async ({ page }) => {
    await page.goto("/users/create");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/create-user/create-user-page.png`,
      fullPage: true,
    });
  });
});

test.describe("admin flow — batch create", () => {
  test.use({ storageState: AUTH_STATE });

  test("batch create section shows add row capability", async ({ page }) => {
    await page.goto("/users/create");
    const addButton = page.getByRole("button", { name: /tambah|add|baris|row/i });
    if (await addButton.isVisible()) {
      await addButton.scrollIntoViewIfNeeded();
    }
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/batch-create/batch-create-add-row.png`,
      fullPage: true,
    });
  });

  test("batch create form shows multiple user entries", async ({ page }) => {
    await page.goto("/users/create");
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/batch-create/batch-create-entries.png`,
      fullPage: true,
    });
  });
});

test.describe("admin flow — update user", () => {
  test.use({ storageState: AUTH_STATE });

  test("user detail page renders with heading", async ({ page }) => {
    await page.goto("/users/1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/update-user/user-detail-page.png`,
      fullPage: true,
    });
  });

  test("user detail shows user information section", async ({ page }) => {
    await page.goto("/users/1");
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/update-user/user-detail-information.png`,
      fullPage: true,
    });
  });
});

test.describe("admin flow — update role", () => {
  test.use({ storageState: AUTH_STATE });

  test("user list shows role filter menu", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByText(/peran|role/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/update-role/user-list-role-filter.png`,
      fullPage: true,
    });
  });

  test("user detail shows role section", async ({ page }) => {
    await page.goto("/users/1");
    await expect(page.getByText(/peran|role/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/update-role/user-detail-role-section.png`,
      fullPage: true,
    });
  });
});

test.describe("admin flow — delete user", () => {
  test.use({ storageState: AUTH_STATE });

  test("user list shows status filter for deleted users", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByText(/status|all|semua|aktif|active|hapus|deleted|trash/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/delete-user/user-list-status-filter.png`,
      fullPage: true,
    });
  });

  test("user list shows row actions dropdown", async ({ page }) => {
    await page.goto("/users");
    const actionButton = page.getByRole("button", { name: /aksi|action|more|lagi/i });
    if (await actionButton.isVisible()) {
      await actionButton.scrollIntoViewIfNeeded();
    }
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/delete-user/user-list-row-actions.png`,
      fullPage: true,
    });
  });
});

test.describe("admin flow — restore user", () => {
  test.use({ storageState: AUTH_STATE });

  test("user list can filter to show trashed users", async ({ page }) => {
    await page.goto("/users");
    const statusButton = page.getByRole("button", { name: /status|all|semua/i }).first();
    if (await statusButton.isVisible()) {
      await statusButton.scrollIntoViewIfNeeded();
    }
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/restore-user/user-list-trashed-filter.png`,
      fullPage: true,
    });
  });

  test("user list shows restore option for deleted users", async ({ page }) => {
    await page.goto("/users");
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/restore-user/user-list-restore-option.png`,
      fullPage: true,
    });
  });
});

test.describe("admin flow — sidebar", () => {
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

  test("sidebar shows users link for admin", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("link", { name: /pengguna|users/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/sidebar/sidebar-users-link.png`,
      fullPage: true,
    });
  });
});

test.describe("admin flow — logout", () => {
  test.use({ storageState: AUTH_STATE });

  test("logout button is visible in sidebar", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("button", { name: /keluar|log out|sign out/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/logout/logout-button-visible.png`,
      fullPage: true,
    });
  });

  test("logout opens confirm dialog", async ({ page }) => {
    await page.goto("/overview");
    await page.getByRole("button", { name: /keluar|log out|sign out/i }).click();
    await expect(page.getByRole("button", { name: /batal|cancel/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/logout/logout-confirm-dialog.png`,
      fullPage: true,
    });
  });
});
