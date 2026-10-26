// Genera escenarios.pdf (raíz del repo): reglas propuestas de «VMC ahora» por escenario de inventario.
// Usa las mismas fórmulas que el feed de la demo (apps/index-lab/app/qa/home-index-rebase/feedPlan.ts), así el PDF y la
// página no se separan. Uso: node scripts/escenarios-pdf.mjs
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import {
  buildInventory, checkPlan, counts, DAY_MIN, describe, fmtMin, GAP_S, planDay, proposalsPerDay, rotationCap, rotationPerDay,
  PROMO_MAX, PROMO_MIN, BLOG_SIN_NEGOCIABLES, REGISTROS_MAX, mockupsLeft, registrosPerDay,
} from "../apps/index-lab/app/qa/home-index-rebase/feedPlan.ts";

const OUT = fileURLToPath(new URL("../escenarios.pdf", import.meta.url));
const HTML = process.env.ESCENARIOS_HTML; // opcional: guardar también el HTML (para revisar)

const SCENARIOS = [
  { id: "A", V: 0, N: 0, name: "Sin inventario" },
  { id: "B", V: 1, N: 0, name: "Una sola oferta en vivo" },
  { id: "C", V: 0, N: 1, name: "Una sola negociable" },
  { id: "D", V: 3, N: 2, name: "Pocas, mezcladas" },
  { id: "E", V: 0, N: 5, name: "5 negociables (ejemplo de Aaron)" },
  { id: "F", V: 6, N: 0, name: "Solo en vivo, 6" },
  { id: "G", V: 8, N: 2, name: "Ejemplo del documento" },
  { id: "H", V: 0, N: 10, name: "Puros negociables" },
  { id: "I", V: 10, N: 1, name: "Varios en vivo, una negociable" },
  { id: "J", V: 6, N: 6, name: "12 ofertas, mitad y mitad" },
  { id: "K", V: 0, N: 20, name: "Muchas negociables" },
  { id: "L", V: 15, N: 15, name: "30 ofertas" },
  { id: "M", V: 40, N: 20, name: "60 ofertas" },
];
const DAYS = ["A", "E", "G", "L"]; // escenarios con el plan del día completo

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const every = (min) => {
  if (!min) return "—";
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return h ? (m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`) : `${m} min`;
};
const pct = (x) => `${Math.round(x * 100)} %`;
const KIND = {
  rotacion: ["Rotación", "#00A8AB"], propuesta: ["Propuesta enviada", "#7B5CE6"], nueva: ["Nueva · empresa", "#8460E5"],
  "nueva-subascars": ["Nueva · SubasCars", "#8460E5"], registro: ["Nuevo usuario", "#9A7BF0"], "ad-valoriza": ["Publicidad · Valoriza", "#3B1782"],
  "ad-publica": ["Publicidad · Publica", "#3B1782"], blog: ["Blog", "#4A2CE0"],
};
const tag = (k) => `<span class="tag" style="--k:${KIND[k][1]}">${KIND[k][0]}</span>`;

// ─── Tabla principal ─────────────────────────────────────────────────────────────────────────────────────────────────
const rows = SCENARIOS.map((s) => {
  const c = counts(s.V, s.N);
  const plan = planDay(s.V, s.N);
  const chk = checkPlan(plan);
  return { ...s, c, plan, chk };
});
const mainTable = `
<table class="grid compact">
  <thead><tr>
    <th>Esc.</th><th class="l">Escenario</th><th>V<br><small>en vivo</small></th><th>N<br><small>negoc.</small></th><th>T<br><small>total</small></th>
    <th>Rotación<br><small>por día · cada</small></th><th>Veces por<br><small>oferta al día</small></th><th>Propuestas<br><small>mockup · cada</small></th>
    <th>Nuevas<br><small>hoy</small></th><th>Registros<br><small>mockup</small></th><th>Publicidad</th><th>Blog</th><th>Total<br><small>por día</small></th>
    <th>Promo<br><small>% del feed</small></th><th>Producción<br><small>1 entrada cada</small></th><th>Demo<br><small>ciclo a 45 s</small></th>
  </tr></thead>
  <tbody>${rows.map(({ id, name, c }) => `<tr>
    <td><b>${id}</b></td><td class="l">${esc(name)}</td><td>${c.V}</td><td>${c.N}</td><td><b>${c.T}</b></td>
    <td>${c.rot ? `${c.rot} · ${every(c.rotEvery)}` : "0"}</td><td>${c.rot ? (c.rotRepeat >= 2 ? `${c.rotRepeat} (≥ 5 h)` : "1") : "—"}</td>
    <td>${c.prop ? `${c.prop} · ${every(c.propEvery)}` : `<span class="muted">0</span>`}</td>
    <td>${c.nuevas}</td><td>${c.reg}</td><td>${c.ads}</td><td>${c.blog}</td><td><b>${c.total}</b></td>
    <td class="${c.promoShare > 0.45 ? "warn" : ""}">${pct(c.promoShare)}</td><td>${every(DAY_MIN / c.total)}</td><td>${every((c.total * GAP_S) / 60)}</td>
  </tr>`).join("")}</tbody>
</table>`;

// ─── Curvas de las fórmulas ──────────────────────────────────────────────────────────────────────────────────────────
const Ts = [0, 1, 2, 3, 4, 5, 6, 8, 10, 11, 12, 15, 20, 30, 40, 60];
const rotTable = `
<table class="grid tight">
  <thead><tr><th>T</th><th>Rotaciones<br><small>por día</small></th><th>Cada</th><th>Veces por<br><small>oferta</small></th><th class="l">Tramo</th></tr></thead>
  <tbody>${Ts.map((T) => {
    const r = rotationPerDay(T);
    const tramo = T === 0 ? "Sin inventario" : T <= 5 ? "1–5 · 3 vueltas (propuesta)" : T <= 11 ? "6–11 · una vez (Julio)" : T <= 30 ? "12–30 · una vez (propuesta)" : "> 30 · 30 por prioridad";
    return `<tr class="${T === 5 || T === 6 ? "hl" : ""}"><td><b>${T}</b></td><td>${r}</td><td>${every(r ? DAY_MIN / r : 0)}</td><td>${r ? (T > 30 ? "1 (30 de " + T + ")" : rotationCap(T)) : "—"}</td><td class="l">${tramo}</td></tr>`;
  }).join("")}</tbody>
</table>`;
const Ns = [0, 1, 2, 3, 4, 5, 8, 11, 12, 20, 30];
const propTable = `
<table class="grid tight">
  <thead><tr><th>N</th><th>Propuestas<br><small>por día</small></th><th>Cada</th><th>Por oferta<br><small>al día</small></th><th class="l">Tramo</th></tr></thead>
  <tbody>${Ns.map((N) => {
    const p = proposalsPerDay(N);
    const tramo = N === 0 ? "Sin avisos (confirmado)" : N <= 4 ? "1–4 · tope 5 (propuesto)" : N <= 11 ? "5–11 · tope 8 (~2 h)" : "12+ · tope 12";
    return `<tr><td><b>${N}</b></td><td>${p}</td><td>${every(p ? DAY_MIN / p : 0)}</td><td>${p ? (p / N).toFixed(p % N ? 1 : 0).replace(".", ",") : "—"}</td><td class="l">${tramo}</td></tr>`;
  }).join("")}</tbody>
</table>`;

// ─── Plan del día ────────────────────────────────────────────────────────────────────────────────────────────────────
const dayTable = (s) => {
  const r = rows.find((x) => x.id === s);
  const inv = buildInventory(r.V, r.N);
  return `
<section class="page">
  <h2>Escenario ${r.id} · ${esc(r.name)} <small>V = ${r.V} · N = ${r.N} · T = ${r.c.T} · ${r.plan.length} entradas de 9:00 a 24:00</small></h2>
  <p class="lead">Cada fila es una entrada del feed a su hora del día. En la demo se reproducen en este orden con 45 s entre una y otra
  (ciclo de ${every((r.plan.length * GAP_S) / 60)}). Comprobación: ${r.chk.promoRun > 1 ? `hasta <b>${r.chk.promoRun}</b> promocionales seguidas (no hay actividad para intercalar)` : "nunca dos promocionales seguidas"}${Number.isFinite(r.chk.propNear) ? ` · la propuesta más cercana a su oferta en el feed queda a <b>${every(r.chk.propNear)}</b>` : ""}.</p>
  <table class="grid day">
    <thead><tr><th>#</th><th>Hora</th><th class="l">Tipo</th><th class="l">Autor</th><th class="l">Entrada</th><th class="l">Contador</th><th>En producción</th></tr></thead>
    <tbody>${r.plan.map((e, i) => {
      const t = describe(e, inv);
      const n = t.count ?? 0;
      const count = t.mode ? `${n} ${t.mode === "vivo" ? (n === 1 ? "participante" : "participantes") : n === 1 ? "negociación" : "negociaciones"}` : "";
      return `<tr><td>${i + 1}</td><td>${fmtMin(e.min)}</td><td class="l">${tag(e.kind)}</td><td class="l">${esc(t.author)}</td><td class="l">${esc(t.title)}${t.detail ? `<span class="muted"> · ${esc(t.detail)}</span>` : ""}</td><td class="l">${count}</td><td>${e.mock ? `<span class="tag" style="--k:#C2410C">Mockup</span>` : `<span class="muted">Real</span>`}</td></tr>`;
    }).join("")}</tbody>
  </table>
</section>`;
};

// ─── Mockups ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const MOCK_TYPES = [
  ["Propuesta enviada", "Mockup", "Mockup hasta que Francis conecte las reales; después, real", "N", "Pm = mín(2·N, tope) − reales del día. N = 0 → 0. Código de oferta aleatorio (no tiene que existir) y foto genérica."],
  ["Nuevo usuario", "Mockup", "Mockup hasta conectar los registros reales; después, real", "T", `Rm = 1 + T/4 (hacia abajo), hasta ${REGISTROS_MAX}, − reales del día. T = 0 → 0.`],
  ["Nueva oferta (empresa / SubasCars)", "Real", "Real, nunca mockup", "Publicación", "Una oferta que no existe no se anuncia."],
  ["Rotación del inventario", "Real", "Real, nunca mockup", "T", "Solo ofertas publicadas y abiertas."],
  ["Publicidad y blog", "Contenido de VMC", "Real", "C", "No afirma ningún hecho; no es mockup."],
  ["Participantes (en vivo)", "Ejemplo", "Real (dato de la subasta)", "Oferta", "Si es 0: «Sé el primero en participar»."],
  ["Negociaciones · me gusta", "Ejemplo", "Real", "Oferta", "Las propuestas mockup no las tocan (código aleatorio)."],
];
const mockTag = `<span class="tag" style="--k:#C2410C">Mockup</span>`;
const mockRows = rows.map(({ id, name, c }) => {
  const mocks = c.prop + c.reg;
  return `<tr><td><b>${id}</b></td><td class="l">${esc(name)}</td><td>${c.V}</td><td>${c.N}</td><td><b>${c.T}</b></td>
    <td>${c.prop || `<span class="muted">0</span>`}</td><td>${c.N ? (c.prop / c.N).toFixed(c.prop % c.N ? 1 : 0).replace(".", ",") : "—"}</td>
    <td>${c.reg || `<span class="muted">0</span>`}</td><td><b>${mocks}</b></td><td class="${mocks / c.total > 0.3 ? "warn" : ""}">${pct(mocks / c.total)}</td>
    <td>${c.prop ? mockupsLeft(c.prop, 2) : "—"}</td><td>${c.reg ? mockupsLeft(c.reg, 2) : "—"}</td></tr>`;
}).join("");
const regTs = [0, 1, 3, 4, 8, 12, 16, 20, 30];
const mockPage = `
<section class="page">
  <h2>Mockups <small>qué es simulado por ahora y de qué depende</small></h2>
  <p class="lead">Por ahora las propuestas enviadas y los registros son mockups: no hay un hecho real detrás. Para que no parezca fake,
  <b>los mockups dependen del inventario que hay en la página</b>: con pocas negociables hay pocos avisos de propuesta, con 0 no hay ninguno,
  y sin inventario tampoco hay registros mockup.</p>
  <div class="cols">
    <table class="grid tight">
      <thead><tr><th class="l">Entrada</th><th>Hoy</th><th class="l">En producción</th><th>Depende de</th><th class="l">Regla</th></tr></thead>
      <tbody>${MOCK_TYPES.map(([a, b, c, d, e]) => `<tr><td class="l"><b>${esc(a)}</b></td><td>${b === "Mockup" ? mockTag : esc(b)}</td><td class="l">${esc(c)}</td><td>${esc(d)}</td><td class="l">${esc(e)}</td></tr>`).join("")}</tbody>
    </table>
    <div class="box pr"><h3 style="margin-top:0">Reglas de los mockups</h3><ol>
      <li><b>Sin inventario, sin mockups.</b> T = 0 → ni propuestas ni registros mockup. N = 0 → ninguna propuesta mockup (confirmado).</li>
      <li><b>Escalan con lo que hay.</b> Propuestas mockup con N (2 por negociable, con tope 5 / 8 / 12); registros con T (1 + T/4, hasta ${REGISTROS_MAX}).</li>
      <li><b>Código aleatorio, pero nunca de la nada.</b> Nadie puede verificar una propuesta, así que el mockup usa un código de OFERTA aleatorio (que no choca con uno real) y una foto genérica: no hace falta que la oferta exista. Pero solo aparecen si hay negociables publicadas: con 2, un código random pasa; con 0, no se inventa.</li>
      <li><b>Los reales descuentan.</b> Mockups del día = objetivo − reales del día. Si los hechos reales llegan al objetivo, no hay más mockups; los reales nunca se ocultan. Ya aplicado en la demo («Simular acción real»).</li>
      <li><b>Nunca mockups de ofertas.</b> Nuevas ofertas y rotación muestran solo inventario real.</li>
      <li><b>No tocan los contadores.</b> Como el código es aleatorio, una propuesta mockup no suma a las negociaciones de ninguna oferta del feed: los contadores muestran solo datos reales y nada los desmiente.</li>
      <li><b>Se apagan por tipo.</b> Cuando Francis conecte las propuestas reales, los mockups de propuesta se apagan; igual con los registros.</li>
    </ol></div>
  </div>
  <p class="muted" style="margin-top:10px">Registros mockup según T: ${regTs.map((T) => `T = ${T} → ${registrosPerDay(T)}`).join(" · ")}.</p>
</section>`;

// ─── Choques ─────────────────────────────────────────────────────────────────────────────────────────────────────────
const G = rows.find((r) => r.id === "G").c;
const A = rows.find((r) => r.id === "A").c;
const CLASHES = [
  ["Salto entre 5 y 6 ofertas", "Con 5 ofertas rotan 15 veces al día (una por hora); con 6, solo 6 (cada 2 h 30). Tener más inventario muestra menos inventario.",
    "Aceptarlo: desde 6 hay más nuevas y propuestas que llenan el feed. Alternativas: 2 vueltas en 1–5 (con 5 → 10 al día, cada 1 h 30) o permitir 2 vueltas con 6–7 (va contra lo que pidió Julio).", "Julio"],
  ["45 s frente a reglas por día", `La demo reproduce el día comprimido: el escenario G (${G.total} entradas) dura ~${every((G.total * GAP_S) / 60)} a 45 s. En producción, con horas reales, sale una entrada cada ~${every(DAY_MIN / G.total)} en promedio. Para tener una cada 45 s de verdad harían falta ${(DAY_MIN * 60) / GAP_S} entradas al día.`,
    "Los 45 s son de la simulación. En producción el feed es la línea del día (con hora) y la sensación de «en vivo» la dan los hechos reales.", "Julio"],
  ["Propuestas simuladas en producción", "El tope de 5 por día es para avisos simulados, pero en producción los avisos de propuestas deben ser hechos reales.",
    "En producción, solo propuestas reales. La simulación queda para la demo hasta que Francis confirme la conexión.", "Julio · Francis"],
  ["Muchas propuestas reales", "El tope no oculta eventos reales. Si llegan 10 propuestas reales en una hora, el feed se llena de avisos iguales.",
    "Agrupar: «3 usuarios enviaron su propuesta a la OFERTA 67942 en la última hora» (una entrada que se actualiza).", "Julio"],
  ["Misma oferta: rotación y propuesta", "Son hechos distintos (confirmado), pero si salen juntos parece que el feed repite. Solo pasa con propuestas reales: las mockup usan un código aleatorio.",
    "Con propuestas reales, separarlas al menos 1 h de cuando esa oferta salió en el feed.", "Julio"],
  ["Oferta nueva y rotación el mismo día", "Una oferta publicada hoy saldría como «nueva» y luego como «disponible».",
    "No rota el día en que se publica. Ya aplicado.", "Aplicado"],
  ["Cero en vivo (V = 0)", "La cabecera dice «En vivo · Actividad en tiempo real» aunque no haya subastas en vivo; las rotaciones son todas negociables.",
    "Mostrar «En vivo» solo si V > 0 o si hubo una acción real en los últimos 15 min; si no, «Actividad de hoy».", "Julio"],
  ["Contadores en cero", "«0 participantes» o «0 negociaciones» hacen ver vacía la oferta.",
    "Texto en lugar del 0: «Sé el primero en participar» / «Sin negociaciones aún». Ya aplicado en la demo.", "Aplicado"],
  ["Ofertas en vivo que cierran", "Una subasta que cierra a las 14:00 no debe rotar a las 16:00; al adjudicarse, T baja en medio del día.",
    "Rotar solo ofertas abiertas, con prioridad para las que cierran pronto; recalcular el plan que queda cuando cambia T.", "Julio"],
  ["Cero ofertas (T = 0)", `El feed queda con ${A.total} entradas al día, ${pct(A.promoShare)} de publicidad y blog.`,
    "Opciones: (a) feed solo con blog, publicidad y registros reales; (b) ocultar «VMC ahora» y mostrar un banner; (c) una entrada fija «Pronto nuevas ofertas · Avísame».", "Julio"],
  ["Más de 30 ofertas", "Con una rotación cada 30 min como mínimo no caben todas en el día.",
    "Rotar 30 por día por prioridad (cierra pronto, menos mostradas, bajó de precio) y seguir al día siguiente.", "Julio"],
  ["Puros negociables (V = 0)", "No hay participantes: todas las acciones muestran negociaciones y las propuestas ocupan más espacio.",
    "Correcto con la fórmula: con N ≥ 5 hay 8 avisos al día (~cada 2 h) y como máximo 2 por oferta.", "Revisar"],
  ["Puros en vivo (N = 0)", "No hay avisos de propuesta (confirmado).",
    `Los espacios pasan al blog: +${BLOG_SIN_NEGOCIABLES} entradas de blog al día. Ya aplicado.`, "Aplicado"],
  ["Contador con propuestas mockup", "Si una propuesta mockup apuntara a una oferta del feed, su contador «negociaciones» (me gusta · negociaciones · compartir) no subiría y desmentiría el aviso.",
    "Resuelto: la propuesta mockup lleva un código de oferta aleatorio, así que no apunta a ninguna oferta del feed y ningún contador la desmiente. Ya aplicado.", "Aplicado"],
  ["Pocas negociables con mockups", "Con N = 1 salen 2 propuestas mockup al día con dos códigos distintos, aunque en la página haya una sola negociable.",
    "Aceptable: nadie puede verificar el código. Alternativa más prudente: 1 por negociable al día cuando N ≤ 2 (N = 1 → 1, N = 2 → 2).", "Julio"],
  ["Registros mockup sin inventario", "Sin ofertas, «Usuario X se registró» cada pocas horas se ve fake: ¿a qué se registran?",
    "Registros mockup según T: 0 sin inventario, 1 + T/4 hasta 6. Ya aplicado.", "Aplicado"],
  ["Ráfagas de registros", "Muchos registros juntos llenarían el feed de «Usuario X se registró».",
    "Agrupar: «5 personas se registraron en la última hora». Mostrar solo el código, nunca el nombre.", "Julio"],
];

const QUESTIONS = [
  "¿Aprobamos el tope de 5 avisos de propuesta simulados al día con 1–4 negociables?",
  "Con 5–11 negociables, ¿8 avisos al día (uno cada ~2 h) y con 12 o más, 12 al día (cada 1 h 15)?",
  "¿Máximo 2 avisos de propuesta por la misma oferta al día, con al menos 4 h entre ambos?",
  "Con 1–5 ofertas, ¿3 vueltas al día (con 5 → una por hora) o 2 vueltas para suavizar el salto con 6?",
  "Con 12 o más ofertas, ¿cada una una vez al día, con un tope de 30 rotaciones (cada ≥ 30 min)?",
  "¿Publicidad + blog cerca de 1 de cada 3 entradas (entre 6 y 15 al día), alternando las dos publicidades?",
  "Con 0 ofertas: ¿feed solo con blog y publicidad, ocultarlo, o entrada fija «Pronto nuevas ofertas»?",
  "¿«En vivo» en la cabecera solo cuando hay ofertas en vivo o actividad real reciente?",
  "¿Agrupamos propuestas y registros reales cuando llegan varios en poco tiempo?",
  "¿Registros mockup según el inventario: 0 sin ofertas y 1 + T/4 al día, hasta 6?",
  "En la propuesta mockup (código aleatorio), ¿foto genérica de vehículo o sin foto?",
  "Con 1–2 negociables, ¿1 propuesta mockup por oferta al día en vez de 2?",
];

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>VMC ahora · Escenarios</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
@page { size: A4 landscape; margin: 14mm 14mm 14mm; }
* { box-sizing: border-box; }
body { margin: 0; font: 10px/1.45 'Plus Jakarta Sans', 'Segoe UI', sans-serif; color: #1B1442; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { break-before: page; }
.page:first-of-type { break-before: auto; }
h1 { margin: 0 0 4px; font-size: 26px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; color: #3B1782; }
h2 { margin: 0 0 6px; font-size: 16px; font-weight: 800; color: #3B1782; }
h2 small { margin-left: 8px; font-size: 10.5px; font-weight: 600; color: #6B6878; }
h3 { margin: 14px 0 6px; font-size: 12px; font-weight: 800; color: #3B1782; }
p { margin: 0 0 8px; }
.lead { max-width: 220mm; color: #4A4560; }
.muted { color: #8A879C; }
.meta { margin-bottom: 14px; color: #6B6878; }
.pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 9px; background: #F3EFFD; color: #3B1782; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.box { padding: 10px 12px; border: 1px solid #E6E1F5; border-radius: 10px; }
.box ul, .box ol { margin: 0; padding-left: 16px; }
.box li { margin: 2px 0; }
.box.ok { border-color: #BDE9DF; background: #F3FBF9; }
.box.pr { border-color: #E6DEFF; background: #FAF8FF; }
table.grid { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
.grid th { padding: 5px 6px; font-size: 9px; font-weight: 800; text-align: center; color: #fff; background: #3B1782; vertical-align: bottom; }
.grid th small { font-weight: 600; opacity: 0.8; }
.grid td { padding: 4px 6px; text-align: center; border-bottom: 1px solid #EFEDF5; }
.grid tr:nth-child(even) td { background: #FAF9FD; }
.grid .l { text-align: left; }
.grid td.warn { color: #B4380F; font-weight: 700; }
.grid tr.hl td { background: #FFF4EB !important; }
.grid.tight td { padding: 3px 6px; }
.grid.compact td { padding: 2.5px 6px; }
.grid.compact th { padding: 3px 6px; }
.grid.day td { padding: 2.5px 6px; font-size: 9px; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
.tag { display: inline-block; padding: 1px 6px; border-radius: 999px; font-size: 8.5px; font-weight: 700; white-space: nowrap; color: var(--k); background: color-mix(in srgb, var(--k) 12%, #fff); }
.f { display: grid; grid-template-columns: 150px 1fr 1fr; border-top: 1px solid #EFEDF5; }
.f > div { padding: 6px 8px; }
.f > div:first-child { font-weight: 800; color: #3B1782; }
.f code { font: 700 10px/1.4 Consolas, monospace; color: #1B1442; }
.clash td { vertical-align: top; text-align: left; padding: 3px 6px; font-size: 9.3px; line-height: 1.35; }
.who { white-space: nowrap; font-weight: 700; }
.who.ok { color: #00777A; }
</style></head><body>

<section class="page">
  <h1>VMC ahora · Escenarios del feed</h1>
  <p class="meta">Propuesta para revisar con Julio · 26 de octubre de 2026 · <span class="pill">Lo confirmado va en verde; el resto es propuesta</span></p>
  <p class="lead">Este documento pone números a las reglas de «VMC ahora» para cada combinación de inventario. Las tablas salen de las mismas fórmulas que usa la demo
  (<code>feedPlan.ts</code>): lo que se ve aquí es lo que se ve en <b>/qa/home-index-rebase</b> con el control «VMC ahora · inventario».</p>
  <div class="cols">
    <div class="box ok"><h3 style="margin-top:0">Confirmado</h3><ul>
      <li>Ocho tipos de entrada: nueva oferta de empresa, nueva negociable de SubasCars, nuevo usuario, publicidad «Valoriza tu auto», publicidad «Publica tu auto y recibe ofertas», propuesta enviada, blog y rotación del inventario.</li>
      <li>45 s entre entradas simuladas. Una acción real entra al momento y los 45 s se cuentan desde ella.</li>
      <li>Aviso de propuesta: autor VMC, «Usuario ZAE490 ha enviado su propuesta a la OFERTA 67942», foto pequeña, sin enlace. Es una propuesta <i>enviada</i>, no aceptada.</li>
      <li>Con 0 negociables no hay avisos de propuesta; esos espacios, para publicidad o blog.</li>
      <li>La rotación presenta la oferta como inventario disponible, nunca como recién publicada.</li>
      <li>Con 6–11 ofertas, rotación sin repetir una oferta en el día, entre 9:00 y 24:00.</li>
      <li>Acciones: en vivo → me gusta · participantes · compartir. Negociable → me gusta · negociaciones · compartir.</li>
      <li>En producción, los avisos de registros y propuestas deben ser hechos reales.</li>
    </ul></div>
    <div class="box pr"><h3 style="margin-top:0">Variables</h3><ul>
      <li><b>V</b> = ofertas en vivo · <b>N</b> = ofertas negociables · <b>T = V + N</b> = inventario total (todas las publicadas, de cualquier tipo de bien).</li>
      <li><b>T</b> decide la <b>rotación</b>; <b>N</b> decide los <b>avisos de propuesta</b>. Las propuestas de compradores no cuentan como ofertas.</li>
      <li><b>W</b> = ventana del día, 9:00–24:00 = 900 min.</li>
      <li><b>C</b> = entradas de actividad del día = rotación + propuestas + nuevas + registros.</li>
      <li>«Promo» = publicidad + blog.</li>
      <li>Columna «Producción»: cada cuánto sale una entrada si el plan se reparte en horas reales. Columna «Demo»: cuánto dura el día reproducido a 45 s.</li>
    </ul></div>
  </div>

  <h3>Fórmulas propuestas</h3>
  <div class="f"><div>Rotación R(T)</div><div><code>T = 0 → 0 · 1–5 → 3·T · 6–30 → T · más de 30 → 30</code><br>Repartidas parejo en W: una cada W / R.</div><div>Con 1–5 cada oferta sale 3 veces, a 5 h o más entre una y otra (con 5 ofertas, una por hora). Desde 6, cada oferta una vez al día. Se intercalan en vivo y negociables en proporción.</div></div>
  <div class="f"><div>Propuestas P(N)</div><div><code>P = mín(2·N, tope) · tope = 5 (1–4) · 8 (5–11) · 12 (12+)</code><br>Una cada W / P.</div><div>Por ahora son mockups: código de OFERTA aleatorio y foto genérica, solo si N &gt; 0. Los reales apuntan a su oferta, entran al momento, descuentan mockups y no tienen tope.</div></div>
  <div class="f"><div>Nuevas ofertas</div><div>Reales: entran cuando se publican.</div><div>No rotan el día en que se publican. En la demo: con T ≥ 6, una nueva en vivo (empresa) y una negociable (SubasCars).</div></div>
  <div class="f"><div>Registros Rm(T)</div><div><code>T = 0 → 0 · si no, 1 + T/4 (hacia abajo), hasta ${REGISTROS_MAX}</code></div><div>Por ahora son mockups y dependen del inventario, para que no parezcan fake. Solo el código del usuario. Los reales entran al momento; si hay varios en 30 min, se agrupan (propuesta).</div></div>
  <div class="f"><div>Publicidad + blog</div><div><code>Pr = C / 2 redondeado hacia arriba, entre ${PROMO_MIN} y ${PROMO_MAX}</code> (+${BLOG_SIN_NEGOCIABLES} de blog si N = 0)</div><div>Cerca de 1 de cada 3 entradas: depende de la actividad, no del inventario. Con poco inventario hay menos entradas, no más publicidad. 1/3 es blog; el resto alterna las dos publicidades. Nunca dos promocionales seguidas si hay actividad a menos de 30 min.</div></div>
  <div class="f"><div>Separación</div><div>45 s entre entradas simuladas (demo).</div><div>Una acción real entra al momento y reinicia la cuenta: 10:00:00 entrada → 10:00:30 real → la siguiente simulada desde 10:01:15.</div></div>
</section>

<section class="page">
  <h2>Escenarios <small>entradas por día según V y N</small></h2>
  <p class="lead">En rojo, escenarios donde la promo pasa del 45 % del feed. Las filas de «Rotación» y «Propuestas» muestran cuántas al día y cada cuánto sale una.</p>
  ${mainTable}
  <h3>Cuánto de cada escenario es mockup <small class="muted">(en rojo, más del 30 % del feed es mockup · reglas en la página siguiente)</small></h3>
  <table class="grid compact">
    <thead><tr><th>Esc.</th><th class="l">Escenario</th><th>V</th><th>N</th><th>T</th><th>Propuestas<br><small>mockup al día</small></th><th>Por<br><small>negociable</small></th>
      <th>Registros<br><small>mockup al día</small></th><th>Mockups<br><small>total</small></th><th>Mockup<br><small>% del feed</small></th>
      <th>Con 2 propuestas<br><small>reales → mockups</small></th><th>Con 2 registros<br><small>reales → mockups</small></th></tr></thead>
    <tbody>${mockRows}</tbody>
  </table>
</section>
${mockPage}

<section class="page">
  <h2>Cómo crecen las fórmulas <small>rotación según T · avisos de propuesta según N</small></h2>
  <div class="cols">
    <div>${rotTable}<p class="muted" style="margin-top:4px">En naranja, el salto entre 5 y 6 ofertas (ver choques).</p></div>
    <div>${propTable}
      <h3>Para cerrar con Julio</h3>
      <div class="box pr"><ol>${QUESTIONS.map((q) => `<li>${esc(q)}</li>`).join("")}</ol></div>
    </div>
  </div>
</section>

<section class="page">
  <h2>Variables que chocan <small>y qué proponemos</small></h2>
  <table class="grid clash">
    <thead><tr><th class="l" style="width:150px">Choque</th><th class="l">Qué pasa</th><th class="l">Propuesta</th><th class="l" style="width:80px">Decide</th></tr></thead>
    <tbody>${CLASHES.map(([a, b, c, d]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td><td>${esc(c)}</td><td class="who ${d === "Aplicado" ? "ok" : ""}">${esc(d)}</td></tr>`).join("")}</tbody>
  </table>
</section>

${DAYS.map(dayTable).join("")}
</body></html>`;

if (HTML) await writeFile(HTML, html);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({ path: OUT, format: "A4", landscape: true, printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true, headerTemplate: "<span></span>",
  footerTemplate: `<div style="width:100%;padding:0 14mm;font:8px 'Segoe UI',sans-serif;color:#8A879C;display:flex;justify-content:space-between"><span>VMC ahora · Escenarios del feed · propuesta</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>` });
await browser.close();
console.log(`escenarios.pdf → ${OUT}`);
