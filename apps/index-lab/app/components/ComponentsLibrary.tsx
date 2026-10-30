"use client";

/**
 * /components — librería de componentes del Index para desarrollo (30/10, Aaron).
 * Cada ficha: los estados (normal, hover, active) lado a lado —normal es un botón real para probarlo—, la especificación y el código para copiar.
 * El CSS sale del mismo archivo que usa el Index (glass.ts): si el botón cambia allá, aquí cambia solo.
 * Los estados forzados reescriben ese CSS (:hover → .is-hover, etc.) en vez de copiarlo a mano.
 */
import Link from "next/link";
import { useState } from "react";
import type { JSX } from "react";
import { GLASS_CSS } from "../qa/home-index-rebase/glass";
import { PILL_CSS } from "../qa/home-index-rebase/pills";

const forced = (css: string, cls: string) => css
  .replaceAll(`.${cls}:hover`, `.${cls}.is-hover`)
  .replaceAll(`.${cls}:active`, `.${cls}.is-active`);

type Comp = {
  id: string; name: string; cls: string; label: string; css: string; react: string;
  // La especificación repite en palabras los valores de glass.ts: al cambiar uno, actualizar el otro.
  spec: [string, string][];
};

const COMPONENTS: Comp[] = [{
  id: "boton-vidrio", name: "Botón de vidrio", cls: "hib-glass", label: "Publicar mi auto", css: GLASS_CSS.trim(),
  react: `import type { ButtonHTMLAttributes } from "react";
import "./glass-button.css"; // el CSS de la pestaña «CSS», tal cual

export function GlassButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="hib-glass" {...props}>{children}</button>;
}

// Uso: <GlassButton>Publicar mi auto</GlassButton>`,
  spec: [
    ["Tamaño", "Alto 35 px · padding 0 29 px · radio 100 px (en celular, contenedor ≤ 480 px: alto 34 px · padding 0 22 px)"],
    ["Texto", "Plus Jakarta Sans 600 · 14 px · blanco · sombra 0 1px 3px rgba(0,0,0,.25)"],
    ["Fondo", "Dos degradados blancos verticales (35 % → 0 y 18 % → 3 %) + backdrop-filter: blur(5px)"],
    ["Borde", "1.5 px con degradado VYStrokes1 a 94°: #FFFFFF → #F4AC59 22.1 % → #8460E5 74.5 % → #FFFFFF (máscara en ::before)"],
    ["Sombra", "0 8px 24px rgba(0,0,0,.10) + interior 0 1px 6px rgba(255,255,255,.45)"],
    ["Hover", "Sube 1 px · fondo rgba(255,255,255,.10) · sombra 0 12px 28px rgba(0,0,0,.16) + interior más brillante"],
    ["Active (clic)", "Baja 1 px y escala a 0.97 · fondo violeta rgba(32,0,104,.22) · sombra interior violeta"],
    ["Transición", "background-color y box-shadow 0.25 s (ease) · transform 0.2 s cubic-bezier(0.25, 0.8, 0.25, 1)"],
  ],
}];

const STATES = [["", "Normal"], ["is-hover", "Hover"], ["is-active", "Active (clic)"]] as const;

function copy(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const t = document.createElement("textarea"); t.value = text; document.body.append(t); t.select();
  try { document.execCommand("copy"); } finally { t.remove(); }
  return Promise.resolve();
}

function Code({ title, text }: { title: string; text: string }): JSX.Element {
  const [done, setDone] = useState(false);
  return <figure className="cmp-code">
    <figcaption><b>{title}</b><button type="button" onClick={() => copy(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1600); })}>{done ? "Copiado ✓" : "Copiar"}</button></figcaption>
    <pre><code>{text}</code></pre>
  </figure>;
}

