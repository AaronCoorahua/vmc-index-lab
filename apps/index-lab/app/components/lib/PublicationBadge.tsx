/** PublicationBadge: estado de una publicación en Mis publicaciones. Solo depende de React y publication-badge.css. */
import type { JSX } from "react";
import "./publication-badge.css";

export type PublicationStatus = "revision" | "publicada" | "negociacion" | "subaschat" | "vendido" | "no-concretada";

const LABEL: Record<PublicationStatus, string> = {
  revision: "En revisión",
  publicada: "Publicada",
  negociacion: "En negociación",
  subaschat: "SubasChat",
  vendido: "Vendido",
  "no-concretada": "No concretada",
};

const Check = () => <svg width="10" height="10" viewBox="0 0 20 20" aria-hidden><path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export function PublicationBadge({ status, label }: { status: PublicationStatus; label?: string }): JSX.Element {
  const text = label ?? LABEL[status];
  return <span className={`vpb vpb--${status}`} role="status" aria-label={text}>{status === "vendido" ? <Check /> : null}<span>{text}</span></span>;
}

export default PublicationBadge;
