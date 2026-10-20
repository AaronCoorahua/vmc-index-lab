"use client";

import { useId, type JSX, type ReactNode } from "react";
import "./vidrio.css";

/** «Vidrio esmerilado» (15/10): dos formas por ícono, una sólida detrás y una de vidrio delante que la desenfoca donde
 *  se cruzan, con el detalle en blanco. Referencia: sets de íconos glassmorphism de Dribbble/Figma (p. ej. Glazicons).
 *  ponytail: el vidrio es SVG puro (copia desenfocada de la forma de atrás, recortada por la de adelante), no backdrop-filter:
 *  se ve igual en todos los navegadores y se exporta tal cual a Figma. Retícula de 48 px. */
export type Sec = "negociaciones" | "participaciones" | "compras" | "publicaciones" | "valorizaciones" | "billetera" | "auto" | "alertas" | "publicar" | "km" | "caja" | "combustible" | "fecha" | "ubicacion" | "equipo" | "docs" | "texto" | "precio" | "vehicular" | "equipos" | "maquinaria" | "materiales" | "articulos" | "empresa" | "verificado" | "crecimiento";

type Parts = { back: ReactNode; front: ReactNode; detail: ReactNode };
const W = { fill: "none", stroke: "#fff", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const T = { fill: "#fff", fontSize: 10, fontWeight: 800, textAnchor: "middle", fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;

const PARTS: Record<Sec, Parts> = {
  // Dos globos: el de la contraparte (sólido) y el tuyo (vidrio).
  negociaciones: {
    back: <path d="M24 6h12a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6v5l-6-5h-6a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z" />,
    front: <path d="M12 15h14a7 7 0 0 1 7 7v7a7 7 0 0 1-7 7h-8l-7 6v-6.3A7 7 0 0 1 5 29v-7a7 7 0 0 1 7-7z" />,
    detail: <g fill="#fff"><circle className="vd-dot" cx="13" cy="25.5" r="2" /><circle className="vd-dot" cx="19" cy="25.5" r="2" /><circle className="vd-dot" cx="25" cy="25.5" r="2" /></g>,
  },
  // Martillo de subasta compacto: base como bloque y mango sólidos, cabeza de vidrio sobre el mango.
  participaciones: {
    back: <><path d="M21 18l15 15" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" /><rect x="6" y="36" width="22" height="7" rx="3.5" /></>,
    front: <rect x="7" y="9.5" width="26" height="14" rx="5" transform="rotate(-40 20 16.5)" />,
    detail: <path d="M22.4 8.3l6.2 7.4M11.4 17.3l6.2 7.4" {...W} strokeWidth={2} />,
  },
  // Asa sólida detrás, bolsa de vidrio con check.
  compras: {
    back: <path className="vd-asa" d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" />,
    front: <path d="M11.4 16h25.2a3 3 0 0 1 3 2.8l1.3 19.4a4 4 0 0 1-4 4.3H11.1a4 4 0 0 1-4-4.3l1.3-19.4a3 3 0 0 1 3-2.8z" />,
    detail: <><circle cx="15" cy="22" r="2" fill="#fff" /><circle cx="33" cy="22" r="2" fill="#fff" /><path className="vd-ck" d="M18.5 30.5l4 4 7.5-7.5" pathLength={1} {...W} /></>,
  },
  // Etiqueta de vidrio (con S/) sobre una tarjeta sólida girada, como la etiqueta «%» de la referencia.
  publicaciones: {
    back: <rect x="22" y="7" width="20" height="20" rx="5" transform="rotate(18 32 17)" />,
    front: <path d="M17.5 9.4a2.5 2.5 0 0 1 3 0l7.6 6.4a3 3 0 0 1 1 2.3V39a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V18.1a3 3 0 0 1 1-2.3z" transform="rotate(-12 19 26)" />,
    detail: <g transform="rotate(-12 19 26)"><circle cx="19" cy="18" r="2.2" fill="#fff" /><text x="19" y="34" {...T}>S/</text></g>,
  },
  // Aguja sólida que asoma detrás del dial de vidrio, como el check de la referencia.
  valorizaciones: {
    back: <path className="vd-nd" d="M24 33L37 12" fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" />,
    front: <path d="M7 34a17 17 0 0 1 34 0v1a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4z" />,
    detail: <><circle cx="24" cy="33" r="3" fill="#fff" /><path d="M13 31.5h1.5M17 23.5l1 1M34.5 31.5H33" {...W} strokeWidth={2.5} /></>,
  },
  // Billetera de vidrio con S/ y una tarjeta sólida asomando, como la billetera de la referencia.
  billetera: {
    back: <g className="vd-card"><rect x="12" y="6" width="24" height="17" rx="4" transform="rotate(-10 24 14)" /></g>,
    front: <rect x="6" y="15" width="36" height="27" rx="7" />,
    detail: <text x="24" y="33.5" {...T} fontSize={12}>S/</text>,
  },
  // Auto de frente: cabina y ruedas sólidas, carrocería de vidrio con faros.
  auto: {
    back: <><path d="M12.5 23l3.6-8.4a4 4 0 0 1 3.7-2.6h8.4a4 4 0 0 1 3.7 2.6l3.6 8.4z" /><rect x="9" y="32" width="7" height="9" rx="2.5" /><rect x="32" y="32" width="7" height="9" rx="2.5" /></>,
    front: <rect x="6" y="21" width="36" height="15" rx="6" />,
    detail: <><circle cx="13" cy="28.5" r="2.3" fill="#fff" /><circle cx="35" cy="28.5" r="2.3" fill="#fff" /><path d="M20.5 28.5h7" {...W} strokeWidth={2.5} /></>,
  },
  // Campana de vidrio; badajo y punto de aviso sólidos detrás.
  alertas: {
    back: <><circle className="vd-pt" cx="35" cy="11" r="7" /><circle className="vd-bd" cx="24" cy="38" r="4.5" /></>,
    front: <path d="M24 7a11 11 0 0 1 11 11v8l3.5 5a1.5 1.5 0 0 1-1.2 2.5H10.7A1.5 1.5 0 0 1 9.5 31l3.5-5v-8A11 11 0 0 1 24 7z" />,
    detail: <path d="M18 20a6 6 0 0 1 4-5.5" {...W} strokeWidth={2.5} />,
  },
  // Ficha del vehículo (16/10, vista rápida de la negociación): kilometraje, transmisión, combustible y fecha de publicación.
  // Kilometraje: odómetro de vidrio sobre una ruta sólida.
  km: {
    back: <path d="M16 42l5-30h6l5 30z" />,
    front: <rect x="5" y="9" width="38" height="18" rx="6" />,
    detail: <text x="24" y="22.5" {...T} fontSize={11}>km</text>,
  },
  // Transmisión: patrón en H sólido, pomo de vidrio arriba.
  caja: {
    back: <path d="M12 22v18M24 22v18M36 22v18M12 31h24" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" />,
    front: <circle cx="24" cy="13" r="9" />,
    detail: <circle cx="24" cy="13" r="2.5" fill="#fff" />,
  },
  // Combustible: manguera sólida, surtidor de vidrio con visor.
  combustible: {
    back: <path d="M30 14h4l5 6v15a3 3 0 0 1-6 0v-7h-3" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />,
    front: <rect x="8" y="7" width="22" height="35" rx="5" />,
    detail: <rect x="12.5" y="12" width="13" height="9" rx="2.5" fill="#fff" />,
  },
  // Fecha: anillas sólidas, hoja de vidrio con días.
  fecha: {
    back: <><rect x="13" y="4" width="6" height="12" rx="3" /><rect x="29" y="4" width="6" height="12" rx="3" /></>,
    front: <rect x="6" y="10" width="36" height="32" rx="7" />,
    detail: <g fill="#fff"><circle cx="16" cy="25" r="2.2" /><circle cx="24" cy="25" r="2.2" /><circle cx="32" cy="25" r="2.2" /><circle cx="16" cy="33" r="2.2" /><circle cx="24" cy="33" r="2.2" /></g>,
  },
  // Publicar VMC (16/10): ubicación, equipamiento, documentos y descripción con la misma receta (sólido detrás, vidrio delante).
  // Ubicación: sombra en el suelo sólida, pin de vidrio con su punto.
  ubicacion: {
    back: <><ellipse cx="24" cy="41" rx="13" ry="4" /><circle cx="35" cy="12" r="6" /></>,
    front: <path d="M24 5a13 13 0 0 1 13 13c0 9.5-13 23-13 23S11 27.5 11 18A13 13 0 0 1 24 5z" />,
    detail: <circle cx="24" cy="18" r="4.5" fill="#fff" />,
  },
  // Equipamiento: círculo sólido detrás, estrella de vidrio con check.
  equipo: {
    back: <circle cx="34" cy="13" r="9" />,
    front: <path d="M24 6l5.3 11.3 12.3 1.5-9.1 8.4 2.4 12.2L24 33.3 13.1 39.4l2.4-12.2-9.1-8.4 12.3-1.5z" />,
    detail: <path d="M19.5 24.5l3 3 6-6" {...W} strokeWidth={2.5} />,
  },
  // Documentos: hoja sólida detrás, hoja de vidrio delante con renglones.
  docs: {
    back: <rect x="17" y="4" width="24" height="30" rx="5" />,
    front: <rect x="7" y="11" width="27" height="32" rx="6" />,
    detail: <path d="M13.5 21h14M13.5 27.5h14M13.5 34h9" {...W} strokeWidth={2.5} />,
  },
  // Descripción: renglón sólido, lápiz de vidrio encima.
  texto: {
    back: <rect x="6" y="37" width="36" height="5" rx="2.5" />,
    front: <path d="M30.5 5.5a4 4 0 0 1 5.7 0l3.3 3.3a4 4 0 0 1 0 5.7L17 37H8.5v-8.5z" />,
    detail: <path d="M26.5 10l8.5 8.5" {...W} strokeWidth={2.5} />,
  },
  // Categorías de oferta (20/10): Vehicular, Equipos diversos, Maquinaria, Materiales y Artículos diversos.
  // Vehicular: auto de perfil; ruedas sólidas, carrocería de vidrio con ventana.
  vehicular: {
    back: <><circle cx="14" cy="34" r="6" /><circle cx="34" cy="34" r="6" /></>,
    front: <path d="M15 12h14a5 5 0 0 1 4 2l5 7h3a4 4 0 0 1 4 4v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-6a4 4 0 0 1 4-4h2l2-6a5 5 0 0 1 4-2z" />,
    detail: <path d="M16 21.5l1.5-4.5h9.5l3.3 4.5z" fill="#fff" />,
  },
  // Equipos diversos: disco dentado sólido, cuerpo de sierra de vidrio con gatillo.
  equipos: {
    back: <circle cx="30" cy="30" r="12" stroke="currentColor" strokeWidth={4} strokeDasharray="3.2 2.6" />,
    front: <rect x="4" y="10" width="29" height="17" rx="6" />,
    detail: <><circle cx="30" cy="30" r="3.5" fill="#fff" /><path d="M10.5 18.5h10" {...W} strokeWidth={2.5} /></>,
  },
  // Maquinaria: grúa pórtico; cable, gancho y base sólidos, torre y pluma de vidrio.
  maquinaria: {
    back: <><path d="M33 13v12" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" /><path d="M33 26a5 5 0 1 1-5 5" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" /><rect x="3" y="37" width="20" height="6" rx="3" /></>,
    front: <><rect x="4" y="6" width="40" height="9" rx="4.5" /><rect x="8" y="6" width="10" height="34" rx="4" /></>,
    detail: <path d="M13 19v15M25 10.5h12" {...W} strokeWidth={2.5} />,
  },
  // Materiales: dos capas apiladas; la de abajo sólida, la de arriba de vidrio.
  materiales: {
    back: <path d="M21.6 21.2a5 5 0 0 1 4.8 0l16.4 8.4a1.6 1.6 0 0 1 0 2.8l-16.4 8.4a5 5 0 0 1-4.8 0L5.2 32.4a1.6 1.6 0 0 1 0-2.8z" />,
    front: <path d="M21.6 8.2a5 5 0 0 1 4.8 0l16.4 8.4a1.6 1.6 0 0 1 0 2.8l-16.4 8.4a5 5 0 0 1-4.8 0L5.2 19.4a1.6 1.6 0 0 1 0-2.8z" />,
    detail: <path d="M17 18l7-3.5 7 3.5" {...W} strokeWidth={2.5} />,
  },
  // Artículos diversos: laptop; base sólida, pantalla de vidrio con gráfico.
  articulos: {
    back: <rect x="3" y="33" width="42" height="8" rx="4" />,
    front: <rect x="8" y="8" width="32" height="29" rx="5" />,
    detail: <path d="M15 26l5-5 4 4 8-8" {...W} strokeWidth={2.5} />,
  },
  // Banner de maquinaria de la home (vmc-index-lab, 21/10): empresa, verificado y crecimiento.
  // Empresa: ala sólida a la derecha, edificio de vidrio delante con ventanas y puerta.
  empresa: {
    back: <rect x="25" y="17" width="18" height="25" rx="4" />,
    front: <rect x="6" y="6" width="26" height="36" rx="6" />,
    detail: <><g fill="#fff"><circle cx="14" cy="15" r="2.2" /><circle cx="24" cy="15" r="2.2" /><circle cx="14" cy="23.5" r="2.2" /><circle cx="24" cy="23.5" r="2.2" /></g><path d="M16 41v-6h6v6" {...W} strokeWidth={2.5} /></>,
  },
  // Verificado: sello sólido arriba a la derecha, escudo de vidrio con check.
  verificado: {
    back: <circle className="vd-pt" cx="35" cy="13" r="8" />,
    front: <path d="M24 6l15 5.5v10.5c0 9.5-6.3 16.6-15 20-8.7-3.4-15-10.5-15-20V11.5z" />,
    detail: <path className="vd-ck" d="M17.5 24.5l4.5 4.5 8.5-8.5" pathLength={1} {...W} />,
  },
  // Crecimiento: flecha sólida que sube por detrás, tablero de vidrio con barras.
  crecimiento: {
    back: <path className="vd-nd" d="M9 27l9-9 6 6L39 9M30 9h9v9" fill="none" stroke="currentColor" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />,
    front: <rect x="6" y="20" width="28" height="22" rx="6" />,
    detail: <path d="M13 36v-3M20 36v-6M27 36v-9" {...W} strokeWidth={2.5} />,
  },
  // Publicar (15/10): un + de vidrio sobre un círculo sólido que asoma arriba a la derecha.
  // Precio de lista (19/10): moneda sólida detrás, etiqueta de precio de vidrio con «$» (el MSRP de AVT es en US$).
  precio: {
    back: <circle cx="34" cy="14" r="9" />,
    front: <path d="M22 7h15a4 4 0 0 1 4 4v15a4 4 0 0 1-1.2 2.8L26.6 42a4 4 0 0 1-5.6 0L8 29a4 4 0 0 1 0-5.6L19.2 8.2A4 4 0 0 1 22 7z" />,
    detail: <><circle cx="32.5" cy="15.5" r="2.6" fill="#fff" /><text x="22.5" y="31" {...T} fontSize={13}>$</text></>,
  },
  publicar: {
    back: <circle cx="31" cy="17" r="12" />,
    front: <path d="M20 10a4 4 0 0 1 8 0v10h10a4 4 0 0 1 0 8H28v10a4 4 0 0 1-8 0V28H10a4 4 0 0 1 0-8h10z" />,
    detail: null,
  },
};

export function Vidrio({ s, size = 24 }: { s: Sec; size?: number }): JSX.Element {
  const id = useId().replace(/:/g, "");
  const p = PARTS[s];
  // Capas: vd-bk (sólido) y vd-gl (vidrio + detalle) se separan al pasar (parallax); vd-gx lleva el gesto propio del ícono.
  // ponytail: la forma de atrás se pinta dos veces (nítida y desenfocada) en vez de <use>, para que el CSS de hover la alcance.
  return <svg className={`vd vd--${s}`} viewBox="0 0 48 48" width={size} height={size} aria-hidden>
    <defs>
      <clipPath id={`${id}c`}>{p.front}</clipPath>
      <filter id={`${id}f`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" /></filter>
    </defs>
    <g className="vd-bk">{p.back}</g>
    <g className="vd-gl"><g className="vd-gx">
      <g clipPath={`url(#${id}c)`}>
        <g className="vd-bl" filter={`url(#${id}f)`}>{p.back}</g>
        <g className="vd-glass">{p.front}</g>
        <g className="vd-edge">{p.front}</g>
      </g>
      {p.detail}
    </g></g>
  </svg>;
}
