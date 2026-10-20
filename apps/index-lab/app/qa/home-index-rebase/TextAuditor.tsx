"use client";

/**
 * TextAuditor — auditor de texto dentro de la página (solo QA del lab).
 * Recorre el DOM del index y reporta: la escala tipográfica real (tamaño/peso, cuántos textos usan cada estilo), los textos
 * por debajo del mínimo, y los títulos de sección (tamaño, peso, alto de línea, margen superior y si llevan línea divisoria),
 * para que se vea qué es incoherente. Clic en una fila resalta en la página todos los textos con ese estilo.
 * Abrirlo con el botón negro discreto de abajo a la derecha (el de la «A»).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, JSX } from "react";

const MIN_PX = 12; // mínimo recomendado para texto legible (11 solo en captions muy secundarios)
const SCOPE = '[data-testid="home-desktop-canvas"]';
const HL_ATTR = "data-ta-hl";

type Row = { key: string; size: number; weight: string; count: number; samples: string[]; els: HTMLElement[] };
type Title = { text: string; size: number; weight: string; lh: number; lines: number; border: boolean; el: HTMLElement };

const px = (v: string) => Math.round(parseFloat(v) * 10) / 10;

function scan(): { rows: Row[]; titles: Title[]; total: number } {
  const root = document.querySelector(SCOPE);
  if (!root) return { rows: [], titles: [], total: 0 };
  const map = new Map<string, Row>();
  let total = 0;
  root.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (el.closest("[data-ta-ignore]") || ["STYLE", "SCRIPT", "SVG", "PATH"].includes(el.tagName.toUpperCase())) return;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent && n.textContent.trim()).map((n) => n.textContent!.trim()).join(" ");
    if (!own) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) === 0) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const size = px(cs.fontSize);
    const weight = cs.fontWeight;
    const key = `${size}/${weight}`;
    total += 1;
    const row = map.get(key) ?? { key, size, weight, count: 0, samples: [], els: [] };
    row.count += 1;
    if (row.samples.length < 3) row.samples.push(own.slice(0, 28));
    row.els.push(el);
    map.set(key, row);
  });
  const rows = [...map.values()].sort((a, b) => a.size - b.size || Number(a.weight) - Number(b.weight));

  // Títulos de sección: h1–h3 visibles dentro del contenido.
  const titles: Title[] = [];
  root.querySelectorAll<HTMLElement>("h1, h2, h3").forEach((el) => {
    if (el.closest("[data-ta-ignore]")) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    const host = el.closest("section, aside") ?? el.parentElement;
    const border = !!host && [...host.querySelectorAll<HTMLElement>("*")].some((n) => {
      const c = getComputedStyle(n);
      return parseFloat(c.borderBottomWidth) > 0 && c.borderBottomStyle !== "none" && n.getBoundingClientRect().height < 60 && n.querySelector("h1,h2,h3") !== null;
    });
    const lh = px(cs.lineHeight === "normal" ? String(parseFloat(cs.fontSize) * 1.2) : cs.lineHeight);
    titles.push({ text: (el.textContent ?? "").trim().slice(0, 34), size: px(cs.fontSize), weight: cs.fontWeight, lh, lines: Math.round(r.height / (lh || 1)), border, el });
  });
  return { rows, titles, total };
}

const panel: CSSProperties = {
  position: "fixed", left: 14, bottom: 54, zIndex: 60, width: 372, maxHeight: "62vh", overflow: "auto", boxSizing: "border-box",
  padding: 12, borderRadius: 12, background: "#14112B", color: "#fff", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.45,
  boxShadow: "rgba(0,0,0,0.35) 0 16px 40px",
};
const chip = (on: boolean): CSSProperties => ({ padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", background: on ? "#8460E5" : "transparent", color: "#fff", cursor: "pointer", font: "inherit" });

export default function TextAuditor(): JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"escala" | "titulos">("escala");
  const [data, setData] = useState<{ rows: Row[]; titles: Title[]; total: number }>({ rows: [], titles: [], total: 0 });
  const [active, setActive] = useState<string | null>(null);
  const [onlySmall, setOnlySmall] = useState(false);

  useEffect(() => setMounted(true), []);

  const run = useCallback(() => setData(scan()), []);
  useEffect(() => {
    if (!open) return;
    run();
    const t = setInterval(run, 2000); // los carruseles cambian el contenido
    return () => clearInterval(t);
  }, [open, run]);

  // Resalta en la página los textos de la fila elegida.
  useEffect(() => {
    document.querySelectorAll(`[${HL_ATTR}]`).forEach((e) => { (e as HTMLElement).style.outline = ""; e.removeAttribute(HL_ATTR); });
    if (!open || !active) return;
    const row = data.rows.find((r) => r.key === active);
    row?.els.forEach((el) => { el.style.outline = "2px solid #FF2E93"; el.style.outlineOffset = "1px"; el.setAttribute(HL_ATTR, ""); });
  }, [active, data, open]);
  useEffect(() => () => { document.querySelectorAll(`[${HL_ATTR}]`).forEach((e) => { (e as HTMLElement).style.outline = ""; }); }, []);

  const small = useMemo(() => data.rows.filter((r) => r.size < MIN_PX).reduce((n, r) => n + r.count, 0), [data]);
  const rows = onlySmall ? data.rows.filter((r) => r.size < MIN_PX) : data.rows;
  const titleSizes = new Set(data.titles.map((t) => `${t.size}/${t.weight}`));

  if (!mounted) return null;
  return createPortal(
    <div data-ta-ignore>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-pressed={open} aria-label="Auditor de texto" title="Auditor de texto"
        style={{ position: "fixed", right: 78, bottom: 14, zIndex: 50, display: "grid", placeItems: "center", width: 26, height: 26, padding: 0, border: 0, borderRadius: "50%", color: "#fff", background: "#111", opacity: open ? 0.95 : 0.28, cursor: "pointer", font: "700 13px sans-serif" }}>A</button>
      {open && (
        <div style={panel} role="dialog" aria-label="Auditor de texto">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <b style={{ fontSize: 13 }}>Auditor de texto</b>
            <span style={{ opacity: 0.65 }}>{data.total} textos</span>
            <span style={{ marginLeft: "auto", color: small ? "#FF7AB6" : "#7CE0A8" }}>{small ? `${small} bajo ${MIN_PX}px` : `todo ≥ ${MIN_PX}px`}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button type="button" style={chip(tab === "escala")} onClick={() => setTab("escala")}>Escala</button>
            <button type="button" style={chip(tab === "titulos")} onClick={() => setTab("titulos")}>Títulos ({data.titles.length})</button>
            {tab === "escala" && <button type="button" style={{ ...chip(onlySmall), marginLeft: "auto" }} onClick={() => setOnlySmall((v) => !v)}>solo &lt; {MIN_PX}px</button>}
          </div>
          {tab === "escala" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ textAlign: "left", opacity: 0.6 }}><th>px/peso</th><th>usos</th><th>ejemplos</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} onClick={() => setActive(active === r.key ? null : r.key)} style={{ cursor: "pointer", background: active === r.key ? "rgba(255,46,147,0.25)" : "transparent", color: r.size < MIN_PX ? "#FF9CC8" : "#fff" }}>
                    <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>{r.size}/{r.weight}{r.size < MIN_PX ? " ⚠" : ""}</td>
                    <td style={{ padding: "2px 4px" }}>{r.count}</td>
                    <td style={{ padding: "2px 4px", opacity: 0.7, maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.samples.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>
              <p style={{ margin: "0 0 6px", opacity: 0.75 }}>{titleSizes.size === 1 ? "Todos los títulos usan el mismo estilo." : `${titleSizes.size} estilos distintos de título: deberían ser 1 por nivel.`}</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ textAlign: "left", opacity: 0.6 }}><th>título</th><th>px/peso</th><th>línea</th><th>divisor</th></tr></thead>
                <tbody>
                  {data.titles.map((t, i) => (
                    <tr key={i} onClick={() => t.el.scrollIntoView({ block: "center", behavior: "smooth" })} style={{ cursor: "pointer" }}>
                      <td style={{ padding: "2px 4px", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.text}</td>
                      <td style={{ padding: "2px 4px", whiteSpace: "nowrap" }}>{t.size}/{t.weight}</td>
                      <td style={{ padding: "2px 4px" }}>{t.lh}</td>
                      <td style={{ padding: "2px 4px", color: t.border ? "#7CE0A8" : "#FF9CC8" }}>{t.border ? "sí" : "no"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>,
    document.body,
  );
}
