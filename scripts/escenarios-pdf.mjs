// Genera escenarios.pdf (raíz del repo): las reglas propuestas de «VMC ahora» como diapositivas 16:9, una idea por página.
// Usa las mismas fórmulas que el feed de la demo (apps/index-lab/app/qa/home-index-rebase/feedPlan.ts), así el PDF y la
// página no se separan. Uso: node scripts/escenarios-pdf.mjs
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import {
  buildInventory, counts, DAY_MIN, describe, fmtMin, GAP_S, mockupsLeft, planDay, proposalsPerDay, registrosPerDay,
  rotationCap, rotationPerDay,
} from "../apps/index-lab/app/qa/home-index-rebase/feedPlan.ts";

const OUT = fileURLToPath(new URL("../escenarios.pdf", import.meta.url));
const HTML = process.env.ESCENARIOS_HTML; // opcional: guardar también el HTML (para revisar)

const SCENARIOS = [
  { id: "A", V: 0, N: 0, name: "Sin inventario" },
  { id: "B", V: 1, N: 0, name: "Una oferta en vivo" },
  { id: "C", V: 0, N: 1, name: "Una negociable" },
  { id: "D", V: 3, N: 2, name: "Pocas, mezcladas" },
  { id: "E", V: 0, N: 5, name: "5 negociables" },
  { id: "F", V: 6, N: 0, name: "6 en vivo" },
  { id: "G", V: 8, N: 2, name: "Ejemplo del documento" },
  { id: "H", V: 0, N: 10, name: "Puros negociables" },
  { id: "I", V: 10, N: 1, name: "10 en vivo y 1 negociable" },
  { id: "J", V: 6, N: 6, name: "Mitad y mitad" },
  { id: "K", V: 0, N: 20, name: "Muchas negociables" },
  { id: "L", V: 15, N: 15, name: "30 ofertas" },
  { id: "M", V: 40, N: 20, name: "60 ofertas" },
];
const rows = SCENARIOS.map((s) => ({ ...s, c: counts(s.V, s.N), plan: planDay(s.V, s.N) }));
const byId = (id) => rows.find((r) => r.id === id);
const G = byId("G").c;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const every = (min) => {
  if (!min) return "";
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h ? (m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`) : `${m} min`;
};
const pct = (x) => `${Math.round(x * 100)} %`;
const dec = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(1).replace(".", ","));
const zero = (n) => (n ? n : `<span class="muted">0</span>`);
const KIND = {
  rotacion: ["Rotación", "#00A8AB"], propuesta: ["Propuesta", "#7B5CE6"], nueva: ["Nueva", "#8460E5"], "nueva-subascars": ["Nueva", "#8460E5"],
  registro: ["Registro", "#9A7BF0"], "ad-valoriza": ["Publicidad", "#3B1782"], "ad-publica": ["Publicidad", "#3B1782"], blog: ["Blog", "#4A2CE0"],
};
const tag = (k) => `<span class="tag" style="--k:${KIND[k][1]}">${KIND[k][0]}</span>`;
const mock = `<span class="tag" style="--k:#C2410C">Mockup</span>`;

const slide = (kicker, title, body, sub = "") => `
<section class="slide">
  <p class="kicker">${kicker}</p>
  <h2>${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ""}
  <div class="body">${body}</div>
</section>`;
const table = (head, body, cls = "") => `<table class="${cls}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;

// ─── Diapositivas ────────────────────────────────────────────────────────────────────────────────────────────────────
const cover = `
<section class="slide cover">
  <p class="kicker">Propuesta para revisar con Julio · 26 de octubre de 2026</p>
  <h1>VMC ahora</h1>
  <p class="lead">Escenarios del feed según el inventario publicado</p>
  ${table("<th>Letra</th><th class=\"l\">Qué cuenta</th>", `
    <tr><td><b>V</b></td><td class="l">Ofertas en vivo</td></tr>
    <tr><td><b>N</b></td><td class="l">Ofertas negociables (las que reciben propuestas)</td></tr>
    <tr><td><b>T</b></td><td class="l">V + N: todo el inventario publicado, de cualquier tipo de bien</td></tr>
    <tr><td><b>Día</b></td><td class="l">De 9:00 a 24:00, 15 horas</td></tr>`, "narrow")}
</section>`;

const confirmed = slide("Punto de partida", "Lo que ya está confirmado", table("<th class=\"l\">Tema</th><th class=\"l\">Regla</th>", [
  ["Tipos de entrada", "Nueva oferta de empresa, nueva negociable de SubasCars, nuevo usuario, publicidad «Valoriza tu auto», publicidad «Publica tu auto y recibe ofertas», propuesta enviada, blog y rotación del inventario."],
  ["Separación", `${GAP_S} s entre entradas simuladas. Una acción real entra al momento y la cuenta vuelve a empezar.`],
  ["Aviso de propuesta", "Lo firma VMC, lleva una foto pequeña y no tiene enlace. Dice que la propuesta se envió, no que se aceptó."],
  ["Sin negociables", "No hay avisos de propuesta. Ese espacio va para publicidad o blog."],
  ["Rotación", "La oferta sale como disponible, nunca como recién publicada."],
  ["De 6 a 11 ofertas", "Cada oferta rota una sola vez al día."],
  ["Producción", "Los avisos de registros y propuestas tienen que ser hechos reales."],
].map(([a, b]) => `<tr><td class="l"><b>${a}</b></td><td class="l">${b}</td></tr>`).join(""), "rules"));

const formulas = slide("Fórmulas", "Cuántas entradas de cada tipo hay en un día", table(
  "<th class=\"l\">Entrada</th><th>Depende de</th><th class=\"l\">Fórmula propuesta</th><th>Con 8 en vivo<br>y 2 negociables</th>", [
    ["Rotación", "T", "De 1 a 5 ofertas: 3 × T. De 6 a 30: T. Más de 30: 30.", `${G.rot} al día`],
    ["Propuesta enviada", "N", "2 × N, con tope de 5 (1 a 4 negociables), 8 (5 a 11) o 12 (12 o más).", `${G.prop} al día`],
    ["Nuevo usuario", "T", "Ninguno si T = 0. Si no, 1 + T/4, hasta 6.", `${G.reg} al día`],
    ["Nueva oferta", "Publicación", "Entra cuando se publica. Ese día no rota.", `${G.nuevas} al día`],
    ["Publicidad y blog", "Actividad", "La mitad de las entradas de actividad, entre 6 y 15. Un tercio es blog. Con N = 0, 2 de blog más.", `${G.ads} + ${G.blog}`],
  ].map(([a, b, c, d]) => `<tr><td class="l"><b>${a}</b></td><td>${b}</td><td class="l">${c}</td><td class="num">${d}</td></tr>`).join(""), "rules"),
  "La actividad del día es la suma de rotación, propuestas, nuevas ofertas y registros.");

const Ts = [0, 1, 2, 3, 4, 5, 6, 8, 11, 12, 30, 60];
const rotation = slide("Fórmulas", "Rotación según el inventario (T)", `
<div class="split">
  ${table("<th>T</th><th>Al día</th><th>Una cada</th><th>Veces por oferta</th>", Ts.map((T) => {
    const r = rotationPerDay(T);
    return `<tr class="${T === 5 || T === 6 ? "hl" : ""}"><td><b>${T}</b></td><td>${zero(r)}</td><td>${every(r ? DAY_MIN / r : 0)}</td><td>${r ? (T > 30 ? `1 (30 de ${T})` : rotationCap(T)) : ""}</td></tr>`;
  }).join(""), "dense")}
  <div class="note">
    <p class="big">15 → 6</p>
    <p>Con 5 ofertas rotan 15 al día, una por hora. Con 6 rotan solo 6, porque desde ahí cada oferta sale una vez (regla de Julio).</p>
    <p class="muted">Con más inventario se ve menos inventario. Está en los choques.</p>
  </div>
</div>`);

const Ns = [0, 1, 2, 3, 4, 5, 8, 11, 12, 20, 30];
const proposals = slide("Fórmulas", "Avisos de propuesta según las negociables (N)", `
<div class="split">
  ${table("<th>N</th><th>Al día</th><th>Uno cada</th><th>Por negociable</th>", Ns.map((N) => {
    const p = proposalsPerDay(N);
    return `<tr class="${N === 0 ? "ok" : ""}"><td><b>${N}</b></td><td>${zero(p)}</td><td>${every(p ? DAY_MIN / p : 0)}</td><td>${p ? dec(p / N) : ""}</td></tr>`;
  }).join(""), "dense")}
  <div class="note">
    <p class="big">0 → 0</p>
    <p>Sin negociables no hay avisos de propuesta. Es lo único confirmado de esta tabla; los topes de 5, 8 y 12 son propuesta.</p>
    <p class="muted">Con 5 negociables sale un aviso cada 1 h 53, cerca de las 2 horas que se pidieron.</p>
  </div>
</div>`);

const mainTable = slide("Escenarios", "Entradas por día en cada escenario", table(
  "<th></th><th class=\"l\">Escenario</th><th>V</th><th>N</th><th>T</th><th>Rotación</th><th>Propuestas</th><th>Nuevas</th><th>Registros</th><th>Publicidad</th><th>Blog</th><th>Total</th><th>Promo</th>",
  rows.map(({ id, name, c }) => `<tr><td><b>${id}</b></td><td class="l">${esc(name)}</td><td>${c.V}</td><td>${c.N}</td><td><b>${c.T}</b></td>
    <td>${zero(c.rot)}</td><td>${zero(c.prop)}</td><td>${zero(c.nuevas)}</td><td>${zero(c.reg)}</td><td>${c.ads}</td><td>${c.blog}</td><td><b>${c.total}</b></td>
    <td class="${c.promoShare > 0.45 ? "warn" : ""}">${pct(c.promoShare)}</td></tr>`).join(""), "dense"),
  "Promo es publicidad más blog. En rojo, cuando pasa del 45 % del feed.");

const pace = slide("Escenarios", "Cada cuánto sale una entrada", table(
  "<th></th><th class=\"l\">Escenario</th><th>Total al día</th><th>En producción,<br>una cada</th><th>En la demo,<br>el día dura</th><th>Rotación,<br>una cada</th><th>Propuesta,<br>una cada</th>",
  rows.map(({ id, name, c }) => `<tr><td><b>${id}</b></td><td class="l">${esc(name)}</td><td><b>${c.total}</b></td><td>${every(DAY_MIN / c.total)}</td>
    <td>${every((c.total * GAP_S) / 60)}</td><td>${every(c.rotEvery)}</td><td>${every(c.propEvery)}</td></tr>`).join(""), "dense xs"),
  `La demo pasa el día completo con ${GAP_S} s entre entradas. En producción el mismo plan se reparte en 15 horas.`);

const mockTypes = slide("Mockups", "Qué es mockup hoy", table("<th class=\"l\">Entrada</th><th>Hoy</th><th class=\"l\">En producción</th><th>Depende de</th>", [
  ["Propuesta enviada", mock, "Real cuando Francis la conecte", "N"],
  ["Nuevo usuario", mock, "Real cuando se conecte", "T"],
  ["Nueva oferta", "Real", "Real", "Publicación"],
  ["Rotación", "Real", "Real", "T"],
  ["Publicidad y blog", "Contenido de VMC", "Igual", "Actividad"],
  ["Me gusta, contador y visitas", "Datos de ejemplo", "Los reales de la detail card", "Cada oferta"],
].map(([a, b, c, d]) => `<tr><td class="l"><b>${a}</b></td><td>${b}</td><td class="l">${c}</td><td>${d}</td></tr>`).join(""), "rules"),
  "Una propuesta o un registro mockup no se puede verificar, pero tiene que ser creíble para el inventario que se ve.");

const mockRules = slide("Mockups", "Reglas de los mockups", `<ol class="steps">
  <li>Sin inventario no hay mockups. Con 0 negociables no hay propuestas mockup.</li>
  <li>La cantidad sigue al inventario: 2 propuestas por negociable y 1 registro cada 4 ofertas, con topes.</li>
  <li>La propuesta mockup lleva un código de oferta aleatorio y una foto genérica. Solo aparece si hay negociables publicadas.</li>
  <li>Un mockup no cambia ningún contador de las ofertas del feed.</li>
  <li>Cada hecho real descuenta un mockup del mismo tipo. Los reales no tienen tope y nunca se ocultan.</li>
  <li>Cuando se conecten las propuestas y los registros reales, sus mockups se apagan.</li>
</ol>`);

const regTs = [0, 1, 4, 8, 12, 16, 20];
const mockScen = slide("Mockups", "Mockups por escenario", `
<div class="split wide">
  ${table("<th></th><th class=\"l\">Escenario</th><th>N</th><th>T</th><th>Propuestas</th><th>Registros</th><th>Total</th><th>Del feed</th><th>Con 2 propuestas<br>reales quedan</th>",
    rows.map(({ id, name, c }) => {
      const m = c.prop + c.reg;
      return `<tr><td><b>${id}</b></td><td class="l">${esc(name)}</td><td>${c.N}</td><td>${c.T}</td><td>${zero(c.prop)}</td><td>${zero(c.reg)}</td><td><b>${m}</b></td>
        <td class="${m / c.total > 0.3 ? "warn" : ""}">${pct(m / c.total)}</td><td>${c.prop ? mockupsLeft(c.prop, 2) : ""}</td></tr>`;
    }).join(""), "dense")}
  <div class="note small">
    <p>Registros mockup según T</p>
    ${table("<th>T</th><th>Al día</th>", regTs.map((T) => `<tr><td>${T}</td><td>${zero(registrosPerDay(T))}</td></tr>`).join(""), "mini")}
    <p class="muted">En rojo, más del 30 % del feed es mockup.</p>
  </div>
</div>`);

const actions = slide("Acciones", "Qué acciones lleva cada entrada", table("<th class=\"l\">Entrada</th><th class=\"l\">Acciones</th>", [
  ["Oferta en vivo, nueva o en rotación", "Me gusta, participantes, visitas y compartir"],
  ["Oferta negociable, nueva o en rotación", "Me gusta, negociaciones, visitas y compartir"],
  ["Propuesta enviada", "Compartir"],
  ["Nuevo usuario", "Compartir"],
  ["Publicidad", "Botón «Valorizar» o «Publicar», y compartir"],
  ["Blog", "Botón «Leer» y compartir"],
].map(([a, b]) => `<tr><td class="l"><b>${a}</b></td><td class="l">${b}</td></tr>`).join(""), "rules"),
  "Me gusta, el contador y las visitas son los mismos datos que muestra la detail card.");

const CLASHES = [
  ["Salto entre 5 y 6 ofertas", "Con 5 rotan 15 al día; con 6, solo 6.", "Aceptarlo, o 2 vueltas con 1 a 5 ofertas (con 5 serían 10).", "Julio"],
  ["45 s y reglas por día", `La demo pasa el día en ${every((G.total * GAP_S) / 60)}. En producción sale una entrada cada ${every(DAY_MIN / G.total)}.`, "Los 45 s son de la demo. En producción el feed sigue la hora real.", "Julio"],
  ["Propuestas en producción", "El tope de 5 es para mockups, pero en producción deben ser reales.", "Mockups hasta que Francis conecte las reales.", "Julio y Francis"],
  ["Muchas propuestas reales", "El tope no las oculta y el feed se llena de avisos iguales.", "Agruparlas: «3 usuarios enviaron su propuesta a la OFERTA 67942».", "Julio"],
  ["Oferta nueva que también rota", "Saldría como nueva y después como disponible.", "No rota el día que se publica.", "Aplicado"],
  ["Cero en vivo", "La cabecera dice «En vivo» sin subastas en vivo.", "Mostrar «En vivo» solo si V > 0 o hubo actividad real reciente.", "Julio"],
  ["Contadores en cero", "«0 participantes» hace ver vacía la oferta.", "«Sé el primero en participar» o «Sin negociaciones aún».", "Aplicado"],
  ["Ofertas que cierran", "Una subasta cerrada no debe rotar, y T baja durante el día.", "Rotar solo ofertas abiertas, primero las que cierran pronto.", "Julio"],
  ["Cero ofertas", `El feed queda con ${byId("A").c.total} entradas, todas de publicidad y blog.`, "Dejarlo así, ocultar el feed o poner «Pronto nuevas ofertas».", "Julio"],
  ["Más de 30 ofertas", "No caben todas en un día.", "Rotar 30 por prioridad y seguir al día siguiente.", "Julio"],
  ["Contador y propuesta mockup", "Si el mockup nombrara una oferta del feed, su contador lo desmentiría.", "Código de oferta aleatorio.", "Aplicado"],
  ["Una sola negociable", "Salen 2 propuestas mockup con códigos distintos.", "Aceptarlo, o 1 por negociable cuando N es 1 o 2.", "Julio"],
  ["Registros sin inventario", "Registros sin ofertas se ven falsos.", "Ningún registro mockup con T = 0.", "Aplicado"],
  ["Palabras del contador", "La detail card dice «ofertas» y «propuestas»; el feed, «participantes» y «negociaciones».", "Usar las mismas en los dos.", "Julio"],
  ["Muchos registros juntos", "Llenarían el feed.", "Agrupar: «5 personas se registraron en la última hora».", "Julio"],
  ["Rotación y propuesta real", "Si salen juntas sobre la misma oferta, parece que el feed repite.", "Separarlas al menos 1 hora.", "Julio"],
];
const clashSlide = (part, list) => slide("Choques", `Variables que chocan (${part} de 3)`, table(
  "<th class=\"l\">Choque</th><th class=\"l\">Qué pasa</th><th class=\"l\">Propuesta</th><th>Decide</th>",
  list.map(([a, b, c, d]) => `<tr><td class="l"><b>${a}</b></td><td class="l">${b}</td><td class="l">${c}</td><td class="${d === "Aplicado" ? "applied" : ""}">${d}</td></tr>`).join(""), "rules clash"));

const QUESTIONS = [
  "¿Tope de 5 propuestas mockup al día con 1 a 4 negociables?",
  "¿8 al día con 5 a 11 negociables y 12 con 12 o más?",
  "¿Máximo 2 propuestas por negociable al día?",
  "Con 1 a 5 ofertas, ¿3 vueltas al día o 2?",
  "Con 12 o más ofertas, ¿cada una una vez al día, hasta 30?",
  "¿Publicidad y blog en 1 de cada 3 entradas?",
  "Con 0 ofertas, ¿qué mostramos?",
  "¿«En vivo» en la cabecera solo cuando hay ofertas en vivo?",
  "¿Agrupamos propuestas y registros reales cuando llegan juntos?",
  "¿Registros mockup según el inventario, hasta 6 al día?",
  "En la propuesta mockup, ¿foto genérica o sin foto?",
  "¿Mismas palabras para el contador en la detail card y en el feed?",
];
const questions = slide("Para decidir", "Preguntas para Julio", `<ol class="steps two">${QUESTIONS.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>`);

// Plan del día: hasta 26 entradas por diapositiva, en dos columnas, con un texto corto por entrada.
const PER_COL = 13;
const short = (e, inv) => {
  const o = inv.find((x) => x.id === e.offerId);
  switch (e.kind) {
    case "rotacion": case "nueva": case "nueva-subascars": return `${o.lot} · ${o.mode === "vivo" ? "en vivo" : "negociable"}`;
    case "propuesta": return `Usuario ${e.user} → OFERTA ${o?.id ?? e.code}`;
    case "registro": return `Usuario ${e.user}`;
    case "ad-valoriza": return "Valoriza tu auto en VMC";
    case "ad-publica": return "Publica tu auto y recibe ofertas";
    default: return describe(e, inv).title;
  }
};
const dayTable = (list, inv, from) => table("<th>#</th><th>Hora</th><th class=\"l\">Tipo</th><th class=\"l\">Entrada</th><th></th>",
  list.map((e, i) => `<tr><td class="muted">${from + i + 1}</td><td>${fmtMin(e.min)}</td><td class="l">${tag(e.kind)}</td>
    <td class="l ellip">${esc(short(e, inv))}</td><td>${e.mock ? mock : ""}</td></tr>`).join(""), "day");
const daySlides = (id, label) => {
  const r = byId(id);
  const inv = buildInventory(r.V, r.N);
  const pages = Math.ceil(r.plan.length / (2 * PER_COL));
  return Array.from({ length: pages }, (_, p) => {
    const a = r.plan.slice(p * 2 * PER_COL, p * 2 * PER_COL + PER_COL);
    const b = r.plan.slice(p * 2 * PER_COL + PER_COL, (p + 1) * 2 * PER_COL);
    return slide("Un día completo", `${label}${pages > 1 ? ` (${p + 1} de ${pages})` : ""}`,
      `<div class="cols2">${dayTable(a, inv, p * 2 * PER_COL)}${b.length ? dayTable(b, inv, p * 2 * PER_COL + PER_COL) : "<div></div>"}</div>`,
      `Escenario ${r.id}: V = ${r.V}, N = ${r.N}. ${r.plan.length} entradas de 9:00 a 24:00; en la demo el día dura ${every((r.plan.length * GAP_S) / 60)}.`);
  }).join("");
};

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>VMC ahora · Escenarios</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
@page { size: 1280px 720px; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { font: 18px/1.4 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #1B1442; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.slide { position: relative; display: flex; flex-direction: column; width: 1280px; height: 720px; padding: 52px 64px 44px; overflow: hidden; break-after: page; background: #fff; }
.slide:last-child { break-after: auto; }
.kicker { margin: 0 0 6px; font-size: 14px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8460E5; }
h1 { margin: 0; font-size: 88px; line-height: 1; font-weight: 800; letter-spacing: -0.03em; color: #3B1782; }
h2 { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; color: #3B1782; }
.sub { margin: 10px 0 0; font-size: 18px; color: #5B5870; }
.lead { margin: 14px 0 36px; font-size: 28px; color: #4A4560; }
.body { flex: 1; min-height: 0; margin-top: 26px; }
.cover { justify-content: center; background: radial-gradient(70% 90% at 100% 0%, #F1ECFF 0%, #fff 60%); }
.muted { color: #8A879C; }
table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
th { padding: 10px 12px; font-size: 14px; font-weight: 700; line-height: 1.25; text-align: center; color: #fff; background: #3B1782; vertical-align: bottom; }
td { padding: 10px 12px; text-align: center; border-bottom: 1px solid #ECE8F6; }
tbody tr:nth-child(even) td { background: #FAF9FD; }
.l { text-align: left; }
.num { font-weight: 700; color: #3B1782; white-space: nowrap; }
td.warn { font-weight: 700; color: #B4380F; }
td.applied { font-weight: 700; color: #00777A; }
tr.hl td { background: #FFF1E4 !important; font-weight: 700; }
tr.ok td { background: #EAF8F5 !important; font-weight: 700; }
table.narrow { width: 720px; }
table.rules td { padding: 13px 14px; font-size: 18px; vertical-align: top; }
table.rules td:first-child { width: 26%; }
table.clash td { padding: 12px 14px; font-size: 18px; }
table.clash td:first-child { width: 22%; }
table.clash td:last-child { width: 12%; }
table.dense td { padding: 6px 10px; font-size: 16px; }
table.dense th { padding: 8px 10px; }
table.dense.xs td { padding: 5px 10px; }
table.mini td { padding: 5px 8px; font-size: 15px; }
table.day th { padding: 7px 8px; font-size: 13px; }
table.day td { padding: 5px 8px; font-size: 15px; }
td.ellip { max-width: 0; width: 64%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.split { display: grid; grid-template-columns: 1.25fr 1fr; gap: 48px; align-items: start; }
.split.wide { grid-template-columns: 1fr 200px; gap: 32px; }
.note p { margin: 0 0 14px; font-size: 20px; line-height: 1.45; }
.note .big { margin-bottom: 10px; font-size: 72px; line-height: 1; font-weight: 800; letter-spacing: -0.02em; color: #3B1782; }
.note.small p { font-size: 15px; }
.note.small p:first-child { font-weight: 700; color: #3B1782; }
.note.small table { margin-bottom: 12px; }
.cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.tag { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; color: var(--k); background: color-mix(in srgb, var(--k) 13%, #fff); }
ol.steps { margin: 0; padding: 0; list-style: none; counter-reset: s; display: grid; gap: 14px; }
ol.steps li { counter-increment: s; display: grid; grid-template-columns: 48px 1fr; gap: 16px; align-items: center; font-size: 22px; line-height: 1.35; }
ol.steps li::before { content: counter(s); display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; font-size: 18px; font-weight: 800; color: #fff; background: #8460E5; }
ol.steps.two { grid-template-columns: 1fr 1fr; gap: 18px 40px; }
ol.steps.two li { font-size: 19px; }
</style></head><body>
${cover}
${confirmed}
${formulas}
${rotation}
${proposals}
${mainTable}
${pace}
${mockTypes}
${mockRules}
${mockScen}
${actions}
${clashSlide(1, CLASHES.slice(0, 6))}
${clashSlide(2, CLASHES.slice(6, 11))}
${clashSlide(3, CLASHES.slice(11))}
${questions}
${daySlides("A", "Sin inventario")}
${daySlides("G", "8 en vivo y 2 negociables")}
${daySlides("E", "5 negociables")}
</body></html>`;

if (HTML) await writeFile(HTML, html);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
// Comprobación: ninguna diapositiva puede pasarse de su alto (720 px menos el margen de abajo).
const over = await page.evaluate(() => [...document.querySelectorAll(".slide")].map((el, i) => {
  const bottom = Math.max(...[...el.querySelectorAll(".body *, h2, .sub")].map((c) => c.getBoundingClientRect().bottom)) - el.getBoundingClientRect().top;
  return { i: i + 1, bottom: Math.round(bottom) };
}).filter((x) => x.bottom > 676));
if (over.length) console.warn("Diapositivas que se pasan:", over);
await page.pdf({ path: OUT, width: "1280px", height: "720px", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`escenarios.pdf → ${OUT}`);
