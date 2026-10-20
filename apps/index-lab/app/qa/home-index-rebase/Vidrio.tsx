"use client";

/**
 * Vidrio — íconos «vidrio esmerilado» (receta de mi-garaje-lab · 08-iconos-vidrio.md).
 * Cada ícono = 3 piezas sobre una retícula de 48 × 48:
 *   back   forma SÓLIDA detrás (accesorio / sombra)        · var(--solid)
 *   front  forma de VIDRIO delante (objeto principal)      · var(--glass) al 72 % + borde blanco 1,5 px al 45 %
 *   detail detalle en BLANCO sobre el vidrio (una sola idea)
 * El vidrio NO usa backdrop-filter: es una copia desenfocada (blur 3,2) de `back` recortada por la silueta de `front`.
 * SVG puro: se ve igual en todos los navegadores.
 *
 * Movimiento: el contenedor clickeable lleva la clase `vd-host`; en hover/foco el vidrio sube 1,5 px y el sólido baja,
 * al presionar las capas se juntan (escala 0,94 en 90 ms), seleccionado = naranja + barra inferior. `prefers-reduced-motion`
 * apaga todo. Para otro contexto de color basta redefinir --solid y --glass sobre `.vd`.
 */

import { useId } from "react";
import type { JSX, ReactNode } from "react";

export type VidrioName =
  | "fecha" | "negociaciones" | "categoria" | "empresa" | "ayuda"
  | "auto" | "maquinaria" | "equipos" | "materiales" | "articulos"
  | "verificado" | "crecimiento" | "subasta";
export type VidrioState = "default" | "hover" | "active" | "disabled";

