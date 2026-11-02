"use client";

/**
 * /components: componentes del Index para copiar a otro proyecto.
 * Cada sección: vista en escritorio y en móvil (375 px), cómo usarlo (archivos + ejemplo + código) y sus propiedades.
 * El código de los archivos de ./lib lo lee page.tsx al compilar; el del botón y el badge sale de glass.ts y pills.ts.
 */
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, JSX, ReactNode } from "react";
import { GLASS_CSS } from "../qa/home-index-rebase/glass";
import { PILL_CSS } from "../qa/home-index-rebase/pills";
import { Vidrio } from "../qa/home-index-rebase/Vidrio";
import { CardIcons, FeaturedCard } from "./lib/FeaturedCard";
import { LightBar } from "./lib/LightBar";
import { OfferTypeCards } from "./lib/OfferTypeCards";
import { CategoryGrid } from "./lib/CategoryGrid";
import { HeroBanner, type HeroBannerEffect } from "./lib/HeroBanner";
import { LotGallery, type LotRowItem } from "./lib/LotGallery";

export type LibSources = Record<string, string>;
type Prop = [name: string, type: string, def: string, desc: string];
type File = { name: string; code: string };

// ── Piezas de la página ─────────────────────────────────────────────────────────
function copy(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const t = document.createElement("textarea"); t.value = text; document.body.append(t); t.select();
  try { document.execCommand("copy"); } finally { t.remove(); }
  return Promise.resolve();
}

function Code({ usage, files }: { usage: string; files: File[] }): JSX.Element {
  const tabs = [{ name: "Ejemplo", code: usage }, ...files];
  const [tab, setTab] = useState(0);
  const [done, setDone] = useState(false);
  const cur = tabs[tab];
  return <div className="cx-code">
    <div className="cx-code__bar">
      <div className="cx-code__tabs" role="tablist" aria-label="Archivos">
        {tabs.map((t, i) => <button key={t.name} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{t.name}</button>)}
      </div>
      <button type="button" className="cx-code__copy" onClick={() => copy(cur.code).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}>{done ? "Copiado" : "Copiar"}</button>
    </div>
    <pre><code>{cur.code.split("\n").map((l, i) => <span key={i}>{l}{"\n"}</span>)}</code></pre>
  </div>;
}

function Props({ rows }: { rows: Prop[] }): JSX.Element {
  return <div className="cx-table"><table>
    <thead><tr><th>Propiedad</th><th>Tipo</th><th>Por defecto</th><th>Qué hace</th></tr></thead>
    <tbody>{rows.map(([n, t, d, x]) => <tr key={n}><td><code>{n}</code></td><td><code>{t}</code></td><td>{d === "—" ? "—" : <code>{d}</code>}</td><td>{x}</td></tr>)}</tbody>
  </table></div>;
}

/** El mismo teléfono de la vista móvil del Index (DevicePreview): iPhone 14 Pro, pantalla 393 × 852, marco de 11 px,
 *  isla de 126 × 37 y barra de estado de 54. La página adentro tiene 12 px de margen, como el Index en celular (369 px útiles).
 *  Se dibuja a tamaño real y se muestra al 72 %. */
const PHONE_SCALE = 0.72;
function Phone({ children }: { children: ReactNode }): JSX.Element {
  return <div className="cx-phone-wrap" style={{ "--s": PHONE_SCALE } as CSSProperties}>
    <div className="cx-phone"><div className="cx-phone__screen">
      <span className="cx-phone__island" aria-hidden />
      <div className="cx-phone__status" aria-hidden><span>9:41</span><span className="cx-phone__icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="#fff" strokeOpacity="0.4" /><rect x="2" y="2" width="20" height="9" rx="2.5" fill="#fff" /></svg>
      </span></div>
      <div className="cx-phone__page">{children}</div>
      <span className="cx-phone__home" aria-hidden />
    </div></div>
  </div>;
}

/** Vista previa. Escritorio con el ancho que tiene en el Index (`width`) y, si hay `mobile`, el teléfono al lado. */
function Preview({ desktop, mobile, width, controls, note, tone = "light" }: {
  desktop: ReactNode; mobile?: ReactNode; width?: number; controls?: ReactNode; note?: string; tone?: "light" | "lilac";
}): JSX.Element {
  return <div className="cx-prev">
    {controls ? <div className="cx-prev__controls">{controls}</div> : null}
    <div className="cx-views">
      <div className="cx-view">
        <span className="cx-view__label">{mobile ? "Escritorio" : "Vista"}</span>
        <div className={`cx-view__box cx-view__box--${tone}`}><div style={width ? { width } : undefined}>{desktop}</div></div>
      </div>
      {mobile ? <div className="cx-view cx-view--phone">
        <span className="cx-view__label">Móvil</span>
        <div className={`cx-view__box cx-view__box--${tone} cx-view__box--phone`}><Phone>{mobile}</Phone></div>
      </div> : null}
    </div>
    {note ? <p className="cx-note">{note}</p> : null}
  </div>;
}

