"use client";

/**
 * HeroPromo — carrusel principal del index (reemplaza a PrincipalBanner).
 * Tres slides con foto nítida y fundido corto hacia el degradado del sistema:
 *   1. Subasta en vivo   (plum → naranja, lote destacado + cuenta regresiva real)
 *   2. Publica tu auto   (naranja → plum, foto a la izquierda)
 *   3. Negocia directo   (plum → teal negociable)
 * Ancho 100% fluido; alto por aspect-ratio (≈4.2:1) acotado a 260–320 px. Sin zoom ni transform:scale de layout.
 * Colores y degradados: los de PromoBanner.tsx (C / TONE_GRADIENTS); el resto, tokens var(--vmc-*) de tokens.css.
 * CTA = GlassButton (Figma VOYAGER 7566:25905). Contenido de ejemplo; sin inventario real.
 */

import { useEffect, useState } from "react";
import type { JSX, ReactNode } from "react";
import { BadgeStatus } from "@vmc/concorde-adapter";
import TimerIcon from "@/concorde/components/TimerIcon";
import { HandshakeIcon } from "@/concorde/bloques/banners/desktop/decor";
import GlassButton from "./GlassButton";

const AUTOPLAY_MS = 7000;
const LIVE_SECONDS = 1 * 3600 + 24 * 60 + 36; // 01:24:36, dato de ejemplo del lab

// Paleta y degradados exactos de PromoBanner.tsx (C y TONE_GRADIENTS).
const CREAM = "#FFE2C2";
const BG_LIVE = "linear-gradient(100deg, #2A1670 0%, #3D2299 32%, #C85A1E 78%, #E8732A 100%)"; // plum-orange / live.centerBg
const BG_LIVE_FLIP = "linear-gradient(100deg, #E8732A 0%, #C85A1E 26%, #3D2299 72%, #2A1670 100%)"; // live.flip
const BG_NEGOTIABLE = "linear-gradient(100deg, #2A1670 0%, #3D2299 35%, #00838C 78%, #00D2D3 100%)"; // negotiable.centerBg

const EDGE_BOTH = "linear-gradient(90deg, transparent 0%, #000 26%, #000 80%, transparent 100%)"; // foto exenta: deja ver el teal a ambos lados
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (s: number) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

