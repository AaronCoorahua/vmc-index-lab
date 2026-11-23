// Exporta a PNG cada banner de /qa/banners con «Descargar» (public/banners/descargas).
// Uso: con `next dev` corriendo → node scripts/export-banners.mjs [http://localhost:3000]
import { chromium } from "playwright-core";
const BASE = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto(`${BASE}/qa/banners`, { waitUntil: "networkidle" });
// Sin el número de slot encima (el hero ya no se exporta aquí: scripts/hero-sizes.py).
await p.addStyleTag({ content: ".slot__n,nav{display:none!important} nextjs-portal{display:none!important}" });
const jobs = await p.$$eval("a.dl", (as) => as.map((a) => ({ href: a.getAttribute("href"), ...a.dataset })));
for (const j of jobs.filter((j) => j.href.startsWith("/banners/descargas/"))) {
  const out = `public${j.href}`, name = j.href.split("/").pop().replace(".png", "");
  if (j.src) {
    const q = await b.newPage({ viewport: { width: +j.w, height: +j.h }, deviceScaleFactor: 2 });
    await q.goto(BASE + j.src, { waitUntil: "networkidle" }); await q.waitForTimeout(600);
    await q.screenshot({ path: out }); await q.close();
  } else {
    const el = p.locator(`[data-dl="${name}"]`).first();
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
    await el.screenshot({ path: out });
  }
  console.log("✓", out);
}
await b.close();
