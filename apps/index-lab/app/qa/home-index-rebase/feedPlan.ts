/**
 * feedPlan — reglas de «VMC ahora»: qué entra al feed en un día y en qué orden. Es una PROPUESTA en revisión con Julio
 * (ver escenarios.pdf en la raíz del repo); lo confirmado va marcado como tal.
 * Módulo puro (sin React ni imports): lo usan el feed (VmcAhora) y scripts/escenarios-pdf.mjs, así el PDF y la demo
 * salen de la misma fórmula.
 *
 * Ventana del día: 9:00–24:00 (W = 900 min). V = ofertas en vivo, N = negociables, T = V + N (inventario total).
 * La demo reproduce el plan del día en orden, con 45 s entre entradas (confirmado); no son las horas reales.
 */

export type Mode = "vivo" | "negociable";
export type Offer = {
  id: number; mode: Mode; who: string; lot: string; price?: string; city: string; imageSrc: string;
  /** Publicada hoy: sale como «nueva» y no entra a la rotación del día. */
  isNew: boolean;
  /** Participantes (en vivo) o negociaciones (negociable) al empezar el día. */
  base: number; likes: number;
  /** Visitas de la oferta (el ojito de la detail card). */
  views: number;
};
export type Kind = "nueva" | "nueva-subascars" | "registro" | "ad-valoriza" | "ad-publica" | "propuesta" | "blog" | "rotacion";
export type PlanEntry = {
  key: string; min: number; kind: Kind; offerId?: number;
  /** Participantes o negociaciones de la oferta en ese momento (las propuestas del día van sumando). */
  count?: number; blog?: number;
  /** Mockup: hoy no hay un hecho real detrás (propuestas y registros, hasta conectarlos). */
  mock?: boolean;
  /** Propuesta mockup: código de oferta aleatorio (no tiene que existir) y foto genérica. */
  code?: number; imageSrc?: string;
};
/** Entradas que por ahora son mockups. Las demás muestran datos reales: ofertas publicadas, publicidad y blog de VMC. */
export const MOCK_KINDS: readonly Kind[] = ["propuesta", "registro"];

export const DAY_START = 9 * 60;
export const DAY_MIN = 15 * 60;
/** Separación entre entradas simuladas (confirmado). Una acción real reinicia la cuenta. */
export const GAP_S = 45;

// ─── Fórmulas ────────────────────────────────────────────────────────────────────────────────────────────────────────
/** Veces que una misma oferta puede rotar en el día: 3 con 1–5 ofertas (≥ 5 h entre una y otra), 1 desde 6 (Julio). */
export const rotationCap = (T: number): number => (T <= 5 ? 3 : 1);
/** Rotaciones por día R(T): 1–5 → 3·T (con 5 ofertas, una por hora) · 6–30 → T (cada una una vez) · > 30 → 30 (por prioridad). */
export function rotationPerDay(T: number): number {
  if (T <= 0) return 0;
  return T <= 5 ? 3 * T : Math.min(T, 30);
}
/** Tope de avisos de propuesta simulados por día según N: 5 (1–4, propuesto) · 8 (5–11, uno cada ~2 h) · 12 (12+). */
export const proposalMax = (N: number): number => (N <= 4 ? 5 : N <= 11 ? 8 : 12);
/** Avisos de propuesta simulados por día P(N) = mín(2·N, tope). Con N = 0 no hay (confirmado). Máx. 2 por oferta al día. */
export const proposalsPerDay = (N: number): number => (N <= 0 ? 0 : Math.min(2 * N, proposalMax(N)));
/** Ofertas publicadas hoy en la demo: con T ≥ 6, una en vivo y una negociable (en producción, solo las reales). Con
 *  menos inventario no se marca ninguna, para que todas roten. */
export const hasNew = (T: number, n: number): boolean => T >= 6 && n > 0;
export const newPerDay = (V: number, N: number): number => Number(hasNew(V + N, V)) + Number(hasNew(V + N, N));
/** Registros mockup por día Rm(T): sin inventario no hay (para que no parezca fake); 1 + ⌊T / 4⌋, hasta 6. */
export const REGISTROS_MAX = 6;
export const registrosPerDay = (T: number): number => (T <= 0 ? 0 : Math.min(REGISTROS_MAX, 1 + Math.floor(T / 4)));
/** Los mockups solo completan lo que falta: mockups del día = máx(0, objetivo − reales del día). */
export const mockupsLeft = (target: number, real: number): number => Math.max(0, target - real);
/** Límites de la publicidad + blog por día. */
export const PROMO_MIN = 6;
export const PROMO_MAX = 15;
/** Publicidad + blog Pr(C) = acotar(⌈C / 2⌉, 6, 15), con C = rotación + propuestas + nuevas + registros: ~1 de cada 3
 *  entradas. Depende de la actividad (no del inventario directo): con poco inventario el feed tiene menos entradas, no más
 *  publicidad. De Pr, 1/3 es blog y el resto alterna las dos publicidades. */
