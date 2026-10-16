import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidenceRoot = resolve(root, "evidence");
const runId = process.env.HOME_INDEX_RUN_ID || `home-index-rebase-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const baseUrl = process.env.HOME_INDEX_BASE_URL || "http://127.0.0.1:3001";
const output = resolve(evidenceRoot, runId);
const viewports = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
];

if (!/^[a-zA-Z0-9._-]+$/.test(runId)) throw new Error("HOME_INDEX_RUN_ID may only contain letters, numbers, dot, dash and underscore.");

await mkdir(evidenceRoot, { recursive: true });
await mkdir(output, { recursive: false });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  cut: "home-index-concorde-only-v1",
  baseUrl,
  browser: `Microsoft Edge ${browser.version()}`,
  sourceHashes: await hashSources(),
  scenarios: [],
};

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedResources = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("requestfailed", (request) => failedResources.push({ url: request.url(), failure: request.failure()?.errorText }));
  page.on("response", (response) => { if (response.status() >= 400) failedResources.push({ url: response.url(), status: response.status() }); });

  await page.goto(`${baseUrl}/qa/home-index-rebase`, { waitUntil: "networkidle" });
  const initial = await measure(page);
  await page.screenshot({ path: resolve(output, `${viewport.name}-first-fold.png`), fullPage: false });
  report.scenarios.push({ viewport, initial, consoleErrors, failedResources });
  await context.close();
}

await browser.close();
report.assertions = [
  assertion("first-fold-structure", report.scenarios.every((scenario) => scenario.initial.structurePresent), report.scenarios.map(summary)),
  assertion("featured-asset-is-visible", report.scenarios.every((scenario) => scenario.initial.featuredAsset.visible && scenario.initial.featuredAsset.localFixture), report.scenarios.map(summary)),
  assertion("no-laboratory-language", report.scenarios.every((scenario) => scenario.initial.labTerms.length === 0), report.scenarios.map(summary)),
  assertion("no-horizontal-overflow", report.scenarios.every((scenario) => !scenario.initial.horizontalOverflow), report.scenarios.map(summary)),
  assertion("console-clean", report.scenarios.every((scenario) => scenario.consoleErrors.length === 0 && scenario.failedResources.length === 0), report.scenarios.map(summary)),
  assertion("desktop-hierarchy", report.scenarios.filter((scenario) => scenario.viewport.width >= 1024).every((scenario) => scenario.initial.desktopHierarchy), report.scenarios.map(summary)),
  assertion("desktop-canvas-is-1024", report.scenarios.filter((scenario) => scenario.viewport.width >= 1024).every((scenario) => scenario.initial.desktopCanvas), report.scenarios.map(summary)),
  assertion("rail-continuity", report.scenarios.every((scenario) => scenario.initial.railContinuity), report.scenarios.map(summary)),
];
report.result = report.assertions.every((item) => item.pass) ? "PASS" : "FAIL";
await writeFile(resolve(output, "metrics.json"), `${JSON.stringify(report, null, 2)}\n`);
report.artifacts = await hashArtifacts(output);
await writeFile(resolve(output, "metrics.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Home index evidence written to ${output}`);
console.log(`Home index evidence gate: ${report.result}`);
if (report.result !== "PASS") process.exitCode = 1;

function assertion(id, pass, actual) { return { id, pass: Boolean(pass), actual }; }

function summary(scenario) {
  return {
    viewport: scenario.viewport.name,
    structurePresent: scenario.initial.structurePresent,
    featuredAsset: scenario.initial.featuredAsset,
    labTerms: scenario.initial.labTerms,
    horizontalOverflow: scenario.initial.horizontalOverflow,
    desktopHierarchy: scenario.initial.desktopHierarchy,
    desktopCanvas: scenario.initial.desktopCanvas,
    railContinuity: scenario.initial.railContinuity,
    continuity: scenario.initial.continuity,
    consoleErrors: scenario.consoleErrors.length,
    failedResources: scenario.failedResources.length,
  };
}

