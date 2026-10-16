import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { arch, platform, release } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidenceRoot = resolve(root, "evidence");
const runId =
  process.env.SHELL_RUN_ID ||
  `shell-spike-${new Date().toISOString().replace(/[:.]/g, "-")}`;
if (!/^[a-zA-Z0-9._-]+$/.test(runId)) {
  throw new Error("SHELL_RUN_ID may only contain letters, numbers, dot, dash and underscore.");
}
const output = resolve(evidenceRoot, runId);
const baseUrl = process.env.SHELL_BASE_URL || "http://127.0.0.1:3220";
const viewports = [
  { name: "mobile-390x844", width: 390, height: 844 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "desktop-1024x768", width: 1024, height: 768 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
];

await mkdir(evidenceRoot, { recursive: true });
await mkdir(output, { recursive: false });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  runId,
  baseUrl,
  label: "diagnóstico técnico — no propuesta visual",
  provenance: {
    sourceCommit: git("rev-parse", "HEAD"),
    sourceStatusAtStart: git("status", "--short"),
    packageLockSha256: await sha256File(resolve(root, "package-lock.json")),
    buildId: await optionalText(resolve(root, "apps", "index-lab", ".next", "BUILD_ID")),
    serverMode: process.env.SHELL_SERVER_MODE || "externally-managed",
    browser: `Microsoft Edge ${browser.version()}`,
    node: process.version,
    os: `${platform()} ${release()} ${arch()}`,
  },
  scenarios: [],
};

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const failedResources = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push({ text: message.text(), location: message.location() });
    }
  });
  page.on("pageerror", (error) =>
    consoleErrors.push({ text: error.message, location: null }),
  );
  page.on("requestfailed", (request) => {
    failedResources.push({
      url: request.url(),
      reason: request.failure()?.errorText || "request failed",
    });
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedResources.push({ url: response.url(), status: response.status() });
    }
  });

  await page.goto(`${baseUrl}/qa/shell`, { waitUntil: "networkidle" });
  const top = await measure(page);
  await page.screenshot({
    path: resolve(output, `${viewport.name}-long-top.png`),
    fullPage: false,
  });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(150);
  const bottom = await measure(page);
  await page.screenshot({
    path: resolve(output, `${viewport.name}-long-bottom.png`),
    fullPage: false,
  });

  await page.goto(`${baseUrl}/qa/shell?length=short`, { waitUntil: "networkidle" });
  const short = await measure(page);
  await page.screenshot({
    path: resolve(output, `${viewport.name}-short-full.png`),
    fullPage: true,
  });

  const reducedMotion = await inspectReducedMotion(page, viewport.width < 900);
  const scenario = {
    viewport,
    top,
    bottom,
    short,
    reducedMotion,
    consoleErrors,
    failedResources,
  };

  if (viewport.width < 900) {
    scenario.drawer = await inspectDrawer(page, output, viewport.name);
  } else {
    const toggle = page.locator("aside button").first();
    await toggle.click();
    await page.waitForTimeout(350);
    scenario.collapsed = await measure(page);
    await page.screenshot({
      path: resolve(output, `${viewport.name}-collapsed.png`),
      fullPage: false,
    });
  }

  report.scenarios.push(scenario);
  await context.close();
}

await browser.close();
report.assertions = buildAssertions(report.scenarios);
report.promotionGate = report.assertions.every((assertion) => assertion.pass)
  ? "PASS"
  : "FAIL";
