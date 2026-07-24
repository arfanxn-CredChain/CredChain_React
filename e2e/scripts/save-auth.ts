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

async function recordRole(role: string): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`\n=== Recording auth state for ${role} ===`);
  console.log(`Navigating to ${BASE_URL}/login ...`);
  await page.goto(`${BASE_URL}/login`);

  console.log("Complete Google OAuth in the browser window.");
  console.log("Waiting for redirect to /overview (up to 120s)...");

  try {
    await page.waitForURL("**/overview", { timeout: 120_000 });
    const statePath = path.join(AUTH_DIR, `${role}.json`);
    await context.storageState({ path: statePath });
    console.log(`✓ ${role} auth saved to ${statePath}`);
  } catch {
    console.error(`✗ ${role} timed out — skipped`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const arg = process.argv[2];

  if (arg) {
    if (!VALID_ROLES.includes(arg as (typeof VALID_ROLES)[number])) {
      console.error(`Invalid role "${arg}". Valid: ${VALID_ROLES.join(", ")}`);
      process.exit(1);
    }
    await recordRole(arg);
    process.exit(0);
  }

  console.log("No role specified — recording all 4 roles interactively.\n");
  console.log("For each role: press Enter to record, or Space+Enter to skip.\n");

  for (const role of VALID_ROLES) {
    const answer = await prompt(`Record "${role}"? [Y/n] `);
    if (answer.toLowerCase() === "n" || answer === " ") {
      console.log(`  Skipping ${role}\n`);
      continue;
    }
    await recordRole(role);
  }

  console.log("\nDone.");
  process.exit(0);
}

main();