function Section({ id, name, tag, summary, preview, files, usage, props }: {
  id: string; name: string; tag: string; summary: string; preview: ReactNode; files: File[]; usage: string; props: Prop[];
}): JSX.Element {
  return <section id={id} className="cx-sec" aria-labelledby={`${id}-t`}>
    <header className="cx-sec__head"><h2 id={`${id}-t`}>{name}</h2><code>{tag}</code></header>
    <p className="cx-sum">{summary}</p>
    {preview}
    <h3>Cómo usarlo</h3>
    <ol className="cx-steps">
      <li>Copia {files.length === 1 ? "este archivo" : "estos archivos"} en una misma carpeta:<span className="cx-files">{files.map((f) => <code key={f.name}>{f.name}</code>)}</span></li>
      <li>Impórtalo y pásale tus datos, como en el ejemplo.</li>
    </ol>
    <Code usage={usage} files={files} />
    <h3>Propiedades</h3>
    <Props rows={props} />
  </section>;
}

const Seg = <T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) =>
  <div className="cx-seg" role="group" aria-label={label}><span>{label}</span>
    {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}</div>;

// ── Datos de las vistas (fotos e íconos de este proyecto; los componentes no dependen de ellos) ─────────────
const ICON = {
  star: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="currentColor" /></svg>,
  live: <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" /><circle cx="12" cy="12" r="4" fill="currentColor" /></svg>,
  tag: <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M3 12V4h8l10 10-8 8z" fill="currentColor" /><circle cx="7.5" cy="8.5" r="1.6" fill="#fff" /></svg>,
};
type PillKind = "live" | "negotiable" | "featured";
const PILL: Record<PillKind, [JSX.Element, string]> = { live: [ICON.live, "En vivo"], negotiable: [ICON.tag, "Recibe ofertas"], featured: [ICON.star, "Destacado"] };
const Pill = ({ kind }: { kind: PillKind }) => <span className={`lc-pill lc-pill--${kind}`}>{PILL[kind][0]}{PILL[kind][1]}</span>;

const YARIS = { image: "/demo/vehicles/autoplan-yaris.png", title: "Toyota Yaris", subtitle: "2022 · Hatchback", photos: 12, startsIn: "01:24:36", price: "US$ 2,799", progress: 0.62,
  chips: [{ icon: CardIcons.gear, label: "Automática" }, { icon: CardIcons.fuel, label: "Gasolina" }],
  stats: [{ icon: CardIcons.gauge, label: "45,000 km" }, { icon: CardIcons.seats, label: "5 asientos" }] };
// Galería de lotes (Autoplan): los 6 lotes que van a la derecha de la destacada.
const LOT_ROWS: LotRowItem[] = [
  { image: "/demo/vehicles/autoplan-grand-i10.png", title: "Hyundai Grand i10 2021", tone: "live", price: "US$ 2,199", details: "38,200 km · Mecánica · Gasolina", location: "Lima", startsIn: "05:10:00" },
  { image: "/demo/vehicles/autoplan-agya.png", title: "Toyota Agya 2023", tone: "negotiable", details: "32,000 km · Automática · Gasolina", location: "Lima" },
  { image: "/demo/vehicles/autoplan-refine.png", title: "Jac Refine 2022", tone: "negotiable", details: "61,500 km · Mecánica · Diésel", location: "Arequipa" },
  { image: "/demo/inventory-excavator-v1.png", title: "Caterpillar 320 2019", tone: "live", price: "US$ 45,000", details: "6,200 h · Hidráulica · Diésel", location: "Lima", startsIn: "03:02:10" },
  { image: "/demo/inventory-steel-v1.png", title: "Lote de vigas 2024", tone: "negotiable", details: "12 t · Acero A36 · Vigas H", location: "Callao" },
  { image: "/demo/vehicles/autoplan-suv.png", title: "Kia Sportage 2020", tone: "live", price: "US$ 8,450", details: "52,300 km · Automática · Gasolina", location: "Lima", startsIn: "07:45:00" },
];
const Gallery = ({ count = 6 }: { count?: number }) =>
  <LotGallery featured={<FeaturedCard {...YARIS} featured progress={0.72} height="100%" fillMedia />} items={LOT_ROWS.slice(0, count)} />;
