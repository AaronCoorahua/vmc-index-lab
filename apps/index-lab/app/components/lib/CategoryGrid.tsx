/**
 * CategoryGrid · «Explora por categoría» del Index: card con foto, ícono, nombre, conteo y flecha.
 * Las cards se apilan solas: en `layout="auto"` caben tantas por fila como permita el ancho (mínimo `minWidth`
 * cada una) y el resto baja a la fila siguiente. También puedes fijar las columnas o usar una fila con scroll.
 * Al pasar el mouse la card sube 3 px y la foto se acerca.
 * Independiente: solo React y category-grid.css. El ícono es cualquier ReactNode (SVG, <img>, emoji…).
 *
 *   <CategoryGrid items={[
 *     { label: "Vehicular", count: "21 lotes", image: "/suv.png", icon: <MiIcono />, href: "/vehicular" },
 *     { label: "Maquinaria", count: "2 lotes", image: "/excavadora.png", href: "/maquinaria" },
 *   ]} />
 *   <CategoryGrid items={items} layout="columns" columns={3} />
 *   <CategoryGrid items={items} layout="scroll" />
 */
import type { CSSProperties, JSX, MouseEvent, ReactNode } from "react";
import "./category-grid.css";

export type CategoryItem = {
  label: string;
  /** Texto pequeño bajo el nombre, p. ej. «21 lotes». */
  count?: string;
  image: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
};

export type CategoryGridProps = {
  items: CategoryItem[];
  /** auto: se apilan según el ancho · columns: columnas fijas · scroll: una sola fila deslizable. */
  layout?: "auto" | "columns" | "scroll";
  /** Ancho mínimo de cada card en `auto` (px). Con menos espacio, la card baja a la fila siguiente. */
  minWidth?: number;
  /** Columnas en `columns`. */
  columns?: number;
  /** Alto de la foto (px). */
  imageHeight?: number;
  className?: string;
};

const Arrow = () => <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export function CategoryGrid({ items, layout = "auto", minWidth = 140, columns = 3, imageHeight = 92, className = "" }: CategoryGridProps): JSX.Element {
  return (
    <ul className={`vcat vcat--${layout}${className ? ` ${className}` : ""}`}
      style={{ "--vcat-min": `${minWidth}px`, "--vcat-cols": columns, "--vcat-img": `${imageHeight}px` } as CSSProperties}>
      {items.map((c) => {
        const click = (e: MouseEvent<HTMLAnchorElement>) => { if (c.onClick) { if (!c.href) e.preventDefault(); c.onClick(); } };
        return (
          <li key={c.label}>
            <a href={c.href ?? "#"} onClick={click} className="vcat__card" aria-label={c.count ? `${c.label} · ${c.count}` : c.label}>
              <span className="vcat__media"><img src={c.image} alt="" /></span>
              <span className="vcat__foot">
                {c.icon ? <span className="vcat__icon" aria-hidden>{c.icon}</span> : null}
                <span className="vcat__txt"><b>{c.label}</b>{c.count ? <small>{c.count}</small> : null}</span>
                <span className="vcat__go" aria-hidden><Arrow /></span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default CategoryGrid;