export const promoPerDay = (C: number): number => Math.max(PROMO_MIN, Math.min(PROMO_MAX, Math.ceil(C / 2)));
/** Con N = 0 no hay avisos de propuesta (confirmado) y esos espacios pasan al blog: +2 entradas. */
export const BLOG_SIN_NEGOCIABLES = 2;

export type Counts = {
  V: number; N: number; T: number; nuevas: number; rot: number; rotEvery: number; rotRepeat: number;
  prop: number; propEvery: number; reg: number; ads: number; blog: number; promo: number; total: number; promoShare: number;
};
export function counts(V: number, N: number): Counts {
  const T = V + N;
  const nuevas = newPerDay(V, N);
  const rot = Math.min(rotationPerDay(T), rotationCap(T) * (T - nuevas));
  const prop = proposalsPerDay(N);
  const reg = registrosPerDay(T);
  const base = promoPerDay(rot + prop + nuevas + reg);
  const extra = N === 0 ? BLOG_SIN_NEGOCIABLES : 0;
  const promo = base + extra;
  const blog = Math.round(base / 3) + extra;
  const total = rot + prop + nuevas + reg + promo;
  return {
    V, N, T, nuevas, rot, rotEvery: rot ? DAY_MIN / rot : 0, rotRepeat: rot && T - nuevas ? rot / Math.min(T - nuevas, 30) : 0,
    prop, propEvery: prop ? DAY_MIN / prop : 0, reg, ads: promo - blog, blog, promo, total, promoShare: promo / total,
  };
}

// ─── Inventario de ejemplo ───────────────────────────────────────────────────────────────────────────────────────────
const POOL: { lot: string; price: string; city: string; imageSrc: string }[] = [
  { lot: "Toyota Yaris 2022", price: "US$ 2,799", city: "Lima", imageSrc: "/demo/vehicles/autoplan-yaris.png" },
  { lot: "Kia Rio 2020", price: "US$ 6,300", city: "Lima", imageSrc: "/demo/vehicles/mapfre-rio.png" },
  { lot: "Hyundai Tucson 2021", price: "US$ 11,400", city: "Lima", imageSrc: "/demo/vehicles/mapfre-tucson.png" },
  { lot: "Toyota Agya 2023", price: "US$ 5,900", city: "Arequipa", imageSrc: "/demo/vehicles/autoplan-agya.png" },
  { lot: "Hyundai Grand i10 2021", price: "US$ 2,199", city: "Lima", imageSrc: "/demo/vehicles/autoplan-grand-i10.png" },
  { lot: "Toyota Hilux 2019", price: "US$ 14,200", city: "Arequipa", imageSrc: "/demo/vehicles/mapfre-pickup.png" },
  { lot: "Jac Refine 2022", price: "US$ 7,900", city: "Lima", imageSrc: "/demo/vehicles/autoplan-refine.png" },
  { lot: "Kia Sportage 2020", price: "US$ 8,450", city: "Trujillo", imageSrc: "/demo/vehicles/autoplan-suv.png" },
  { lot: "Nissan Sentra 2021", price: "US$ 6,950", city: "Lima", imageSrc: "/demo/vehicles/autoplan-sedan.png" },
  { lot: "Toyota Hilux 2020", price: "US$ 18,900", city: "Piura", imageSrc: "/demo/vehicles/autoplan-pickup.png" },
  { lot: "Caterpillar 320 2019", price: "US$ 45,000", city: "Lima", imageSrc: "/demo/inventory-excavator-v1.png" },
  { lot: "Montacargas Toyota 2018", price: "US$ 8,600", city: "Callao", imageSrc: "/demo/inventory-forklift-v1.png" },
];
const EMPRESAS = ["Autoplan", "Mapfre", "Pacífico", "Trupal S.A."];
export const BLOG = [
  { title: "Cómo funciona una subasta en VMC, paso a paso", detail: "Guía · 4 min de lectura" },
  { title: "¿Qué es una oferta negociable y cómo se envía una propuesta?", detail: "Guía · 3 min de lectura" },
  { title: "5 cosas que revisar antes de ofertar por un auto usado", detail: "Consejos · 5 min de lectura" },
  { title: "Documentos para transferir un vehículo en Perú", detail: "Trámites · 6 min de lectura" },
  { title: "Cómo se fija el precio base de una subasta", detail: "Guía · 4 min de lectura" },
];

