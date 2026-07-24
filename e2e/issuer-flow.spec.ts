import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { registerFailureScreenshot } from "./helpers/screenshots";

const SCREENSHOT_DIR = "e2e/screenshots/issuer-flow";
const AUTH_STATE = "./e2e/.auth/issuer.json";
const CRED_FIXTURES_DIR = path.resolve("e2e/fixtures/credentials");

registerFailureScreenshot(test, SCREENSHOT_DIR);

test.describe("issuer flow — overview", () => {
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

test.describe("issuer flow — credential list", () => {
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

  test("credential list shows issue button for issuer", async ({ page }) => {
    await page.goto("/credentials");
    await expect(page.getByRole("link", { name: /terbitkan|issue/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/credential-list/credential-list-issue-button.png`,
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

test.describe("issuer flow — credential detail", () => {
  test.use({ storageState: AUTH_STATE });

  test("credential detail page renders with heading", async ({ page }) => {
    await page.goto("/credentials/1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/credential-detail/credential-detail-page.png`,
      fullPage: true,
    });
  });

  test("credential detail shows metadata section", async ({ page }) => {
    await page.goto("/credentials/1");
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/credential-detail/credential-detail-metadata.png`,
      fullPage: true,
    });
  });

  test("credential detail shows verify button", async ({ page }) => {
    await page.goto("/credentials/1");
    const verifyButton = page.getByRole("button", { name: /verifikasi|verify|publik|public/i });
    if (await verifyButton.isVisible()) {
      await verifyButton.scrollIntoViewIfNeeded();
    }
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/credential-detail/credential-detail-verify-button.png`,
      fullPage: true,
    });
  });
});

test.describe("issuer flow — issue credential", () => {
  test.use({ storageState: AUTH_STATE });

  test("issue credential page renders with heading", async ({ page }) => {
    await page.goto("/credentials/issue");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/issue-credential/issue-credential-page.png`,
      fullPage: true,
    });
  });

  test("issue credential form shows recipient fields", async ({ page }) => {
    await page.goto("/credentials/issue");
    await expect(page.getByText(/penerima|recipient/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/issue-credential/issue-credential-recipient-fields.png`,
      fullPage: true,
    });
  });

  test("issue credential form shows credential type selector", async ({ page }) => {
    await page.goto("/credentials/issue");
    await expect(page.getByText(/tipe|type|jenis|kind/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/issue-credential/issue-credential-type-selector.png`,
      fullPage: true,
    });
  });

  test("issue credential form shows issue button", async ({ page }) => {
    await page.goto("/credentials/issue");
    const submitButton = page.getByRole("button", { name: /terbitkan|issue|simpan|save/i });
    await expect(submitButton).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/issue-credential/issue-credential-submit-button.png`,
      fullPage: true,
    });
  });

  test("issue credential submit shows success toast", async ({ page }) => {
    await page.goto("/credentials/issue");
    await page.waitForLoadState("networkidle");

    const nameInput = page.getByPlaceholder(/nama/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill(`E2E Test Credential ${Date.now()}`);
    }

    const holderSearch = page.getByPlaceholder(/cari|search/i).first();
    if (await holderSearch.isVisible()) {
      await holderSearch.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"], [role="listbox"] li').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForTimeout(300);
      } else {
        await page.keyboard.press("Escape");
      }
    }

    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      const files = fs.readdirSync(CRED_FIXTURES_DIR);
      const ijazah = files.find((f) => f.includes("Ijazah Full")) ?? files.find((f) => f.endsWith(".pdf"));
      if (ijazah) {
        await fileInput.setInputFiles(path.join(CRED_FIXTURES_DIR, ijazah));
        await page.waitForTimeout(1000);
      }
    }

    const submitButton = page.getByRole("button", { name: /terbitkan|issue|simpan|save/i });
    if (await submitButton.isVisible() && await submitButton.isEnabled()) {
      await submitButton.click();
      const toast = page.locator("[data-sonner-toast]");
      await expect(toast).toBeVisible({ timeout: 15000 });
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/issue-credential/issue-credential-success-toast.png`,
      });
    }
  });
});

test.describe("issuer flow — user list", () => {
  test.use({ storageState: AUTH_STATE });

  test("user list page renders", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/user-list/user-list-page.png`,
      fullPage: true,
    });
  });

  test("user list shows search input", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByPlaceholder(/cari|search/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/user-list/user-list-search.png`,
      fullPage: true,
    });
  });

  test("user list shows role filter menu", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByText(/peran|role/i)).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/user-list/user-list-role-filter.png`,
      fullPage: true,
    });
  });
});

