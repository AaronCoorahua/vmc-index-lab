"use client";

/** LotGallery: carta destacada a la izquierda y los lotes a la derecha, llenando columna por columna (3 filas por columna).
 *  Con pocos lotes el espacio queda reservado y no se ensancha. Bajo 700 px todo va en una columna.
 *  Usa FeaturedCard (pills, moneda y favorito).
 *  Solo depende de React, lot-gallery.css y FeaturedCard. */
import { useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import { LikeButton, PillIcons, SubasCoin } from "./FeaturedCard";
import "./lot-gallery.css";

export type LotRowItem = {
  image: string;
  title: string;
  /** live = subasta (precio); negotiable = Recibe ofertas ("Haz tu oferta"). */
  tone: "live" | "negotiable";
  price?: string;
  offerText?: string;
  /** Línea de datos, p. ej. "38,200 km · Mecánica · Gasolina". */
  details?: string;
  location?: string;
  /** "Empieza en …" (solo en vivo). */
  startsIn?: string;
  onClick?: () => void;
};

/** Fila de lote: foto de 84 px con favorito, pill de estado, nombre, precio y datos. */
export function LotRow({ item }: { item: LotRowItem }): JSX.Element {
  const [liked, setLiked] = useState(false);
  const live = item.tone === "live";
  const foot = [item.location, live && item.startsIn ? `Empieza en ${item.startsIn}` : ""].filter(Boolean).join(" · ");
  return (
    <article className={`vlg-row vlg-row--${item.tone}`} aria-label={item.title} onClick={item.onClick}>
      <span className="vlg-row__thumb"><img src={item.image} alt="" /></span>
      <span className="vlg-row__like"><LikeButton name={item.title} on={liked} onToggle={() => setLiked((v) => !v)} size={26} /></span>
      <div className="vlg-row__main">
        <span className="vlg-row__pill">{live
          ? <span className="vfc-pill vfc-pill--live">{PillIcons.live}En vivo</span>
          : <span className="vfc-pill vfc-pill--negotiable">{PillIcons.tag}Recibe ofertas</span>}</span>
        <p className="vlg-row__title">{item.title}</p>
        {live ? <b className="vlg-row__price"><SubasCoin size={17} />{item.price ?? "Por definir"}</b> : <b className="vlg-row__offer">{item.offerText ?? "Haz tu oferta"}</b>}
        {item.details ? <span className="vlg-row__rest">{item.details}</span> : null}
        {foot ? <span className="vlg-row__foot">{foot}</span> : null}
      </div>
    </article>
  );
}

export type LotGalleryProps = {
  /** La carta grande de la izquierda (normalmente <FeaturedCard height="100%" fillMedia … />). */
  featured: ReactNode;
  items: LotRowItem[];
  /** Ancho de la carta destacada en px. */
  featuredWidth?: number;
  /** Alto mínimo de la galería en px (lo que mide la destacada). */
  height?: number;
  /** Columnas de filas a la derecha (se reservan aunque estén vacías). */
  columns?: number;
  className?: string;
};

export function LotGallery({ featured, items, featuredWidth = 292, height = 386, columns = 2, className = "" }: LotGalleryProps): JSX.Element {
  return (
    <div className={`vlg${className ? ` ${className}` : ""}`}
      style={{ "--vlg-feat": `${featuredWidth}px`, "--vlg-h": `${height}px`, "--vlg-cols": columns } as CSSProperties}>
      <div className="vlg__grid">
        <div className="vlg__feat">{featured}</div>
        <div className="vlg__list">{items.map((it) => <LotRow key={it.title} item={it} />)}</div>
      </div>
    </div>
  );
}

export default LotGallery;