/** V ofertas en vivo (de las empresas) y N negociables (de SubasCars), con datos estables para un mismo V y N. */
export function buildInventory(V: number, N: number): Offer[] {
  const vivo = Array.from({ length: V }, (_, i): Offer => ({
    ...POOL[i % POOL.length], id: 51015 + i * 97, mode: "vivo", who: EMPRESAS[i % EMPRESAS.length],
    isNew: hasNew(V + N, V) && i === 0, base: 8 + ((i * 13) % 30), likes: 12 + ((i * 17) % 50), views: 180 + ((i * 1733) % 4600),
  }));
  const neg = Array.from({ length: N }, (_, j): Offer => {
    const p = POOL[(j + 5) % POOL.length];
    return { ...p, price: undefined, id: 67942 + j * 113, mode: "negociable", who: "SubasCars",
      isNew: hasNew(V + N, N) && j === 0, base: (j * 3) % 5, likes: 9 + ((j * 11) % 40), views: 120 + ((j * 1291) % 3900) };
  });
  return [...vivo, ...neg];
}

/** Intercala en vivo y negociables en proporción (para que la rotación no traiga cinco seguidas del mismo tipo). */
function interleave(offers: Offer[]): Offer[] {
  const a = offers.filter((o) => o.mode === "vivo");
  const b = offers.filter((o) => o.mode === "negociable");
  const out: Offer[] = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (j >= b.length || (i < a.length && i / a.length <= j / b.length)) out.push(a[i++]);
    else out.push(b[j++]);
  }
  return out;
}

const spread = (k: number, phase: number): number[] => Array.from({ length: k }, (_, i) => DAY_START + ((i + phase) * DAY_MIN) / k);
export const isPromo = (k: Kind): boolean => k === "ad-valoriza" || k === "ad-publica" || k === "blog";