const OFFERS = [
  { tone: "negotiable" as const, title: "Recibe ofertas", text: "Encuentra vehículos con precio conversable", cta: "Ver lotes", image: "/demo/vehicles/autoplan-agya.png" },
  { tone: "live" as const, title: "En vivo", text: "Participa en subastas en tiempo real", cta: "Ver subastas", image: "/demo/vehicles/autoplan-yaris.png" },
];
const CATS = [
  { label: "Vehicular", count: "21 lotes", image: "/demo/inventory-suv-v1.png", icon: <Vidrio s="vehicular" size={32} /> },
  { label: "Equipos diversos", count: "12 lotes", image: "/demo/inventory-forklift-v1.png", icon: <Vidrio s="equipos" size={32} /> },
  { label: "Maquinaria", count: "2 lotes", image: "/demo/inventory-excavator-v1.png", icon: <Vidrio s="maquinaria" size={32} /> },
  { label: "Materiales", count: "1 lote", image: "/demo/inventory-steel-v1.png", icon: <Vidrio s="materiales" size={32} /> },
  { label: "Mobiliario", count: "3 lotes", image: "/demo/inventory-furniture-v1.jpg", icon: <Vidrio s="mobiliario" size={32} /> },
  { label: "Artículos diversos", count: "1 lote", image: "/demo/inventory-mosaic-v1.png", icon: <Vidrio s="articulos" size={32} /> },
];
const WA = <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.2-.7-2.7-1.1-4.4-3.8-4.5-4s-1.1-1.5-1.1-2.8.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.2.5.1.6 0l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.4Z" /></svg>;
const SLIDES = [
  { image: "/banners/vmc/hero-whatsapp-c.jpg", imagePosition: "70% 30%", label: "Canal de WhatsApp",
    pill: { text: "Canal de WhatsApp", icon: WA, background: "linear-gradient(135deg, #25D366 0%, #0E7A5A 100%)" },
    title: <>Entérate <em>primero</em><br />de las subastas</>, lead: <>Únete al canal de VMC y recibe los lotes<br />nuevos antes que nadie.</>, cta: "Unirme al canal",
    background: "linear-gradient(100deg, #2A1670 0%, #3D2299 34%, #0E7A5A 78%, #25D366 100%)" },
  { image: "/banners/vmc/hero-publica.jpg", imagePosition: "30% 30%", align: "right" as const, label: "Publica en VMC",
    pill: { text: "Publica en VMC" }, title: <>Publica tu auto<br />y <em>recibe ofertas</em></>, lead: "Recibe propuestas y elige la que más te convenga.", cta: "Publicar mi auto" },
  { image: "/banners/vmc/hero-negociable-a.jpg", imagePosition: "70% 20%", label: "Recibe ofertas",
    pill: { text: "Recibe ofertas", icon: ICON.tag, background: "linear-gradient(110deg, #00A9B0 0%, #3F7FD0 45%, #6A35D6 100%)" },
    title: <>¡Tú pones el precio<br />y <em>el 100% es tuyo</em>!</>, lead: "Publica tu auto en minutos y negocia directo con los compradores.", cta: "¡Publica ahora!",
    background: "linear-gradient(100deg, #2A1670 0%, #3D2299 35%, #00838C 78%, #00D2D3 100%)" },
];

