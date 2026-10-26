// Imágenes de vmc-ahora.md (docs/vmc-ahora/): el día de 8 + 2 como gráfico (sale de feedPlan.ts) y capturas reales del lab.
// Uso: con el lab corriendo, `node scripts/vmc-ahora-docs.mjs`. VMC_URL (por defecto http://localhost:3001) y
// BROWSER_CHANNEL (por defecto msedge; chrome en Linux) cambian el servidor y el navegador.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { COLORS, DAY_MIN, DAY_START, fmtMin, planDay } from "../apps/index-lab/app/qa/home-index-rebase/feedPlan.ts";

const out = resolve(dirname(fileURLToPath(import.meta.url)), "../docs/vmc-ahora");
const url = `${process.env.VMC_URL || "http://localhost:3001"}/qa/home-index-rebase`;
await mkdir(out, { recursive: true });

// ─── Gráfico del día ─────────────────────────────────────────────────────────────────────────────────────────────────
const ROWS = [
  { label: "Nuevas", kinds: ["nueva", "nueva-subascars"], color: COLORS.vivo },
  { label: "Rotación", kinds: ["rotacion"], color: COLORS.negociable },
  { label: "Propuestas", kinds: ["propuesta"], color: COLORS.negociable },
  { label: "Registros", kinds: ["registro"], color: COLORS.morado },
  { label: "Publicidad", kinds: ["ad-valoriza", "ad-publica"], color: COLORS.promo },
  { label: "Blog", kinds: ["blog"], color: COLORS.blog },
];
function daySvg(V, N) {
  const plan = planDay(V, N);
  const W = 1200, L = 120, R = 70, top = 56, rowH = 44, H = top + ROWS.length * rowH + 40;
  const x = (min) => L + ((min - DAY_START) / DAY_MIN) * (W - L - R);
  const hours = Array.from({ length: 16 }, (_, i) => DAY_START + i * 60);
  const rows = ROWS.map((r, i) => {
    const y = top + i * rowH + rowH / 2;
    const es = plan.filter((e) => r.kinds.includes(e.kind));
    return `<text x="${L - 14}" y="${y + 5}" text-anchor="end" font-weight="600">${r.label}</text>
<text x="${W - R + 12}" y="${y + 5}" fill="#6B6880">${es.length}</text>
<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#ECEAF3"/>
${es.map((e) => `<circle cx="${x(e.min).toFixed(1)}" cy="${y}" r="6" fill="${r.color}"${e.mock ? ' fill-opacity=".45"' : ""}/>`).join("")}`;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="system-ui, sans-serif" font-size="15" fill="#1D1B2C">
<rect width="${W}" height="${H}" fill="#fff"/>
<text x="${L}" y="28" font-size="18" font-weight="700">Un día con ${V} en vivo + ${N} negociables (${plan.length} entradas simuladas; las claras son mockups)</text>
${hours.map((h) => `<line x1="${x(h)}" x2="${x(h)}" y1="${top - 6}" y2="${top + ROWS.length * rowH}" stroke="#F4F3F8"/><text x="${x(h)}" y="${H - 14}" text-anchor="middle" fill="#6B6880" font-size="13">${fmtMin(h)}</text>`).join("\n")}
${rows}
</svg>`;
}
await writeFile(resolve(out, "dia-8-2.svg"), daySvg(8, 2));

// ─── Capturas del lab ────────────────────────────────────────────────────────────────────────────────────────────────
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });
const set = (page, state) => page.evaluate((s) => postMessage({ type: "hib-set", state: s }, location.origin), state);
async function open(width, height, state) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: "networkidle" });
  await set(page, { feedSpeed: "10", ...state });
  // Fuera de la foto: controles de QA, el aviso de Next en dev y la píldora «Nuevo» (tapa la entrada de arriba).
  await page.addStyleTag({ content: "nextjs-portal, .hdp-toggle, .hdp-ctrl, .hib-controls-toggle, .hib-option-toggle, .va-newpill { display: none !important; }" });
  await page.waitForTimeout(1500);
  return page;
}

// Índice completo, escritorio y móvil.
for (const [name, w, h] of [["indice-escritorio", 1440, 900], ["indice-movil", 393, 852]]) {
  const page = await open(w, h, { feedScenario: "v8n2" });
  await page.screenshot({ path: resolve(out, `${name}.jpg`), type: "jpeg", quality: 80 });
  await page.close();
}

// Una entrada de cada tipo (8 + 2, a ×10 sale una cada 4,5 s): se espera a que aparezca y se recorta.
const KINDS = [
  ["nueva", "Publicó una nueva oferta"], ["rotacion", "Disponible "], ["propuesta", "Se ha enviado una propuesta"],
  ["registro", "Se registró un nuevo usuario"], ["ad-valoriza", "Valoriza tu auto"], ["ad-publica", "Publica tu auto"], ["blog", "Blog VMC"],
];
{
  const page = await open(1440, 900, { feedScenario: "v8n2" });
  const left = new Map(KINDS);
  for (let t = 0; left.size && t < 240; t++) {
    for (const [kind, text] of left) {
      const li = page.locator("li.va-post:visible", { hasText: text }).first();
      if (!(await li.count())) continue;
      await page.waitForTimeout(600); // que termine la animación de entrada
      await li.screenshot({ path: resolve(out, `entrada-${kind}.png`) });
      left.delete(kind);
    }
    await page.waitForTimeout(1000);
  }
  if (left.size) console.warn("Sin captura:", [...left.keys()].join(", "));
  await page.close();
}

// Casos borde: el feed entero sin ofertas y sin negociables.
for (const [name, scenario] of [["feed-0-ofertas", "s0"], ["feed-0-negociables", "v10"], ["feed-8-2", "v8n2"]]) {
  const page = await open(1440, 900, { feedScenario: scenario, feedView: "normal" }); // el listado muestra más entradas
  await page.waitForTimeout(3000);
  await page.locator("aside.va:visible").first().screenshot({ path: resolve(out, `${name}.png`) });
  await page.close();
}
await browser.close();
console.log(`Listo: ${out}`);
