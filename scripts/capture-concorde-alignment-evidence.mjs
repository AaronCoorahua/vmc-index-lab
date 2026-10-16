import { chromium } from "playwright-core";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "evidence", `concorde-alignment-${Date.now()}`);
const baseUrl = process.env.HOME_INDEX_BASE_URL || "http://localhost:3001";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const scenarios = [];
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${baseUrl}/qa/home-index-rebase`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => {
      const visible = (selector) => [...document.querySelectorAll(selector)].find((el) => el.getBoundingClientRect().width > 0);
      const title = visible(".cardtitle__title");
      const price = visible(".pcard__price-text");
      const banner = visible(".sb-banner");
      const box = banner?.getBoundingClientRect();
      const loadedFonts = [...document.fonts].filter((font) => font.status === "loaded").map((font) => font.family);
      return {
        displayFamily: title ? getComputedStyle(title).fontFamily : null,
        monoFamily: price ? getComputedStyle(price).fontFamily : null,
        loadedFonts,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        sidebarAdVisible: !box || (box.top >= 0 && box.bottom <= window.innerHeight),
        railCount: [...document.querySelectorAll('[aria-label^="Explorar lotes de"]')].filter((el) => el.getBoundingClientRect().width > 0).length,
        cardColor: getComputedStyle(visible(".pcard__name")).color,
      };
    });
    const rail = page.getByLabel("Explorar lotes de SubasCars", { exact: true }).filter({ visible: true });
    await rail.focus();
    await page.keyboard.press("ArrowRight");
    if (viewport.width < 900) {
      // Browser-native keyboard scrolling is asynchronous; measure the effect
      // after it happens rather than in the same event-loop tick as keyup.
      await page.waitForFunction(() => [...document.querySelectorAll('[aria-label="Explorar lotes de SubasCars"]')]
        .some((el) => el.getBoundingClientRect().width > 0 && el.scrollLeft > 0), null, { timeout: 2000 });
    }
    const scrollAfterKey = await rail.evaluate((el) => el.scrollLeft);
    const like = page.getByRole("button", { name: "Agregar a favoritos", exact: true }).filter({ visible: true }).first();
    await like.click();
    const favoriteWorks = await page.getByRole("button", { name: "Quitar de favoritos", exact: true }).filter({ visible: true }).count() > 0;
    const image = resolve(output, `${viewport.width}x${viewport.height}.png`);
    await page.screenshot({ path: image, fullPage: true });
    scenarios.push({ viewport, ...metrics, scrollAfterKey, favoriteWorks, errors, image });
    await context.close();
  }
} finally { await browser.close(); }
const assertions = {
  fontsLoaded: scenarios.every((s) => s.loadedFonts.some((f) => f.includes("Jakarta")) && s.loadedFonts.some((f) => f.includes("Roboto"))),
  officialCardColor: scenarios.every((s) => s.cardColor === "rgb(76, 30, 188)"),
  noPageOverflow: scenarios.every((s) => !s.horizontalOverflow),
  desktopAdVisible: scenarios[0].sidebarAdVisible,
  twoStoreRails: scenarios.every((s) => s.railCount === 2),
  mobileRailKeyboardScroll: scenarios[1].scrollAfterKey > 0,
  favoriteWorks: scenarios.every((s) => s.favoriteWorks),
  cleanConsole: scenarios.every((s) => s.errors.length === 0),
};
const paths = [
  "config/concorde-v2-source.json", "docs/design-contracts/home-index-concorde-only-v1.json",
  "apps/index-lab/app/qa/home-index-rebase/HomeIndexRebase.tsx",
  "apps/index-lab/app/qa/home-index-rebase/HomeIndexRebase.module.css",
  "apps/index-lab/app/qa/home-index-rebase/layout.tsx",
];
const hashes = await Promise.all(paths.map(async (path) => ({ path, sha256: createHash("sha256").update(await readFile(resolve(root, path))).digest("hex") })));
const imageHashes = await Promise.all(scenarios.map(async (s) => ({ path: s.image, sha256: createHash("sha256").update(await readFile(s.image)).digest("hex") })));
const result = Object.values(assertions).every(Boolean) ? "PASS" : "FAIL";
await writeFile(resolve(output, "metrics.json"), JSON.stringify({ result, assertions, scenarios, hashes, imageHashes }, null, 2));
console.log(JSON.stringify({ result, output, assertions, scenarios }, null, 2));
if (result !== "PASS") process.exitCode = 1;