report.artifacts = await hashArtifacts(output);
await writeFile(resolve(output, "metrics.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Shell evidence written to ${output}`);
console.log(`Promotion gate: ${report.promotionGate}`);
if (process.argv.includes("--require-promotion") && report.promotionGate !== "PASS") {
  process.exitCode = 1;
}

async function measure(page) {
  return page.evaluate(() => {
    function rect(selector) {
      const elements = Array.from(document.querySelectorAll(selector));
      const element =
        elements.find((candidate) => {
          const candidateBox = candidate.getBoundingClientRect();
          const candidateStyle = getComputedStyle(candidate);
          return (
            candidateBox.width > 0 &&
            candidateBox.height > 0 &&
            candidateStyle.display !== "none"
          );
        }) || elements[0];
      if (!(element instanceof HTMLElement)) return null;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        top: Math.round(box.top),
        right: Math.round(box.right),
        bottom: Math.round(box.bottom),
        left: Math.round(box.left),
        width: Math.round(box.width),
        height: Math.round(box.height),
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
      };
    }

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      scroll: { x: Math.round(window.scrollX), y: Math.round(window.scrollY) },
      document: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        horizontalOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
      },
      header: rect('[data-block="header"]'),
      sidebar: rect('[data-slot="sidebar"]'),
      banner: rect('[data-slot="sidebar-banner"]'),
      bannerWrapper: rect(".sb-banner"),
    };
  });
}

async function inspectDrawer(page, outputDirectory, name) {
  await page.locator("body").focus();
  const closedTabSequence = [];
  for (let index = 0; index < 16; index += 1) {
    await page.keyboard.press("Tab");
    closedTabSequence.push(await activeElement(page));
  }

  const trigger = page.getByRole("button", { name: "Abrir menú" });
  await trigger.click();
  await page.waitForTimeout(350);
  const activeAfterOpen = await activeElement(page);
  const openGeometry = await page.evaluate(() => {
    const panel = document.querySelector(".sbm-panel");
    if (!(panel instanceof HTMLElement)) return null;
    const box = panel.getBoundingClientRect();
    return {
      left: Math.round(box.left),
      right: Math.round(box.right),
      top: Math.round(box.top),
      bottom: Math.round(box.bottom),
      width: Math.round(box.width),
      height: Math.round(box.height),
      clippedHorizontally: box.left < 0 || box.right > window.innerWidth,
      clippedVertically: box.top < 0 || box.bottom > window.innerHeight,
    };
  });
  await page.screenshot({
    path: resolve(outputDirectory, `${name}-drawer-open.png`),
    fullPage: false,
  });

  const openTabSequence = [];
  for (let index = 0; index < 16; index += 1) {
    await page.keyboard.press("Tab");
    openTabSequence.push(await activeElement(page));
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);

  return {
    closedTabSequence,
    closedPanelReceivedFocus: closedTabSequence.some((item) => item.insidePanel),
    activeAfterOpen,
    openGeometry,
    focusEnteredPanelOnOpen: activeAfterOpen.insidePanel,
    openTabSequence,
    focusEscapedPanelWhileOpen: openTabSequence.some((item) => !item.insidePanel),
    activeAfterEscape: await activeElement(page),
  };
}

async function inspectReducedMotion(page, mobile) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const result = await page.evaluate((isMobile) => {
    const selector = isMobile ? ".sbm-panel" : ".sb-root";
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLElement)) {
      return { selector, found: false };
    }
    const style = getComputedStyle(element);
    return {
      selector,
      found: true,
      transitionDuration: style.transitionDuration,
      animationDuration: style.animationDuration,
    };
  }, mobile);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  return result;
}

async function activeElement(page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) {
      return { tag: null, label: null, insidePanel: false };
    }
    return {
      tag: element.tagName.toLowerCase(),
      label:
        element.getAttribute("aria-label") ||
        element.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ||
        null,
      insidePanel: Boolean(element.closest(".sbm-panel")),
    };
  });
}

