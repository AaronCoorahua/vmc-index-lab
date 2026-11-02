"use client";

/**
 * HeroBanner · banner principal del Index con su transición.
 * - Fundido entre diapositivas (0.5 s) y la foto entra con un zoom lento (de 108 % a 100 % en 7.5 s).
 * - El texto entra con un efecto: «letters» (el título letra por letra, en cascada), «rise», «blur», «mask» o «none».
 * - Abajo al centro, la «montaña de vidrio»: una pestaña curva de vidrio con los puntos; el activo se alarga.
 * - Avanza solo cada `interval` ms; se pausa con el mouse o el foco dentro. Flechas ← → del teclado.
 * Independiente: solo React y hero-banner.css.
 *
 *   <HeroBanner height={300} slides={[
 *     { image: "/hero-1.jpg", pill: { text: "Canal de WhatsApp" }, title: <>Entérate <em>primero</em><br />de las subastas</>,
 *       lead: "Únete al canal y recibe los lotes nuevos antes que nadie.", cta: "Unirme al canal", href: "/whatsapp" },
 *     { image: "/hero-2.jpg", align: "right", title: <>Publica tu auto<br />y <em>recibe ofertas</em></>, cta: "Publicar mi auto" },
 *   ]} />
 */
import { Fragment, cloneElement, isValidElement, useEffect, useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import "./hero-banner.css";

export type HeroBannerSlide = {
  image: string;
  /** Título; usa <em> para la parte resaltada (va en durazno) y <br /> para partir la línea. */
  title: ReactNode;
  lead?: ReactNode;
  /** Botón de vidrio. */
  cta?: string;
  href?: string;
  onCta?: () => void;
  pill?: { text: string; icon?: ReactNode; background?: string };
  /** Degradado de fondo (se ve donde la foto no llega y detrás del velo). */
  background?: string;
  /** object-position de la foto, p. ej. "70% 30%". */
  imagePosition?: string;
  /** Lado del texto; la foto queda limpia del otro lado. */
  align?: "left" | "right";
  /** Nombre corto para lectores de pantalla y los puntos. */
  label?: string;
};

export type HeroBannerEffect = "letters" | "rise" | "blur" | "mask" | "none";

export type HeroBannerProps = {
  slides: HeroBannerSlide[];
  /** Milisegundos por diapositiva (0 = sin avance automático). */
  interval?: number;
  effect?: HeroBannerEffect;
  /** Alto del banner (px o cualquier valor CSS). */
  height?: number | string;
  className?: string;
};

/** Parte el título en palabras y letras (efecto «letters»); conserva <em> y <br>. */
function Letters({ children }: { children: ReactNode }): JSX.Element {
  let n = 0;
  const walk = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      return node.split(/(\s+)/).map((w, k) => (/^\s+$/.test(w) || !w ? w
        : <span key={k} className="vbn-word">{[...w].map((c, j) => <span key={j} className="vbn-ch" style={{ "--i": n++ } as CSSProperties}>{c}</span>)}</span>));
    }
    if (Array.isArray(node)) return node.map((c, k) => <Fragment key={k}>{walk(c)}</Fragment>);
    if (isValidElement<{ children?: ReactNode }>(node)) return cloneElement(node, undefined, walk(node.props.children));
    return node;
  };
  return <>{walk(children)}</>;
}
/** Texto plano del título, para lectores de pantalla cuando se parte en letras. */
const plain = (node: ReactNode): string =>
  typeof node === "string" ? node : Array.isArray(node) ? node.map(plain).join("")
    : isValidElement<{ children?: ReactNode }>(node) ? (node.type === "br" ? " " : plain(node.props.children)) : "";

export function HeroBanner({ slides, interval = 7000, effect = "letters", height = 300, className = "" }: HeroBannerProps): JSX.Element {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);
  useEffect(() => {
    if (paused || !interval || count < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearTimeout(t);
  }, [index, paused, interval, count]);

  return (
    <section className={`vbn vbn--fx-${effect}${paused ? " is-paused" : ""}${className ? ` ${className}` : ""}`} style={{ height }}
      aria-roledescription="carrusel" aria-label="Destacados"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); }}>
      {slides.map((s, i) => {
        const on = i === index;
        const right = s.align === "right";
        const name = s.label ?? plain(s.title);
        return (
          <div key={i} className={`vbn-slide${on ? " is-on" : ""}`} role="group" aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${count}: ${name}`} aria-hidden={!on} inert={!on}>
            <div className="vbn-bg" style={{ background: s.background ?? "linear-gradient(100deg, #2A1670 0%, #3D2299 34%, #6B48DD 76%, #8460E5 100%)" }} />
            <div className={`vbn-photo${right ? " vbn-photo--flip" : ""}`}><img src={s.image} alt="" style={{ objectPosition: s.imagePosition ?? (right ? "30% 30%" : "70% 30%") }} /></div>
            <div className={`vbn-copy${right ? " vbn-copy--right" : ""}`}>
              {s.pill ? <span className="vbn-pill" style={s.pill.background ? { background: s.pill.background } : undefined}>{s.pill.icon}{s.pill.text}</span> : null}
              {effect === "letters"
                ? <h2 className="vbn-title"><span className="vbn-sr">{plain(s.title)}</span><span aria-hidden><Letters>{s.title}</Letters></span></h2>
                : <h2 className="vbn-title">{s.title}</h2>}
              {s.lead ? <p className="vbn-lead">{s.lead}</p> : null}
              {s.cta ? (s.href
                ? <a className="vbn-cta" href={s.href} onClick={s.onCta}>{s.cta}</a>
                : <button type="button" className="vbn-cta" onClick={s.onCta}>{s.cta}</button>) : null}
            </div>
          </div>
        );
      })}
      {count > 1 ? (
        <div className="vbn-mtn">
          <span className="vbn-mtn__clip" aria-hidden><span className="vbn-mtn__glass" /></span>
          <svg className="vbn-mtn__edge" viewBox="0 0 132 26" aria-hidden><path d="M0 26C22 26 26 2 48 2H84C106 2 110 26 132 26" /></svg>
          <div className="vbn-mtn__dots" role="group" aria-label="Elegir diapositiva">
            {slides.map((s, i) => (
              <button key={i} type="button" className={i === index ? "is-on" : undefined} aria-current={i === index}
                aria-label={`Ir a la diapositiva ${i + 1}: ${s.label ?? plain(s.title)}`} onClick={() => setIndex(i)} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default HeroBanner;