async function measure(page) {
  return page.evaluate(() => {
    const elementFor = (selector) => Array.from(document.querySelectorAll(selector))
      .find((element) => element instanceof HTMLElement && element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0) ?? null;
    const rect = (selector) => {
      const element = elementFor(selector);
      if (!(element instanceof HTMLElement)) return null;
      const box = element.getBoundingClientRect();
      return { width: Math.round(box.width), height: Math.round(box.height), top: Math.round(box.top), left: Math.round(box.left) };
    };
    const firstFold = rect('[data-testid="home-first-fold"]');
    const shell = rect('[data-testid="home-desktop-canvas"]');
    const featured = rect('[data-testid="home-featured-opportunity"]');
    const asset = rect('[data-testid="home-featured-asset"]');
    const activity = rect('[data-testid="home-activity"]');
    const visibleAsset = elementFor('[data-testid="home-featured-asset"]');
    const image = visibleAsset?.querySelector("img");
    const text = document.body.innerText.toLowerCase();
    const labTerms = ["revisión visual", "contenido estático", "snapshot de revisión", "iconos oficiales en v1"]
      .filter((term) => text.includes(term));
    const visible = asset !== null && asset.width > 0 && asset.height > 0;
    const localFixture = image instanceof HTMLImageElement && image.getAttribute("src")?.startsWith("/demo/");
    const opportunities = rect('[data-testid="home-opportunities"]');
    const rail = rect('[data-testid="store-offer-rail"]');
    const railCards = Array.from(document.querySelectorAll('[data-testid="store-offer-rail"] > *'))
      .filter((element) => element instanceof HTMLElement && element.getBoundingClientRect().width > 0).length;
    const desktop = window.innerWidth >= 1024;
    const ratio = featured && activity ? featured.width / activity.width : 0;
    const canvasIsCentered = shell && Math.abs(shell.width - 1024) <= 1
      && Math.abs(shell.left - ((window.innerWidth - shell.width) / 2)) <= 1;
    // The first card follows the section heading and the store label. The
    // continuity target is therefore the start of the opportunities section.
    const sectionGap = opportunities && firstFold ? opportunities.top - (firstFold.top + firstFold.height) : null;
    const railGap = rail && firstFold ? rail.top - (firstFold.top + firstFold.height) : null;
    return {
      structurePresent: Boolean(firstFold && featured && asset && activity),
      featuredAsset: { visible, localFixture, box: asset },
      labTerms,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      desktopHierarchy: !desktop || Boolean(featured && activity && featured.top === activity.top && ratio >= 2.2 && ratio <= 2.6),
      desktopCanvas: !desktop || Boolean(canvasIsCentered),
      railContinuity: desktop
        ? Boolean(opportunities && rail && sectionGap !== null && sectionGap <= 32 && railGap !== null && railGap <= 180 && railCards >= 4)
        : Boolean(rail && railCards >= 2),
      continuity: { sectionGap, railGap, railCards },
    };
  });
}

async function hashSources() {
  const paths = [
    "apps/index-lab/app/qa/home-index-rebase/HomeIndexRebase.tsx",
    "apps/index-lab/app/qa/home-index-rebase/HomeIndexRebase.module.css",
    "docs/decisions/HOME-INDEX-CONCORDE-ONLY-V1-DECISION-PACKET.md",
    "apps/index-lab/app/qa/home-index-rebase/components/HomeOpportunityHero.tsx",
    "apps/index-lab/app/qa/home-index-rebase/components/ActivityFeedPanel.tsx",
    "scripts/capture-home-index-rebase-evidence.mjs",
    "apps/index-lab/public/demo/inventory-suv-v1.png",
  ];
  return Promise.all(paths.map(async (relativePath) => ({ relativePath, sha256: await sha256File(resolve(root, relativePath)) })));
}

async function hashArtifacts(directory) {
  const files = (await readdir(directory, { withFileTypes: true })).filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  return Promise.all(files.map(async (name) => ({ name, sha256: await sha256File(resolve(directory, name)) })));
}

async function sha256File(path) { return createHash("sha256").update(await readFile(path)).digest("hex"); }
