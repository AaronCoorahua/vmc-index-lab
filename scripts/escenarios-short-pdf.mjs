// Genera escenarios-short.pdf (raíz del repo): la versión corta de escenarios.pdf. Reglas en una línea, fórmulas escritas
// como fórmulas y una tabla con todos los escenarios. Sale de las mismas fórmulas que el feed de la demo (feedPlan.ts).
// Uso: node scripts/escenarios-short-pdf.mjs
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { counts, GAP_S, PROMO_MAX, PROMO_MIN, REGISTROS_MAX, BLOG_SIN_NEGOCIABLES } from "../apps/index-lab/app/qa/home-index-rebase/feedPlan.ts";

const OUT = fileURLToPath(new URL("../escenarios-short.pdf", import.meta.url));
const SCENARIOS = [[0, 0], [1, 0], [0, 1], [3, 2], [0, 5], [6, 0], [8, 2], [0, 10], [10, 1], [6, 6], [0, 20], [15, 15], [40, 20]];

const zero = (n) => (n ? n : `<span class="muted">0</span>`);
const slide = (title, body) => `<section class="slide"><h2>${title}</h2><div class="body">${body}</div></section>`;
// Fórmula por tramos: nombre = { valor si condición ... }
const cases = (lhs, rows) => `<div class="f"><span class="lhs">${lhs} =</span><span class="brace">{</span>
  <table class="cases">${rows.map(([v, c]) => `<tr><td class="v">${v}</td><td class="c">${c}</td></tr>`).join("")}</table></div>`;
const line = (html) => `<div class="f"><span>${html}</span></div>`;

const cover = `
<section class="slide cover">
  <h1>VMC ahora</h1>
  <p class="lead">Reglas y fórmulas en corto</p>
  <table class="legend">
    <tr><td class="m">V</td><td>ofertas en vivo publicadas</td></tr>
    <tr><td class="m">N</td><td>ofertas negociables publicadas</td></tr>
    <tr><td class="m">T</td><td>V + N, todas las ofertas publicadas</td></tr>
    <tr><td class="m">t</td><td>tiempo desde que se publicó algo</td></tr>
    <tr><td class="m">Día</td><td>de 9:00 a 24:00</td></tr>
  </table>
</section>`;

const RULES = [
  `Entra una entrada simulada cada ${GAP_S} segundos. Una real entra al momento y reinicia la cuenta.`,
  "Al abrir la página, la primera entrada es una publicidad.",
  "Sin negociables no hay avisos de propuesta.",
  "Sin ofertas no se simula nada.",
  "La rotación muestra la oferta como disponible. Una oferta nueva no rota el día en que se publica.",
  "Los avisos de propuestas y registros no dicen quién fue.",
  "La propuesta simulada usa un código de oferta al azar y no cambia ningún contador.",
  "Cada hecho real reemplaza a uno simulado del mismo tipo. Los reales no tienen tope.",
  "Visitas, me gusta y participantes empiezan en 0 y crecen con el tiempo.",
  "Ofertas: me gusta, participantes o negociaciones, visitas y compartir. El resto: visitas y compartir.",
];
const rules = slide("Reglas", `<ol class="steps">${RULES.map((r) => `<li>${r}</li>`).join("")}</ol>`);

const formulas = slide("Fórmulas", `<div class="grid">
  <div>
    <h3>Rotaciones al día</h3>
    ${cases("<i>R</i>(<i>T</i>)", [["0", "si <i>T</i> = 0"], ["3<i>T</i>", "si 1 ≤ <i>T</i> ≤ 5"], ["<i>T</i>", "si 6 ≤ <i>T</i> ≤ 30"], ["30", "si <i>T</i> &gt; 30"]])}
    <h3>Propuestas al día</h3>
    ${line("<i>P</i>(<i>N</i>) = mín(2<i>N</i>, tope)")}
    ${cases("tope", [["0", "si <i>N</i> = 0"], ["5", "si 1 ≤ <i>N</i> ≤ 4"], ["8", "si 5 ≤ <i>N</i> ≤ 11"], ["12", "si <i>N</i> ≥ 12"]])}
    <h3>Registros al día</h3>
    ${cases("<i>U</i>(<i>T</i>)", [["0", "si <i>T</i> = 0"], [`mín(${REGISTROS_MAX}, 1 + ⌊<i>T</i> / 4⌋)`, "si <i>T</i> ≥ 1"]])}
  </div>
  <div>
    <h3>Publicidad y blog al día</h3>
    ${line("<i>A</i> = <i>R</i> + <i>P</i> + <i>U</i> + nuevas")}
    ${line(`Pub = mín(${PROMO_MAX}, máx(${PROMO_MIN}, ⌈<i>A</i> / 2⌉))`)}
    ${line(`Blog = Pub / 3 <span class="muted">(+${BLOG_SIN_NEGOCIABLES} si <i>N</i> = 0)</span>`)}
    <h3>Simuladas del día</h3>
    ${line("simuladas = máx(0, objetivo − reales)")}
    <h3>Contadores</h3>
    ${line("visitas(<i>t</i>) = tope × (1 − <i>e</i><sup>−<i>t</i> / 6 h</sup>)")}
    ${line("me gusta, participantes = 4 % a 8 % de visitas")}
    ${line('<span class="muted">tope de visitas: 120 a 500 (muy buenas: 600 a 800)</span>')}
  </div>
</div>`);

