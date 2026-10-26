// Genera escenarios.pdf (raíz del repo): las reglas propuestas de «VMC ahora» como diapositivas 16:9, una idea por página.
// Usa las mismas fórmulas que el feed de la demo (apps/index-lab/app/qa/home-index-rebase/feedPlan.ts), así el PDF y la
// página no se separan. El texto del PDF va en español llano: sin letras sueltas (V, N, T), sin comillas angulares y
// sin palabras en inglés. Uso: node scripts/escenarios-pdf.mjs
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import {
  buildInventory, counts, DAY_MIN, describe, fmtMin, GAP_S, mockupsLeft, planDay, proposalsPerDay, registrosPerDay,
  rotationCap, rotationPerDay,
} from "../apps/index-lab/app/qa/home-index-rebase/feedPlan.ts";

const OUT = fileURLToPath(new URL("../escenarios.pdf", import.meta.url));
const HTML = process.env.ESCENARIOS_HTML; // opcional: guardar también el HTML (para revisar)

// Escenarios: ofertas en vivo y negociables.
const SCENARIOS = [[0, 0], [1, 0], [0, 1], [3, 2], [0, 5], [6, 0], [8, 2], [0, 10], [10, 1], [6, 6], [0, 20], [15, 15], [40, 20]];
const rows = SCENARIOS.map(([V, N]) => ({ V, N, c: counts(V, N), plan: planDay(V, N) }));
const find = (V, N) => rows.find((r) => r.V === V && r.N === N);
const G = find(8, 2).c;
const name = (V, N) => {
  if (!V && !N) return "Sin ofertas";
  const vivo = V ? `${V} en vivo` : "";
  const neg = N ? `${N} negociable${N === 1 ? "" : "s"}` : "";
  return [vivo, neg].filter(Boolean).join(" y ");
};

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
// Colores de la card de Tipo de oferta: en vivo naranja, negociable cian (y las propuestas); el resto, morado.
const tag = (k, mode) => `<span class="tag" style="--k:${mode === "vivo" ? "#C2410C" : mode === "negociable" || k === "propuesta" ? "#00777A" : "#7B5CE6"}">${KIND[k][0]}</span>`;
const sim = (label = "Simulada") => `<span class="tag" style="--k:#C2410C">${label}</span>`;

const slide = (title, body, sub = "") => `
<section class="slide">
  <h2>${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ""}
  <div class="body">${body}</div>
</section>`;
const table = (head, body, cls = "") => `<table class="${cls}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
const ruleRows = (list) => list.map(([a, ...rest]) => `<tr><td class="l"><b>${a}</b></td>${rest.map((x) => `<td class="l">${x}</td>`).join("")}</tr>`).join("");

// ─── Diapositivas ────────────────────────────────────────────────────────────────────────────────────────────────────
const cover = `
<section class="slide cover">
  <h1>VMC ahora</h1>
  <p class="lead">Escenarios según el inventario publicado</p>
  <p class="meta">Propuesta para revisar con Julio. 26 de octubre de 2026.</p>
  ${table("<th class=\"l\">Término</th><th class=\"l\">Qué cuenta</th>", ruleRows([
    ["En vivo", "Ofertas en subasta en vivo"],
    ["Negociables", "Ofertas que reciben propuestas"],
    ["Total de ofertas", "Todas las publicadas, en vivo y negociables, de cualquier tipo de bien"],
    ["Día", "De 9:00 a 24:00"],
  ]), "rules narrow")}
