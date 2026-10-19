"use client";

/**
 * HomeIndexBlock — composición local del bloque Homepage de Concorde V2
 * (concorde/bloques/homepage/desktop/Homepage.tsx, que queda intacto).
 *
 * Mismo lienzo (798 × 1104) y mismas secciones; solo cambia el primer tramo:
 * Principal Banner y Secondary Banner van lado a lado, como en la referencia
 * elegida (hero a la izquierda, el feed «VMC ahora» a la derecha).
 * Debajo, en este orden: Lotes para explorar, el banner de campaña, Explora por
 * categoría, Empresas y vendedores y Tipo de oferta / Categorías.
 *
 * La sección del Subastador (AuctioneerSection, 766 × 352) se recompone aquí como
 * «Lotes para explorar» con los mismos componentes (CardTitle · ProfileButton ·
 * OfferCard · BadgeStatus): la de Concorde fija «Ir al Perfil» y todas las cards
 * en variante «live», y aquí hacen falta «Ver todos los lotes» y negociables.
 * Principal Banner y Secondary Banner: Concorde no tiene hero ni feed de actividad
 * (los banners del registry son 766 × 192 y ActivityCard son contadores de «Tu
 * actividad»), así que se componen aquí solo con piezas de Concorde (Button ·
 * CardTitle · BadgeStatus · ProfileButton) y layout mínimo, sin estilos que las imiten.
 * Contenido de ejemplo; sin inventario real.
 */