const scenarios = slide("Escenarios", `<table class="data">
  <thead><tr><th>En vivo</th><th>Negociables</th><th>Ofertas</th><th>Rotación</th><th>Propuestas</th><th>Registros</th><th>Nuevas</th><th>Publicidad</th><th>Blog</th><th>Entradas al día</th></tr></thead>
  <tbody>${SCENARIOS.map(([V, N]) => {
    const c = counts(V, N);
    return `<tr><td>${V}</td><td>${N}</td><td><b>${c.T}</b></td><td>${zero(c.rot)}</td><td>${zero(c.prop)}</td><td>${zero(c.reg)}</td><td>${zero(c.nuevas)}</td><td>${c.ads}</td><td>${c.blog}</td><td><b>${c.total}</b></td></tr>`;
  }).join("")}</tbody>
</table>`);

const PENDING = [
  ["Topes de propuestas", "5, 8 y 12 al día"],
  ["Vueltas con 1 a 5 ofertas", "3 al día (con 5 ofertas, una por hora)"],
  ["Sin ofertas", "Solo publicidad y blog, ocultar o \"Pronto nuevas ofertas\""],
  ["\"En vivo\" en la cabecera", "Solo si hay ofertas en vivo"],
  ["Propuestas y registros reales", "Conectarlos (Francis)"],
  ["Foto de la propuesta simulada", "Genérica o sin foto"],
];
const pending = slide("Por decidir con Julio", `<table class="data rules">
  <thead><tr><th class="l">Tema</th><th class="l">Propuesta</th></tr></thead>
  <tbody>${PENDING.map(([a, b]) => `<tr><td class="l"><b>${a}</b></td><td class="l">${b}</td></tr>`).join("")}</tbody>
</table>`);

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>VMC ahora · Reglas en corto</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
@page { size: 1280px 720px; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { font: 20px/1.4 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #1B1442; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.slide { display: flex; flex-direction: column; width: 1280px; height: 720px; padding: 52px 64px 44px; overflow: hidden; break-after: page; background: #fff; }
.slide:last-child { break-after: auto; }
h1 { margin: 0; font-size: 88px; line-height: 1; font-weight: 800; letter-spacing: -0.03em; color: #3B1782; }
h2 { margin: 0; font-size: 38px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; color: #3B1782; }
h3 { margin: 18px 0 8px; font-size: 16px; font-weight: 700; color: #8460E5; }
h3:first-child { margin-top: 0; }
.lead { margin: 16px 0 36px; font-size: 30px; color: #4A4560; }
.body { flex: 1; min-height: 0; margin-top: 28px; }
.cover { justify-content: center; background: radial-gradient(70% 90% at 100% 0%, #F1ECFF 0%, #fff 60%); }
.muted { color: #8A879C; }
table.legend { border-collapse: collapse; font-size: 22px; }
table.legend td { padding: 6px 18px 6px 0; }
table.legend td.m, .f i, .f .lhs { font-family: Cambria, 'Times New Roman', serif; }
table.legend td.m { font-size: 26px; font-style: italic; font-weight: 700; color: #3B1782; }
ol.steps { margin: 0; padding: 0; list-style: none; counter-reset: s; display: grid; gap: 11px; }
ol.steps li { counter-increment: s; display: grid; grid-template-columns: 40px 1fr; gap: 14px; align-items: center; font-size: 20px; line-height: 1.3; }
ol.steps li::before { content: counter(s); display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; font-size: 15px; font-weight: 800; color: #fff; background: #8460E5; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; }
.f { display: flex; align-items: center; gap: 10px; margin: 0 0 6px; font: 23px/1.35 Cambria, 'Times New Roman', serif; color: #1B1442; }
.f i { font-style: italic; }
.f .lhs { white-space: nowrap; }
.f .brace { font-size: 64px; line-height: 1; font-weight: 300; color: #8460E5; transform: scaleX(0.7); }
table.cases { border-collapse: collapse; }
table.cases td { padding: 1px 0; }
table.cases td.v { padding-right: 22px; }
table.cases td.c { color: #5B5870; }
table.data { width: 100%; border-collapse: collapse; }
table.data th { padding: 9px 10px; font-size: 14px; font-weight: 700; color: #fff; background: #3B1782; }
table.data td { padding: 6px 10px; font-size: 17px; text-align: center; border-bottom: 1px solid #ECE8F6; }
table.data tbody tr:nth-child(even) td { background: #FAF9FD; }
table.data .l { text-align: left; }
table.data.rules td { padding: 14px; font-size: 20px; }
table.data.rules td:first-child { width: 38%; }
</style></head><body>
${cover}${rules}${formulas}${scenarios}${pending}
</body></html>`;

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
const over = await page.evaluate(() => [...document.querySelectorAll(".slide")].map((el, i) => {
  const bottom = Math.max(...[...el.querySelectorAll(".body *, h2")].map((c) => c.getBoundingClientRect().bottom)) - el.getBoundingClientRect().top;
  return { i: i + 1, bottom: Math.round(bottom) };
}).filter((x) => x.bottom > 676));
if (over.length) console.warn("Diapositivas que se pasan:", over);
await page.pdf({ path: OUT, width: "1280px", height: "720px", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`escenarios-short.pdf → ${OUT}`);