// ── Ejemplos ────────────────────────────────────────────────────────────────────
const USE_BUTTON = `import "./glass-button.css";

export function GlassButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="hib-glass" {...props} />;
}

<GlassButton onClick={publicar}>Publicar mi auto</GlassButton>`;
const USE_BADGE = `import "./pills.css";

<span className="lc-pills">
  <span className="lc-pill lc-pill--featured">Destacado</span>
  <span className="lc-pill lc-pill--live">En vivo</span>
</span>

<span className="lc-pill lc-pill--negotiable">Recibe ofertas</span>`;
const USE_CARD = `import { FeaturedCard, CardIcons } from "./FeaturedCard";

<FeaturedCard
  image="/fotos/yaris.png"
  title="Toyota Yaris"
  subtitle="2022 · Hatchback"
  featured
  photos={12}
  chips={[
    { icon: CardIcons.gear, label: "Automática" },
    { icon: CardIcons.fuel, label: "Gasolina" },
  ]}
  stats={[
    { icon: CardIcons.gauge, label: "45,000 km" },
    { icon: CardIcons.seats, label: "5 asientos" },
  ]}
  startsIn="01:24:36"
  price="US$ 2,799"
  progress={0.62}
  width={220}
  height={380}
  fillMedia
  onClick={() => abrirLote("yaris")}
/>

<FeaturedCard tone="negotiable" image="/fotos/agya.png" title="Toyota Agya" subtitle="2023 · Hatchback" />`;
const USE_GALLERY = `import { LotGallery } from "./LotGallery";
import { FeaturedCard, CardIcons } from "./FeaturedCard";

<LotGallery
  featured={
    <FeaturedCard
      image="/fotos/yaris.png"
      title="Toyota Yaris"
      subtitle="2022 · Hatchback"
      featured
      price="US$ 2,799"
      height="100%"
      fillMedia
    />
  }
  items={[
    { image: "/fotos/i10.png", title: "Hyundai Grand i10 2021", tone: "live", price: "US$ 2,199",
      details: "38,200 km · Mecánica · Gasolina", location: "Lima", startsIn: "05:10:00" },
    { image: "/fotos/agya.png", title: "Toyota Agya 2023", tone: "negotiable",
      details: "32,000 km · Automática · Gasolina", location: "Lima" },
  ]}
/>`;
const USE_BAR = `import { LightBar } from "./LightBar";

<LightBar value={0.62} />
<LightBar value={1} tone="negotiable" />
<LightBar value={0.35} rounded height={6} label="Tiempo transcurrido" />`;
const USE_OFFER = `import { OfferTypeCards } from "./OfferTypeCards";

<OfferTypeCards
  items={[
    {
      tone: "negotiable",
      title: "Recibe ofertas",
      text: "Encuentra vehículos con precio conversable",
      cta: "Ver lotes",
      image: "/fotos/agya.png",
      href: "/negociables",
    },
    {
      tone: "live",
      title: "En vivo",
      text: "Participa en subastas en tiempo real",
      cta: "Ver subastas",
      image: "/fotos/yaris.png",
      href: "/subastas",
    },
  ]}
/>`;
const USE_CATS = `import { CategoryGrid } from "./CategoryGrid";

const categorias = [
  { label: "Vehicular", count: "21 lotes", image: "/fotos/suv.png", icon: <IconoAuto />, href: "/vehicular" },
  { label: "Maquinaria", count: "2 lotes", image: "/fotos/excavadora.png", icon: <IconoMaquina />, href: "/maquinaria" },
];

<CategoryGrid items={categorias} />
<CategoryGrid items={categorias} layout="columns" columns={3} />
<CategoryGrid items={categorias} layout="scroll" />`;
const USE_HERO = `import { HeroBanner } from "./HeroBanner";

<HeroBanner
  height={300}
  slides={[
    {
      image: "/banners/whatsapp.jpg",
      pill: { text: "Canal de WhatsApp", background: "linear-gradient(135deg, #25D366, #0E7A5A)" },
      title: <>Entérate <em>primero</em><br />de las subastas</>,
      lead: <>Únete al canal de VMC y recibe los lotes<br />nuevos antes que nadie.</>,
      cta: "Unirme al canal",
      href: "/whatsapp",
    },
    {
      image: "/banners/publica.jpg",
      align: "right",
      pill: { text: "Publica en VMC" },
      title: <>Publica tu auto<br />y <em>recibe ofertas</em></>,
      cta: "Publicar mi auto",
      onCta: () => abrirPublicar(),
    },
  ]}
/>`;

// ── Página ──────────────────────────────────────────────────────────────────────
const NAV = [
  ["boton-vidrio", "Botón de vidrio"], ["badge", "Badge"], ["carta-destacada", "Carta destacada"], ["galeria", "Galería de lotes"], ["barra-luz", "Barra de luz"],
  ["tipo-oferta", "Tipo de oferta"], ["categorias", "Categorías"], ["banner", "Banner"],
] as const;
const forced = (css: string) => css.replaceAll(".hib-glass:hover", ".hib-glass.is-hover").replaceAll(".hib-glass:active", ".hib-glass.is-active");

