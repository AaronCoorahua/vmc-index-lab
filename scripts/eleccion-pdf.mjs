// Genera eleccion.pdf (raíz del repo): la versión corta de escenarios.pdf. Reglas en una línea, fórmulas escritas
// como fórmulas y una tabla con todos los escenarios. Sale de las mismas fórmulas que el feed de la demo (feedPlan.ts).
// Las capturas salen de docs/vmc-ahora (scripts/vmc-ahora-docs.mjs). Uso: node scripts/eleccion-pdf.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { counts, GAP_S, PROMO_MAX, PROMO_MIN, REGISTROS_MAX, BLOG_SIN_NEGOCIABLES } from "../apps/index-lab/app/qa/home-index-rebase/feedPlan.ts";

const OUT = fileURLToPath(new URL("../eleccion.pdf", import.meta.url));
const img = (name) => {
  const file = new URL(`../docs/vmc-ahora/${name}`, import.meta.url);
  const type = name.endsWith(".svg") ? "svg+xml" : name.endsWith(".jpg") ? "jpeg" : "png";
  return `data:image/${type};base64,${readFileSync(file).toString("base64")}`;
};
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

// Igual que la sección 5 de vmc-ahora.md. ok = confirmada por Julio; el resto funciona en la demo y espera su sí.
const RULES = [
  [true, `Una simulada cada ${GAP_S} s. Una real entra al momento y reinicia la cuenta.`],
  [true, `Sin negociables no hay avisos de propuesta; +${BLOG_SIN_NEGOCIABLES} de blog.`],
  [true, "Con 6 ofertas o más, cada oferta rota 1 vez al día."],
  [false, "Con 1 a 5 ofertas, cada una rota 3 veces (≥ 5 h entre vueltas)."],
  [false, "Tope de propuestas simuladas: 5, 8 y 12 según N."],
  [false, "Sin ofertas no se simula nada: solo publicidad y blog."],
  [false, "Al abrir la página, la primera entrada es una publicidad."],
  [false, "Una oferta nueva no rota el día en que se publica."],
  [false, "Propuestas y registros no dicen quién fue."],
  [false, "La propuesta simulada: código al azar, sin foto, no toca contadores."],
  [false, "Cada real reemplaza a una simulada del mismo tipo. Los reales no tienen tope."],
  [false, "Nunca dos publicidades o blogs seguidos si hay actividad en 30 min."],
  [false, "Ofertas con su foto; blog con su portada."],
  [false, "Los contadores cuentan desde que sale la entrada."],
];
const rules = slide(`Reglas <span class="key"><b class="ok">✓ confirmada</b> <b class="prop">● propuesta</b></span>`,
  `<ol class="steps two">${RULES.map(([ok, r]) => `<li class="${ok ? "ok" : "prop"}">${r}</li>`).join("")}</ol>`);
const fig = (src, cap) => `<figure><img src="${img(src)}"><figcaption>${cap}</figcaption></figure>`;
const entries = slide("Tipos de entrada", `<div class="kinds">
  ${fig("entrada-nueva.png", "Nueva · real")}${fig("entrada-rotacion.png", "Rotación · real")}${fig("entrada-ad-valoriza.png", "Publicidad · Valoriza")}${fig("entrada-ad-publica.png", "Publicidad · Publica")}
  ${fig("entrada-blog.png", "Blog")}${fig("entrada-propuesta.png", "Propuesta · simulada hoy")}${fig("entrada-registro.png", "Registro · simulado hoy")}
</div>`);
const day = slide("Un día con 8 en vivo + 2 negociables", `<img class="wide" src="${img("dia-8-2.svg")}">
  <p class="note">26 entradas de 9:00 a 24:00. Los puntos claros son simulados y desaparecen a medida que llegan los reales.</p>`);
const edges = slide("Casos borde", `<div class="shots edge">
  ${fig("feed-0-ofertas.png", "0 ofertas: solo publicidad y blog")}${fig("feed-0-negociables.png", "0 negociables: sin avisos de propuesta")}${fig("feed-8-2.png", "8 + 2: el caso normal")}
</div>`);

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
    ${line(`Publicidad + blog = mín(${PROMO_MAX}, máx(${PROMO_MIN}, ⌈<i>A</i> / 2⌉))`)}
    ${line(`Blog = ⅓ de eso <span class="muted">(+${BLOG_SIN_NEGOCIABLES} si <i>N</i> = 0)</span>`)}
    <h3>Simuladas del día</h3>
    ${line("simuladas = máx(0, objetivo − reales)")}
    <h3>Contadores</h3>
    ${line("visitas(<i>t</i>) = inicio + (tope − inicio)(1 − <i>e</i><sup>−<i>t</i> / τ</sup>)")}
    ${line('<span class="muted">τ: ofertas 6 h, blog 5 h, publicidad 4 h, propuesta y registro 3 h</span>')}
    ${line('<span class="muted">inicio: oferta nueva 0, en rotación 30 a 60, publicidad 8 a 15</span>')}
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
  ["Más de 30 ofertas", "¿Cuáles 30 rotan? Hoy, las 30 primeras"],
  ["Móvil", "Opción A (\"Ver más\") u Opción B (pestañas)"],
  ["Topes de propuestas", "5, 8 y 12 al día"],
  ["Vueltas con 1 a 5 ofertas", "3 al día (con 5 ofertas, una por hora)"],
  ["Sin ofertas", "Solo publicidad y blog, ocultar o \"Pronto nuevas ofertas\""],
  ["\"En vivo\" en la cabecera", "Solo si hay ofertas en vivo"],
  ["Palabras del contador", "Las mismas en la ficha y en VMC ahora"],
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
h2 .key { float: right; margin-top: 12px; font-size: 16px; font-weight: 600; letter-spacing: 0; }
.key b { margin-left: 18px; }
.ok, .key .ok { color: #0F7B4A; }
.prop, .key .prop { color: #B26A00; }
ol.steps.two { grid-template-columns: 1fr 1fr; grid-template-rows: repeat(7, auto); grid-auto-flow: column; gap: 20px 40px; }
ol.steps.two li { font-size: 20px; grid-template-columns: 34px 1fr; }
ol.steps.two li::before { width: 30px; height: 30px; font-size: 13px; }
ol.steps li.ok::before { background: #0F7B4A; }
ol.steps li.prop::before { background: #D98A00; }
.shots { display: flex; gap: 18px; align-items: flex-start; height: 100%; }
.shots figure { flex: 1; min-width: 0; margin: 0; }
.shots img { display: block; width: 100%; border: 1px solid #ECE8F6; border-radius: 12px; }
.shots.edge figure img { max-height: 520px; object-fit: cover; object-position: top; }
.kinds { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px 18px; align-items: start; }
.kinds figure { margin: 0; }
.kinds img { display: block; width: 100%; max-height: 236px; object-fit: contain; object-position: left top; border: 1px solid #ECE8F6; border-radius: 12px; }
figcaption { margin-top: 8px; font-size: 15px; font-weight: 600; color: #4A4560; }
img.wide { display: block; width: 100%; }
.note { font-size: 19px; color: #4A4560; }
</style></head><body>
${cover}${entries}${rules}${formulas}${day}${scenarios}${edges}${pending}
</body></html>`;

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "msedge", headless: true });
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
console.log(`eleccion.pdf → ${OUT}`);