function buildAssertions(scenarios) {
  const assertions = [];
  const add = (id, pass, actual, expected) =>
    assertions.push({ id, pass: Boolean(pass), actual, expected });

  add(
    "no-horizontal-overflow",
    scenarios.every((scenario) => !scenario.top.document.horizontalOverflow),
    scenarios.map((scenario) => ({
      viewport: scenario.viewport.name,
      overflow: scenario.top.document.horizontalOverflow,
    })),
    "false in every viewport",
  );
  add(
    "console-clean",
    scenarios.every(
      (scenario) =>
        scenario.consoleErrors.length === 0 && scenario.failedResources.length === 0,
    ),
    scenarios.map((scenario) => ({
      viewport: scenario.viewport.name,
      consoleErrors: scenario.consoleErrors.length,
      failedResources: scenario.failedResources.length,
    })),
    "zero errors and failed resources",
  );
  add(
    "visible-header-height",
    scenarios.every((scenario) => scenario.top.header?.height === 64),
    scenarios.map((scenario) => ({
      viewport: scenario.viewport.name,
      height: scenario.top.header?.height ?? null,
    })),
    "64px in every viewport",
  );
  add(
    "reduced-motion",
    scenarios.every(
      (scenario) => scenario.reducedMotion.transitionDuration === "0s",
    ),
    scenarios.map((scenario) => ({
      viewport: scenario.viewport.name,
      transitionDuration: scenario.reducedMotion.transitionDuration,
    })),
    "0s in every viewport",
  );

  const desktop = scenarios.filter((scenario) => scenario.viewport.width >= 900);
  add(
    "desktop-sidebar-persists",
    desktop.every(
      (scenario) => scenario.top.sidebar?.top === 0 && scenario.bottom.sidebar?.top === 0,
    ),
    desktop.map((scenario) => ({
      viewport: scenario.viewport.name,
      topAtStart: scenario.top.sidebar?.top ?? null,
      topAtEnd: scenario.bottom.sidebar?.top ?? null,
    })),
    "top 0 at document start and end",
  );

  const mobile = scenarios.filter((scenario) => scenario.viewport.width < 900);
  add(
    "mobile-drawer-not-clipped",
    mobile.every(
      (scenario) =>
        scenario.drawer.openGeometry &&
        !scenario.drawer.openGeometry.clippedHorizontally &&
        !scenario.drawer.openGeometry.clippedVertically,
    ),
    mobile.map((scenario) => ({
      viewport: scenario.viewport.name,
      geometry: scenario.drawer.openGeometry,
    })),
    "open panel remains inside viewport",
  );
  add(
    "closed-drawer-inert",
    mobile.every((scenario) => !scenario.drawer.closedPanelReceivedFocus),
    mobile.map((scenario) => ({
      viewport: scenario.viewport.name,
      hiddenPanelReceivedFocus: scenario.drawer.closedPanelReceivedFocus,
    })),
    "false in every mobile viewport",
  );
  add(
    "focus-enters-drawer",
    mobile.every((scenario) => scenario.drawer.focusEnteredPanelOnOpen),
    mobile.map((scenario) => ({
      viewport: scenario.viewport.name,
      focusEntered: scenario.drawer.focusEnteredPanelOnOpen,
    })),
    "true in every mobile viewport",
  );
  add(
    "focus-trapped-in-drawer",
    mobile.every((scenario) => !scenario.drawer.focusEscapedPanelWhileOpen),
    mobile.map((scenario) => ({
      viewport: scenario.viewport.name,
      focusEscaped: scenario.drawer.focusEscapedPanelWhileOpen,
    })),
    "false in every mobile viewport",
  );
  add(
    "focus-restored-after-escape",
    mobile.every(
      (scenario) =>
        !scenario.drawer.activeAfterEscape.insidePanel &&
        scenario.drawer.activeAfterEscape.label === "Abrir menú",
    ),
    mobile.map((scenario) => ({
      viewport: scenario.viewport.name,
      active: scenario.drawer.activeAfterEscape,
    })),
    'focus returns to "Abrir menú"',
  );

  return assertions;
}

function git(...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

async function optionalText(path) {
  try {
    return (await readFile(path, "utf8")).trim();
  } catch {
    return null;
  }
}

async function sha256File(path) {
  const content = await readFile(path);
  return createHash("sha256").update(content).digest("hex");
}

async function hashArtifacts(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  return Promise.all(
    files.map(async (name) => ({ name, sha256: await sha256File(resolve(directory, name)) })),
  );
}