export default function ComponentsLibrary({ sources }: { sources: LibSources }): JSX.Element {
  const f = (name: string): File => ({ name, code: sources[name] ?? "" });
  const [layout, setLayout] = useState<"auto" | "columns" | "scroll">("auto");
  const [fx, setFx] = useState<HeroBannerEffect>("letters");
  const [count, setCount] = useState("6");
  return <div className="cx">
    <style>{PAGE_CSS + GLASS_CSS + forced(GLASS_CSS) + PILL_CSS}</style>
    <aside className="cx-nav">
      <p className="cx-nav__k">VMC Index Lab</p>
      <h1>Componentes</h1>
      <nav>{NAV.map(([id, name]) => <a key={id} href={`#${id}`}>{name}</a>)}</nav>
      <Link className="cx-nav__back" href="/qa/home-index-rebase">Volver al Index</Link>
    </aside>
    <main className="cx-main">
      <Section id="boton-vidrio" name="Botón de vidrio" tag=".hib-glass"
        summary="Botón translúcido con borde degradado."
        preview={<Preview tone="lilac" desktop={<div className="cx-states">
          {([["", "Normal"], ["is-hover", "Al pasar el mouse"], ["is-active", "Al hacer clic"]] as const).map(([k, l]) =>
            <div key={l} className="cx-photo">{k ? <span className={`hib-glass ${k}`} aria-hidden>Publicar mi auto</span> : <button type="button" className="hib-glass">Publicar mi auto</button>}<small>{l}</small></div>)}
        </div>} />}
        files={[{ name: "glass-button.css", code: GLASS_CSS.trim() }]} usage={USE_BUTTON}
        props={[["children", "ReactNode", "—", "Texto del botón"], ["...props", "ButtonHTMLAttributes", "—", "onClick, disabled y demás atributos de <button>"]]} />

      <Section id="badge" name="Badge" tag=".lc-pill"
        summary="Etiquetas de estado de los lotes."
        preview={<Preview width={884} controls={<div className="cx-badges__row">{(Object.keys(PILL) as PillKind[]).map((k) => <Pill key={k} kind={k} />)}</div>}
          desktop={<Gallery />} mobile={<div className="cx-inset"><Gallery /></div>} />}
        files={[{ name: "pills.css", code: PILL_CSS.trim() }]} usage={USE_BADGE}
        props={[["lc-pill--live", "clase", "—", "En vivo, naranja"], ["lc-pill--negotiable", "clase", "—", "Recibe ofertas, cian a violeta"], ["lc-pill--featured", "clase", "—", "Destacado, violeta"], ["lc-pills", "clase", "—", "Grupo arriba a la izquierda de la card (la card con position: relative)"]]} />

      <Section id="carta-destacada" name="Carta destacada" tag="FeaturedCard"
        summary="Carta de lote destacado. Se inclina hacia el mouse."
        preview={<Preview tone="lilac" note="Pasa el mouse sobre la carta." width={292}
          desktop={<FeaturedCard {...YARIS} featured width={292} height={386} fillMedia />}
          mobile={<div className="cx-inset"><FeaturedCard {...YARIS} featured height={416} fillMedia /></div>} />}
        files={[f("FeaturedCard.tsx"), f("featured-card.css"), f("LightBar.tsx"), f("light-bar.css")]} usage={USE_CARD}
        props={[
          ["image", "string", "—", "Foto del lote"], ["title", "string", "—", "Nombre"], ["subtitle", "string", "—", "Año y tipo"],
          ["tone", "\"live\" | \"negotiable\"", "\"live\"", "En vivo (naranja, precio) o Recibe ofertas (turquesa)"],
          ["featured", "boolean", "false", "Muestra la pill Destacado"], ["photos", "number", "—", "Total del contador de fotos"],
          ["chips", "{ icon?, label }[]", "[]", "Etiquetas con borde"], ["stats", "{ icon?, label }[]", "[]", "Datos en dos columnas"],
          ["startsIn", "string", "—", "Tiempo para que empiece (en vivo)"], ["price", "string", "—", "Precio"], ["priceLabel", "string", "\"Precio base\"", "Texto sobre el precio"],
          ["progress", "number", "0.4", "Llenado de la barra de luz, de 0 a 1"], ["tilt", "number", "12", "Inclinación máxima en grados; 0 la apaga"],
          ["width / height", "number | string", "\"100%\" / \"auto\"", "Tamaño de la carta"], ["fillMedia", "boolean", "false", "La foto crece para llenar el alto"],
          ["onClick", "() => void", "—", "Clic en la carta"], ["liked / onLikeChange", "boolean / (v) => void", "—", "Favorito controlado desde afuera (opcional)"],
        ]} />

      <Section id="galeria" name="Galería de lotes" tag="LotGallery"
        summary="Destacada a la izquierda y los lotes a su derecha, columna por columna."
        preview={<Preview width={884} note="Con menos lotes el espacio de la derecha queda reservado."
          controls={<Seg label="Lotes" value={count} onChange={setCount} options={[["2", "2"], ["3", "3"], ["4", "4"], ["6", "6"]]} />}
          desktop={<Gallery count={Number(count)} />} mobile={<div className="cx-inset"><Gallery count={Number(count)} /></div>} />}
        files={[f("LotGallery.tsx"), f("lot-gallery.css"), f("FeaturedCard.tsx"), f("featured-card.css"), f("LightBar.tsx"), f("light-bar.css")]} usage={USE_GALLERY}
        props={[
          ["featured", "ReactNode", "—", "Carta de la izquierda; normalmente FeaturedCard con height=\"100%\" y fillMedia"],
          ["items", "LotRowItem[]", "—", "Lotes de la derecha, en orden: llenan la primera columna de arriba abajo y luego la siguiente"],
          ["items[].tone", "\"live\" | \"negotiable\"", "—", "En vivo (precio) o Recibe ofertas"],
          ["items[].title / image", "string", "—", "Nombre y foto"], ["items[].price", "string", "—", "Precio (en vivo)"],
          ["items[].details / location / startsIn", "string", "—", "Datos, ciudad y tiempo para que empiece"],
          ["columns", "number", "2", "Columnas a la derecha; se reservan aunque estén vacías"],
          ["featuredWidth", "number", "292", "Ancho de la destacada en px"], ["height", "number", "386", "Alto mínimo de la galería en px"],
        ]} />

      <Section id="barra-luz" name="Barra de luz" tag="LightBar"
        summary="Barra de avance con una luz que la recorre."
        preview={<Preview desktop={<div className="cx-bars">
          <div><small>En vivo, 62 %</small><LightBar value={0.62} /></div>
          <div><small>Recibe ofertas, llena</small><LightBar value={1} tone="negotiable" /></div>
          <div><small>Redondeada, 6 px, 35 %</small><LightBar value={0.35} rounded height={6} label="Tiempo transcurrido" /></div>
        </div>} />}
        files={[f("LightBar.tsx"), f("light-bar.css")]} usage={USE_BAR}
        props={[
          ["value", "number", "1", "Llenado, de 0 a 1"], ["tone", "\"live\" | \"negotiable\"", "\"live\"", "Naranja o turquesa"],
          ["height", "number", "9", "Alto en px"], ["speed", "number", "1.8", "Segundos que tarda la luz en cruzar"],
          ["rounded", "boolean", "false", "Puntas redondeadas"], ["label", "string", "—", "Si lo pasas, se anuncia como barra de progreso"],
        ]} />

      <Section id="tipo-oferta" name="Tipo de oferta" tag="OfferTypeCards"
        summary="Tarjetas para elegir el tipo de oferta."
        preview={<Preview note="Pasa el mouse sobre una tarjeta." width={600} desktop={<OfferTypeCards items={OFFERS} />} mobile={<OfferTypeCards items={OFFERS} />} />}
        files={[f("OfferTypeCards.tsx"), f("offer-type-cards.css")]} usage={USE_OFFER}
        props={[
          ["items", "OfferTypeItem[]", "—", "Una tarjeta por elemento"], ["items[].tone", "\"live\" | \"negotiable\"", "—", "Colores de la tarjeta"],
          ["items[].title", "string", "—", "Texto de la pill"], ["items[].text", "string", "—", "Descripción"], ["items[].cta", "string", "—", "Texto del botón"],
          ["items[].image", "string", "—", "Foto a la derecha (opcional)"], ["items[].href / onClick", "string / () => void", "—", "Destino o acción"],
          ["items[].colors", "{ bg, shade, glow, ink }", "—", "Colores propios para otra modalidad"],
        ]} />

      <Section id="categorias" name="Categorías" tag="CategoryGrid"
        summary="Cards de categoría. Se acomodan según el ancho."
        preview={<Preview width={916}
          controls={<Seg label="Distribución" value={layout} onChange={setLayout} options={[["auto", "Se apilan solas"], ["columns", "3 columnas"], ["scroll", "Una fila con scroll"]]} />}
          desktop={<CategoryGrid items={CATS} layout={layout} />} mobile={<CategoryGrid items={CATS} layout={layout} />} />}
        files={[f("CategoryGrid.tsx"), f("category-grid.css")]} usage={USE_CATS}
        props={[
          ["items", "CategoryItem[]", "—", "{ label, count?, image, icon?, href?, onClick? }"],
          ["layout", "\"auto\" | \"columns\" | \"scroll\"", "\"auto\"", "Se apilan solas, columnas fijas o una fila deslizable"],
          ["minWidth", "number", "140", "Ancho mínimo de cada card en auto; si no entra, baja a la fila siguiente"],
          ["columns", "number", "3", "Columnas en columns"], ["imageHeight", "number", "92", "Alto de la foto en px"],
        ]} />

      <Section id="banner" name="Banner" tag="HeroBanner"
        summary="Carrusel de banners."
        preview={<Preview width={600} note="Toca los puntos de abajo para cambiar de imagen."
          controls={<Seg label="Efecto del título" value={fx} onChange={setFx} options={[["letters", "Letras"], ["rise", "Subir"], ["blur", "Desenfoque"], ["mask", "Revelar"], ["none", "Ninguno"]]} />}
          desktop={<HeroBanner key={`d-${fx}`} slides={SLIDES} effect={fx} height={300} />} mobile={<HeroBanner key={`m-${fx}`} slides={SLIDES} effect={fx} height={300} />} />}
        files={[f("HeroBanner.tsx"), f("hero-banner.css")]} usage={USE_HERO}
        props={[
          ["slides", "HeroBannerSlide[]", "—", "Una diapositiva por elemento"], ["slides[].image", "string", "—", "Foto de fondo"],
          ["slides[].title", "ReactNode", "—", "Título; <em> lo resalta y <br /> parte la línea"], ["slides[].lead", "ReactNode", "—", "Texto bajo el título"],
          ["slides[].cta / href / onCta", "string / string / () => void", "—", "Botón de vidrio"], ["slides[].pill", "{ text, icon?, background? }", "—", "Etiqueta sobre el título"],
          ["slides[].align", "\"left\" | \"right\"", "\"left\"", "Lado del texto"], ["slides[].imagePosition", "string", "—", "Encuadre de la foto, como object-position"],
          ["slides[].background", "string", "violeta", "Degradado detrás de la foto"],
          ["interval", "number", "7000", "Milisegundos por imagen; 0 lo detiene"], ["effect", "\"letters\" | \"rise\" | \"blur\" | \"mask\" | \"none\"", "\"letters\"", "Entrada del texto"],
          ["height", "number | string", "300", "Alto del banner"],
        ]} />
    </main>
  </div>;
}

