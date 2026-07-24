import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ROLE = process.argv[2];
const VALID_ROLES = ["holder", "issuer", "admin", "super_admin"];

if (!ROLE || !VALID_ROLES.includes(ROLE)) {
  console.error("Usage: npx tsx e2e/scripts/save-auth.ts <role>");
  console.error(`Valid roles: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const AUTH_DIR = path.resolve("e2e/.auth");
fs.mkdirSync(AUTH_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Navigating to ${BASE_URL}/login ...`);
  await page.goto(`${BASE_URL}/login`);

  console.log("Waiting for Google OAuth redirect to /overview (up to 120s)...");
  console.log("Complete the Google sign-in in the browser window.");

  try {
    await page.waitForURL("**/overview", { timeout: 120_000 });
    console.log(`Authenticated as ${ROLE}, saving storage state...`);
    await context.storageState({ path: path.join(AUTH_DIR, `${ROLE}.json`) });
    console.log(`Storage state saved to e2e/.auth/${ROLE}.json`);
  } catch {
    console.error("Timed out waiting for authentication. Did you complete Google OAuth?");
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