</section>`;

const confirmed = slide("Reglas confirmadas", table("<th class=\"l\">Tema</th><th class=\"l\">Regla</th>", ruleRows([
  ["Tipos de entrada", "Nueva oferta de empresa, nueva negociable de SubasCars, nuevo usuario, publicidad \"Valoriza tu auto en VMC\", publicidad \"Publica tu auto en VMC y recibe ofertas\", propuesta enviada, blog y rotación del inventario."],
  ["Separación", `${GAP_S} segundos entre entradas simuladas. Una acción real entra en el momento y desde ella se cuentan los ${GAP_S} segundos.`],
  ["Aviso de propuesta", "Lo firma VMC y no tiene enlace. Dice que la propuesta se envió, no que se aceptó. Lleva la foto de la oferta solo si es real."],
  ["Privacidad", "Los avisos de propuestas y registros no muestran quién fue: \"Se ha enviado una propuesta a la OFERTA 67942\"."],
  ["Sin negociables", "No hay avisos de propuesta. En ese espacio va publicidad o blog."],
  ["Rotación", "La oferta sale como disponible, no como recién publicada."],
  ["De 6 a 11 ofertas", "Cada oferta rota una vez al día."],
  ["Acciones", "En vivo: me gusta, participantes y compartir. Negociable: me gusta, negociaciones y compartir."],
  ["Producción", "Los registros y las propuestas que se muestren tienen que ser reales."],
]), "rules snug"));

const formulas = slide("Fórmulas", table("<th class=\"l\">Entrada</th><th class=\"l\">Depende de</th><th class=\"l\">Fórmula</th><th>Con 8 en vivo<br>y 2 negociables</th>", [
  ["Rotación", "Total de ofertas", "De 1 a 5 ofertas, 3 veces cada una. De 6 a 30, una vez cada una. Con más de 30, 30 al día.", G.rot],
  ["Propuesta enviada", "Negociables", "2 por negociable, hasta 5 (de 1 a 4 negociables), 8 (de 5 a 11) o 12 (12 o más).", G.prop],
  ["Nuevo usuario", "Total de ofertas", "Ninguno sin ofertas. Si hay, 1 más 1 por cada 4 ofertas, hasta 6.", G.reg],
  ["Nueva oferta", "Publicación", "Sale cuando se publica. Ese día no rota.", G.nuevas],
  ["Publicidad y blog", "Actividad del día", "La mitad de la actividad del día, entre 6 y 15. Un tercio es blog. Sin negociables, 2 de blog más.", `${G.ads} y ${G.blog}`],
  ["Actividad del día", "", "Rotación + propuestas + nuevas ofertas + registros.", G.rot + G.prop + G.nuevas + G.reg],
  ["Al abrir la página", "Cada visita", "La primera entrada es una publicidad. En cada visita se alterna entre las dos.", 1],
  ["Visitas, me gusta y participantes", "Tiempo publicada", "Empiezan en 0 y crecen: a las 6 horas, cerca del 63 % del tope. Visitas hasta 120 a 500; las ofertas muy buenas, 600 a 800.", "0 al publicar"],
].map(([a, b, c, d]) => `<tr><td class="l"><b>${a}</b></td><td class="l">${b}</td><td class="l">${c}</td><td class="num">${d}</td></tr>`).join(""), "rules snug"));

const Ts = [0, 1, 2, 3, 4, 5, 6, 8, 11, 12, 30, 60];
const Ns = [0, 1, 2, 3, 4, 5, 8, 11, 12, 20, 30];
const curves = slide("Rotación y avisos de propuesta", `
<div class="cols2 gap">
  <div><h3>Rotación según el total de ofertas</h3>
  ${table("<th>Ofertas</th><th>Al día</th><th>Una cada</th><th>Veces por oferta</th>", Ts.map((T) => {
    const r = rotationPerDay(T);
    return `<tr class="${T === 5 || T === 6 ? "hl" : ""}"><td><b>${T}</b></td><td>${zero(r)}</td><td>${every(r ? DAY_MIN / r : 0)}</td><td>${r ? (T > 30 ? `1 (30 de ${T})` : rotationCap(T)) : ""}</td></tr>`;
  }).join(""), "dense")}</div>
  <div><h3>Avisos de propuesta según las negociables</h3>
  ${table("<th>Negociables</th><th>Al día</th><th>Uno cada</th><th>Por negociable</th>", Ns.map((N) => {
    const p = proposalsPerDay(N);
    return `<tr><td><b>${N}</b></td><td>${zero(p)}</td><td>${every(p ? DAY_MIN / p : 0)}</td><td>${p ? dec(p / N) : ""}</td></tr>`;
  }).join(""), "dense")}</div>