import { useEffect, useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import {
  BadgeStatus, Button, OfferCard, ProfileButton,
} from "@vmc/concorde-adapter";

import {
  CompactCurveCard, EbayLotRow, FichaCard, FichaLegend, FichaPlus, FichaPro, GlassCard, ImmersiveCard, LotCardStyles, ReliefCard, SummaryCard,
  type FichaLayout, type LegendTier, type LotData, type ProTheme,
} from "./LotCards";
import VmcAhora, { type FeedView } from "./VmcAhora";
import LogoLoop from "./reactbits/LogoLoop";

const GAP = 16;

const FONT = "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)";
const SHADOW = "rgba(0,0,0,0.07) 0px 0px 16px 4px"; // sombra de las secciones del homepage


// Principal Banner — réplica del hero de vmc-index-final-review (/qa/home-index-rebase):
// fondo con el degradado del sistema, foto nítida a un lado que se funde con máscara, texto al otro lado,
// tarjeta glass del lote destacado (slide 1) y controles con segmentos de progreso arriba a la derecha.
// Pills: EN VIVO (BadgeStatus de Concorde), PARA VENDEDORES morada y NEGOCIABLE cyan.
// Avanza solo cada 7 s; se pausa con el puntero o el foco dentro.
type HeroSlide = {
  label: string; pill: "live" | "seller" | "negotiable";
  title: JSX.Element; lead: JSX.Element; cta: string; bg: string;
  photo: { src: string; side: "l" | "r"; width: string; position: string; style?: CSSProperties };
  copy: "left" | "right"; lot?: boolean;
};
const SLIDES: HeroSlide[] = [
  { label: "Subasta en vivo: puja y llévatelo hoy", pill: "live",
    title: <>Puja <em>en vivo</em><br />y llévatelo hoy</>, lead: <><b>21 subastas activas</b> con lotes verificados por empresas.</>,
    cta: "Entrar a la subasta", bg: "linear-gradient(100deg, #2A1670 0%, #3D2299 32%, #C85A1E 78%, #E8732A 100%)",
    photo: { src: "/demo/inventory-suv-v1.png", side: "r", width: "60%", position: "50% 55%" }, copy: "left", lot: true },
  { label: "Publica tu auto y véndelo con VMC", pill: "seller",
    title: <>Publica tu auto<br />y <em>véndelo</em> con VMC</>, lead: <>Llega a compradores de todo el país. Elige subasta en vivo o precio negociable.</>,
    cta: "Publicar mi auto", bg: "linear-gradient(100deg, #E8732A 0%, #C85A1E 26%, #3D2299 72%, #2A1670 100%)",
    photo: { src: "/demo/inventory-suv-v1.png", side: "l", width: "58%", position: "40% 55%" }, copy: "right" },
  { label: "Negocia directo con el vendedor", pill: "negotiable",
    title: <>Negocia <em>directo</em><br />con el vendedor</>, lead: <><b>12 lotes negociables.</b> Envía tu oferta y cierra el precio.</>,
    cta: "Ver negociables", bg: "linear-gradient(100deg, #2A1670 0%, #3D2299 35%, #00838C 78%, #00D2D3 100%)",
    photo: { src: "/demo/inventory-forklift-v1.png", side: "r", width: "44%", position: "50% 50%",
      style: { right: "7%", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 26%, #000 80%, transparent 100%)", maskImage: "linear-gradient(90deg, transparent 0%, #000 26%, #000 80%, transparent 100%)" } },
    copy: "left" },
];
const AUTOPLAY_MS = 7000;

const HERO_CSS = `
.hp { position: relative; width: 100%; min-width: 0; height: 100%; box-sizing: border-box; container: hp / inline-size; border-radius: 16px; overflow: hidden;
  font-family: var(--vmc-font-display); color: var(--vmc-color-base-white); background: var(--vmc-color-vault-800); box-shadow: var(--vmc-shadow-card); isolation: isolate; }
.hp *, .hp *::before, .hp *::after { box-sizing: border-box; }
.hp-slide { position: absolute; inset: 0; opacity: 0; visibility: hidden; transition: opacity .5s ease, visibility 0s linear .5s; }
.hp-slide.on { opacity: 1; visibility: visible; transition: opacity .5s ease, visibility 0s; }
.hp-bg { position: absolute; inset: 0; }
.hp-photo { position: absolute; top: 0; bottom: 0; width: var(--pw, 58%); }
.hp-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.hp-photo.r { right: 0; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 30%); mask-image: linear-gradient(90deg, transparent 0%, #000 30%); }
.hp-photo.l { left: 0; -webkit-mask-image: linear-gradient(270deg, transparent 0%, #000 30%); mask-image: linear-gradient(270deg, transparent 0%, #000 30%); }
.hp-copy { position: absolute; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  padding-bottom: 28px; gap: 12px; width: 44%; min-width: 0; }
.hp-copy.left { left: 36px; }
.hp-copy.right { right: 36px; }
.hp-label { display: inline-flex; align-items: center; gap: 8px; height: 28px; padding: 0 14px; border-radius: var(--vmc-radius-full);
  font-size: var(--vmc-font-size-label); line-height: var(--vmc-line-height-label); font-weight: 700; letter-spacing: var(--vmc-letter-spacing-label); text-transform: uppercase; white-space: nowrap; }
.hp-label--seller { background: linear-gradient(135deg, #8460E5 0%, #3B1782 100%); box-shadow: rgba(32,0,104,0.45) 0 2px 10px; }
.hp-label--negotiable { background: linear-gradient(135deg, #00DAE0 0%, #008688 100%); box-shadow: rgba(0,168,171,0.45) 0 2px 10px; }
.hp-h { margin: 0; font-size: var(--vmc-font-size-hero); line-height: var(--vmc-line-height-hero); font-weight: var(--vmc-font-weight-bold); letter-spacing: var(--vmc-letter-spacing-tight); }
.hp-h em { font-style: normal; color: #FFE2C2; }
.hp-p { margin: 0; font-size: var(--vmc-font-size-body); line-height: var(--vmc-line-height-body); font-weight: var(--vmc-font-weight-medium); max-width: 40ch; }
.hp-p b { font-weight: var(--vmc-font-weight-bold); }
.hp-lot { position: absolute; right: 24px; bottom: 24px; width: 232px; padding: 14px 16px; border-radius: var(--vmc-radius-xl);
  background: var(--vmc-color-glass-dark); border: var(--vmc-border-glass); -webkit-backdrop-filter: var(--vmc-glass-blur); backdrop-filter: var(--vmc-glass-blur); }
.hp-lot small { display: block; font-size: var(--vmc-font-size-caption); line-height: var(--vmc-line-height-caption); font-weight: 700; letter-spacing: var(--vmc-letter-spacing-label); text-transform: uppercase; color: #FFE2C2; }
.hp-lot strong { display: block; margin-top: 2px; font-size: var(--vmc-font-size-body); line-height: var(--vmc-line-height-body); font-weight: var(--vmc-font-weight-bold); }
.hp-lot .price { display: block; margin-top: 2px; font-size: 24px; line-height: 30px; font-weight: var(--vmc-font-weight-bold); letter-spacing: var(--vmc-letter-spacing-tight); }
.hp-lot .price span { font-size: var(--vmc-font-size-label); margin-right: 4px; font-weight: 700; }
.hp-lot .timer { display: inline-flex; align-items: center; gap: 7px; height: 28px; margin-top: 10px; padding: 0 13px; border-radius: var(--vmc-radius-full);
  background: linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 100%); border: 1px solid rgba(255,255,255,0.5);
  font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.hp-ctrl { position: absolute; top: 12px; right: 12px; z-index: 5; display: flex; align-items: center; gap: 2px; padding: 2px 4px; border-radius: var(--vmc-radius-full);
  background: var(--vmc-color-glass-dark); border: var(--vmc-border-glass); -webkit-backdrop-filter: var(--vmc-glass-blur); backdrop-filter: var(--vmc-glass-blur); }
.hp-arrow { display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 50%; background-color: transparent; color: var(--vmc-color-base-white); cursor: pointer; transition: background-color .2s; }
.hp-arrow:hover { background-color: rgba(255,255,255,.18); }
.hp-segs { display: flex; gap: 4px; padding: 0 4px; }
.hp-seg { position: relative; width: 22px; height: 24px; padding: 0; border: 0; background-color: transparent; cursor: pointer; }
.hp-seg::before { content: ""; position: absolute; left: 0; right: 0; top: 10px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.4); }
.hp-seg i { position: absolute; left: 0; top: 10px; height: 4px; width: 0; border-radius: 2px; background: var(--vmc-color-base-white); transition: width 0.3s ease; }
.hp-seg.on i { width: 100%; } /* indica la diapositiva actual (no es temporizador) */
.hp-arrow:focus-visible, .hp-seg:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }
@container hp (max-width: 960px) { .hp-copy { width: 50%; } .hp-h { font-size: var(--vmc-font-size-title); line-height: var(--vmc-line-height-title); } .hp-lot { width: 200px; right: 16px; bottom: 16px; } }
@container hp (max-width: 700px) {
  .hp-photo { width: 100%; opacity: .6; left: 0; right: 0; }
  .hp-copy, .hp-copy.right { left: 20px; right: auto; width: calc(100% - 40px); }
  .hp-lot { display: none; }
}

/* Botón de vidrio con borde degradado (VYStrokes1) */
.hib-glass { position: relative; display: inline-flex; align-items: center; justify-content: center; height: 35px; padding: 0 29px; border: 0; border-radius: 100px;
  font: 600 14px/1 var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif); color: #fff; white-space: nowrap; cursor: pointer;
  background-color: transparent; /* sin esto el <button> hereda el gris del navegador (buttonface) */
  background-image: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 100%), linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.03) 100%);
  -webkit-backdrop-filter: blur(5px); backdrop-filter: blur(5px);
  box-shadow: rgba(0,0,0,0.1) 0 8px 24px, inset 0 1px 6px rgba(255,255,255,0.45);
  text-shadow: rgba(0,0,0,0.25) 0 1px 3px;
  transition: background-color 0.25s, box-shadow 0.25s, transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); }
.hib-glass::before { content: ""; position: absolute; inset: 0; padding: 1.5px; border-radius: inherit; pointer-events: none;
  background: linear-gradient(94deg, #FFFFFF 0%, #F4AC59 22.1%, #8460E5 74.5%, #FFFFFF 100%); /* VYStrokes1 */
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.hib-glass:hover { transform: translateY(-1px); background-color: rgba(255,255,255,0.1);
  box-shadow: rgba(0,0,0,0.16) 0 12px 28px, inset 0 1px 8px rgba(255,255,255,0.6); }
.hib-glass:active { transform: translateY(1px) scale(0.97); background-color: rgba(32,0,104,0.22);
  box-shadow: rgba(0,0,0,0.12) 0 2px 6px, inset 0 2px 8px rgba(32,0,104,0.4); }
.hib-glass:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
`;

const HandshakeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" /></svg>
);
const TimerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 22 22" fill="none" aria-hidden><path d="M4.63973 10C5.09082 6.38255 8.17668 3.58333 11.9163 3.58333C15.9664 3.58333 19.2496 6.86658 19.2496 10.9167C19.2496 14.9668 15.9664 18.25 11.9163 18.25H7.33333M11.9167 10.9167V7.25M10.0833 1.75H13.75M2.75 12.75H7.33333M4.58333 15.5H9.16667" stroke="#FFE2C2" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Chevron = ({ dir }: { dir: "prev" | "next" }) => (
  <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d={dir === "prev" ? "M12 5l-5 5 5 5" : "M8 5l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

/** Cuenta regresiva del lote destacado (empieza en 01:15:27). */
function useCountdown(start: number): string {
  const [left, setLeft] = useState(start);
  useEffect(() => { const t = setInterval(() => setLeft((n) => (n > 0 ? n - 1 : start)), 1000); return () => clearInterval(t); }, [start]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(left / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;
}

function PrincipalBanner(): JSX.Element {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useCountdown(1 * 3600 + 15 * 60 + 27);
  const go = (d: number) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused]);
  return (
    <section className={`hp${paused ? " paused" : ""}`} aria-roledescription="carrusel" aria-label="Destacados"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}>
      {SLIDES.map((sl, i) => (
        <div key={sl.cta} className={`hp-slide${i === index ? " on" : ""}`} role="group" aria-roledescription="diapositiva"
          aria-label={`${i + 1} de ${SLIDES.length}: ${sl.label}`} aria-hidden={i !== index} inert={i !== index}>
          <div className="hp-bg" style={{ background: sl.bg }} />
          <div className={`hp-photo ${sl.photo.side}`} style={{ "--pw": sl.photo.width, ...sl.photo.style } as CSSProperties}>
            <img src={sl.photo.src} alt="" style={{ objectPosition: sl.photo.position }} />
          </div>
          <div className={`hp-copy ${sl.copy}`}>
            {sl.pill === "live" ? <BadgeStatus variant="live" />
              : <span className={`hp-label hp-label--${sl.pill}`}>{sl.pill === "negotiable" ? <HandshakeIcon /> : null}{sl.pill === "seller" ? "Para vendedores" : "Negociable"}</span>}
            <h2 className="hp-h">{sl.title}</h2>
            <p className="hp-p">{sl.lead}</p>
            <button type="button" className="hib-glass">{sl.cta}</button>
          </div>
          {sl.lot ? (
            <div className="hp-lot">
              <small>Lote destacado</small><strong>Toyota Yaris 2022</strong>
              <span className="price"><span>US$</span>2,799</span>
              <span className="timer"><TimerIcon />Cierra en {timer}</span>
            </div>
          ) : null}
        </div>
      ))}
      <div className="hp-ctrl" role="group" aria-label="Navegar destacados">
        <button type="button" className="hp-arrow" aria-label="Anterior" onClick={() => go(-1)}><Chevron dir="prev" /></button>
        <div className="hp-segs" role="group" aria-label="Elegir diapositiva">
          {SLIDES.map((sl, i) => (
            <button key={sl.cta} type="button" className={`hp-seg${i === index ? " on" : ""}`} aria-label={`Ir a la diapositiva ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)}><i key={`${index}-${i}`} /></button>
          ))}
        </div>
        <button type="button" className="hp-arrow" aria-label="Siguiente" onClick={() => go(1)}><Chevron dir="next" /></button>
      </div>
      <style>{HERO_CSS}</style>
    </section>
  );
}

// Banner de campaña 766 × 168 (el del bloque es 100 de alto; aquí crece para que entre el contenido).
const BANNER_HEIGHT = 168;
// Íconos dúotono del banner, estilo del set de íconos de referencia (morado detrás, lila delante).
// No existen en Concorde: Business/Category/OfferIcon son de un solo tono para el sidebar.
const BACK = "#CDBEFF";
const FRONT = "#7B5CE6";
function CompanyIcon(): JSX.Element {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
      <path d="M6 34V9a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3v25z" fill={FRONT} />
      <path d="M10 12h4M17 12h4M10 18h4M17 18h4M10 24h4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M28 17l8 3v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10v-6z" fill={BACK} />
      <path d="M24.5 26.5l2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function VerifiedIcon(): JSX.Element {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
      <rect x="5" y="9" width="24" height="26" rx="4" fill={FRONT} />
      <rect x="11" y="5" width="12" height="7" rx="2.5" fill={BACK} />
      <path d="M10 20h10M10 26h7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="28" cy="27" r="8.5" fill={BACK} />
      <path d="M24.2 27.2l2.6 2.6 5-5.2" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GrowthIcon(): JSX.Element {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
      <rect x="6" y="24" width="7" height="11" rx="2" fill={FRONT} />
      <rect x="16.5" y="17" width="7" height="18" rx="2" fill={FRONT} />
      <rect x="27" y="10" width="7" height="25" rx="2" fill={FRONT} />
      <path d="M5 21L15 12l6 5 11-11" fill="none" stroke={BACK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 5h8v8" fill="none" stroke={BACK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const POINTS = [
  { Icon: CompanyIcon, text: "Activos de empresas de confianza" },
  { Icon: VerifiedIcon, text: "Equipos verificados y listos para operar" },
  { Icon: GrowthIcon, text: "Oportunidades para hacer crecer tu negocio" },
];

function CampaignBanner(): JSX.Element {
  return (
    <section
      aria-label="Maquinaria que mueve tu negocio"
      style={{
        position: "relative", boxSizing: "border-box", width: "100%", height: BANNER_HEIGHT, overflow: "hidden", borderRadius: 16,
        display: "grid", gridTemplateColumns: "272px minmax(0, 1fr) 214px", alignItems: "center",
        background: "linear-gradient(100deg, #F6F2FF 0%, #ECE4FF 55%, #F3EEFF 100%)", boxShadow: SHADOW, fontFamily: FONT,
      }}
    >
      <div style={{ position: "relative", zIndex: 1, display: "grid", justifyItems: "start", gap: 8, padding: "0 0 0 24px" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.1, color: "#3b1782" }}>Maquinaria que mueve tu negocio</h2>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "#3f3f4a" }}>Equipos industriales y vehículos de empresas confiables, en un solo lugar.</p>
        <Button variant="primary">Ver maquinaria</Button>
      </div>
      <img
        src="/demo/inventory-excavator-v1.png" alt=""
        style={{
          width: "100%", height: BANNER_HEIGHT, objectFit: "cover",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
        }}
      />
      <ul style={{ display: "grid", gap: 10, margin: 0, padding: "0 20px 0 4px", listStyle: "none" }}>
        {POINTS.map(({ Icon, text }) => (
          <li key={text} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 10, alignItems: "center", fontSize: 11.5, lineHeight: 1.3, fontWeight: 600, color: "#3b1782" }}>
            <Icon />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

// «Explora por categoría»: cinco cards con la caja de OfferCard (radio 8, sombra y elevación al pasar).
// Íconos dúotono como los del banner. Las fotos son las de demo del lab (no hay una de artículos diversos).
// Íconos del CategoryCard de Concorde (paths exactos de su SVG de Figma; el componente no los exporta):
// auto → Vehicular · sierra → Equipos diversos · grúa → Maquinaria · laptop → Artículos diversos.
// Materiales no existe en Concorde: capas apiladas propias, con el mismo degradado.
// Caja como la del CategoryCard: blanco→#F4F5F9 con borde degradado lila.
type Paint = string;
type Shape = { viewBox: string; draw: (f: Paint) => JSX.Element };
const CAR: Shape = { viewBox: "41 29 31 27", draw: (f) => <path fill={f} d="M49.8053 30.4693C48.7705 30.7374 47.8575 31.8771 47.0662 33.7542C45.9705 36.3017 45.7271 36.5698 44.2053 36.1676C42.7445 35.8324 42.501 36.0335 42.501 37.2402C42.501 37.9777 42.8662 38.7821 43.2314 38.9162C43.8401 39.1844 43.9618 41.1955 43.8401 46.6257L43.5966 54H45.4836C46.9445 54 47.4314 53.6648 47.7358 52.324L48.101 50.648H56.501H64.901L65.2662 52.324C65.5705 53.6648 66.0575 54 67.5184 54H69.4053L69.1618 46.6257C69.0401 41.1955 69.1618 39.1844 69.7705 38.9162C70.1358 38.7821 70.501 37.9777 70.501 37.2402C70.501 36.0335 70.2575 35.8324 68.7966 36.1676C67.2749 36.5698 67.0314 36.3017 65.9358 33.7542C64.4749 30.3352 63.6227 30 56.501 30C53.6401 30 50.6575 30.2011 49.8053 30.4693ZM61.4923 32.2793C63.4401 32.6816 63.8053 33.0838 64.7184 35.6983C65.2662 37.3073 65.5705 38.8492 65.3271 39.1173C64.7792 39.7207 48.2227 39.7207 47.6749 39.1173C47.4314 38.8492 47.7358 37.3073 48.2836 35.6313C49.1358 33.2849 49.6836 32.5475 50.9618 32.3464C53.6401 31.8771 59.1184 31.8771 61.4923 32.2793ZM49.7445 42.5363C50.901 43.3408 50.0488 44.6145 48.2836 44.6145C47.4314 44.6145 46.5184 44.0112 46.1532 43.2737C45.5445 42.067 45.6662 41.933 47.1879 41.933C48.101 41.933 49.2575 42.2011 49.7445 42.5363ZM66.8488 43.2737C66.1184 44.7486 63.5618 45.0838 62.8314 43.8771C62.2836 42.8715 63.6836 41.933 65.814 41.933C67.3358 41.933 67.4575 42.067 66.8488 43.2737ZM60.9445 47.2961C60.6401 48.5028 60.0923 48.6369 56.501 48.6369C52.9097 48.6369 52.3618 48.5028 52.0575 47.2961C51.7532 46.0223 52.0575 45.9553 56.501 45.9553C60.9445 45.9553 61.2488 46.0223 60.9445 47.2961Z" /> };
const CRANE: Shape = { viewBox: "41 27 30 30", draw: (f) => <path fillRule="evenodd" clipRule="evenodd" fill={f} d="M70 32.5046V30.949C70 30.0905 69.303 29.3934 68.4444 29.3934H52.8889V27.8379H48.2222V29.3934H46.6667V32.5046H48.2222V46.5046H46.6667V43.3934H43.5556V46.5046H42V49.6157H43.5556V55.8379H46.6667V49.6157H54.4444V55.8379H57.5556V54.1579V49.6157H59.1111V46.5046H57.5556V43.3934H54.4444V46.5046H52.8889V32.5046H65.3333V39.6912C64.6022 39.9557 64.0733 40.6401 64.0733 41.4646C64.0733 42.149 64.4467 42.7712 65.0222 43.1134V44.949H65.9867C66.5156 44.949 66.9356 45.3846 66.9356 45.9134C66.9356 46.4423 66.5156 46.8779 65.9867 46.8779C65.6444 46.8779 65.3333 46.6912 65.1622 46.3957C64.8822 45.9446 64.3067 45.789 63.8556 46.0534C63.3889 46.3023 63.2333 46.8934 63.4978 47.3601C64.0111 48.2312 64.96 48.7912 65.9867 48.7912C67.5578 48.7912 68.8489 47.5001 68.8489 45.9134C68.8489 44.7001 68.0711 43.6112 66.9356 43.2068V43.1134C67.5267 42.7712 67.9 42.149 67.9 41.4646C67.9 40.749 67.48 40.1423 66.8889 39.8157V32.5046H70ZM51.3333 44.4201L49.7778 45.9757V43.7668L51.3333 42.2112V44.4201ZM51.3333 39.8312L49.7778 41.3868V39.1779L51.3333 37.6223V39.8312ZM49.7778 36.7201V34.5112L51.3333 32.9557V35.1646L49.7778 36.7201Z" /> };
const SAW: Shape = { viewBox: "40 25 30 24", draw: (f) => <path fillRule="evenodd" clipRule="evenodd" fill={f} d="M56.4 35.4479C57.1727 35.4479 57.8 36.0526 57.8 36.7975C57.8 37.5425 57.1727 38.1472 56.4 38.1472C55.6273 38.1472 55 37.5425 55 36.7975C55 36.0526 55.6273 35.4479 56.4 35.4479ZM49.204 29.0368C50.996 27.1742 53.558 26 56.4 26C61.3 26 65.416 29.5227 66.102 34.0982H69V36.7975H60.6C60.6 34.5628 58.718 32.7485 56.4 32.7485C54.082 32.7485 52.2 34.5628 52.2 36.7975H41V34.0982H41.07C41.35 31.0344 42.596 28.2405 44.5 26L49.204 29.0368ZM47.622 31.2503L45.284 29.7387C44.542 31.0613 44.052 32.5325 43.884 34.0982H46.698C46.852 33.0859 47.16 32.1276 47.622 31.2503ZM48.56 41.3865L46.6 39.4969H54.706C55.042 40.0638 55.7 40.4417 56.4 40.4417C57.1 40.4417 57.758 40.0638 58.094 39.4969H66.2V41.3865C63.946 40.0638 64.044 41.8589 64.044 41.8589V44.5043L61.3 47.1497C60.6 44.7877 59.34 46.1104 59.34 46.1104L57.38 48H53.46C54.832 45.827 52.97 45.9215 52.97 45.9215H50.226L47.482 43.2761C49.932 42.6147 48.56 41.3865 48.56 41.3865Z" /> };
const LAPTOP: Shape = { viewBox: "40 22 32 31", draw: (f) => <path fillRule="evenodd" clipRule="evenodd" fill={f} d="M45.5652 23.3989H66.4348C67.5146 23.3989 68.3913 24.3542 68.3913 25.5309V39.4598C68.3913 40.2443 67.8068 40.8812 67.087 40.8812H44.913C44.1932 40.8812 43.6087 40.2443 43.6087 39.4598V25.5309C43.6087 24.3542 44.4854 23.3989 45.5652 23.3989ZM44.913 40.3126H67.087L71 50.404H41L44.913 40.3126ZM41 50.8304H71V51.3989H41V50.8304ZM44.913 24.8202H67.087V38.0385H44.913V24.8202ZM56 24.2517C55.712 24.2521 55.4787 24.5067 55.4789 24.8206C55.4791 25.1345 55.7126 25.3888 56.0007 25.3888C56.2887 25.3888 56.5222 25.1345 56.5224 24.8206C56.5226 24.5067 56.2893 24.2521 56.0013 24.2517H56ZM45.8261 41.0233H66.1739L68.3913 47.135H43.6087L45.8261 41.0233ZM52.7391 47.8456H59.2609L59.5217 49.2669H52.4783L52.7391 47.8456ZM45.5652 25.5309H66.4348V37.3279H45.5652V25.5309ZM46.2174 41.4497H65.7826L66.1739 42.4446H45.8261L46.2174 41.4497ZM45.5652 43.0131H66.4348L66.9565 44.0081H45.0435L45.5652 43.0131ZM44.7826 44.5766H67.2174L67.7391 45.5715H44.2609L44.7826 44.5766ZM51.4348 45.9979H60.5652L60.8261 46.9928H51.1739L51.4348 45.9979ZM46.8696 26.9522L53.3913 36.1908H54.1739L47.6522 26.9522H46.8696ZM48.8261 26.9522L52.087 31.5004H52.8696L49.6087 26.9522H48.8261ZM61.8696 31.2162L65.3913 36.1908H66.1739L62.6522 31.2162H61.8696Z" /> };
const LAYERS: Shape = { viewBox: "0 0 40 40", draw: (f) => <><path d="M20 22l15 7-15 7-15-7z" fill={f} opacity="0.45" /><path d="M20 15l15 7-15 7-15-7z" fill={f} opacity="0.7" /><path d="M20 5l15 7-15 7-15-7z" fill={f} /></> };

// Íconos de categoría: la forma de Concorde en el morado de los íconos del banner (#7B5CE6), sin caja ni fondo.
function GradIcon({ shape }: { shape: Shape }): JSX.Element {
  const [x, y, w, h] = shape.viewBox.split(" ").map(Number);
  const m = Math.max(w, h) * 0.04;
  return (
    <svg width="32" height="32" viewBox={`${x - m} ${y - m} ${w + 2 * m} ${h + 2 * m}`} aria-hidden>
      {shape.draw(FRONT)}
    </svg>
  );
}
const CATEGORIES = [
  { label: "Vehicular", count: "21 lotes", shape: CAR, imageSrc: "/demo/inventory-suv-v1.png" },
  { label: "Equipos diversos", count: "12 lotes", shape: SAW, imageSrc: "/demo/inventory-forklift-v1.png" },
  { label: "Maquinaria", count: "2 lotes", shape: CRANE, imageSrc: "/demo/inventory-excavator-v1.png" },
  { label: "Materiales", count: "1 lote", shape: LAYERS, imageSrc: "/demo/inventory-steel-v1.png" },
  { label: "Artículos diversos", count: "1 lote", shape: LAPTOP, imageSrc: "/demo/inventory-mosaic-v1.png" },
];
const CATEGORY_CSS = `
.hib-cat { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px; background: #fff; color: inherit; text-decoration: none;
  box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-cat:hover { transform: translateY(-3px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-cat:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-cat > img { display: block; width: 100%; height: 92px; object-fit: cover; }
.hib-cat__foot { flex: 1; display: grid; grid-template-columns: 32px minmax(0,1fr) 20px; gap: 6px; align-items: center; padding: 8px 6px 8px 8px; }
.hib-cat__icon { display: grid; place-items: center; width: 32px; height: 32px; } /* sin caja: dúotono como el banner */ /* = caja del CategoryCard de Concorde */
.hib-cat__icon svg { width: 32px; height: 32px; }
.hib-cat__txt { display: grid; min-width: 0; }
.hib-cat__txt b { font-size: 12px; line-height: 1.2; color: #3b1782; } /* «Equipos diversos» va en 2 líneas: no se corta */
.hib-cat__txt small { font-size: 11px; color: #5b5b66; }
.hib-cat__go { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; color: #3b1782; background: #F3EFFD; }
@media (prefers-reduced-motion: reduce) { .hib-cat { transition: none; } }
/* Vista «Sin card»: el ícono suelto, sin la caja con borde degradado. */
.hib-cats--plain .hib-cat__icon { border: 0; background: none; box-shadow: none; }
.hib-cats--plain .hib-cat__icon svg { width: 32px; height: 32px; }
`;
type CategoriesView = "normal" | "plain" | "premium";
const CATEGORIES_VIEWS: { id: CategoriesView; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "Foto, ícono y conteo" },
  { id: "premium", label: "Premium", hint: "Fondo lila, ícono en cajita y destello" },
];

// Vista «Premium» (referencia de producto): sección con fondo lila suave, título sin corchetes y enlace
// con flecha; cards de vidrio blanco con la foto sobre lila, ícono en cajita blanca con sombra, flecha
// en círculo que se llena al pasar y un destello que cruza la card.
const CATEGORY_PREMIUM_CSS = `
.hib-pcats { box-sizing: border-box; width: 100%; padding: 18px 16px 16px; border-radius: 16px; font-family: ${FONT};
  background: radial-gradient(120% 140% at 0% 0%, #F4EFFF 0%, #EEE8FF 45%, #F8F5FF 100%); border: 1px solid #E6DEFF;
  box-shadow: rgba(92,56,214,0.12) 0 12px 28px -12px; }
.hib-pcats__head { display: flex; align-items: center; justify-content: space-between; padding: 0 4px 14px; }
.hib-pcats__head h2 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.01em; color: #1B1442; }
.hib-pcats__all { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #3B1782; text-decoration: none; }
.hib-pcats__all svg { transition: transform 0.2s; }
.hib-pcats__all:hover svg { transform: translateX(3px); }
.hib-pcats ul { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
.hib-pcat { position: relative; display: flex; flex-direction: column; height: 100%; overflow: hidden; border-radius: 14px; color: inherit; text-decoration: none;
  background: rgba(255,255,255,0.88); border: 1px solid rgba(255,255,255,0.95); box-shadow: rgba(76,40,200,0.12) 0 8px 22px -8px, inset 0 1px 0 #fff;
  transition: transform 0.2s cubic-bezier(0.3,0,0,1), box-shadow 0.2s; }
.hib-pcat:hover { transform: translateY(-4px); box-shadow: rgba(76,40,200,0.24) 0 16px 30px -10px; }
.hib-pcat:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-pcat::before { content: ""; position: absolute; top: 0; left: -60%; z-index: 2; width: 40%; height: 100%; pointer-events: none;
  transform: skewX(-18deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); transition: left 0.6s ease; }
.hib-pcat:hover::before { left: 130%; }
.hib-pcat__media { position: relative; height: 96px; margin: 6px 6px 0; overflow: hidden; border-radius: 10px;
  background: radial-gradient(80% 90% at 50% 40%, #FFFFFF 0%, #ECE6FF 100%); }
.hib-pcat__media img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
.hib-pcat:hover .hib-pcat__media img { transform: scale(1.06); }
.hib-pcat__media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(236,230,255,0) 55%, rgba(236,230,255,0.6) 100%); }
.hib-pcat__foot { flex: 1; display: grid; grid-template-columns: 30px minmax(0,1fr) 20px; gap: 6px; align-items: center; padding: 9px 6px 9px 7px; }
.hib-pcat__icon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: #fff; border: 1px solid #ECE6FF;
  box-shadow: rgba(76,40,200,0.16) 0 4px 10px; }
.hib-pcat__icon svg { width: 20px; height: 20px; }
.hib-pcat__txt { display: grid; min-width: 0; }
.hib-pcat__txt b { font-size: 11.5px; line-height: 1.2; color: #1B1442; }
.hib-pcat__txt small { font-size: 10.5px; color: #6B6880; }
.hib-pcat__go { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; color: #4A2CE0; background: #EEE8FF;
  transition: background 0.2s, color 0.2s; }
.hib-pcat:hover .hib-pcat__go { color: #fff; background: linear-gradient(135deg, #8460E5, #3B1782); }
`;
const ARROW = <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

// Cabecera de las secciones planas (sin card): como la referencia, alineada al borde del contenido.
function SectionHead({ title, subtitle, action }: { title: string; subtitle: string; action?: string }): JSX.Element {
  return (
    <header style={{ boxSizing: "border-box", flex: "none", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, padding: "0 0 10px", marginBottom: 18, borderBottom: "1px solid #DEDCE4" }}>
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: 22, lineHeight: "27px", fontWeight: 700, letterSpacing: "-0.02em", color: "#3b1782", whiteSpace: "nowrap" }}>{title}</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: "#3F3F4A" }}>{subtitle}</p>
      </div>
      {action ? <div style={{ flex: "none" }}><ProfileButton>{action}</ProfileButton></div> : null}
    </header>
  );
}
const FLAT: CSSProperties = { boxSizing: "border-box", width: "100%", fontFamily: FONT };

// «Vende tu vehículo» (réplica de vmc-index-final-review): dos opciones a la izquierda y el beneficio de
// SubasCars a la derecha, con ProfileButton de Concorde y el botón de vidrio del hero.
const SELL_CSS = `
.hib-sell { box-sizing: border-box; width: 100%; color: #191C1C; font-family: var(--vmc-font-display, "Plus Jakarta Sans", sans-serif); }
.hib-sell *, .hib-sell *::before, .hib-sell *::after { box-sizing: border-box; }
.hib-sell__layout { display: grid; grid-template-columns: minmax(0, 1fr) clamp(260px, 34%, 300px); gap: 16px; align-items: stretch; }
.hib-sell__choices { display: grid; gap: 12px; }
.hib-sell__choice { display: grid; grid-template-columns: 132px minmax(0, 1fr); min-height: 142px; overflow: hidden; border: 1px solid #DEDCE4; border-radius: 14px; background: #fff; text-decoration: none; color: inherit; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.hib-sell__choice:hover { transform: translateY(-2px); border-color: #B7A5E9; box-shadow: rgb(32 0 104 / 14%) 0 12px 24px -16px; }
.hib-sell__photo { position: relative; overflow: hidden; background: #E8E5FF; }
.hib-sell__photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.hib-sell__photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 56%, rgb(255 255 255 / 92%) 100%); pointer-events: none; }
.hib-sell__choice--fleet .hib-sell__photo { background: #D9F0EE; }
.hib-sell__choice--fleet .hib-sell__photo img { object-position: 50% 45%; }
.hib-sell__copy { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; min-width: 0; padding: 14px 16px; }
.hib-sell__copy h3 { margin: 0; color: #191C1C; font-size: 17px; line-height: 22px; font-weight: 750; letter-spacing: -.015em; }
.hib-sell__copy p { margin: 5px 0 10px; color: #5B5B66; font-size: 13px; line-height: 19px; }
.hib-sell__copy .pprofilebtn { padding: 0; font-size: 13px; }
.hib-sell__benefit { position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: flex-start; min-height: 296px; overflow: hidden; padding: 22px; border-radius: 14px; color: #fff;
  background: radial-gradient(110% 100% at -10% 112%, rgb(239 133 46 / 88%) 0%, rgb(239 133 46 / 38%) 27%, transparent 56%), linear-gradient(145deg, #32136F 0%, #4E22A9 55%, #7B4BE3 100%); box-shadow: rgb(59 23 130 / 18%) 0 12px 24px -18px; }
.hib-sell__benefit::before { content: ""; position: absolute; z-index: -1; top: -85px; right: -48px; width: 250px; height: 210px; border: 42px solid rgb(255 255 255 / 10%); border-radius: 50%; }
.hib-sell__benefit::after { content: ""; position: absolute; z-index: -1; right: -74px; bottom: -118px; width: 270px; height: 210px; border: 42px solid rgb(255 255 255 / 8%); border-radius: 50%; }
.hib-sell__person { position: absolute; z-index: 0; right: -26px; bottom: -1px; width: min(68%, 238px); height: auto; pointer-events: none; }
.hib-sell__benefit > :not(.hib-sell__person) { position: relative; z-index: 1; }
.hib-sell__coin { display: inline-flex; align-items: center; height: 27px; padding: 0 12px; border: 1px solid rgb(255 255 255 / 28%); border-radius: 999px; background: rgb(255 255 255 / 12%); font-size: 11px; font-weight: 800; letter-spacing: .02em; }
.hib-sell__benefit h3 { max-width: 190px; margin: 16px 0 0; font-size: 21px; line-height: 25px; font-weight: 750; letter-spacing: -.025em; }
.hib-sell__benefit p { max-width: 190px; margin: 7px 0 0; color: rgb(255 255 255 / 88%); font-size: 13px; line-height: 19px; }
.hib-sell__benefit .hib-glass { height: 38px; margin-top: auto; padding-inline: 24px; font-size: 13px; }
`;
function SellSection(): JSX.Element {
  return (
    <section className="hib-sell" aria-label="Vende tu vehículo">
      <SectionHead title="Vende tu vehículo" subtitle="Publica tu auto y recibe ofertas de compradores verificados." />
      <div className="hib-sell__layout">
        <div className="hib-sell__choices">
          <article className="hib-sell__choice">
            <div className="hib-sell__photo"><img src="/demo/inventory-suv-v1.png" alt="" /></div>
            <div className="hib-sell__copy"><h3>¿Vendes tu vehículo?</h3><p>Registra tu publicación en minutos y deja que VMC filtre las ofertas por ti.</p>
              <ProfileButton href="https://www.vmcsubastas.com/landing-subascars">Publica tu auto</ProfileButton></div>
          </article>
          <article className="hib-sell__choice hib-sell__choice--fleet">
            <div className="hib-sell__photo"><img src="/demo/inventory-mosaic-v1.png" alt="" /></div>
            <div className="hib-sell__copy"><h3>¿Vendes varios vehículos?</h3><p>Una alternativa para propietarios, empresas y concesionarios que buscan vender sus vehículos seminuevos.</p>
              <ProfileButton href="https://www.vmcsubastas.com/landing-subascars">Conoce SubasCars</ProfileButton></div>
          </article>
        </div>
        <aside className="hib-sell__benefit" aria-label="Beneficios de SubasCars">
          <img className="hib-sell__person" src="/demo/sell/seller-phone-man.png" alt="" />
          <span className="hib-sell__coin">25 SubasCoins · 0% comisión</span>
          <h3>Un solo pago, hasta que lo vendas</h3>
          <p>Sin pagos mensuales ni renovaciones: el 100% de la venta es tuyo.</p>
          <button type="button" className="hib-glass">Publica ahora</button>
        </aside>
      </div>
      <style>{SELL_CSS}</style>
    </section>
  );
}

function CategoryRail({ view }: { view: CategoriesView }): JSX.Element {
  if (view === "premium") {
    return (
      <section className="hib-pcats" aria-labelledby="hib-pcats-title">
        <header className="hib-pcats__head">
          <h2 id="hib-pcats-title">Explora por categoría</h2>
          <a href="#" className="hib-pcats__all">Ver todas las categorías{ARROW}</a>
        </header>
        <ul>
          {CATEGORIES.map(({ label, count, shape, imageSrc }) => (
            <li key={label} style={{ display: "flex" }}>
              <a href="#" className="hib-pcat" aria-label={`${label} · ${count}`}>
                <span className="hib-pcat__media"><img src={imageSrc} alt="" /></span>
                <span className="hib-pcat__foot">
                  <span className="hib-pcat__icon"><GradIcon shape={shape} /></span>
                  <span className="hib-pcat__txt"><b>{label}</b><small>{count}</small></span>
                  <span className="hib-pcat__go" aria-hidden>{ARROW}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <style>{CATEGORY_PREMIUM_CSS}</style>
      </section>
    );
  }
  return (
    <section aria-label="Explora por categoría" style={FLAT}>
      <SectionHead title="Explora por categoría" subtitle="Encuentra oportunidades por tipo de activo" action="Ver todas las categorías" />
      <ul className={view === "plain" ? "hib-cats--plain" : undefined} style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10, margin: 0, padding: "0 0 6px", listStyle: "none" }}>
        {CATEGORIES.map(({ label, count, shape, imageSrc }) => (
          <li key={label} style={{ display: "flex" }}>
            <a href="#" className="hib-cat" aria-label={`${label} · ${count}`}>
              <img src={imageSrc} alt="" />
              <span className="hib-cat__foot">
                <span className="hib-cat__icon"><GradIcon shape={shape} /></span>
                <span className="hib-cat__txt"><b>{label}</b><small>{count}</small></span>
                <span className="hib-cat__go" aria-hidden><svg width="12" height="12" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <style>{CATEGORY_CSS}</style>
    </section>
  );
}

// «Empresas y vendedores»: 2 × 2 filas con la caja de las cards (radio 8, sombra y elevación al pasar).
// Autoplan, Pacífico y Trupal (y sus conteos) salen del submenú «Empresas» del sidebar; Mapfre es de
// ejemplo (no está en el sidebar, su conteo es inventado). Logos oficiales bajados de sus sitios
// (autoplan.pe, pacifico.com.pe, mapfre.com.pe, trupal.com.pe) a public/demo/empresas.
const COMPANIES = [
  { name: "Autoplan", lots: "3 lotes", logo: "/demo/empresas/autoplan.png", tile: "#ffffff" },
  { name: "Pacífico", lots: "2 lotes", logo: "/demo/empresas/pacifico.png", tile: "#ffffff" },
  { name: "Mapfre", lots: "4 lotes", logo: "/demo/empresas/mapfre.png", tile: "#ffffff" },
  { name: "Trupal S.A.", lots: "2 lotes", logo: "/demo/empresas/trupal.svg", tile: "#ffffff" },
];
const COMPANY_CSS = `
.hib-emp { display: grid; grid-template-columns: 76px minmax(0,1fr) 24px; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 8px; background: #fff; color: inherit; text-decoration: none;
  box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-emp:hover { transform: translateY(-2px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-emp:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-emp__logo { box-sizing: border-box; display: grid; place-items: center; width: 76px; height: 44px; padding: 6px 8px; border-radius: 8px; border: 1px solid #ECE8F6; }
.hib-emp__logo img { display: block; max-width: 58px; max-height: 30px; object-fit: contain; }
.hib-emp__txt { display: grid; min-width: 0; gap: 2px; }
.hib-emp__txt b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #3b1782; }
.hib-emp__txt small { font-size: 12px; color: #5b5b66; }
.hib-emp__go { color: #3b1782; }
@media (prefers-reduced-motion: reduce) { .hib-emp { transition: none; } }

/* Slider: marquee de logos en bucle infinito. La pista lleva la lista dos veces y se desplaza -50%,
   así el corte no se ve. Se pausa con el puntero o el foco; bordes desvanecidos. Se mueve siempre,
   también con «reducir animaciones» activo en el sistema (pedido de producto). */
.hib-marquee { position: relative; overflow: hidden; margin-top: 0; padding: 6px 0 10px;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%); }
.hib-marquee__track { display: flex; gap: 16px; width: max-content; animation: hib-marquee 26s linear infinite; }
.hib-marquee:hover .hib-marquee__track, .hib-marquee:focus-within .hib-marquee__track { animation-play-state: paused; }
@keyframes hib-marquee { to { transform: translateX(calc(-50% - 8px)); } }
.hib-marquee__item { box-sizing: border-box; display: grid; justify-items: center; align-content: center; gap: 6px; width: 168px; height: 92px; padding: 10px;
  border-radius: 8px; background: #fff; color: inherit; text-decoration: none; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px;
  transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-marquee__item:hover { transform: translateY(-2px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-marquee__item:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-marquee__item img { display: block; max-width: 120px; max-height: 40px; object-fit: contain; }
.hib-marquee__item small { font-size: 11px; color: #5b5b66; }
`;
type CompaniesView = "normal" | "slider" | "loop"; // «normal» (2 × 2) se conserva en código, fuera del selector
const COMPANIES_VIEWS: { id: CompaniesView; label: string; hint: string }[] = [
  { id: "slider", label: "Slider", hint: "Logos en movimiento" },
  { id: "loop", label: "Logo loop", hint: "Efecto de React Bits" },
];

// «Tipo de oferta» sin la columna de Categorías del CategoriesSection de Concorde (ya está «Explora por
// categoría»): misma caja y mismos componentes (CardTitle · OfferType).
// «Tipo de oferta» premium, en la línea de la card Holo: tarjeta blanca con borde degradado, foil
// holográfico y reflejo que siguen al puntero (con inclinación 3D), ícono en baldosa con degradado y brillo,
// conteo en vivo, enlace con chevron (ProfileButton) y una franja inferior con luz que corre.
const OFFER_TYPES = [
  { id: "negotiable", kicker: "Modalidad", title: "Negociable", text: "Haz tu propuesta y cierra el precio directo con el vendedor.",
    count: 12, unit: "lotes negociables", cta: "Ver negociables",
    a: "#00DAE0", b: "#008688", ink: "#00777A", soft: "rgba(0,218,224,0.16)", glow: "rgba(0,168,171,0.35)" },
  { id: "live", kicker: "Modalidad", title: "En vivo", text: "Puja en tiempo real y llévate el lote al cierre de la subasta.",
    count: 21, unit: "subastas activas", cta: "Ver subastas",
    a: "#FF9639", b: "#BE3D00", ink: "#C2410C", soft: "rgba(255,150,57,0.16)", glow: "rgba(239,133,46,0.35)" },
] as const;
const OfferTypeIcon = ({ id, size }: { id: "negotiable" | "live"; size: number }) => id === "negotiable" ? (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" /></svg>
) : (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="2.4" fill="currentColor" /><path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.4 18.6a9.3 9.3 0 0 1 0-13.2M18.6 5.4a9.3 9.3 0 0 1 0 13.2" /></svg>
);
const OFFER_TYPE_CSS = `
@keyframes hib-ot-run { from { left: -35%; } to { left: 100%; } }
@keyframes hib-ot-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.75); } }
@keyframes hib-ot-idle { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
.hib-ot__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 0; perspective: 900px; }
.hib-ot__card { position: relative; isolation: isolate; display: grid; grid-template-columns: 60px minmax(0, 1fr); gap: 16px; align-items: start;
  padding: 18px 20px 22px; overflow: hidden; border-radius: 16px; color: #14112B; text-decoration: none;
  border: 1.5px solid transparent;
  background: radial-gradient(120% 90% at 100% 0%, var(--soft) 0%, transparent 55%) padding-box, #fff padding-box,
              linear-gradient(140deg, var(--a) 0%, #ffffff 35%, #CFBAFF 65%, var(--b) 100%) border-box;
  box-shadow: 0 14px 30px -18px var(--glow), 0 2px 6px rgba(32,0,104,0.06);
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform 0.2s ease, box-shadow 0.25s; }
.hib-ot__card:hover { box-shadow: 0 22px 40px -18px var(--glow), 0 4px 10px rgba(32,0,104,0.08); }
.hib-ot__card:focus-visible { outline: 2px solid #8460E5; outline-offset: 3px; }
.hib-ot__holo { position: absolute; inset: 0; z-index: 2; pointer-events: none; background-size: 260% 260%; mix-blend-mode: multiply;
  background-image: linear-gradient(115deg, transparent 26%, rgba(132,96,229,0.09) 38%, rgba(0,218,224,0.08) 46%, rgba(255,150,57,0.08) 54%, rgba(132,96,229,0.07) 62%, transparent 74%);
  animation: hib-ot-idle 6s ease-in-out infinite alternate; }
.hib-ot__card:hover .hib-ot__holo { animation: none; background-position: var(--mx, 50%) var(--my, 50%); }
.hib-ot__glare { position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; transition: opacity 0.2s;
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.75), transparent 42%); }
.hib-ot__card:hover .hib-ot__glare { opacity: 1; }
.hib-ot__tile { position: relative; display: grid; place-items: center; width: 60px; height: 60px; border-radius: 18px; color: #fff;
  background: linear-gradient(145deg, var(--a) 0%, var(--b) 100%); box-shadow: 0 10px 22px -8px var(--glow), inset 0 1px 0 rgba(255,255,255,0.45); }
.hib-ot__tile::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 55%); }
.hib-ot__tile svg { position: relative; }
.hib-ot__body { position: relative; z-index: 1; display: grid; gap: 4px; min-width: 0; }
.hib-ot__kicker { font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); }
.hib-ot__title { margin: 0; font-size: 22px; line-height: 1.1; font-weight: 800; letter-spacing: -0.02em; color: #14112B; }
.hib-ot__text { margin: 2px 0 0; font-size: 13px; line-height: 1.45; color: #5B5870; }
.hib-ot__row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #F0EDF7; }
.hib-ot__count { display: inline-flex; align-items: baseline; gap: 6px; font-size: 12px; color: #5B5870; }
.hib-ot__count b { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #14112B; font-variant-numeric: tabular-nums; }
.hib-ot__count i { align-self: center; width: 7px; height: 7px; border-radius: 50%; background: var(--a); box-shadow: 0 0 0 3px var(--soft); animation: hib-ot-pulse 1.4s ease-in-out infinite; }
.hib-ot__cta { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #3B1782; white-space: nowrap; }
.hib-ot__cta span { display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; color: #fff; background: linear-gradient(135deg, var(--a), var(--b));
  transition: transform 0.2s; }
.hib-ot__card:hover .hib-ot__cta span { transform: translateX(3px); }
.hib-ot__deco { position: absolute; right: -18px; top: -14px; z-index: 0; color: var(--a); opacity: 0.09; pointer-events: none; }
.hib-ot__track { position: absolute; left: 0; right: 0; bottom: 0; height: 5px; overflow: hidden; background: linear-gradient(90deg, var(--a), var(--b)); }
.hib-ot__track::after { content: ""; position: absolute; top: 0; width: 30%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent); animation: hib-ot-run 2.4s linear infinite; }
`;
function OfferTypeClara(): JSX.Element {
  return (
    <>
      <div className="hib-ot__grid">
        {OFFER_TYPES.map((t) => (
          <a key={t.id} href="#" className="hib-ot__card"
            style={{ "--a": t.a, "--b": t.b, "--ink": t.ink, "--soft": t.soft, "--glow": t.glow } as CSSProperties}>
            <span className="hib-ot__tile"><OfferTypeIcon id={t.id} size={28} /></span>
            <span className="hib-ot__body">
              <span className="hib-ot__kicker">{t.kicker}</span>
              <span className="hib-ot__title">{t.title}</span>
              <span className="hib-ot__text">{t.text}</span>
              <span className="hib-ot__row">
                <span className="hib-ot__count"><i aria-hidden /><b>{t.count}</b>{t.unit}</span>
                <span className="hib-ot__cta">{t.cta}<span aria-hidden><svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M6 11L10 8L6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span></span>
              </span>
            </span>
            <span className="hib-ot__track" aria-hidden />
          </a>
        ))}
      </div>
      <style>{OFFER_TYPE_CSS}</style>
    </>
  );
}

// ── Tipo de oferta · vista «Normal»: tarjeta con el degradado de la modalidad, más luminosa (brillo
// superior, foco de luz que respira y un destello que cruza). Al pasar el mouse la tarjeta crece, el
// contenido se desenfoca y aparece al centro el botón de vidrio «Ver …».
const OFFER_GRAD_CSS = `
@keyframes hib-otg-breathe { 0%, 100% { opacity: 0.55; transform: translate(0, 0) scale(1); } 50% { opacity: 0.85; transform: translate(-8%, 6%) scale(1.12); } }
@keyframes hib-otg-sweep { 0%, 70% { transform: translateX(-160%) skewX(-20deg); } 100% { transform: translateX(360%) skewX(-20deg); } }
.hib-otg { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 4px 0; }
.hib-otg__card { position: relative; isolation: isolate; display: block; min-height: 108px; overflow: hidden; border-radius: 16px; color: #fff; text-decoration: none;
  box-shadow: var(--glow) 0 12px 26px -10px, inset 0 1px 0 rgba(255,255,255,0.45);
  transition: transform 0.35s cubic-bezier(0.3,0,0,1), box-shadow 0.35s; }
.hib-otg__card:hover, .hib-otg__card:focus-visible { transform: scale(1.035); box-shadow: var(--glow) 0 22px 40px -12px, inset 0 1px 0 rgba(255,255,255,0.55); z-index: 1; }
.hib-otg__card:focus-visible { outline: 2px solid #fff; outline-offset: -4px; }
/* Luz: brillo de vidrio arriba, foco que respira en la esquina y destello que cruza. */
.hib-otg__card::before { content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 42%, rgba(255,255,255,0) 60%); }
.hib-otg__light { position: absolute; top: -60%; right: -20%; z-index: 0; width: 70%; height: 180%; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 55%, transparent); animation: hib-otg-breathe 5s ease-in-out infinite; }
.hib-otg__card::after { content: ""; position: absolute; top: 0; left: 0; z-index: 0; width: 30%; height: 100%; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); animation: hib-otg-sweep 5s ease-in-out infinite; }
.hib-otg__body { position: relative; z-index: 1; display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 16px; align-items: center; height: 100%; padding: 20px 24px;
  transition: filter 0.35s, opacity 0.35s, transform 0.35s; }
.hib-otg__card:hover .hib-otg__body, .hib-otg__card:focus-visible .hib-otg__body { filter: blur(6px); opacity: 0.55; transform: scale(0.98); }
.hib-otg__icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.55);
  box-shadow: inset 0 1px 8px rgba(255,255,255,0.45), 0 6px 14px -6px rgba(0,0,0,0.25); }
.hib-otg__txt b { font-size: 18px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; text-shadow: rgba(0,0,0,0.18) 0 1px 3px; }
/* Vista «Con foto» (como el banner): el auto de fondo a la derecha y la sombra del color de la modalidad
   desde la izquierda; texto encima. El hover (crece, blur, botón al centro) es el mismo. */
.hib-otg--photo .hib-otg__card { min-height: 128px; }
.hib-otg--photo .hib-otg__body { grid-template-columns: minmax(0, 1fr); padding: 20px 24px; }
.hib-otg__bgimg { position: absolute; top: 0; right: 0; bottom: 0; z-index: 0; width: 66%; pointer-events: none;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 38%); mask-image: linear-gradient(90deg, transparent 0%, #000 38%); }
.hib-otg__bgimg img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 55%; }
.hib-otg__shade { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: var(--shade); }
.hib-otg--photo .hib-otg__txt { gap: 6px; max-width: 60%; }
.hib-otg--photo .hib-otg__txt b { font-size: 22px; letter-spacing: 0.02em; text-transform: none; }
.hib-otg--photo .hib-otg__card:hover .hib-otg__bgimg, .hib-otg--photo .hib-otg__card:focus-visible .hib-otg__bgimg { filter: blur(6px); }
.hib-otg__bgimg { transition: filter 0.35s; }
/* Pill como la de las cards (ícono + texto en mayúsculas), en blanco para que resalte sobre el degradado. */
.hib-otg__pill { justify-self: start; display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 12px 0 10px; border-radius: 999px;
  font-size: 13px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink); background: #fff; box-shadow: rgba(0,0,0,0.16) 0 3px 8px; }
.hib-otg__txt { display: grid; gap: 4px; }
.hib-otg--photo .hib-otg__txt { gap: 8px; }
.hib-otg__txt > span:last-child { font-size: 13px; line-height: 1.35; opacity: 0.95; }
.hib-otg__cta { position: absolute; left: 50%; top: 50%; z-index: 2; transform: translate(-50%, -40%) scale(0.92); opacity: 0; pointer-events: none;
  transition: opacity 0.3s, transform 0.35s cubic-bezier(0.3,0,0,1); }
.hib-otg__card:hover .hib-otg__cta, .hib-otg__card:focus-visible .hib-otg__cta { opacity: 1; transform: translate(-50%, -50%) scale(1); }
.hib-otg__cta.hib-glass { height: 40px; padding: 0 30px; font-size: 14px; }
`;
const OFFER_GRAD = [
  { id: "negotiable" as const, title: "Negociable", text: "Encuentra vehículos con precio conversable", cta: "Ver negociables", photo: "/demo/vehicles/autoplan-agya.png", ink: "#00777A",
    shade: "linear-gradient(90deg, rgba(0,150,155,0.96) 0%, rgba(0,170,175,0.82) 34%, rgba(0,190,195,0.25) 68%, rgba(0,190,195,0.05) 100%)",
    bg: "linear-gradient(135deg, #2EF0F2 0%, #00C9CD 30%, #00A3A7 65%, #00787B 100%)", glow: "rgba(0,190,195,0.45)" },
  { id: "live" as const, title: "En vivo", text: "Participa en subastas en tiempo real", cta: "Ver subastas", photo: "/demo/vehicles/autoplan-yaris.png", ink: "#C2410C",
    shade: "linear-gradient(90deg, rgba(225,95,20,0.96) 0%, rgba(240,120,40,0.82) 34%, rgba(255,140,50,0.25) 68%, rgba(255,140,50,0.05) 100%)",
    bg: "linear-gradient(135deg, #FFB25E 0%, #FF8F2E 30%, #EF6A1C 65%, #B83A00 100%)", glow: "rgba(255,130,40,0.45)" },
];
// Íconos de las pills de las cards (LotCards): En vivo (aro con punto) y Negociable (etiqueta).
const LiveDot = () => <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>;
const TagIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="currentColor" /><circle cx="7.5" cy="8.5" r="1.6" fill="#fff" /></svg>;
function OfferTypeGradient({ photo }: { photo?: boolean }): JSX.Element {
  return (
    <div className={`hib-otg${photo ? " hib-otg--photo" : ""}`}>
      {OFFER_GRAD.map((t) => (
        <a key={t.id} href="#" className="hib-otg__card" style={{ background: t.bg, "--glow": t.glow, "--ink": t.ink } as CSSProperties} aria-label={`${t.title}: ${t.cta}`}>
          {photo ? <><span className="hib-otg__bgimg" aria-hidden><img src={t.photo} alt="" /></span><span className="hib-otg__shade" aria-hidden style={{ "--shade": t.shade } as CSSProperties} /></> : null}
          <span className="hib-otg__light" aria-hidden />
          <span className="hib-otg__body">
            {photo ? <>
              <span className="hib-otg__txt">
                <span className="hib-otg__pill">{t.id === "live" ? <LiveDot /> : <TagIcon />}{t.title}</span>
                <span>{t.text}</span>
              </span>
            </> : <>
              <span className="hib-otg__icon"><OfferTypeIcon id={t.id} size={26} /></span>
              <span className="hib-otg__txt"><b>{t.title}</b><span>{t.text}</span></span>
            </>}
          </span>
          <span className="hib-otg__cta hib-glass" aria-hidden>{t.cta}</span>
        </a>
      ))}
      <style>{OFFER_GRAD_CSS}</style>
    </div>
  );
}

// ── Tipo de oferta · vista «Selector»: lo mínimo, como un control segmentado grande. Cada lado: el número
// en degradado como protagonista, una palabra y una flecha. Sin bajadas, sin efectos sobre la tarjeta; el
// color solo aparece en el número, el punto de estado y una línea que crece al pasar el mouse.
const OFFER_SEG_CSS = `
@keyframes hib-seg-pulse { 0%, 100% { box-shadow: 0 0 0 0 var(--ring); } 50% { box-shadow: 0 0 0 6px transparent; } }
.hib-seg { display: grid; grid-template-columns: 1fr 1fr; margin: 0; border: 1px solid #ECE8F6; border-radius: 16px; background: #FBFAFE; overflow: hidden; }
.hib-seg__opt + .hib-seg__opt::before { content: ""; position: absolute; left: 0; top: 18px; bottom: 18px; width: 1px; background: #ECE8F6; }
.hib-seg__opt { position: relative; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 18px; padding: 22px 28px; color: #14112B; text-decoration: none;
  transition: background 0.25s; }
.hib-seg__opt:hover { background: #fff; }
.hib-seg__opt::after { content: ""; position: absolute; left: 28px; right: 28px; bottom: 0; height: 3px; border-radius: 3px 3px 0 0; background: linear-gradient(90deg, var(--a), var(--b));
  transform: scaleX(0); transform-origin: left; transition: transform 0.35s cubic-bezier(0.3,0,0,1); }
.hib-seg__opt:hover::after { transform: scaleX(1); }
.hib-seg__opt:focus-visible { outline: 2px solid #8460E5; outline-offset: -4px; }
.hib-seg__num { font-size: 44px; line-height: 1; font-weight: 800; letter-spacing: -0.04em; font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, var(--a), var(--b)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hib-seg__lbl { display: grid; gap: 3px; }
.hib-seg__lbl b { font-size: 17px; font-weight: 800; letter-spacing: -0.01em; }
.hib-seg__lbl span { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #6B6880; }
.hib-seg__lbl i { width: 7px; height: 7px; border-radius: 50%; background: var(--a); animation: hib-seg-pulse 2s ease-in-out infinite; }
.hib-seg__go { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; color: #3B1782; background: #fff; border: 1px solid #ECE8F6;
  transition: transform 0.25s cubic-bezier(0.3,0,0,1), background 0.25s, color 0.25s, border-color 0.25s; }
.hib-seg__opt:hover .hib-seg__go { transform: translateX(3px); color: #fff; border-color: transparent; background: linear-gradient(135deg, var(--a), var(--b)); }
`;
const OFFER_SEG = [
  { id: "negotiable", n: 12, label: "Negociables", note: "Disponibles", a: "#00DAE0", b: "#008688", ring: "rgba(0,218,224,0.45)" },
  { id: "live", n: 21, label: "En vivo", note: "Activas ahora", a: "#FF9639", b: "#BE3D00", ring: "rgba(255,150,57,0.45)" },
];
function OfferTypeSegmented(): JSX.Element {
  return (
    <div className="hib-seg">
      {OFFER_SEG.map((t) => (
          <a key={t.id} href="#" className="hib-seg__opt" style={{ "--a": t.a, "--b": t.b, "--ring": t.ring } as CSSProperties} aria-label={`${t.label}: ${t.n}`}>
            <span className="hib-seg__num">{t.n}</span>
            <span className="hib-seg__lbl"><b>{t.label}</b><span><i aria-hidden />{t.note}</span></span>
            <span className="hib-seg__go" aria-hidden><svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          </a>
      ))}
      <style>{OFFER_SEG_CSS}</style>
    </div>
  );
}

type OfferTypeView = "normal" | "clara" | "selector" | "foto" | "corta";
const OFFER_TYPE_VIEWS: { id: OfferTypeView; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "Degradado de cada modalidad" },
  { id: "clara", label: "Clara", hint: "Blanca con borde y conteo" },
  { id: "selector", label: "Selector", hint: "Mínimo: número y flecha" },
  { id: "foto", label: "Con foto", hint: "Auto de fondo y pill" },
  { id: "corta", label: "Corta", hint: "Bajo el banner; VMC ahora crece al lado" },
];
function OfferTypeCard({ view }: { view: OfferTypeView }): JSX.Element {
  return (
    <section className="hib-ot" aria-label="Tipo de oferta" style={FLAT}>
      <SectionHead title="Tipo de oferta" subtitle="Elige cómo quieres comprar" />
      {view === "normal" || view === "corta" ? <OfferTypeGradient /> : view === "foto" ? <OfferTypeGradient photo /> : view === "clara" ? <OfferTypeClara /> : <OfferTypeSegmented />}
    </section>
  );
}
// Cada mitad de la pista repite la lista 2 veces (8 logos) para que siempre cubra los 734 de ancho.
const MARQUEE_HALF = [...COMPANIES, ...COMPANIES];

function CompaniesSection({ view }: { view: CompaniesView }): JSX.Element {
  const compact = false; // a todo el ancho
  return (
    <section aria-label="Empresas que publican en VMC" style={{ ...FLAT, flex: 1, minWidth: 0, width: compact ? "auto" : "100%" }}>
      <SectionHead title="Empresas que publican en VMC" subtitle="Tiendas especializadas que publican en VMC" />
      {view === "normal" ? (
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, margin: "16px 0 0", padding: 0, listStyle: "none" }}>
          {COMPANIES.map((c) => (
            <li key={c.name}>
              <a href="#" className="hib-emp" aria-label={`${c.name} · ${c.lots}`}>
                <span className="hib-emp__logo" style={{ background: c.tile }}><img src={c.logo} alt="" /></span>
                <span className="hib-emp__txt"><b>{c.name}</b><small>{c.lots}</small></span>
                <svg className="hib-emp__go" width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </li>
          ))}
        </ul>
      ) : view === "loop" ? (
        // Logo Loop de React Bits: loop continuo, bordes desvanecidos, se frena y agranda el logo al pasar el
        // mouse y se puede arrastrar. Nombre de la empresa debajo de cada logo.
        <div style={{ marginTop: 18 }}>
          <LogoLoop
            logos={COMPANIES.map((c) => ({ src: c.logo, alt: c.name, title: c.name, href: "#" }))}
            speed={50} gap={48} logoHeight={28} hoverSpeed={12} scaleOnHover labels="below" ariaLabel="Empresas que publican en VMC"
          />
        </div>
      ) : (
        <div className="hib-marquee" role="region" aria-label="Empresas que publican en VMC">
          <div className="hib-marquee__track">
            {[...MARQUEE_HALF, ...MARQUEE_HALF].map((c, k) => (
              // Solo la primera vuelta es navegable y la lee el lector de pantalla; las copias son decorativas.
              <a key={k} href="#" className="hib-marquee__item" aria-label={`${c.name} · ${c.lots}`}
                aria-hidden={k >= COMPANIES.length || undefined} tabIndex={k >= COMPANIES.length ? -1 : undefined}>
                <img src={c.logo} alt="" />
                <small>{c.lots}</small>
              </a>
            ))}
          </div>
        </div>
      )}
      <style>{COMPANY_CSS}</style>
    </section>
  );
}


// El primero es el destacado; los otros seis van en 2 filas de 3 a su derecha.
const LOTS: LotData[] = [
  { name: "Toyota Yaris", year: 2022, price: "US$ 2,799", variant: "live", live: true, imageSrc: "/demo/vehicles/autoplan-yaris.png",
    kind: "Hatchback", photos: 12, km: "45,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "01:24:36", progress: 0.72 },
  { name: "Hyundai Grand i10", year: 2021, price: "US$ 2,199", variant: "live", imageSrc: "/demo/vehicles/autoplan-grand-i10.png",
    kind: "Hatchback", photos: 9, km: "38,200 km", transmission: "Mecánica", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "05:10:00", progress: 0.35 },
  { name: "Toyota Agya", year: 2023, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-agya.png",
    kind: "Hatchback", photos: 15, km: "32,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", owner: "Único dueño" },
  { name: "Jac Refine", year: 2022, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-refine.png",
    kind: "Van", photos: 8, km: "61,500 km", transmission: "Mecánica", fuel: "Diésel", seats: 8, city: "Arequipa", owner: "Empresa" },
  { name: "Caterpillar 320", year: 2019, price: "US$ 45,000", variant: "live", live: true, imageSrc: "/demo/inventory-excavator-v1.png",
    kind: "Excavadora", photos: 10, km: "6,200 h", transmission: "Hidráulica", fuel: "Diésel", city: "Lima", remaining: "03:02:10", progress: 0.5 },
  { name: "Lote de vigas", year: 2024, variant: "negotiable", imageSrc: "/demo/inventory-steel-v1.png",
    kind: "Materiales", photos: 6, km: "12 t", transmission: "Acero A36", fuel: "Vigas H", city: "Callao", owner: "Empresa" },
  { name: "Kia Sportage", year: 2020, price: "US$ 8,450", variant: "live", imageSrc: "/demo/vehicles/autoplan-suv.png",
    kind: "SUV", photos: 14, km: "52,300 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "07:45:00", progress: 0.2 },
];

// Misma caja que AuctioneerSection de Concorde (766 de ancho, radio 16, sombra del homepage), con tres
// vistas para comparar (selector flotante a la derecha del bloque). Todas usan el OfferCard de Concorde;
// solo cambian medidas por clase.
//   · normal   → 4 OfferCard en fila, como la sección del Subastador.
//   · gallery  → tipo «Oferta del día» de Mercado Libre: destacado alto a la izquierda + 2 filas de 3 «short».
//   · featured → destacado más chico + 3 autos más grandes que las «short» (menos que el destacado).
type LotsView = "normal" | "gallery" | "featured" | "listado" | "listado-gallery";
const LOTS_VIEWS: { id: LotsView; label: string; hint: string }[] = [
  { id: "gallery", label: "Card gallery", hint: "Destacada + 2 filas de 4" },
  { id: "featured", label: "Card destacada", hint: "Destacada + 3 autos" },
  { id: "listado", label: "Listado", hint: "Foto a la izquierda, detalle a la derecha" },
  { id: "listado-gallery", label: "Listado gallery", hint: "Destacada Holo + listado en 2 columnas" },
];
// Segunda tienda (referencia): Mapfre, con destacado sin «En vivo» y 8 chicas.
const MAPFRE_LOTS: LotData[] = [
  { name: "Hyundai Tucson", year: 2021, price: "US$ 11,400", variant: "live", imageSrc: "/demo/vehicles/mapfre-tucson.png",
    kind: "SUV", photos: 16, km: "34,500 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "02:48:10", progress: 0.68 },
  { name: "Kia Rio", year: 2020, price: "US$ 6,300", variant: "live", imageSrc: "/demo/vehicles/mapfre-rio.png",
    kind: "Sedán", photos: 10, km: "48,000 km", transmission: "Mecánica", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Toyota Hilux", year: 2019, variant: "negotiable", imageSrc: "/demo/vehicles/mapfre-pickup.png",
    kind: "Camioneta", photos: 12, km: "72,000 km", transmission: "Mecánica", fuel: "Diésel", seats: 5, city: "Arequipa" },
  { name: "Nissan Versa", year: 2022, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-sedan.png",
    kind: "Sedán", photos: 9, km: "21,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Chevrolet Onix", year: 2021, price: "US$ 5,900", variant: "live", imageSrc: "/demo/vehicles/autoplan-grand-i10.png",
    kind: "Hatchback", photos: 8, km: "39,500 km", transmission: "Mecánica", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Mitsubishi L200", year: 2018, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-pickup.png",
    kind: "Camioneta", photos: 11, km: "96,000 km", transmission: "Mecánica", fuel: "Diésel", seats: 5, city: "Trujillo" },
  { name: "Suzuki Vitara", year: 2020, price: "US$ 8,700", variant: "live", imageSrc: "/demo/vehicles/autoplan-suv.png",
    kind: "SUV", photos: 13, km: "44,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Honda HR-V", year: 2019, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-agya.png",
    kind: "SUV", photos: 10, km: "58,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima" },
  { name: "Volkswagen Tiguan", year: 2020, price: "US$ 13,200", variant: "live", imageSrc: "/demo/vehicles/autoplan-yaris.png",
    kind: "SUV", photos: 14, km: "41,000 km", transmission: "Automática", fuel: "Gasolina", seats: 7, city: "Lima" },
];
type Store = { name: string; logo: string; lots: LotData[]; total: number };
const STORES: Store[] = [
  { name: "Autoplan", logo: "/demo/empresas/autoplan.png", lots: LOTS, total: 7 },
  { name: "Mapfre", logo: "/demo/empresas/mapfre.png", lots: MAPFRE_LOTS, total: 9 },
];

const CAR_LOTS = ["Hyundai Grand i10", "Toyota Agya", "Kia Sportage", "Kia Rio", "Toyota Hilux", "Nissan Versa"];

// Estilo de las cards de lote. «normal» es el OfferCard de Concorde; «ficha» e «inmersiva» son variantes
// nuevas del lab (LotCards.tsx). En «Card gallery» con un estilo nuevo, las chicas usan la Inmersiva chica.
type CardStyle = "holo-curva" | "normal" | "ficha" | `pro-${ProTheme}` | `leg-${LegendTier}` | `ficha-${FichaLayout}` | "inmersiva" | "resumen" | "relieve" | "cristal";
const CARD_STYLES: { id: CardStyle; label: string; hint: string }[] = [
  { id: "holo-curva", label: "Holo curva", hint: "Default: destacada Holo + curvas" },
  { id: "ficha", label: "Ficha", hint: "Foto + datos, precio y estado" },
  { id: "ficha-social", label: "Prueba social", hint: "Ofertas y visitas" },
  { id: "relieve", label: "Relieve", hint: "Sombras internas y franja curva" },
];

const GALLERY_HEIGHT = 2 * 170 + 12;

const LOTS_CSS = `
.hib-eblist { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
.hib-eblist--one { grid-template-columns: minmax(0, 1fr); }
.hib-eblist--two { column-gap: 20px; }
.hib-eblist--two > .lc-eb:nth-child(-n + 2) { padding-top: 0; }
.hib-eblist--two > .lc-eb:nth-last-child(-n + 2) { border-bottom: 0; padding-bottom: 0; }
.hib-eblist--one > .lc-eb:first-child { padding-top: 0; }
.hib-eblist--one > .lc-eb:last-child { border-bottom: 0; padding-bottom: 0; }
/* Cards de Concorde dentro de grillas fluidas: ocupan su columna (el OfferCard las fija en px). */
.hib-fluid > .pcard { width: 100%; }
/* Destacado de la Card gallery (352 de alto): foto más baja y detalles más chicos para que entre todo. */
.hib-dense .lc .lc-media { min-height: 84px !important; }
.hib-dense .lc .lc-body, .hib-dense .lp .lc-body { gap: 5px; padding: 8px 10px 12px; }
.hib-dense .lc .lc-name { font-size: 15px; }
.hib-dense .lc .lc-sub { margin-top: 0; font-size: 10.5px; }
.hib-dense .lc .lc-chip { padding: 3px 5px; font-size: 9px; }
.hib-dense .lc .lc-stats, .hib-dense .lc .lc-time, .hib-dense .lc .lc-inline, .hib-dense .lc .lc-social { font-size: 10px; }
.hib-dense .lc .lc-bar { height: 5px; }
.hib-dense .lc .lc-label { font-size: 9.5px; }
.hib-dense .lc .lc-price { font-size: 18px; }
.hib-dense .lc .lc-pricerow > svg { width: 24px; height: 26px; }
.hib-dense .lc .lc-offer { font-size: 12.5px; }
.hib-dense .lc .lc-cta { height: 30px; margin-top: 4px; }
.hib-dense .lc .lp-tiles span { padding: 4px 3px; }
.hib-dense .lc .lc-sum__head { padding: 6px 10px; }
.hib-dense .lc .lc-sum__stats span { padding: 4px; }
.hib-dense .lc .lc-sum__price { padding: 4px 8px 8px; }
.hib-dense .lc .lc-rel { padding: 10px 12px 12px; }
.hib-dense .lc .lc-rel__price { padding-top: 8px; }
.hib-dense .lc .lc-glass { padding: 10px 6px 2px; }
.hib-dense .lc .lc-glass__rule { margin-top: 6px; }
.hib-dense .lc .lc-glass__price { padding: 6px 10px; }
.pcard.hib-feat { width: 100%; height: 100%; }
.pcard.hib-feat .pcard__img { flex: 1; min-height: 0; height: auto; }
.pcard.hib-feat .pcard__name { font-size: 20px; line-height: 24px; }
.pcard.hib-feat .pcard__year { font-size: 12px; }
.pcard.hib-feat--sm .pcard__name { font-size: 18px; line-height: 22px; }
.pcard.hib-mid { width: 160px; height: 262px; }
.pcard.hib-mid .pcard__img { height: 142px; }
/* Precio y corazón más chicos que los del OfferCard (gema 30 × 32 · texto 13 · like 30). */
.pcard.hib-mid .pcard-pprice { width: 24px; height: 26px; }
.pcard.hib-mid .pcard-pprice svg { width: 22px; height: 24px; }
.pcard.hib-mid .pcard__price-left { gap: 4px; }
.pcard.hib-mid .pcard__price-text { font-size: 11.5px; }
.pcard.hib-mid .pcard-like { width: 24px; height: 24px; }
.pcard.hib-mid .pcard-like svg { width: 13px; height: 13px; }
/* Etiqueta de precio de las short, más chica que la de Concorde (24 de alto · texto 13). */
.pcard--short .pcard__price-badge { height: 20px; top: 7px; left: 6px; padding: 0 8px 0 2px; gap: 2px; border-radius: 10px; }
.pcard--short .pcard__price-badge::before { border-radius: 10px; }
.pcard--short .pcard__price-badge-gem { transform: scale(0.8); }
.pcard--short .pcard__price-badge-text { font-size: 11px; }
`;

type Lot = LotData;
function badgeFor(lot: Lot, isFeatured: boolean): JSX.Element | undefined {
  const live = lot.live ? <BadgeStatus variant="live" /> : null;
  if (!isFeatured) return live ?? undefined;
  // Pill «Destacado»: el BadgeStatus morado de Concorde (variante «proxima») sin el reloj, a la izquierda de EN VIVO.
  return <span style={{ display: "inline-flex", gap: 6 }}><BadgeStatus variant="proxima" label="Destacado" icon={false} />{live}</span>;
}
function lotCard(lot: Lot, opts: { className?: string; size?: "short"; featured?: boolean } = {}): JSX.Element {
  return (
    <OfferCard key={lot.name} className={opts.className} size={opts.size} variant={lot.variant} name={lot.name} year={lot.year}
      price={lot.price} imageSrc={lot.imageSrc} badge={badgeFor(lot, !!opts.featured)} elevated />
  );
}

function LotsSection({ view, card, store }: { view: LotsView; card: CardStyle; store: Store }): JSX.Element {
  const LOTS = store.lots;
  const [featured, ...rest] = LOTS;
  const count = store.total;
  // Card «grande» según el estilo elegido (en Normal, el OfferCard de Concorde).
  const big = (lot: Lot, o: { featured?: boolean; width?: number | string; height?: number | string; fill?: boolean } = {}) =>
    card === "holo-curva" ? <FichaLegend key={lot.name} lot={lot} tier="holo" curve featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card.startsWith("leg-") ? <FichaLegend key={lot.name} lot={lot} tier={card.slice(4) as LegendTier} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card.startsWith("pro-") ? <FichaPro key={lot.name} lot={lot} theme={card.slice(4) as ProTheme} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card.startsWith("ficha-") ? <FichaPlus key={lot.name} lot={lot} layout={card.slice(6) as FichaLayout} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "ficha" ? <FichaCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "resumen" ? <SummaryCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "relieve" ? <ReliefCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} compact={view !== "gallery"} />
      : card === "cristal" ? <GlassCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height} mediaFill={o.fill} />
      : <ImmersiveCard key={lot.name} lot={lot} featured={o.featured} width={o.width} height={o.height ?? 262} />;
  let body: JSX.Element;
  if (view === "listado") {
    // Listado en 2 columnas: cada lote con la foto a la izquierda y el detalle a la derecha.
    body = <div className="hib-eblist">{LOTS.slice(0, 6).map((lot) => <EbayLotRow key={lot.name} lot={lot} store={store.name} />)}</div>;
  } else if (view === "listado-gallery") {
    // Destacada vertical (Holo curva) a la izquierda y 6 lotes en listado (2 columnas × 3 filas); la destacada toma el alto de la lista.
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "292px minmax(0, 1fr)", gap: 20, alignItems: "stretch" }}>
        <div style={{ display: "flex", minWidth: 0 }}>
          <FichaLegend lot={featured} tier="holo" curve featured width="100%" height="100%" mediaFill />
        </div>
        <div className="hib-eblist hib-eblist--two">{rest.slice(0, 6).map((lot) => <EbayLotRow key={lot.name} lot={lot} store={store.name} size="sm" />)}</div>
      </div>
    );
  } else if (card === "normal") {
    if (view === "normal") {
      body = <div className="hib-fluid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>{LOTS.slice(0, 4).map((lot) => lotCard(lot))}</div>;
    } else if (view === "gallery") {
      body = (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 16, height: GALLERY_HEIGHT }}>
          <div style={{ display: "flex", minWidth: 0, minHeight: 0 }}>{lotCard(featured, { className: "hib-feat", featured: true })}</div>
          <div className="hib-fluid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>{rest.map((lot) => lotCard(lot, { size: "short" }))}</div>
        </div>
      );
    } else {
      const cars = rest.filter((lot) => CAR_LOTS.includes(lot.name)).slice(0, 3);
      body = (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.8fr)", gap: 16, height: 300 }}>
          <div style={{ display: "flex", minWidth: 0 }}>{lotCard(featured, { className: "hib-feat hib-feat--sm", featured: true })}</div>
          <div className="hib-fluid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, alignItems: "start" }}>{cars.map((lot) => lotCard(lot, { className: "hib-mid" }))}</div>
        </div>
      );
    }
  } else if (view === "normal") {
    body = <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, alignItems: "stretch" }}>{LOTS.slice(0, 4).map((lot) => big(lot))}</div>;
  } else if (view === "gallery") {
    // Mismas proporciones que la galería Normal: 2 filas de 170 (las «short» de Concorde) = 352 de alto.
    // El destacado (estilo elegido) entra en esos 352: en .hib-dense la foto cede alto y los detalles
    // van más chicos. Las seis chicas, Inmersiva «sm» de 134 × 170.
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "292px minmax(0, 1fr)", gap: 16 }}>
        <div className="hib-dense" style={{ display: "flex", minWidth: 0, height: GALLERY_HEIGHT }}>{big(featured, { featured: true, height: "100%", fill: true })}</div>
        <div className="hib-smallgrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 134px)", justifyContent: "space-between", gridTemplateRows: "repeat(2, 170px)", gridAutoRows: 0, overflow: "hidden", gap: 12 }}>
          {rest.map((lot) => <CompactCurveCard key={lot.name} lot={lot} />)}
        </div>
      </div>
    );
  } else {
    const cars = rest.filter((lot) => CAR_LOTS.includes(lot.name)).slice(0, 3);
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.8fr)", gap: 16, alignItems: "stretch" }}>
        <div style={{ display: "flex", minWidth: 0 }}>{big(featured, { featured: true, height: "100%", fill: true })}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, alignItems: "stretch" }}>{cars.map((lot) => big(lot))}</div>
      </div>
    );
  }
  return (
    <section
      aria-label={`Lotes de ${store.name}`}
      style={{
        boxSizing: "border-box", width: "100%", background: "#ffffff", borderRadius: 16,
        boxShadow: SHADOW, padding: "0 0 16px", display: "flex", flexDirection: "column", gap: 16, fontFamily: FONT,
      }}
    >
      {/* Cabecera de tienda (referencia): logo 56 × 44, nombre, oportunidades y «Ver todo el lote». */}
      <header style={{ boxSizing: "border-box", flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: 68, padding: "0 24px", borderBottom: "1px solid #e8ddff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <span style={{ flex: "none", display: "grid", placeItems: "center", width: 56, height: 44, padding: "6px 8px", boxSizing: "border-box", borderRadius: 8, border: "1px solid #e8ddff", background: "#fff" }}>
            <img src={store.logo} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
          </span>
          <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 20, lineHeight: "24px", fontWeight: 600, color: "#3b1782", whiteSpace: "nowrap" }}>{store.name}</h3>
            <p style={{ margin: 0, fontSize: 14, lineHeight: "18px", color: "#191c1c" }}>{count} oportunidades</p>
          </div>
        </div>
        <div style={{ flex: "none" }}><ProfileButton>Ver todo el lote</ProfileButton></div>
      </header>
      <div style={{ padding: "0 16px" }}>{body}</div>
      <style>{LOTS_CSS}</style>
      <LotCardStyles />
    </section>
  );
}

const FEED_VIEWS: { id: FeedView; label: string; hint: string }[] = [
  { id: "timeline", label: "Timeline", hint: "Estilo X / Twitter" },
  { id: "normal", label: "Listado", hint: "Foto, lote y precio" },
];

// Selector flotante de vistas, pegado a la derecha del bloque (fuera de los 798 del homepage). Solo QA.
const SWITCH_CSS = `
.hib-switches { position: absolute; top: 0; left: calc(100% + 32px); z-index: 5; display: flex; flex-direction: column; gap: 12px;
  width: clamp(150px, calc((100vw - 1024px) / 2 - 48px), 360px); }
.hib-switch { width: 100%; box-sizing: border-box; padding: 10px;
  border-radius: 12px; background: #fff; box-shadow: rgba(32,0,104,0.16) 0 6px 20px; font-family: ${FONT}; }
.hib-switch > span { display: block; margin: 0 2px 8px; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #8a879c; }
.hib-switch__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 4px; }
.hib-switch button { display: block; width: 100%; padding: 7px 9px; border: 1px solid #e3e1ec; border-radius: 9px; font: inherit; text-align: left; background: #fff; cursor: pointer; }
.hib-switch button b { display: block; font-size: 12px; color: #191C1C; }
.hib-switch button small { display: block; margin-top: 1px; font-size: 10.5px; color: #6b6880; }
.hib-switch button:hover { border-color: #b9a8ef; }
.hib-switch button[aria-pressed="true"] { border-color: #8460e5; background: #f3effd; }
.hib-switch button[aria-pressed="true"] b { color: #3b1782; }
.hib-slider > span { display: flex; justify-content: space-between; align-items: baseline; }
.hib-slider > span b { font-size: 12px; letter-spacing: 0; text-transform: none; color: #3b1782; font-variant-numeric: tabular-nums; }
.hib-slider input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; margin: 6px 0 4px; border-radius: 999px; outline: none; cursor: pointer; }
.hib-slider input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff;
  background: linear-gradient(135deg, #8460E5, #3B1782); box-shadow: rgba(59,23,130,0.35) 0 2px 6px; }
.hib-slider input[type="range"]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; background: #5A35C2; box-shadow: rgba(59,23,130,0.35) 0 2px 6px; }
.hib-slider input[type="range"]:focus-visible::-webkit-slider-thumb { outline: 2px solid #8460E5; outline-offset: 2px; }
.hib-slider__foot { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.hib-slider__foot small { font-size: 10.5px; color: #8a879c; }
.hib-slider__foot button { width: auto !important; padding: 3px 8px !important; font-size: 11px !important; font-weight: 700; color: #3b1782; }
.hib-slider__foot button:disabled { opacity: 0.45; cursor: default; }
`;
// Control QA: alto del banner principal y de «VMC ahora» (misma fila), para ver cómo se adaptan.
const HERO_MIN = 220;
const HERO_MAX = 460;
const HERO_DEFAULT = 368;
function HeightSlider({ value, onChange }: { value: number; onChange: (v: number) => void }): JSX.Element {
  return (
    <div className="hib-switch hib-slider" role="group" aria-label="Alto del banner">
      <span>Alto del banner<b>{value}px</b></span>
      <input type="range" min={HERO_MIN} max={HERO_MAX} step={4} value={value} aria-label="Alto del banner en píxeles"
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(90deg, #8460E5 ${((value - HERO_MIN) / (HERO_MAX - HERO_MIN)) * 100}%, #E6E1F5 0)` }} />
      <div className="hib-slider__foot"><small>{HERO_MIN}</small>
        <button type="button" onClick={() => onChange(HERO_DEFAULT)} disabled={value === HERO_DEFAULT}>Restablecer {HERO_DEFAULT}</button>
        <small>{HERO_MAX}</small></div>
    </div>
  );
}

function Switches({ children }: { children: ReactNode }): JSX.Element {
  return <div className="hib-switches">{children}<style>{SWITCH_CSS}</style></div>;
}
function ViewSwitch<T extends string>({ title, suffix = "vista", options, value, onChange }: {
  title: string; suffix?: string; options: { id: T; label: string; hint: string }[]; value: T; onChange: (v: T) => void;
}): JSX.Element {
  return (
    <div className="hib-switch" role="group" aria-label={`${title} · ${suffix}`}>
      <span>{title}{suffix ? ` · ${suffix}` : ""}</span>
      <div className="hib-switch__grid">
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}><b>{o.label}</b><small>{o.hint}</small></button>
        ))}
      </div>
    </div>
  );
}

export default function HomeIndexBlock(): JSX.Element {
  // Cada tienda tiene su propio selector de vista de lotes y de Detail card.
  const [lotsView, setLotsView] = useState<LotsView>("gallery");
  const [cardStyle, setCardStyle] = useState<CardStyle>("holo-curva");
  const [lotsView2, setLotsView2] = useState<LotsView>("gallery");
  const [cardStyle2, setCardStyle2] = useState<CardStyle>("holo-curva");
  const [companiesView, setCompaniesView] = useState<CompaniesView>("slider");
  const [feedView, setFeedView] = useState<FeedView>("timeline");
  const [offerView, setOfferView] = useState<OfferTypeView>("normal");
  const [heroH, setHeroH] = useState(368); // alto del banner + VMC ahora (control QA)
  const [categoriesView, setCategoriesView] = useState<CategoriesView>("normal");
  // Orden: hero + actividad · Lotes para explorar · banner de campaña · Explora por categoría · Empresas y vendedores ·
  // Tipo de oferta y Categorías.
  // Columna con el mismo margen (16) y separación (16) que el bloque de Concorde; el alto lo da el contenido.
  return (
    <div data-block="homepage" style={{ width: "100%", padding: "16px",  boxSizing: "border-box", background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", gap: GAP }}>
      {/* Proporción de la referencia: hero flexible + feed de mín. 300 (32 %), 368 de alto (600 × 368 · 300 × 368 con el sidebar cerrado). */}
      {/* «Corta»: Tipo de oferta va bajo el banner (mismo ancho) y VMC ahora ocupa las dos filas a su lado. */}
      <div style={{ position: "relative", width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 32%)", gap: GAP,
        ...(offerView === "corta" ? { gridTemplateRows: `${heroH}px auto` } : { gridTemplateRows: "minmax(0, 1fr)", height: heroH }) }}>
        <div data-slot="principal-banner" style={{ gridColumn: 1, gridRow: 1, minWidth: 0, display: "flex", height: "100%" }}><PrincipalBanner /></div>
        <div data-slot="secondary-banner" style={{ gridColumn: 2, gridRow: offerView === "corta" ? "1 / 3" : 1, minWidth: 0, minHeight: 0, display: "flex", height: "100%", position: "relative" }}>
          {/* El feed no empuja la fila: se dibuja absoluto y toma el alto que dejan banner + Tipo de oferta. */}
          <div style={{ position: "absolute", inset: 0, display: "flex" }}><VmcAhora view={feedView} /></div>
        </div>
        {offerView === "corta" ? <div style={{ gridColumn: 1, gridRow: 2, minWidth: 0 }}><OfferTypeCard view="corta" /></div> : null}
        <Switches>
          <ViewSwitch title="VMC ahora" options={FEED_VIEWS} value={feedView} onChange={setFeedView} />
          <HeightSlider value={heroH} onChange={setHeroH} />
          {/* El selector de Tipo de oferta va siempre aquí: es más alto que su sección y se montaba sobre el de Autoplan. */}
          <ViewSwitch title="Tipo de oferta" options={OFFER_TYPE_VIEWS} value={offerView} onChange={setOfferView} />
        </Switches>
      </div>
      {offerView === "corta" ? null : (
        <div style={{ position: "relative", width: "100%" }}>
          <OfferTypeCard view={offerView} />
        </div>
      )}
      <div style={{ position: "relative", width: "100%" }}>
        <LotsSection view={lotsView} card={cardStyle} store={STORES[0]} />
        <Switches>
          <ViewSwitch title="Autoplan · lotes" suffix="" options={LOTS_VIEWS} value={lotsView} onChange={setLotsView} />
          <ViewSwitch title="Autoplan · detail card" suffix="" options={CARD_STYLES} value={cardStyle} onChange={setCardStyle} />
        </Switches>
      </div>
      <div style={{ position: "relative", width: "100%" }}>
        <LotsSection view={lotsView2} card={cardStyle2} store={STORES[1]} />
        <Switches>
          <ViewSwitch title="Mapfre · lotes" suffix="" options={LOTS_VIEWS} value={lotsView2} onChange={setLotsView2} />
          <ViewSwitch title="Mapfre · detail card" suffix="" options={CARD_STYLES} value={cardStyle2} onChange={setCardStyle2} />
        </Switches>
      </div>
      <div style={{ position: "relative", width: "100%" }}>
        <CategoryRail view={categoriesView} />
        <Switches><ViewSwitch title="Categorías" options={CATEGORIES_VIEWS} value={categoriesView} onChange={setCategoriesView} /></Switches>
      </div>
      <div data-slot="banner" style={{ width: "100%" }}><CampaignBanner /></div>
      <div style={{ width: "100%" }}><SellSection /></div>
      <div style={{ position: "relative", width: "100%" }}>
        <CompaniesSection view={companiesView} />
        <Switches><ViewSwitch title="Empresas" options={COMPANIES_VIEWS} value={companiesView} onChange={setCompaniesView} /></Switches>
      </div>
    </div>
  );
}