const W = { stroke: "#fff", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
const T = { fill: "#fff", stroke: "none", fontWeight: 800, textAnchor: "middle" } as const;

type Parts = { back: ReactNode; front: ReactNode; detail?: ReactNode };

const PARTS: Record<VidrioName, Parts> = {
  // Fecha / hoy: bloque sólido arriba a la derecha, hoja de calendario de vidrio con la línea de cabecera y dos días.
  fecha: {
    back: <rect x="24" y="4" width="19" height="17" rx="5" />,
    front: <rect x="5" y="11" width="32" height="32" rx="7" />,
    detail: <path d="M12 21h18M14 31h.01M23 31h.01" {...W} strokeWidth={3.5} />,
  },
  // Negociaciones / tipo de oferta: globo sólido detrás, globo de vidrio delante con tres puntos.
  negociaciones: {
    back: <rect x="20" y="5" width="23" height="17" rx="6" />,
    front: <rect x="5" y="16" width="27" height="22" rx="7" />,
    detail: <path d="M13 27h.01M18.5 27h.01M24 27h.01" {...W} strokeWidth={3.5} />,
  },
  // Categoría: cuadro sólido abajo a la derecha, cuadro de vidrio con cuatro puntos (rejilla).
  categoria: {
    back: <rect x="24" y="24" width="19" height="19" rx="6" />,
    front: <rect x="5" y="5" width="27" height="27" rx="7" />,
    detail: <path d="M13 13h.01M24 13h.01M13 24h.01M24 24h.01" {...W} strokeWidth={3.5} />,
  },
  // Empresa: ala sólida a un lado, edificio de vidrio con ventanas y puerta.
  empresa: {
    back: <rect x="27" y="17" width="16" height="26" rx="5" />,
    front: <rect x="6" y="5" width="26" height="38" rx="6" />,
    detail: <path d="M14 15h.01M24 15h.01M14 24h.01M24 24h.01M15 43v-7h8v7" {...W} strokeWidth={3} />,
  },
  // Ayuda: burbuja sólida arriba a la derecha, globo de vidrio con «?».
  ayuda: {
    back: <circle cx="34" cy="14" r="9" />,
    front: <rect x="5" y="13" width="31" height="27" rx="9" />,
    detail: <text x="20.5" y="33" fontSize="20" {...T}>?</text>,
  },
  // Auto: sombra sólida en el suelo, carrocería de vidrio con faros.
  auto: {
    back: <rect x="8" y="33" width="34" height="10" rx="5" />,
    front: <path d="M6 28l5-11a5 5 0 0 1 4.6-3h16.8a5 5 0 0 1 4.6 3l5 11v8a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />,
    detail: <path d="M13 29h.01M35 29h.01" {...W} strokeWidth={4} />,
  },
  // Maquinaria: orugas sólidas abajo, cabina de vidrio con el brazo en blanco.
  maquinaria: {
    back: <rect x="4" y="33" width="34" height="10" rx="5" />,
    front: <rect x="13" y="11" width="19" height="25" rx="6" />,
    detail: <path d="M30 21l10-10M40 11v8" {...W} strokeWidth={3} />,
  },
  // Equipos: engranaje sólido abajo a la derecha, panel de vidrio con tres reglas (herramientas / ajustes).
  equipos: {
    back: <circle cx="32" cy="32" r="11" />,
    front: <rect x="5" y="6" width="30" height="30" rx="8" />,
    detail: <path d="M12 15h16M12 21h16M12 27h9" {...W} strokeWidth={2.5} />,
  },
  // Materiales: capa sólida inferior, capa de vidrio con vigas.
  materiales: {
    back: <rect x="18" y="26" width="25" height="16" rx="5" />,
    front: <rect x="5" y="8" width="30" height="22" rx="6" />,
    detail: <path d="M12 17h16M12 23h9" {...W} strokeWidth={2.5} />,
  },
  // Artículos: base de laptop sólida, pantalla de vidrio con renglones.
  articulos: {
    back: <rect x="6" y="33" width="36" height="9" rx="4.5" />,
    front: <rect x="10" y="7" width="28" height="27" rx="6" />,
    detail: <path d="M17 17h14M17 24h8" {...W} strokeWidth={2.5} />,
  },
  // Verificado: sello sólido abajo a la derecha, hoja de vidrio con check.
  verificado: {
    back: <circle cx="34" cy="34" r="10" />,
    front: <rect x="6" y="6" width="28" height="34" rx="7" />,
    detail: <path d="M14 23l5 5 9-10" {...W} strokeWidth={3} />,
  },
  // Crecimiento: barra sólida alta detrás, panel de vidrio con la línea que sube.
  crecimiento: {
    back: <rect x="30" y="5" width="12" height="36" rx="5" />,
    front: <rect x="6" y="20" width="26" height="22" rx="6" />,
    detail: <path d="M13 35l5-5 4 3 6-7" {...W} strokeWidth={2.5} />,
  },
  // Subasta / en vivo: base y mango sólidos, cabeza del martillo de vidrio sobre el mango.
  subasta: {
    back: <><path d="M21 18l15 15" fill="none" style={{ stroke: "var(--solid)" }} strokeWidth={5} strokeLinecap="round" /><rect x="6" y="36" width="22" height="7" rx="3.5" /></>,
    front: <rect x="7" y="9.5" width="26" height="14" rx="5" transform="rotate(-40 20 16.5)" />,
    detail: <path d="M22.4 8.3l6.2 7.4M11.4 17.3l6.2 7.4" {...W} strokeWidth={2} />,
  },
};

export const VIDRIO_CSS = `
.vd { --solid: #5A35C2; --glass: #B9A6F2; --fy: 0px; --by: 0px; display: block; overflow: visible; flex: none; transform-origin: 50% 50%; transition: transform 90ms ease; }
.vd[data-tone="dark"] { --solid: #AE8EFF; --glass: #FFFFFF; }
.vd-back { fill: var(--solid); }
.vd-copy { fill: var(--solid); }
.vd-front { fill: var(--glass); fill-opacity: 0.72; stroke: #fff; stroke-opacity: 0.45; stroke-width: 1.5; }
.vd-bar { fill: var(--solid); opacity: 0; transition: opacity 180ms; }
.vd-front, .vd-clip, .vd-detail { transform: translateY(var(--fy)); transition: transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.vd-back { transform: translateY(var(--by)); transition: transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.vd-copy { transform: translateY(calc(var(--by) - var(--fy))); transition: transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1); }
/* Hover / foco: el vidrio sube 1,5 px y el sólido baja (parallax). */
.vd-host:hover .vd, .vd-host:focus-visible .vd, .vd[data-state="hover"] { --fy: -1.5px; --by: 1.5px; }
/* Presionado: las capas se juntan y el ícono se hunde. */
.vd-host:active .vd { --fy: 0px; --by: 0px; transform: scale(0.94); }
/* Seleccionado: naranja + barra inferior (no depende solo del color). */
.vd[data-state="active"], .vd-host[aria-current] .vd, .vd-host[aria-pressed="true"] .vd { --solid: #ED8936; --glass: #FFC995; }
.vd[data-state="active"] .vd-bar, .vd-host[aria-current] .vd-bar, .vd-host[aria-pressed="true"] .vd-bar { opacity: 1; }
/* Sobre fondo oscuro, el seleccionado va en crema y blanco (la píldora naranja ya marca la selección). */
.vd[data-tone="dark"][data-state="active"] { --solid: #FFE2C2; --glass: #FFFFFF; }
.vd[data-tone="dark"] .vd-bar { display: none; }
/* Deshabilitado: gris y sin movimiento. */
.vd[data-state="disabled"] { --solid: #A9A6B5; --glass: #E2E0E9; }
.vd[data-state="disabled"] * { transition: none; }
@media (prefers-reduced-motion: reduce) { .vd, .vd-front, .vd-clip, .vd-detail, .vd-back, .vd-copy, .vd-bar { transition: none; } }
`;

/** Se monta una sola vez en la página para que las clases `.vd*` estén disponibles. */
export function VidrioStyles(): JSX.Element {
  return <style>{VIDRIO_CSS}</style>;
}

export interface VidrioProps {
  s: VidrioName;
  /** Lado en px (no bajar de 28: a 24 las capas se confunden). */
  size?: number;
  /** `dark` para fondos morados (sidebar / header). */
  tone?: "light" | "dark";
  state?: VidrioState;
  /** Nombre accesible; sin él, el ícono es decorativo. */
  label?: string;
}

export default function Vidrio({ s, size = 36, tone = "light", state = "default", label }: VidrioProps): JSX.Element {
  const uid = useId().replace(/:/g, "-");
  const { back, front, detail } = PARTS[s];
  const clip = `vd-c${uid}`;
  const blur = `vd-b${uid}`;
  return (
    <svg
      className="vd" data-tone={tone} data-state={state} viewBox="0 0 48 48" width={size} height={size}
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
    >
      <defs>
        <clipPath id={clip}>{front}</clipPath>
        <filter id={blur} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2" /></filter>
      </defs>
      <g className="vd-back">{back}</g>
      <g className="vd-clip" clipPath={`url(#${clip})`}>
        <g className="vd-copy" filter={`url(#${blur})`}>{back}</g>
      </g>
      <g className="vd-front">{front}</g>
      <g className="vd-detail">{detail}</g>
      <rect className="vd-bar" x="18" y="45" width="12" height="2.5" rx="1.25" />
    </svg>
  );
}