</div>`);

const mainTable = slide("Entradas por día", table(
  "<th>En vivo</th><th>Negociables</th><th>Ofertas</th><th>Rotación</th><th>Propuestas</th><th>Nuevas</th><th>Registros</th><th>Publicidad</th><th>Blog</th><th>Entradas</th><th>Publicidad<br>y blog</th>",
  rows.map(({ V, N, c }) => `<tr><td>${V}</td><td>${N}</td><td><b>${c.T}</b></td>
    <td>${zero(c.rot)}</td><td>${zero(c.prop)}</td><td>${zero(c.nuevas)}</td><td>${zero(c.reg)}</td><td>${c.ads}</td><td>${c.blog}</td><td><b>${c.total}</b></td>
    <td class="${c.promoShare > 0.45 ? "warn" : ""}">${pct(c.promoShare)}</td></tr>`).join(""), "dense"),
  "En rojo, más del 45 % es publicidad y blog.");

const pace = slide("Frecuencia de las entradas", table(
  "<th>En vivo</th><th>Negociables</th><th>Entradas<br>al día</th><th>En producción,<br>una cada</th><th>En la demo,<br>el día dura</th><th>Rotación,<br>una cada</th><th>Propuesta,<br>una cada</th>",
  rows.map(({ V, N, c }) => `<tr><td>${V}</td><td>${N}</td><td><b>${c.total}</b></td><td>${every(DAY_MIN / c.total)}</td>
    <td>${every((c.total * GAP_S) / 60)}</td><td>${every(c.rotEvery)}</td><td>${every(c.propEvery)}</td></tr>`).join(""), "dense xs"));

const simTypes = slide("Qué es simulado", table("<th class=\"l\">Entrada</th><th>Hoy</th><th class=\"l\">En producción</th><th class=\"l\">Depende de</th>", [
  ["Propuesta enviada", sim(), "Real cuando Francis la conecte", "Negociables"],
  ["Nuevo usuario", sim("Simulado"), "Real cuando se conecte", "Total de ofertas"],
  ["Nueva oferta", "Real", "Real", "Publicación"],
  ["Rotación", "Real", "Real", "Total de ofertas"],
  ["Publicidad y blog", "Contenido de VMC", "Contenido de VMC", "Actividad del día"],
  ["Me gusta, contador y visitas", "De ejemplo", "Los de la ficha de la oferta", "Cada oferta"],
].map(([a, b, c, d]) => `<tr><td class="l"><b>${a}</b></td><td>${b}</td><td class="l">${c}</td><td class="l">${d}</td></tr>`).join(""), "rules"));

const simRules = slide("Reglas de lo simulado", `<ol class="steps">
  <li>Sin ofertas no se simula nada. Sin negociables no hay propuestas simuladas.</li>
  <li>La cantidad depende de lo publicado: 2 propuestas por negociable y 1 registro más por cada 4 ofertas, con topes.</li>
  <li>La propuesta simulada usa un código de oferta al azar y no lleva foto. La real lleva la foto de su oferta.</li>
  <li>Lo simulado no cambia el contador de ninguna oferta.</li>
  <li>Cada hecho real reemplaza a uno simulado del mismo tipo. Los reales no tienen tope.</li>
  <li>Cuando se conecten las propuestas y los registros reales, se deja de simular.</li>