const CSS = `
.hp { position: relative; width: 100%; min-width: 0; aspect-ratio: 4.2 / 1; min-height: 260px; max-height: 320px; box-sizing: border-box;
  container: hp / inline-size; border-radius: 16px; overflow: hidden; font-family: var(--vmc-font-display); color: var(--vmc-color-base-white);
  background: var(--vmc-color-vault-800); box-shadow: var(--vmc-shadow-card); isolation: isolate; }
.hp *, .hp *::before, .hp *::after { box-sizing: border-box; }
.hp-slide { position: absolute; inset: 0; opacity: 0; visibility: hidden; transition: opacity .5s ease, visibility 0s linear .5s; }
.hp-slide.on { opacity: 1; visibility: visible; transition: opacity .5s ease, visibility 0s; }
.hp-bg { position: absolute; inset: 0; }

/* Foto nítida; fundido corto hacia el degradado del sistema. */
.hp-photo { position: absolute; top: 0; bottom: 0; width: var(--pw, 58%); }
.hp-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.hp-photo.r { right: 0; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 30%); mask-image: linear-gradient(90deg, transparent 0%, #000 30%); }
.hp-photo.l { left: 0; -webkit-mask-image: linear-gradient(270deg, transparent 0%, #000 30%); mask-image: linear-gradient(270deg, transparent 0%, #000 30%); }

.hp-copy { position: absolute; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  padding-bottom: 28px; gap: 12px; width: 44%; min-width: 0; }
.hp-copy.left { left: 36px; }
.hp-copy.right { right: 36px; }
.hp-label { display: inline-flex; align-items: center; gap: 8px; height: 28px; padding: 0 14px; border-radius: var(--vmc-radius-full); background: rgba(0,0,0,0.22);
  font-size: var(--vmc-font-size-label); line-height: var(--vmc-line-height-label); font-weight: 700; letter-spacing: var(--vmc-letter-spacing-label); text-transform: uppercase; white-space: nowrap; }
.hp-h { margin: 0; font-size: var(--vmc-font-size-hero); line-height: var(--vmc-line-height-hero); font-weight: var(--vmc-font-weight-bold); letter-spacing: var(--vmc-letter-spacing-tight); }
.hp-h em { font-style: normal; color: ${CREAM}; }
.hp-p { margin: 0; font-size: var(--vmc-font-size-body); line-height: var(--vmc-line-height-body); font-weight: var(--vmc-font-weight-medium); max-width: 40ch; }
.hp-p b { font-weight: var(--vmc-font-weight-bold); }

/* Lote destacado (slide 1): glass del sistema sobre la foto */
.hp-lot { position: absolute; right: 24px; bottom: 24px; width: 232px; padding: 14px 16px; border-radius: var(--vmc-radius-xl);
  background: var(--vmc-color-glass-dark); border: var(--vmc-border-glass); -webkit-backdrop-filter: var(--vmc-glass-blur); backdrop-filter: var(--vmc-glass-blur); }
.hp-lot small { display: block; font-size: var(--vmc-font-size-caption); line-height: var(--vmc-line-height-caption); font-weight: 700; letter-spacing: var(--vmc-letter-spacing-label); text-transform: uppercase; color: ${CREAM}; }
.hp-lot strong { display: block; margin-top: 2px; font-size: var(--vmc-font-size-body); line-height: var(--vmc-line-height-body); font-weight: var(--vmc-font-weight-bold); }
.hp-lot .price { display: block; margin-top: 2px; font-size: 24px; line-height: 30px; font-weight: var(--vmc-font-weight-bold); letter-spacing: var(--vmc-letter-spacing-tight); }
.hp-lot .price span { font-size: var(--vmc-font-size-label); margin-right: 4px; font-weight: 700; }
.hp-lot .timer { display: inline-flex; align-items: center; gap: 7px; height: 28px; margin-top: 10px; padding: 0 13px; border-radius: var(--vmc-radius-full);
  background: linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.10) 100%); border: 1px solid rgba(255,255,255,0.5);
  font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* Controles compactos arriba a la derecha */
.hp-ctrl { position: absolute; top: 12px; right: 12px; z-index: 5; display: flex; align-items: center; gap: 2px; padding: 2px 4px; border-radius: var(--vmc-radius-full);
  background: var(--vmc-color-glass-dark); border: var(--vmc-border-glass); -webkit-backdrop-filter: var(--vmc-glass-blur); backdrop-filter: var(--vmc-glass-blur); }
.hp-arrow { display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 50%; background-color: transparent; color: var(--vmc-color-base-white); cursor: pointer; transition: background-color .2s; }
.hp-arrow:hover { background-color: rgba(255,255,255,.18); }
.hp-segs { display: flex; gap: 4px; padding: 0 4px; }
.hp-seg { position: relative; width: 22px; height: 24px; padding: 0; border: 0; background-color: transparent; cursor: pointer; }
.hp-seg::before { content: ""; position: absolute; left: 0; right: 0; top: 10px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.4); }
.hp-seg i { position: absolute; left: 0; top: 10px; height: 4px; width: 0; border-radius: 2px; background: var(--vmc-color-base-white); }
.hp-seg.on i { animation: hp-prog ${AUTOPLAY_MS}ms linear forwards; }
.hp.paused .hp-seg.on i { animation-play-state: paused; }
@keyframes hp-prog { to { width: 100%; } }
.hp-arrow:focus-visible, .hp-seg:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }

@container hp (max-width: 960px) { .hp-copy { width: 50%; } .hp-h { font-size: var(--vmc-font-size-title); line-height: var(--vmc-line-height-title); } .hp-lot { width: 200px; right: 16px; bottom: 16px; } }
@container hp (max-width: 700px) {
  .hp-photo { width: 100%; opacity: .6; left: 0; right: 0; }
  .hp-copy, .hp-copy.right { left: 20px; right: auto; width: calc(100% - 40px); }
  .hp-lot { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hp-slide { transition: none; }
  .hp-seg.on i { animation: none; width: 100%; }
}
`;

type Slide = { label: string; node: ReactNode };

