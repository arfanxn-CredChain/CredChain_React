import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import readline from "readline";

const VALID_ROLES = ["holder", "issuer", "admin", "super_admin"] as const;
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const AUTH_DIR = path.resolve("e2e/.auth");

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function recordAndSave(page: any, context: any, role: string): Promise<void> {
  console.log(`\n=== Recording auth state for ${role} ===`);
  console.log(`Navigating to ${BASE_URL}/login ...`);
  await page.goto(`${BASE_URL}/login`);

  console.log("Complete Google OAuth in the opened Chromium window.");
  console.log("Waiting for redirect to /overview (up to 120s)...");

  try {
    await page.waitForURL("**/overview", { timeout: 120_000 });
    const statePath = path.join(AUTH_DIR, `${role}.json`);
    await context.storageState({ path: statePath });
    fs.writeFileSync(
      statePath,
      JSON.stringify(await context.storageState(), null, 2),
    );
    console.log(`✓ ${role} auth saved to ${statePath}`);
  } catch {
    console.error(`✗ ${role} timed out — skipped`);
  }
}

async function recordRole(role: string): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
  const page = await context.newPage();

  await recordAndSave(page, context, role);
  await browser.close();
}

function parseArgs(): { role: string | null } {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const role = args[0] && VALID_ROLES.includes(args[0] as (typeof VALID_ROLES)[number])
    ? args[0]
    : null;
  return { role };
}

async function main() {
  const { role } = parseArgs();

  if (role) {
    await recordRole(role);
    process.exit(0);
  }

  console.log("No role specified — recording all 4 roles interactively.\n");
  console.log("For each role: press Enter to record, or Space+Enter to skip.\n");

  for (const r of VALID_ROLES) {
    const answer = await prompt(`Record "${r}"? [Y/n] `);
    if (answer.toLowerCase() === "n" || answer === " ") {
      console.log(`  Skipping ${r}\n`);
      continue;
    }
    await recordRole(r);
  }

  console.log("\nDone.");
  process.exit(0);
}

main();