/** Plan del día (9:00–24:00) ordenado por hora. */
export function planDay(V: number, N: number): PlanEntry[] {
  const inv = buildInventory(V, N);
  const c = counts(V, N);
  const out: PlanEntry[] = [];
  const seen = new Map<number, number[]>(); // minutos en que salió cada oferta (nueva o rotación)
  const mark = (id: number, min: number) => seen.set(id, [...(seen.get(id) ?? []), min]);

  // Nuevas: la de la empresa a media mañana y la de SubasCars a media tarde.
  const nuevas = inv.filter((o) => o.isNew);
  nuevas.forEach((o, i) => {
    const min = DAY_START + (i === 0 && o.mode === "vivo" ? 100 : 380);
    out.push({ key: `n${o.id}`, min, kind: o.mode === "vivo" ? "nueva" : "nueva-subascars", offerId: o.id });
    mark(o.id, min);
  });
  // Rotación: ofertas que ya estaban publicadas, intercaladas por tipo; con > 30 se muestran las 30 primeras (prioridad).
  const order = interleave(inv.filter((o) => !o.isNew)).slice(0, 30);
  spread(c.rot, 0.02).forEach((min, i) => {
    const o = order[i % order.length];
    out.push({ key: `r${o.id}-${i}`, min, kind: "rotacion", offerId: o.id });
    mark(o.id, min);
  });
  // Propuestas mockup: nadie puede verificarlas, así que llevan un código de oferta aleatorio (que no choca con las reales)
  // y una foto genérica. No apuntan a ninguna oferta del feed ni tocan sus contadores. Solo hay si hay negociables (N > 0)
  // y su cantidad sigue a N: con 2 negociables, un código random pasa; sin ninguna, no se inventa de la nada.
  const ids = new Set(inv.map((o) => o.id));
  spread(c.prop, 0.5).forEach((min, i) => {
    let code = 62000 + ((i * 7919 + N * 104729 + V * 31) % 18000);
    while (ids.has(code)) code++;
    ids.add(code);
    out.push({ key: `p${code}`, min, kind: "propuesta", code, imageSrc: POOL[(i * 7 + N * 3) % 10].imageSrc, mock: true });
  });
  spread(c.reg, 0.3).forEach((min, i) => out.push({ key: `u${i}`, min, kind: "registro", mock: true }));
  spread(c.ads, 0.18).forEach((min, i) => out.push({ key: `a${i}`, min, kind: i % 2 ? "ad-publica" : "ad-valoriza" }));
  spread(c.blog, 0.75).forEach((min, i) => out.push({ key: `b${i}`, min, kind: "blog", blog: i % BLOG.length }));
  out.sort((x, y) => x.min - y.min);

  // Sin dos promocionales seguidas: si hay una entrada de actividad en los 30 min siguientes, se adelanta entre ambas
  // (nunca una propuesta, ni una oferta si así queda a menos de 1 h de una propuesta suya).
  for (let i = 1; i < out.length; i++) {
    if (!isPromo(out[i].kind) || !isPromo(out[i - 1].kind)) continue;
    const at = (out[i - 1].min + out[i].min) / 2;
    const j = out.findIndex((e, k) => k > i && !isPromo(e.kind) && e.kind !== "propuesta" && e.min - out[i].min <= 30
      && !out.some((p) => p.kind === "propuesta" && p.offerId != null && p.offerId === e.offerId && Math.abs(p.min - at) < 60));
    if (j < 0) continue;
    const [e] = out.splice(j, 1);
    out.splice(i, 0, { ...e, min: at });
  }
  // Contadores al momento de cada entrada: solo las propuestas reales (con oferta) suman negociaciones; las mockup no tocan
  // ningún contador. Los participantes crecen durante el día.
  const byId = new Map(inv.map((o) => [o.id, o]));
  const extra = new Map<number, number>();
  for (const e of out) {
    const o = e.offerId != null ? byId.get(e.offerId) : undefined;
    if (!o) continue;
    if (e.kind === "propuesta") extra.set(o.id, (extra.get(o.id) ?? 0) + 1);
    e.count = o.mode === "vivo" ? o.base + Math.round(((e.min - DAY_START) / DAY_MIN) * 20) : o.base + (extra.get(o.id) ?? 0);
  }
  return out;
}

/** Comprobaciones del plan (para el PDF): promocionales seguidas y la menor distancia entre una propuesta y su oferta en el feed. */
export function checkPlan(plan: PlanEntry[]): { promoRun: number; propNear: number } {
  let run = 0, promoRun = 0, propNear = Infinity;
  for (const e of plan) { run = isPromo(e.kind) ? run + 1 : 0; promoRun = Math.max(promoRun, run); }
  for (const p of plan.filter((e) => e.kind === "propuesta" && e.offerId != null))
    for (const e of plan) if (e !== p && e.offerId === p.offerId && e.kind !== "propuesta") propNear = Math.min(propNear, Math.abs(e.min - p.min));
  return { promoRun, propNear };
}

// ─── Textos ──────────────────────────────────────────────────────────────────────────────────────────────────────────
export type EntryText = {
  author: string; title: string; detail: string; pill: string; color: string; imageSrc?: string;
  /** Publicación de una oferta (nueva o rotación), con los datos de la detail card: «vivo» → me gusta · participantes ·
   *  visitas · compartir; «negociable» → me gusta · negociaciones · visitas · compartir. Sin `mode`, solo compartir. */
  mode?: Mode; likes?: number; count?: number;
  /** Visualizaciones: en las ofertas, las de la detail card; en el resto, cuántas personas vieron la entrada. */
  views: number;
  /** Publicidad: se dibuja como anuncio (foto del banner y botón). `imagePos` encuadra la foto. */
  ad?: boolean; imagePos?: string;
  /** Botón de la publicidad o del blog. Las propuestas y los registros no son clicables. */
  cta?: string;
};
/** Colores de la card de Tipo de oferta: en vivo naranja, negociable cian (también las propuestas, que solo existen en las
 *  negociables). Todo lo demás, morado. */
export const COLORS = { vivo: "#C2410C", negociable: "#00777A", morado: "#7B5CE6", promo: "#3B1782", blog: "#4A2CE0" };