function Chevron({ dir }: { dir: "prev" | "next" }): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden>
      <path d={dir === "prev" ? "M12 5l-5 5 5 5" : "M8 5l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroPromo(): JSX.Element {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [left, setLeft] = useState(LIVE_SECONDS);

  // Cuenta regresiva real (1 s). Al llegar a 0 reinicia el ciclo de ejemplo.
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s <= 1 ? LIVE_SECONDS : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Autoplay 7 s: pausa con puntero/foco y respeta prefers-reduced-motion.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % 3), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, paused]);

  const slides: Slide[] = [
    {
      label: "Subasta en vivo: puja y llévatelo hoy",
      node: (
        <>
          <div className="hp-bg" style={{ background: BG_LIVE }} />
          <div className="hp-photo r" style={{ ["--pw" as string]: "60%" }}><img src="/demo/inventory-suv-v1.png" alt="" width={1536} height={1024} loading="eager" style={{ objectPosition: "50% 55%" }} /></div>
          <div className="hp-copy left">
            <BadgeStatus variant="live" />
            <h2 className="hp-h">Puja <em>en vivo</em><br />y llévatelo hoy</h2>
            <p className="hp-p"><b>21 subastas activas</b> con lotes verificados por empresas.</p>
            <GlassButton>Entrar a la subasta</GlassButton>
          </div>
          <div className="hp-lot">
            <small>Lote destacado</small>
            <strong>Toyota Yaris 2022</strong>
            <span className="price"><span>US$</span>2,799</span>
            <span className="timer"><TimerIcon size={14} color={CREAM} />Cierra en {fmt(left)}</span>
          </div>
        </>
      ),
    },
    {
      label: "Publica tu auto y véndelo con VMC",
      node: (
        <>
          <div className="hp-bg" style={{ background: BG_LIVE_FLIP }} />
          <div className="hp-photo l" style={{ ["--pw" as string]: "58%" }}><img src="/demo/inventory-suv-v1.png" alt="" width={1536} height={1024} loading="lazy" style={{ objectPosition: "40% 55%" }} /></div>
          <div className="hp-copy right">
            <span className="hp-label">Para vendedores</span>
            <h2 className="hp-h">Publica tu auto<br />y <em>véndelo</em> con VMC</h2>
            <p className="hp-p">Llega a compradores de todo el país. Elige subasta en vivo o precio negociable.</p>
            <GlassButton>Publicar mi auto</GlassButton>
          </div>
        </>
      ),
    },
    {
      label: "Negocia directo con el vendedor",
      node: (
        <>
          <div className="hp-bg" style={{ background: BG_NEGOTIABLE }} />
          <div className="hp-photo r" style={{ right: "7%", ["--pw" as string]: "44%", WebkitMaskImage: EDGE_BOTH, maskImage: EDGE_BOTH }}><img src="/demo/inventory-forklift-v1.png" alt="" width={1536} height={1024} loading="lazy" style={{ objectPosition: "50% 50%" }} /></div>
          <div className="hp-copy left">
            <span className="hp-label"><HandshakeIcon size={16} color="#FFFFFF" />Negociable</span>
            <h2 className="hp-h">Negocia <em>directo</em><br />con el vendedor</h2>
            <p className="hp-p"><b>12 lotes negociables.</b> Envía tu oferta y cierra el precio.</p>
            <GlassButton>Ver negociables</GlassButton>
          </div>
        </>
      ),
    },
  ];

  const go = (d: number) => setIndex((i) => (i + d + slides.length) % slides.length);

  return (
    <section
      className={`hp${paused ? " paused" : ""}`}
      aria-roledescription="carrusel"
      aria-label="Destacados"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}
    >
      <style>{CSS}</style>
      {slides.map((s, i) => (
        <div
          key={i}
          className={`hp-slide${i === index ? " on" : ""}`}
          role="group"
          aria-roledescription="diapositiva"
          aria-label={`${i + 1} de ${slides.length}: ${s.label}`}
          aria-hidden={i !== index}
          inert={i !== index}
        >
          {s.node}
        </div>
      ))}
      <div className="hp-ctrl" role="group" aria-label="Navegar destacados">
        <button type="button" className="hp-arrow" aria-label="Anterior" onClick={() => go(-1)}><Chevron dir="prev" /></button>
        <div className="hp-segs" role="group" aria-label="Elegir diapositiva">
          {slides.map((_, i) => (
            <button key={i} type="button" className={`hp-seg${i === index ? " on" : ""}`} aria-label={`Ir a la diapositiva ${i + 1}`} aria-current={i === index} onClick={() => setIndex(i)}>
              <i key={i === index ? `a${index}` : "x"} />
            </button>
          ))}
        </div>
        <button type="button" className="hp-arrow" aria-label="Siguiente" onClick={() => go(1)}><Chevron dir="next" /></button>
      </div>
    </section>
  );
}