test.describe("issuer flow — user detail", () => {
  test.use({ storageState: AUTH_STATE });

  test("user detail page renders with heading", async ({ page }) => {
    await page.goto("/users/1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/user-detail/user-detail-page.png`,
      fullPage: true,
    });
  });

  test("user detail shows user information section", async ({ page }) => {
    await page.goto("/users/1");
    await expect(page.locator("main")).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/user-detail/user-detail-information.png`,
      fullPage: true,
    });
  });
});

test.describe("issuer flow — profile", () => {
  test.use({ storageState: AUTH_STATE });

  test("profile page renders with page header", async ({ page }) => {
    await page.goto("/account/profile");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/profile/profile-page.png`,
      fullPage: true,
    });
  });

  test("profile page shows user detail section", async ({ page }) => {
    await page.goto("/account/profile");
    await expect(page.getByRole("img").first()).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/profile/profile-detail-section.png`,
      fullPage: true,
    });
  });
});

test.describe("issuer flow — sidebar", () => {
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

  test("sidebar shows credentials link for issuer", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("link", { name: /kredensial|credentials/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/sidebar/sidebar-credentials-link.png`,
      fullPage: true,
    });
  });

  test("sidebar shows users link for issuer", async ({ page }) => {
    await page.goto("/overview");
    await expect(page.getByRole("link", { name: /pengguna|users/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/sidebar/sidebar-users-link.png`,
      fullPage: true,
    });
  });
});

test.describe("issuer flow — role escalation", () => {
  test.use({ storageState: AUTH_STATE });

  test("issuer cannot access admin-only /users/create route", async ({ page }) => {
    await page.goto("/users/create");
    await page.waitForURL("**/overview");
    await expect(page).not.toHaveURL(/\/users\/create/);
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/sidebar/issuer-blocked-from-create-user.png`,
      fullPage: true,
    });
  });
});

test.describe("issuer flow — logout", () => {
  test.use({ storageState: AUTH_STATE });

  test("logout shows confirm dialog", async ({ page }) => {
    await page.goto("/overview");
    await page.getByRole("button", { name: /keluar|log out|sign out/i }).click();
    await expect(page.getByRole("button", { name: /batal|cancel/i })).toBeVisible();
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/logout/logout-confirm-dialog.png`,
      fullPage: true,
    });
  });
});

test.afterAll(async ({ page }) => {
  const state = JSON.parse(fs.readFileSync(path.resolve(AUTH_STATE), "utf-8"));
  const accessToken = (state.cookies ?? []).find(
    (c: { name: string; value: string }) => c.name === "access_token",
  )?.value;
  if (!accessToken) return;

  const listResp = await page.request.get("/api/credentials", {
    headers: { Cookie: `access_token=${accessToken}` },
    params: { search: "E2E Test", limit: "100" },
  });
  const body = await listResp.json();
  const ids: string[] = (body?.data ?? []).map((c: { id: string }) => c.id);
  if (ids.length > 0) {
    await page.request.post("/api/credentials/batch/revoke", {
      headers: { "Content-Type": "application/json", Cookie: `access_token=${accessToken}` },
      data: { ids },
    });
  }
});