// Visualizaciones de ejemplo de una entrada que no es oferta (estables para la misma entrada).
const viewsOf = (key: string) => 150 + ([...key].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 100003, 7) % 2800);

export function describe(e: PlanEntry, inv: Offer[]): EntryText {
  return { views: viewsOf(e.key), ...describeEntry(e, inv) };
}
function describeEntry(e: PlanEntry, inv: Offer[]): Omit<EntryText, "views"> & { views?: number } {
  const o = inv.find((x) => x.id === e.offerId);
  const tag = (m: Mode) => (m === "vivo" ? "En vivo" : "Negociable");
  const offer = o ? { imageSrc: o.imageSrc, mode: o.mode, likes: o.likes, count: e.count, views: o.views } : {};
  switch (e.kind) {
    case "nueva":
    case "nueva-subascars":
      return { author: o!.who, title: `Publicó una nueva oferta ${o!.mode === "vivo" ? "en vivo" : "negociable"}: ${o!.lot}`,
        detail: `OFERTA ${o!.id} · ${o!.city}${o!.price ? ` · Base ${o!.price}` : " · Recibe propuestas"}`, pill: `Nueva · ${tag(o!.mode)}`, color: COLORS[o!.mode], ...offer };
    case "rotacion":
      return { author: o!.who, title: `Disponible ${o!.mode === "vivo" ? "en vivo" : "para negociar"}: ${o!.lot}`,
        detail: `OFERTA ${o!.id} · ${o!.city}${o!.price ? ` · Base ${o!.price}` : ""}`, pill: tag(o!.mode), color: COLORS[o!.mode], ...offer };
    case "propuesta":
      // Por privacidad, sin el usuario que la envió.
      return { author: "VMC", title: `Se ha enviado una propuesta a la OFERTA ${o?.id ?? e.code}`, detail: o ? `${o.lot} · Negociable` : "Negociable",
        pill: "Propuesta enviada", color: COLORS.negociable, imageSrc: o?.imageSrc ?? e.imageSrc };
    case "registro":
      return { author: "VMC", title: "Se registró un nuevo usuario en VMC", detail: "", pill: "Nuevo usuario", color: COLORS.morado };
    case "ad-valoriza":
      return { author: "VMC", title: "Valoriza tu auto en VMC", detail: "Descubre cuánto vale tu auto en minutos, gratis.", pill: "Publicidad",
        color: COLORS.promo, imageSrc: "/banners/vmc/valoriza-auto.jpg", imagePos: "75% 30%", cta: "Valorizar", ad: true };
    case "ad-publica":
      return { author: "VMC", title: "Publica tu auto en VMC y recibe ofertas", detail: "Empresas y compradores verificados.", pill: "Publicidad",
        color: COLORS.promo, imageSrc: "/banners/vmc/hero-publica.jpg", imagePos: "70% 35%", cta: "Publicar", ad: true };
    case "blog":
      return { author: "Blog VMC", title: BLOG[e.blog ?? 0].title, detail: BLOG[e.blog ?? 0].detail, pill: "Blog", color: COLORS.blog, cta: "Leer" };
  }
}

export const fmtMin = (min: number): string => `${Math.floor(min / 60) % 24}:${String(Math.floor(min % 60)).padStart(2, "0")}`;

// ─── Escenarios para el control de QA ────────────────────────────────────────────────────────────────────────────────
export const SCENARIOS: { id: string; V: number; N: number; label: string; hint: string }[] = [
  { id: "s0", V: 0, N: 0, label: "0 ofertas", hint: "Sin inventario" },
  { id: "n1", V: 0, N: 1, label: "1 negociable", hint: "0 en vivo" },
  { id: "n5", V: 0, N: 5, label: "5 negociables", hint: "Rotan cada hora" },
  { id: "v3n2", V: 3, N: 2, label: "3 + 2", hint: "En vivo + negociables" },
  { id: "v8n2", V: 8, N: 2, label: "8 + 2", hint: "Ejemplo del documento" },
  { id: "n10", V: 0, N: 10, label: "10 negociables", hint: "Puros negociables" },
  { id: "v10", V: 10, N: 0, label: "10 en vivo", hint: "Sin negociables" },
  { id: "v6n6", V: 6, N: 6, label: "6 + 6", hint: "12 ofertas" },
  { id: "v15n15", V: 15, N: 15, label: "15 + 15", hint: "30 ofertas" },
];
export const DEFAULT_SCENARIO = "v8n2";