const PAGE_CSS = `
.cx { min-height: 100vh; display: grid; grid-template-columns: 220px minmax(0, 1fr); background: #F4F2FA; color: #1B1340;
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', system-ui, sans-serif); }
.cx-nav { position: sticky; top: 0; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px; padding: 28px 16px; background: #2E0F70; color: #fff; }
.cx-nav__k { margin: 0; font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; opacity: .7; }
.cx-nav h1 { margin: 0 0 16px; font-size: 22px; }
.cx-nav nav { display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.cx-nav nav a { padding: 8px 12px; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; }
.cx-nav nav a:hover { background: rgba(255,255,255,.12); }
.cx-nav__back { margin-top: auto; padding: 8px 12px; color: #fff; font-size: 13px; text-decoration: none; opacity: .8; }
.cx-main { display: flex; flex-direction: column; gap: 24px; min-width: 0; padding: 32px clamp(16px, 4vw, 48px) 80px; }
.cx-sec { display: flex; flex-direction: column; gap: 16px; min-width: 0; padding: 28px; border: 1px solid #E6E1F5; border-radius: 20px; background: #fff; scroll-margin-top: 16px; }
.cx-sec__head { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.cx-sec__head h2 { margin: 0; font-size: 22px; }
.cx-sec__head code { padding: 3px 10px; border-radius: 999px; background: #EFEAFD; color: #3D2299; font: 600 13px var(--vmc-font-mono, ui-monospace, monospace); }
.cx-sum { margin: -6px 0 4px; font-size: 15px; line-height: 1.5; color: #4A4370; }
.cx-sec h3 { margin: 12px 0 0; font-size: 15px; }

/* Vista previa: escritorio con su ancho del Index y el teléfono al lado (bajan si no entran) */
.cx-prev { display: flex; flex-direction: column; gap: 16px; }
.cx-prev__controls { display: flex; flex-wrap: wrap; gap: 12px; }
.cx-views { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 20px; }
.cx-view { display: flex; flex-direction: column; gap: 8px; min-width: 0; max-width: 100%; }
.cx-view--phone { flex: none; }
.cx-view__label { font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: #6B6492; }
.cx-view__box { min-width: 0; max-width: 100%; padding: 24px; overflow-x: auto; border-radius: 16px; }
.cx-view__box--light { background: #F7F6FB; border: 1px solid #ECE8F7; }
.cx-view__box--lilac { background: radial-gradient(120% 120% at 0% 0%, #F4EFFF 0%, #EEE8FF 45%, #F8F5FF 100%); border: 1px solid #E6DEFF; }
.cx-view__box--phone { padding: 20px 24px; }
/* iPhone 14 Pro de la vista móvil del Index, a tamaño real y escalado con --s */
.cx-phone-wrap { width: calc(415px * var(--s)); height: calc(874px * var(--s)); }
.cx-phone { position: relative; box-sizing: border-box; width: 415px; height: 874px; padding: 11px; border-radius: 66px; background: #1B1A20;
  box-shadow: inset 0 0 0 2px #3C3A44, 0 0 0 1px #0B0B0F, 0 40px 90px -30px rgba(0,0,0,.45); transform: scale(var(--s)); transform-origin: 0 0; }
.cx-phone::before { content: ""; position: absolute; left: -3px; top: 168px; width: 3px; height: 150px; border-radius: 2px 0 0 2px;
  background: linear-gradient(#2A2930 0 20%, transparent 20% 33%, #2A2930 33% 63%, transparent 63% 70%, #2A2930 70%); }
.cx-phone::after { content: ""; position: absolute; right: -3px; top: 250px; width: 3px; height: 96px; border-radius: 0 2px 2px 0; background: #2A2930; }
.cx-phone__screen { position: relative; display: flex; flex-direction: column; width: 393px; height: 852px; overflow: hidden; border-radius: 55px; background: #2E0F70; }
.cx-phone__island { position: absolute; top: 11px; left: 50%; z-index: 2; width: 126px; height: 37px; margin-left: -63px; border-radius: 20px; background: #000; }
.cx-phone__status { flex: none; display: flex; align-items: center; justify-content: space-between; height: 54px; padding: 6px 30px 0 52px; color: #fff;
  font: 600 16px/1 -apple-system, "SF Pro Text", "Plus Jakarta Sans", system-ui, sans-serif; }
.cx-phone__icons { display: inline-flex; align-items: center; gap: 6px; }
.cx-phone__page { flex: 1; min-height: 0; overflow: auto; padding: 12px; background: #fff; }
.cx-phone__home { position: absolute; left: 50%; bottom: 8px; z-index: 2; width: 134px; height: 5px; margin-left: -67px; border-radius: 3px; background: rgba(20,17,43,.85); pointer-events: none; }
.cx-inset { padding: 0 16px; } /* en el Index la carta va con 16 px a cada lado dentro de su sección */
.cx-note { margin: 0; font-size: 13px; color: #6B6492; }
.cx-states { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.cx-photo { display: grid; place-items: center; align-content: center; gap: 10px; min-height: 120px; padding: 12px; border-radius: 14px; overflow: hidden;
  background: linear-gradient(100deg, rgba(42,22,112,.92) 0%, rgba(61,34,153,.82) 40%, rgba(107,72,221,.55) 76%, rgba(132,96,229,.35) 100%), url(/banners/vmc/hero-publica.jpg) 30% 30% / cover; }
.cx-photo small { color: rgba(255,255,255,.88); font-size: 12px; font-weight: 600; }
.cx-badges__row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.cx-bars { display: grid; gap: 16px; max-width: 440px; }
.cx-bars div { display: grid; gap: 6px; }
.cx-bars small { font-size: 12px; font-weight: 600; color: #5E5785; }
.cx-seg { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.cx-seg span { margin-right: 4px; font-size: 13px; font-weight: 700; }
.cx-seg button { padding: 6px 12px; border: 1px solid #DCD5F3; border-radius: 999px; background: #fff; color: #3D2299; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
.cx-seg button[aria-pressed="true"] { border-color: #3D2299; background: #3D2299; color: #fff; }

/* Cómo usarlo */
.cx-steps { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 14px; line-height: 1.6; color: #3F3866; }
.cx-files { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.cx-steps code { padding: 2px 8px; border-radius: 6px; background: #F1EDFC; color: #3D2299; font: 600 12.5px var(--vmc-font-mono, ui-monospace, monospace); white-space: nowrap; }
.cx-code { overflow: hidden; border-radius: 14px; background: #160A3A; }
.cx-code__bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 8px 8px 10px; background: #21104F; }
.cx-code__tabs { display: flex; gap: 4px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.cx-code__tabs button { flex: none; padding: 7px 12px; border: 0; border-radius: 8px; background: transparent; color: rgba(255,255,255,.7); font: 600 12.5px var(--vmc-font-mono, ui-monospace, monospace); cursor: pointer; }
.cx-code__tabs button:hover { color: #fff; }
.cx-code__tabs button[aria-selected="true"] { background: rgba(255,255,255,.12); color: #fff; }
.cx-code__copy { flex: none; padding: 7px 14px; border: 0; border-radius: 999px; background: #fff; color: #2E0F70; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.cx-code pre { margin: 0; max-height: 460px; overflow: auto; padding: 16px 16px 16px 0; color: #E9E4FF; font: 13px/1.65 var(--vmc-font-mono, ui-monospace, monospace); counter-reset: ln; }
.cx-code code > span { display: block; padding-left: 52px; position: relative; white-space: pre; }
.cx-code code > span::before { counter-increment: ln; content: counter(ln); position: absolute; left: 0; width: 36px; text-align: right; color: rgba(255,255,255,.3); user-select: none; }

/* Propiedades */
.cx-table { overflow-x: auto; border: 1px solid #ECE8F7; border-radius: 14px; }
.cx-table table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.cx-table th, .cx-table td { padding: 10px 14px; text-align: left; vertical-align: top; border-bottom: 1px solid #F0EDF8; }
.cx-table tr:last-child td { border-bottom: 0; }
.cx-table th { background: #FAF9FE; font-size: 12px; font-weight: 700; color: #6B6492; white-space: nowrap; }
.cx-table td { color: #3F3866; line-height: 1.5; }
.cx-table td code { color: #3D2299; font: 600 12.5px var(--vmc-font-mono, ui-monospace, monospace); white-space: nowrap; }

@media (max-width: 900px) {
  .cx { grid-template-columns: 1fr; }
  .cx-nav { position: sticky; top: 0; z-index: 10; height: auto; flex-direction: row; align-items: center; gap: 12px; padding: 12px 16px; overflow: hidden; }
  .cx-nav__k, .cx-nav__back { display: none; }
  .cx-nav h1 { margin: 0; font-size: 16px; flex: none; }
  .cx-nav nav { flex-direction: row; overflow-x: auto; scrollbar-width: none; }
  .cx-nav nav a { flex: none; padding: 6px 10px; font-size: 13px; }
  .cx-main { padding: 16px 12px 64px; }
  .cx-sec { padding: 18px 14px; scroll-margin-top: 64px; }
  .cx-view__box { padding: 16px; }
  .cx-states { grid-template-columns: 1fr; }
  .cx-table th:nth-child(3), .cx-table td:nth-child(3) { display: none; }
}
`;
