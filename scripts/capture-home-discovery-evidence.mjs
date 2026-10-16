import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { arch, platform, release } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidenceRoot = resolve(root, "evidence");
const runId = process.env.HOME_RUN_ID || `home-discovery-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const baseUrl = process.env.HOME_BASE_URL || "http://127.0.0.1:3221";
const output = resolve(evidenceRoot, runId);
const viewports = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "desktop-1024x768", width: 1024, height: 768 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
];

if (!/^[a-zA-Z0-9._-]+$/.test(runId)) {
  throw new Error("HOME_RUN_ID may only contain letters, numbers, dot, dash and underscore.");
}

await mkdir(evidenceRoot, { recursive: true });
await mkdir(output, { recursive: false });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  cut: "home-discovery-v1",
  baseUrl,
  provenance: {
    concordeRevision: "40d1be50206021157d9d6ad81327df8ba25486a4",
    concordeTree: "5d142a656dba74518e46b2c192cce946d15b075f",
    sourceHashes: await hashSources(),
    browser: `Microsoft Edge ${browser.version()}`,
    node: process.version,
    os: `${platform()} ${release()} ${arch()}`,
  },
  scenarios: [],
};

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedResources = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => failedResources.push({ url: request.url(), failure: request.failure()?.errorText }));
  page.on("response", (response) => {
    if (response.status() >= 400) failedResources.push({ url: response.url(), status: response.status() });
  });

  await page.goto(`${baseUrl}/qa/home-discovery`, { waitUntil: "networkidle" });
  const initial = await measure(page);
  const inertInteraction = await inspectInert(page);
  await page.screenshot({ path: resolve(output, `${viewport.name}-full.png`), fullPage: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedMotion = await page.evaluate(() => {
    const card = document.querySelector(".pcard");
    const style = card instanceof HTMLElement ? getComputedStyle(card) : null;
    return { found: Boolean(card), transitionDuration: style?.transitionDuration ?? null, animationName: style?.animationName ?? null };
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });

  report.scenarios.push({ viewport, initial, inertInteraction, reducedMotion, consoleErrors, failedResources });
  await context.close();
}

await browser.close();
report.assertions = [
  assertion("route-and-demo-label", report.scenarios.every((scenario) => scenario.initial.cutPresent && scenario.initial.demoNotice), report.scenarios.map(summary)),
  assertion("no-horizontal-overflow", report.scenarios.every((scenario) => !scenario.initial.horizontalOverflow), report.scenarios.map(summary)),
  assertion("inert-controls-not-focusable", report.scenarios.every((scenario) => scenario.initial.focusableOutsideInert === 0 && scenario.inertInteraction.programmaticFocusAccepted === 0 && !scenario.inertInteraction.tabEnteredInert && scenario.inertInteraction.userClickBlocked), report.scenarios.map(summary)),
  assertion("console-clean", report.scenarios.every((scenario) => scenario.consoleErrors.length === 0 && scenario.failedResources.length === 0), report.scenarios.map((scenario) => ({ viewport: scenario.viewport.name, consoleErrors: scenario.consoleErrors.length, failedResources: scenario.failedResources.length }))),
  assertion("reduced-motion", report.scenarios.every((scenario) => scenario.reducedMotion.found && scenario.reducedMotion.transitionDuration === "0s"), report.scenarios.map((scenario) => ({ viewport: scenario.viewport.name, ...scenario.reducedMotion }))),
];
report.result = report.assertions.every((item) => item.pass) ? "PASS" : "FAIL";
report.artifacts = await hashArtifacts(output);
await writeFile(resolve(output, "metrics.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Home evidence written to ${output}`);
console.log(`Home evidence gate: ${report.result}`);
if (report.result !== "PASS") process.exitCode = 1;

function assertion(id, pass, actual) {
  return { id, pass: Boolean(pass), actual };
}

function summary(scenario) {
  return {
    viewport: scenario.viewport.name,
    horizontalOverflow: scenario.initial.horizontalOverflow,
    controlsInsideInert: scenario.initial.controlsInsideInert,
    focusableOutsideInert: scenario.initial.focusableOutsideInert,
    programmaticFocusAccepted: scenario.inertInteraction.programmaticFocusAccepted,
    tabEnteredInert: scenario.inertInteraction.tabEnteredInert,
    userClickBlocked: scenario.inertInteraction.userClickBlocked,
  };
}

async function measure(page) {
  return page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll("button, a, input, select, textarea, [tabindex]"));
    const focusableOutsideInert = controls.filter((element) => {
      if (!(element instanceof HTMLElement) || element.closest("[inert]")) return false;
      const style = getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.tabIndex >= 0;
    }).length;
    return {
      cutPresent: Boolean(document.querySelector('[data-cut="home-discovery-v1"]')),
      demoNotice: document.body.textContent?.includes("Maqueta visual de QA") ?? false,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      controlsInsideInert: document.querySelectorAll("[inert] button, [inert] a").length,
      focusableOutsideInert,
    };
  });
}

async function inspectInert(page) {
  const programmatic = await page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll("[inert] button, [inert] a"));
    let accepted = 0;
    for (const control of controls) {
      if (!(control instanceof HTMLElement)) continue;
      control.focus();
      if (document.activeElement === control) accepted += 1;
    }
    document.body.focus();
    return { controlsTested: controls.length, programmaticFocusAccepted: accepted };
  });
  let tabEnteredInert = false;
  for (let index = 0; index < 24; index += 1) {
    await page.keyboard.press("Tab");
    const insideInert = await page.evaluate(() => Boolean(document.activeElement?.closest("[inert]")));
    if (insideInert) tabEnteredInert = true;
  }
  let userClickBlocked = false;
  try {
    await page.locator("[inert] button").first().click({ timeout: 750 });
  } catch {
    userClickBlocked = true;
  }
  return { ...programmatic, tabEnteredInert, userClickBlocked };
}

async function sha256File(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function hashSources() {
  const paths = [
    "apps/index-lab/app/qa/home-discovery/HomeDiscovery.tsx",
    "apps/index-lab/app/qa/home-discovery/HomeDiscovery.module.css",
    "docs/decisions/HOME-DISCOVERY-DECISION-PACKET-v1.md",
    "scripts/capture-home-discovery-evidence.mjs",
    "apps/index-lab/public/demo/inventory-suv-v1.png",
    "apps/index-lab/public/demo/inventory-excavator-v1.png",
    "apps/index-lab/public/demo/inventory-forklift-v1.png",
    "apps/index-lab/public/demo/inventory-steel-v1.png",
  ];
  return Promise.all(paths.map(async (relativePath) => ({ relativePath, sha256: await sha256File(resolve(root, relativePath)) })));
}

async function hashArtifacts(directory) {
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  return Promise.all(files.map(async (name) => ({ name, sha256: await sha256File(resolve(directory, name)) })));
}
