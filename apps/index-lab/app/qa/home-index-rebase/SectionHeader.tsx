"use client";

/**
 * SectionHeader — encabezado ÚNICO de sección del index (tiendas, VMC ahora, Categorías, Empresas…), sin corchetes.
 * Mismo título (20/24, peso 600, color vault del CardTitle de Concorde), mismo subtítulo, misma altura, mismo relleno lateral y la misma línea
 * divisoria debajo, para que dos secciones lado a lado queden alineadas al píxel. La acción (enlace, estado en vivo) va a la derecha.
 */

import type { JSX, ReactNode } from "react";

export const SECTION_TITLE_SIZE = 20;
export const SECTION_SUBTITLE_SIZE = 14;
export const SECTION_HEADER_HEIGHT = 68; // alto fijo: títulos con o sin subtítulo ocupan lo mismo
export const SECTION_PAD = 24; // relleno lateral del encabezado

export default function SectionHeader({ title, subtitle, action, logo, divider = true, flush = false }: {
  title: string;
  /** Logo de la tienda a la izquierda del título (bloques por tienda). */
  logo?: string;
  subtitle?: string;
  action?: ReactNode;
  divider?: boolean;
  /** Sin relleno lateral: el título queda en el mismo eje que el contenido de abajo (secciones sin tarjeta). */
  flush?: boolean;
}): JSX.Element {
  return (
    <header
      style={{
        boxSizing: "border-box", flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        height: SECTION_HEADER_HEIGHT, padding: flush ? 0 : `0 ${SECTION_PAD}px`,
        borderBottom: divider ? "1px solid var(--vmc-color-divider, #e8ddff)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        {logo ? <span style={{ flex: "none", display: "grid", placeItems: "center", width: 56, height: 44, padding: "6px 8px", boxSizing: "border-box", borderRadius: 8, border: "1px solid var(--vmc-color-divider, #e8ddff)", background: "#fff" }}><img src={logo} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} /></span> : null}
        <div style={{ display: "grid", gap: 2, minWidth: 0, fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)" }}>
          <h3 style={{ margin: 0, fontSize: SECTION_TITLE_SIZE, lineHeight: `${SECTION_TITLE_SIZE + 4}px`, fontWeight: 600, color: "#3b1782", whiteSpace: "nowrap" }}>{title}</h3>
          {subtitle ? <p style={{ margin: 0, fontSize: SECTION_SUBTITLE_SIZE, lineHeight: "18px", color: "#191c1c" }}>{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div style={{ flex: "none" }}>{action}</div> : null}
    </header>
  );
}