</ol>`);

const regTs = [0, 1, 4, 8, 12, 16, 20];
const simScen = slide("Entradas simuladas por escenario", `
<div class="split">
  ${table("<th>En vivo</th><th>Negociables</th><th>Propuestas</th><th>Registros</th><th>Simuladas</th><th>Parte<br>del día</th><th>Con 2 propuestas<br>reales, quedan</th>",
    rows.map(({ V, N, c }) => {
      const m = c.prop + c.reg;
      return `<tr><td>${V}</td><td>${N}</td><td>${zero(c.prop)}</td><td>${zero(c.reg)}</td><td><b>${m}</b></td>
        <td class="${m / c.total > 0.3 ? "warn" : ""}">${pct(m / c.total)}</td><td>${c.prop ? mockupsLeft(c.prop, 2) : ""}</td></tr>`;
    }).join(""), "dense")}
  <div><h3>Registros según el total</h3>
    ${table("<th>Ofertas</th><th>Al día</th>", regTs.map((T) => `<tr><td>${T}</td><td>${zero(registrosPerDay(T))}</td></tr>`).join(""), "mini")}
  </div>
</div>`, "En rojo, más del 30 % del día es simulado.");

const actions = slide("Acciones por tipo de entrada", table("<th class=\"l\">Entrada</th><th class=\"l\">Acciones</th>", ruleRows([
  ["Oferta en vivo, nueva o en rotación", "Me gusta, participantes, visitas y compartir"],
  ["Oferta negociable, nueva o en rotación", "Me gusta, negociaciones, visitas y compartir"],
  ["Propuesta enviada", "Compartir"],
  ["Nuevo usuario", "Compartir"],
  ["Publicidad", "Botón Valorizar o Publicar, y compartir"],
  ["Blog", "Botón Leer y compartir"],
]), "rules"));

const CLASHES = [
  ["Salto entre 5 y 6 ofertas", "Con 5 ofertas rotan 15 al día y con 6, solo 6.", "Dejarlo así, o 2 vueltas de 1 a 5 ofertas (con 5 serían 10).", "Julio"],
  ["45 segundos y reglas por día", `La demo muestra el día entero en ${every((G.total * GAP_S) / 60)}. En producción sale una entrada cada ${every(DAY_MIN / G.total)}.`, "Los 45 segundos son solo de la demo. En producción se sigue la hora real.", "Julio"],
  ["Propuestas en producción", "El tope de 5 al día es para propuestas simuladas, y en producción tienen que ser reales.", "Simularlas hasta que Francis conecte las reales.", "Julio y Francis"],
  ["Muchas propuestas reales", "Ningún tope las oculta, así que se llenaría de avisos iguales.", "Juntarlas en un aviso: \"Se enviaron 3 propuestas a la OFERTA 67942\".", "Julio"],
  ["Oferta nueva que también rota", "Saldría como nueva y después como disponible.", "No rota el día en que se publica.", "Aplicado"],
  ["Ninguna oferta en vivo", "La cabecera dice \"En vivo\" aunque no haya subastas en vivo.", "Mostrar \"En vivo\" solo si hay ofertas en vivo o actividad real reciente.", "Julio"],
  ["Contadores en cero", "\"0 participantes\" hace ver vacía la oferta.", "Cambiar el 0 por \"Sé el primero en participar\" o \"Sin negociaciones aún\".", "Aplicado"],
  ["Ofertas que cierran", "Una subasta cerrada no debe rotar, y el total baja durante el día.", "Rotar solo ofertas abiertas, primero las que cierran antes.", "Julio"],
  ["Sin ofertas", `Quedan ${find(0, 0).c.total} entradas al día, todas de publicidad y blog.`, "Dejarlo así, ocultar VMC ahora o poner \"Pronto nuevas ofertas\".", "Julio"],
  ["Más de 30 ofertas", "No caben todas en un día.", "Rotar 30 al día por prioridad y seguir al día siguiente.", "Julio"],
  ["Contador y propuesta simulada", "Si la propuesta simulada nombrara una oferta visible, su contador no subiría.", "Usar un código de oferta al azar.", "Aplicado"],
  ["Una sola negociable", "Salen 2 propuestas simuladas con códigos distintos.", "Dejarlo así, o 1 por negociable cuando hay 1 o 2.", "Julio"],
  ["Registros sin ofertas", "Usuarios nuevos sin ninguna oferta publicada no son creíbles.", "Sin ofertas no hay registros simulados.", "Aplicado"],
  ["Palabras del contador", "La ficha de la oferta dice \"ofertas\" y \"propuestas\"; VMC ahora dice \"participantes\" y \"negociaciones\".", "Usar las mismas palabras en los dos.", "Julio"],
  ["Muchos registros juntos", "Llenarían VMC ahora.", "Juntarlos: \"5 personas se registraron en la última hora\".", "Julio"],
  ["Rotación y propuesta real juntas", "Sobre la misma oferta, parece que se repite.", "Separarlas al menos una hora.", "Julio"],
];
const clashSlide = (part, list) => slide(`Problemas por resolver (${part} de 3)`, table(
  "<th class=\"l\">Problema</th><th class=\"l\">Qué pasa</th><th class=\"l\">Propuesta</th><th>Decide</th>",
  list.map(([a, b, c, d]) => `<tr><td class="l"><b>${a}</b></td><td class="l">${esc(b)}</td><td class="l">${esc(c)}</td><td class="${d === "Aplicado" ? "applied" : ""}">${d}</td></tr>`).join(""), "rules clash"));

const QUESTIONS = [
  "¿Tope de 5 propuestas simuladas al día con 1 a 4 negociables?",
  "¿8 al día con 5 a 11 negociables, y 12 con 12 o más?",
  "¿Máximo 2 propuestas por negociable al día?",
  "Con 1 a 5 ofertas, ¿3 vueltas al día o 2?",
  "Con 12 ofertas o más, ¿una vez cada una al día, hasta 30?",
  "¿Publicidad y blog en 1 de cada 3 entradas?",
  "Sin ofertas, ¿qué mostramos?",
  "¿\"En vivo\" en la cabecera solo cuando hay ofertas en vivo?",
  "¿Juntamos propuestas y registros reales cuando llegan varios seguidos?",
  "¿Registros simulados según el total de ofertas, hasta 6 al día?",
  "¿Mismas palabras en el contador de la ficha y en VMC ahora?",
  "¿Publicidad siempre primera al abrir la página, alternando las dos en cada visita?",
];
const questions = slide("Preguntas para Julio", `<ol class="steps two">${QUESTIONS.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>`);

// Plan del día: hasta 26 entradas por diapositiva, en dos columnas, con un texto corto por entrada.
const PER_COL = 13;
const short = (e, inv) => {
  const o = inv.find((x) => x.id === e.offerId);
  switch (e.kind) {
    case "rotacion": case "nueva": case "nueva-subascars": return `${o.lot}, ${o.mode === "vivo" ? "en vivo" : "negociable"}`;
    case "propuesta": return `Propuesta enviada a la OFERTA ${o?.id ?? e.code}`;
    case "registro": return "Nuevo usuario en VMC";
    case "ad-valoriza": return "Valoriza tu auto en VMC";
    case "ad-publica": return "Publica tu auto y recibe ofertas";
    default: return describe(e, inv).title;
  }
};
const dayTable = (list, inv, from) => table("<th>#</th><th>Hora</th><th class=\"l\">Tipo</th><th class=\"l\">Entrada</th><th>Origen</th>",
  list.map((e, i) => `<tr><td class="muted">${from + i + 1}</td><td>${fmtMin(e.min)}</td><td class="l">${tag(e.kind, inv.find((x) => x.id === e.offerId)?.mode)}</td>
    <td class="l ellip">${esc(short(e, inv))}</td><td>${e.mock ? sim(e.kind === "registro" ? "Simulado" : "Simulada") : `<span class="muted">Real</span>`}</td></tr>`).join(""), "day");
const daySlides = (V, N) => {
  const r = find(V, N);
  const inv = buildInventory(V, N);
  const pages = Math.ceil(r.plan.length / (2 * PER_COL));
  const title = V || N ? `Un día con ${name(V, N)}` : "Un día sin ofertas";
  return Array.from({ length: pages }, (_, p) => {
    const a = r.plan.slice(p * 2 * PER_COL, p * 2 * PER_COL + PER_COL);
    const b = r.plan.slice(p * 2 * PER_COL + PER_COL, (p + 1) * 2 * PER_COL);
    return slide(`${title}${pages > 1 ? ` (${p + 1} de ${pages})` : ""}`,
      `<div class="cols2">${dayTable(a, inv, p * 2 * PER_COL)}${b.length ? dayTable(b, inv, p * 2 * PER_COL + PER_COL) : "<div></div>"}</div>`,
      `${r.plan.length} entradas entre las 9:00 y las 24:00. En la demo el día dura ${every((r.plan.length * GAP_S) / 60)}.`);
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
h1 { margin: 0; font-size: 88px; line-height: 1; font-weight: 800; letter-spacing: -0.03em; color: #3B1782; }
h2 { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; color: #3B1782; }
h3 { margin: 0 0 10px; font-size: 18px; font-weight: 700; color: #3B1782; }
.sub { margin: 10px 0 0; font-size: 18px; color: #5B5870; }
.lead { margin: 16px 0 6px; font-size: 30px; color: #4A4560; }
.meta { margin: 0 0 36px; font-size: 18px; color: #8A879C; }
.body { flex: 1; min-height: 0; margin-top: 26px; }
.cover { justify-content: center; background: radial-gradient(70% 90% at 100% 0%, #F1ECFF 0%, #fff 60%); }
.muted { color: #8A879C; }
table { width: 100%; border-collapse: collapse; }
th { padding: 10px 12px; font-size: 14px; font-weight: 700; line-height: 1.25; text-align: center; color: #fff; background: #3B1782; vertical-align: bottom; }
td { padding: 10px 12px; text-align: center; border-bottom: 1px solid #ECE8F6; }
tbody tr:nth-child(even) td { background: #FAF9FD; }
.l { text-align: left; }
.num { font-weight: 700; color: #3B1782; white-space: nowrap; }
td.warn { font-weight: 700; color: #B4380F; }
td.applied { font-weight: 700; color: #00777A; }
tr.hl td { background: #FFF1E4 !important; font-weight: 700; }
table.narrow { width: 820px; }
table.rules td { padding: 12px 14px; font-size: 18px; vertical-align: top; }
table.rules td:first-child { width: 26%; }
table.rules.snug td { padding: 9px 14px; font-size: 17px; }
table.clash td { padding: 12px 14px; font-size: 18px; }
table.clash td:first-child { width: 22%; }
table.clash td:last-child { width: 12%; }
table.dense td { padding: 6px 10px; font-size: 16px; }
table.dense th { padding: 8px 10px; }
table.dense.xs td { padding: 5px 10px; }
table.mini td { padding: 6px 8px; font-size: 16px; }
table.day th { padding: 7px 8px; font-size: 13px; }
table.day td { padding: 5px 8px; font-size: 15px; }
td.ellip { max-width: 0; width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.split { display: grid; grid-template-columns: 1fr 220px; gap: 40px; align-items: start; }
.cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
.cols2.gap { gap: 48px; }
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
${curves}
${mainTable}
${pace}
${simTypes}
${simRules}
${simScen}
${actions}
${clashSlide(1, CLASHES.slice(0, 6))}
${clashSlide(2, CLASHES.slice(6, 11))}
${clashSlide(3, CLASHES.slice(11))}
${questions}
${daySlides(0, 0)}
${daySlides(8, 2)}
${daySlides(0, 5)}
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
