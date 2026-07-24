import fs from "fs";
import path from "path";
import type { TestType } from "@playwright/test";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function registerFailureScreenshot(test: TestType<object, object>, dir: string) {
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== "passed" && testInfo.status !== "skipped") {
      const resolved = path.resolve(dir);
      fs.mkdirSync(resolved, { recursive: true });
      await page.screenshot({
        path: path.resolve(resolved, `${slugify(testInfo.title)}-failed-test.png`),
        fullPage: true,
      });
    }
  });
}
