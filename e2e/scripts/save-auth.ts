import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import readline from "readline";
import os from "os";

const VALID_ROLES = ["holder", "issuer", "admin", "super_admin"] as const;
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";
const AUTH_DIR = path.resolve("e2e/.auth");
const BRAVE_PATH = process.env.E2E_BRAVE_PATH ?? "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const BRAVE_PROFILE = process.env.E2E_BRAVE_PROFILE ?? path.join(os.homedir(), "Library/Application Support/BraveSoftware/Brave-Browser");

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function recordRole(role: string, useBrave: boolean): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  if (useBrave) {
    console.log(`Launching Brave (${BRAVE_PATH}) with profile (${BRAVE_PROFILE})...`);
    const context = await chromium.launchPersistentContext(BRAVE_PROFILE, {
      headless: false,
      viewport: { width: 1440, height: 900 },
      executablePath: BRAVE_PATH,
    });
    const page = context.pages()[0] ?? (await context.newPage());
    await recordAndSave(context, page, role, useBrave);
    await context.close();
    return;
  }

  const browser = await chromium.launch({ headless: false, channel: "chromium" });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await recordAndSave(context, page, role, useBrave);
  await browser.close();
}

async function recordAndSave(context: any, page: any, role: string, useBrave: boolean): Promise<void> {
  console.log(`\n=== Recording auth state for ${role} ===`);
  console.log(`Navigating to ${BASE_URL}/login ...`);
  await page.goto(`${BASE_URL}/login`);

  if (useBrave) {
    console.log("Brave opened with your saved Google sessions.");
    console.log("Click the right Google account to sign in.");
  } else {
    console.log("Complete Google OAuth in the Chromium window.");
  }
  console.log("Waiting for redirect to /overview (up to 120s)...");

  try {
    await page.waitForURL("**/overview", { timeout: 120_000 });
    const statePath = path.join(AUTH_DIR, `${role}.json`);
    await context.storageState({ path: statePath });
    console.log(`✓ ${role} auth saved to ${statePath}`);
  } catch {
    console.error(`✗ ${role} timed out — skipped`);
  }
}

function parseArgs(): { role: string | null; brave: boolean } {
  const args = process.argv.slice(2);
  const brave = args.includes("--brave");
  const roleArg = args.find((a) => !a.startsWith("--"));
  const role = roleArg && VALID_ROLES.includes(roleArg as (typeof VALID_ROLES)[number])
    ? roleArg
    : null;
  return { role, brave };
}

async function main() {
  const { role, brave } = parseArgs();

  if (role) {
    await recordRole(role, brave);
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
    await recordRole(r, brave);
  }

  console.log("\nDone.");
  process.exit(0);
}

main();