function Card({ c }: { c: Comp }): JSX.Element {
  const [tab, setTab] = useState<"react" | "css">("react");
  return <article id={c.id} className="cmp-card">
    <style>{c.css + "\n" + forced(c.css, c.cls)}</style>
    <header className="cmp-card__head"><h2>{c.name}</h2><code className="cmp-pill">.{c.cls}</code></header>
    <div className="cmp-states">{STATES.map(([k, l]) => <div key={l} className="cmp-stage cmp-stage--mini">
      {k ? <span className={`${c.cls} ${k}`} aria-hidden>{c.label}</span> : <button type="button" className={c.cls}>{c.label}</button>}<small>{l}</small></div>)}</div>
    <dl className="cmp-spec">{c.spec.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <div className="cmp-tabs" role="tablist" aria-label="Código">
      <button type="button" role="tab" aria-selected={tab === "react"} onClick={() => setTab("react")}>React</button>
      <button type="button" role="tab" aria-selected={tab === "css"} onClick={() => setTab("css")}>CSS</button>
    </div>
    {tab === "react" ? <Code title="GlassButton.tsx" text={c.react} /> : <Code title="glass-button.css" text={c.css} />}
  </article>;
}

/* Badge (30/10): las pills de las cards de lotes del Index (LotCards). El markup de aquí es el mismo del Index
   (se verificó igual al HTML que pinta la página) y es el que va en la pestaña React. */
const ICON = {
  star: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor" /></svg>,
  live: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>,
  tag: <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="currentColor" /><circle cx="7.5" cy="8.5" r="1.6" fill="#fff" /></svg>,
};
type PillKind = "live" | "negotiable" | "featured";
const PILL: Record<PillKind, [JSX.Element, string, string]> = {
  live: [ICON.live, "En vivo", "Subasta en vivo"], negotiable: [ICON.tag, "Recibe ofertas", "Negociable"], featured: [ICON.star, "Destacado", "Lote destacado"],
};
const Pill = ({ kind }: { kind: PillKind }) => <span className={`lc-pill lc-pill--${kind}`}>{PILL[kind][0]}{PILL[kind][1]}</span>;
const BADGE_REACT = `import type { JSX } from "react";
import "./pills.css"; // el CSS de la pestaña «CSS», tal cual

const ICON = {
  star: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor" /></svg>,
  live: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>,
  tag: <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="currentColor" /><circle cx="7.5" cy="8.5" r="1.6" fill="#fff" /></svg>,
};

export type PillKind = "live" | "negotiable" | "featured";
const PILL: Record<PillKind, [JSX.Element, string]> = {
  live: [ICON.live, "En vivo"],
  negotiable: [ICON.tag, "Recibe ofertas"],
  featured: [ICON.star, "Destacado"],
};

export function Pill({ kind }: { kind: PillKind }) {
  return <span className={\`lc-pill lc-pill--\${kind}\`}>{PILL[kind][0]}{PILL[kind][1]}</span>;
}

/** Grupo de la card: arriba a la izquierda (la card va con position: relative). Destacado siempre primero. */
export function Pills({ kind, featured = false }: { kind: "live" | "negotiable"; featured?: boolean }) {
  return <span className="lc-pills">{featured ? <Pill kind="featured" /> : null}<Pill kind={kind} /></span>;
}

// Uso: <Pills kind="live" featured /> · <Pills kind="negotiable" />`;
const BADGE_SPEC: [string, string][] = [
  ["Tamaño", "Alto 18 px · padding 0 8 px 0 6 px · radio 999 px · 5 px entre ícono y texto"],
  ["Texto", "Plus Jakarta Sans 700 · 9 px · mayúsculas · tracking 0.07em · blanco"],
  ["Ícono", "10 × 10 px, en blanco (currentColor)"],
  ["Sombra", "0 2px 6px rgba(0,0,0,.18)"],
  ["En vivo", "Degradado 135°: #FF9639 → #EF852E 40 % → #BE3D00 · ícono aro con punto"],
  ["Recibe ofertas", "Lotes negociables. Degradado 110°: #00A9B0 → #3F7FD0 45 % → #6A35D6 · ícono etiqueta"],
  ["Destacado", "Degradado 135°: #8460E5 → #3B1782 · ícono estrella"],
  ["En la card", "Grupo .lc-pills arriba a la izquierda (top 8 · left 8), 4 px entre pills; Destacado va primero"],
];
const CARDS: { kind: "live" | "negotiable"; featured?: boolean; name: string; photo: string }[] = [
  { kind: "live", name: "Toyota Yaris 2022", photo: "/demo/vehicles/autoplan-sedan.png" },
  { kind: "negotiable", name: "Toyota Agya 2023", photo: "/demo/vehicles/autoplan-agya.png" },
  { kind: "live", featured: true, name: "Toyota Hilux 2019", photo: "/demo/vehicles/mapfre-pickup.png" },
];

function BadgeCard(): JSX.Element {
  const [tab, setTab] = useState<"react" | "css">("react");
  return <article id="badge" className="cmp-card">
    <style>{PILL_CSS}</style>
    <header className="cmp-card__head"><h2>Badge</h2><code className="cmp-pill">.lc-pill</code></header>
    <div className="cmp-badges">{(Object.keys(PILL) as PillKind[]).map((k) => <div key={k} className="cmp-badges__one"><Pill kind={k} /><small>{PILL[k][2]}</small></div>)}</div>
    <div className="cmp-lots">{CARDS.map((c) => <div key={c.name} className="cmp-lot">
      <span className="cmp-lot__img"><img src={c.photo} alt="" /><span className="lc-pills">{c.featured ? <Pill kind="featured" /> : null}<Pill kind={c.kind} /></span></span>
      <b>{c.name}</b></div>)}</div>
    <dl className="cmp-spec">{BADGE_SPEC.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <div className="cmp-tabs" role="tablist" aria-label="Código">
      <button type="button" role="tab" aria-selected={tab === "react"} onClick={() => setTab("react")}>React</button>
      <button type="button" role="tab" aria-selected={tab === "css"} onClick={() => setTab("css")}>CSS</button>
    </div>
    {tab === "react" ? <Code title="Pills.tsx" text={BADGE_REACT} /> : <Code title="pills.css" text={PILL_CSS.trim()} />}
  </article>;
}

const NAV = [...COMPONENTS.map((c) => ({ id: c.id, name: c.name })), { id: "badge", name: "Badge" }];

export default function ComponentsLibrary(): JSX.Element {
  return <div className="cmp">
    <style>{PAGE_CSS}</style>
    <aside className="cmp-nav"><p className="cmp-nav__k">VMC Index Lab</p><h1>Componentes</h1>
      <nav>{NAV.map((c) => <a key={c.id} href={`#${c.id}`}>{c.name}</a>)}</nav>
      <Link className="cmp-nav__back" href="/qa/home-index-rebase">← Volver al Index</Link></aside>
    <main className="cmp-main">
      {COMPONENTS.map((c) => <Card key={c.id} c={c} />)}
      <BadgeCard />
    </main>
  </div>;
}

const PAGE_CSS = `
.cmp { min-height: 100vh; display: grid; grid-template-columns: 240px minmax(0, 1fr); background: #F4F2FA; color: #1B1340;
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', system-ui, sans-serif); }
.cmp-nav { position: sticky; top: 0; height: 100vh; box-sizing: border-box; padding: 28px 20px; background: #2E0F70; color: #fff; display: flex; flex-direction: column; gap: 6px; }
.cmp-nav__k { margin: 0; font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; opacity: .7; }
.cmp-nav h1 { margin: 0 0 16px; font-size: 24px; }
.cmp-nav nav { display: flex; flex-direction: column; gap: 4px; }
.cmp-nav nav a { padding: 8px 12px; border-radius: 10px; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; background: rgba(255,255,255,.08); }
.cmp-nav nav a:hover { background: rgba(255,255,255,.16); }
.cmp-nav__back { margin-top: auto; color: #fff; opacity: .8; font-size: 13px; text-decoration: none; }
.cmp-main { padding: 32px clamp(16px, 4vw, 48px) 64px; display: flex; flex-direction: column; gap: 24px; min-width: 0; }
.cmp-card { background: #fff; border: 1px solid #E6E1F5; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 6px 24px rgba(46,15,112,.06); }
.cmp-card__head { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.cmp-card__head h2 { margin: 0; font-size: 20px; }
.cmp-pill { flex: none; padding: 4px 10px; border-radius: 999px; background: #EFEAFD; color: #3D2299; font: 600 13px var(--vmc-font-mono, monospace); }
/* Mismo fondo del banner «Publicar mi auto»: la foto con el degradado encima, para que el blur se vea como en el Index. */
.cmp-stage { position: relative; display: grid; place-items: center; border-radius: 16px; overflow: hidden; isolation: isolate;
  background: linear-gradient(100deg, rgba(42,22,112,.92) 0%, rgba(61,34,153,.82) 40%, rgba(107,72,221,.55) 76%, rgba(132,96,229,.35) 100%), url(/banners/vmc/hero-publica.jpg) 30% 30% / cover; }
.cmp-states { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.cmp-stage--mini { min-height: 120px; gap: 10px; align-content: center; padding: 12px; }
.cmp-stage--mini small { color: rgba(255,255,255,.85); font-size: 12px; font-weight: 600; }
.cmp-badges { display: flex; flex-wrap: wrap; gap: 12px; }
.cmp-badges__one { flex: 1 1 160px; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 22px 12px 14px; border: 1px solid #ECE8F7; border-radius: 14px; background: #FAF9FE; }
.cmp-badges__one small { color: #5E5785; font-size: 12px; font-weight: 600; }
.cmp-lots { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.cmp-lot { display: flex; flex-direction: column; gap: 8px; padding: 8px 8px 12px; border-radius: 14px; background: #fff; box-shadow: rgba(0,0,0,.07) 0 0 16px 4px; font-size: 13px; }
.cmp-lot__img { position: relative; display: block; aspect-ratio: 16 / 10; border-radius: 10px; overflow: hidden; background: #F1EFF7; }
.cmp-lot__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cmp-lot b { padding: 0 4px; }
.cmp-spec { margin: 0; display: grid; gap: 0; border: 1px solid #ECE8F7; border-radius: 14px; overflow: hidden; }
.cmp-spec div { display: grid; grid-template-columns: 150px 1fr; gap: 12px; padding: 10px 14px; font-size: 13.5px; line-height: 1.45; }
.cmp-spec div:nth-child(odd) { background: #FAF9FE; }
.cmp-spec dt { font-weight: 700; } .cmp-spec dd { margin: 0; color: #3F3866; }
.cmp-tabs { display: flex; gap: 6px; }
.cmp-tabs button { padding: 8px 16px; border: 1px solid #DCD5F3; border-radius: 999px; background: #fff; color: #3D2299; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.cmp-tabs button[aria-selected="true"] { background: #3D2299; border-color: #3D2299; color: #fff; }
.cmp-code { margin: -8px 0 0; border-radius: 14px; overflow: hidden; background: #160A3A; }
.cmp-code figcaption { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #21104F; color: #fff; font-size: 13px; }
.cmp-code figcaption button { padding: 6px 14px; border: 0; border-radius: 999px; background: #fff; color: #2E0F70; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.cmp-code pre { margin: 0; padding: 16px; max-height: 420px; overflow: auto; color: #E9E4FF; font: 12.5px/1.6 var(--vmc-font-mono, ui-monospace, monospace); white-space: pre; }
@media (max-width: 860px) {
  .cmp { grid-template-columns: 1fr; }
  .cmp-nav { position: static; height: auto; }
  .cmp-states, .cmp-lots { grid-template-columns: 1fr; }
  .cmp-spec div { grid-template-columns: 1fr; gap: 2px; }
}
`;
