"use client";

/**
 * LikeButton — el «Mini like button» de Concorde (el mismo de OfferCard, extraído para reutilizarlo en otras cards).
 * Fuente: concorde/components/OfferCard.tsx (.pcard-like): círculo 30×30 con borde degradado lila, brillo glass
 * (white 0.55 → transparente), corazón #5a35c2 en reposo; activo = degradado vault + corazón blanco, con «pop» al marcar.
 * Estados: hover (escala 1.1 y sube 1px), presionado (0.92), foco visible (anillo oklch 285). `prefers-reduced-motion` apaga el movimiento.
 */

import { useCallback, useState } from "react";
import type { JSX, MouseEvent } from "react";

const HEART_PATH = "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";

const CSS = `
.clike {
  display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 9999px;
  border: 1.44px solid transparent;
  background-image: linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, #e8ddff 0%, #ffffff 40%, #cfbaff 75%, #ae8eff 100%);
  background-origin: padding-box, border-box; background-clip: padding-box, border-box;
  cursor: pointer; padding: 2px; position: relative; overflow: hidden; box-shadow: rgba(132, 96, 229, 0.14) 0px 2px 8px;
  transition: transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s; flex-shrink: 0; outline: none;
}
.clike::before { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(rgba(255, 255, 255, 0.55) 0%, transparent 50%); pointer-events: none; z-index: 1; }
.clike svg { position: relative; z-index: 2; }
.clike:hover { transform: scale(1.1) translateY(-1px); box-shadow: rgba(32, 0, 104, 0.2) 0px 6px 14px; }
.clike:active { transform: scale(0.92); }
.clike--active {
  background-image: linear-gradient(135deg, #8460e5 0%, #3b1782 100%), linear-gradient(135deg, #fbc47d 0%, #fbc47d 100%);
  box-shadow: rgba(132, 96, 229, 0.35) 0px 2px 8px, inset 0px 1px 0px rgba(255, 255, 255, 0.22);
}
.clike--pop svg { animation: clike-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) 1; }
@keyframes clike-pop { 0% { transform: scale(1); } 35% { transform: scale(1.4); } 65% { transform: scale(0.85); } 85% { transform: scale(1.1); } 100% { transform: scale(1); } }
.clike:focus-visible { outline: 2px solid oklch(0.62 0.20 285); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .clike { transition: none; } .clike--pop svg { animation: none; } }
`;

export interface LikeButtonProps {
  /** Estado controlado; si se omite, el botón maneja su propio estado. */
  liked?: boolean;
  onLikeChange?: (liked: boolean) => void;
  /** Lado en px (30 por defecto; 22 en las cards «short», igual que OfferCard). */
  size?: number;
  /** Nombre del lote, para el texto accesible. */
  name?: string;
  className?: string;
}

export default function LikeButton({ liked: controlled, onLikeChange, size = 30, name, className = "" }: LikeButtonProps): JSX.Element {
  const isControlled = controlled !== undefined;
  const [internal, setInternal] = useState(false);
  const [popping, setPopping] = useState(false);
  const isLiked = isControlled ? controlled : internal;

  const handle = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    const next = !isLiked;
    if (!isControlled) setInternal(next);
    onLikeChange?.(next);
    if (next) { setPopping(true); setTimeout(() => setPopping(false), 420); }
  }, [isLiked, isControlled, onLikeChange]);

  const icon = Math.round(size * 0.5);
  return (
    <>
      <style>{CSS}</style>
      <button
        type="button"
        className={["clike", isLiked ? "clike--active" : "", popping ? "clike--pop" : "", className].filter(Boolean).join(" ")}
        style={{ width: size, height: size }}
        onClick={handle}
        aria-label={`${isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}${name ? `: ${name}` : ""}`}
        aria-pressed={isLiked}
      >
        <svg width={icon} height={icon} viewBox="0 0 24 24" fill={isLiked ? "rgba(255,255,255,0.92)" : "#ffffff"} stroke={isLiked ? "none" : "#5a35c2"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={HEART_PATH} />
        </svg>
      </button>
    </>
  );
}
