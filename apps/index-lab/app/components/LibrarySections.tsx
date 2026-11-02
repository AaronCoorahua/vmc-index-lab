"use client";

/**
 * /components · componentes de librería (02/11): FeaturedCard, LightBar, OfferTypeCards, CategoryGrid y HeroBanner.
 * Cada uno vive en ./lib y solo importa React y su CSS: se copian tal cual a otro proyecto.
 * El código de las pestañas es el contenido real de esos archivos (lo lee page.tsx al compilar), así que no se desfasa.
 * Los demos usan fotos e íconos de este proyecto; los componentes no dependen de ellos.
 */
import { useState } from "react";
import type { JSX, ReactNode } from "react";
import { CardIcons, FeaturedCard } from "./lib/FeaturedCard";
import { LightBar } from "./lib/LightBar";
import { OfferTypeCards } from "./lib/OfferTypeCards";
import { CategoryGrid } from "./lib/CategoryGrid";
import { HeroBanner, type HeroBannerEffect } from "./lib/HeroBanner";
import { Vidrio } from "../qa/home-index-rebase/Vidrio";

export type LibSources = Record<string, string>;

function copy(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const t = document.createElement("textarea"); t.value = text; document.body.append(t); t.select();
  try { document.execCommand("copy"); } finally { t.remove(); }
  return Promise.resolve();
}

/** Ficha de un componente: demo, especificación y pestañas «Uso» + un archivo por pestaña. */
function LibCard({ id, name, tag, demo, spec, usage, files, sources }: {
  id: string; name: string; tag: string; demo: ReactNode; spec: [string, string][]; usage: string; files: string[]; sources: LibSources;
}): JSX.Element {
  const tabs = ["Uso", ...files];
  const [tab, setTab] = useState(tabs[0]);
  const [done, setDone] = useState(false);
  const text = tab === "Uso" ? usage : sources[tab] ?? "";
  return <article id={id} className="cmp-card">
    <header className="cmp-card__head"><h2>{name}</h2><code className="cmp-pill">{tag}</code></header>
    {demo}
    <dl className="cmp-spec">{spec.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <div className="cmp-tabs cmp-tabs--wrap" role="tablist" aria-label="Código">
      {tabs.map((t) => <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>)}
    </div>
    <figure className="cmp-code">
      <figcaption><b>{tab === "Uso" ? "Ejemplo de uso" : `lib/${tab}`}</b>
        <button type="button" onClick={() => copy(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1600); })}>{done ? "Copiado ✓" : "Copiar"}</button></figcaption>
      <pre><code>{text}</code></pre>
    </figure>
  </article>;
}

const Seg = <T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) =>
  <div className="lib-seg" role="group" aria-label={label}><span>{label}</span>
    {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}</div>;

// ── Datos de los demos ────────────────────────────────────────────────────────
const YARIS = { image: "/demo/vehicles/autoplan-yaris.png", title: "Toyota Yaris", subtitle: "2022 · Hatchback", photos: 12, startsIn: "01:24:36", price: "US$ 2,799", progress: 0.62,
  chips: [{ icon: CardIcons.gear, label: "Automática" }, { icon: CardIcons.fuel, label: "Gasolina" }],
  stats: [{ icon: CardIcons.gauge, label: "45,000 km" }, { icon: CardIcons.seats, label: "5 asientos" }] };
const AGYA = { image: "/demo/vehicles/autoplan-agya.png", title: "Toyota Agya", subtitle: "2023 · Hatchback", photos: 9,
  chips: [{ icon: CardIcons.gear, label: "Automática" }, { icon: CardIcons.fuel, label: "Gasolina" }],
  stats: [{ icon: CardIcons.gauge, label: "32,000 km" }, { icon: CardIcons.pin, label: "Lima" }] };
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
    title: <>Entérate <em>primero</em><br />de las subastas</>, lead: "Únete al canal de VMC y recibe los lotes nuevos antes que nadie.", cta: "Unirme al canal",
    background: "linear-gradient(100deg, #2A1670 0%, #3D2299 34%, #0E7A5A 78%, #25D366 100%)" },
  { image: "/banners/vmc/hero-publica.jpg", imagePosition: "30% 30%", align: "right" as const, label: "Publica en VMC",
    pill: { text: "Publica en VMC" }, title: <>Publica tu auto<br />y <em>recibe ofertas</em></>, lead: "Recibe propuestas y elige la que más te convenga.", cta: "Publicar mi auto" },
  { image: "/banners/vmc/hero-negociable-a.jpg", imagePosition: "70% 20%", label: "Recibe ofertas",
    pill: { text: "Recibe ofertas", background: "linear-gradient(110deg, #00A9B0 0%, #3F7FD0 45%, #6A35D6 100%)" },
    title: <>Tú pones el precio<br />y <em>ellos te proponen</em></>, lead: "Activa «Recibe ofertas» y negocia directo con los compradores.", cta: "Publicar con Recibe ofertas",
    background: "linear-gradient(100deg, #2A1670 0%, #3D2299 35%, #00838C 78%, #00D2D3 100%)" },
];

// ── Ejemplos de uso (pestaña «Uso») ──────────────────────────────────────────
const USE_CARD = `import { FeaturedCard, CardIcons } from "./FeaturedCard"; // + featured-card.css, LightBar.tsx y light-bar.css en la misma carpeta

<FeaturedCard
  image="/fotos/yaris.png" title="Toyota Yaris" subtitle="2022 · Hatchback"
  featured live photos={12} startsIn="01:24:36" price="US$ 2,799" progress={0.62}
  chips={[{ icon: CardIcons.gear, label: "Automática" }, { icon: CardIcons.fuel, label: "Gasolina" }]}
  stats={[{ icon: CardIcons.gauge, label: "45,000 km" }, { icon: CardIcons.seats, label: "5 asientos" }]}
  width={220} height={380} fillMedia
  onClick={() => router.push("/lote/yaris")}
/>

// Negociable (Recibe ofertas): turquesa, «Haz tu oferta» y la franja llena
<FeaturedCard tone="negotiable" image="/fotos/agya.png" title="Toyota Agya" subtitle="2023 · Hatchback" />

// Sin inclinación 3D (solo el brillo): tilt={0}`;
const USE_BAR = `import { LightBar } from "./LightBar"; // + light-bar.css

<LightBar value={0.62} />                                  // en vivo, como en la carta
<LightBar value={1} tone="negotiable" />                    // negociable, llena
<LightBar value={0.35} rounded height={6} label="Tiempo transcurrido" />  // suelta, con puntas redondas y accesible`;
const USE_OFFER = `import { OfferTypeCards } from "./OfferTypeCards"; // + offer-type-cards.css

<OfferTypeCards items={[
  { tone: "negotiable", title: "Recibe ofertas", text: "Encuentra vehículos con precio conversable",
    cta: "Ver lotes", image: "/fotos/agya.png", href: "/negociables" },
  { tone: "live", title: "En vivo", text: "Participa en subastas en tiempo real",
    cta: "Ver subastas", image: "/fotos/yaris.png", href: "/subastas" },
]} />

// Otra modalidad con sus propios colores:
// { tone: "live", title: "Venta directa", text: "…", cta: "Ver", colors: { bg: "linear-gradient(135deg, #8460E5, #3B1782)", glow: "rgba(90,53,194,.45)", ink: "#3B1782" } }`;
const USE_CATS = `import { CategoryGrid } from "./CategoryGrid"; // + category-grid.css

const categorias = [
  { label: "Vehicular", count: "21 lotes", image: "/fotos/suv.png", icon: <IconoAuto />, href: "/categoria/vehicular" },
  { label: "Maquinaria", count: "2 lotes", image: "/fotos/excavadora.png", icon: <IconoExcavadora />, href: "/categoria/maquinaria" },
  // …
];

<CategoryGrid items={categorias} />                          // se apilan solas según el ancho (mín. 140 px por card)
<CategoryGrid items={categorias} minWidth={180} />           // cards más anchas: se apilan antes
<CategoryGrid items={categorias} layout="columns" columns={3} />
<CategoryGrid items={categorias} layout="scroll" />           // una fila deslizable`;
const USE_HERO = `import { HeroBanner } from "./HeroBanner"; // + hero-banner.css

<HeroBanner height={300} interval={7000} effect="letters" slides={[
  { image: "/banners/whatsapp.jpg", imagePosition: "70% 30%",
    pill: { text: "Canal de WhatsApp", background: "linear-gradient(135deg, #25D366, #0E7A5A)" },
    title: <>Entérate <em>primero</em><br />de las subastas</>,
    lead: "Únete al canal de VMC y recibe los lotes nuevos antes que nadie.",
    cta: "Unirme al canal", href: "https://whatsapp.com/channel/…" },
  { image: "/banners/publica.jpg", align: "right",          // texto a la derecha, foto limpia a la izquierda
    pill: { text: "Publica en VMC" },
    title: <>Publica tu auto<br />y <em>recibe ofertas</em></>,
    cta: "Publicar mi auto", onCta: () => abrirPublicar() },
]} />

// effect: "letters" | "rise" | "blur" | "mask" | "none"`;

export const LIB_NAV = [
  { id: "carta-destacada", name: "Carta destacada" }, { id: "barra-luz", name: "Barra de luz" }, { id: "tipo-oferta", name: "Tipo de oferta" },
  { id: "categorias", name: "Categorías" }, { id: "banner", name: "Banner" },
];

export default function LibrarySections({ sources }: { sources: LibSources }): JSX.Element {
  const [layout, setLayout] = useState<"auto" | "columns" | "scroll">("auto");
  const [fx, setFx] = useState<HeroBannerEffect>("letters");
  return <>
    <style>{LIB_CSS}</style>
    <LibCard id="carta-destacada" name="Carta destacada" tag="FeaturedCard" sources={sources} files={["FeaturedCard.tsx", "featured-card.css", "LightBar.tsx", "light-bar.css"]} usage={USE_CARD}
      demo={<div className="lib-stage lib-stage--cards">
        <FeaturedCard {...YARIS} featured live width={220} height={380} fillMedia />
        <FeaturedCard {...AGYA} tone="negotiable" width={220} height={380} fillMedia />
        <p className="lib-hint">Pasa el mouse: la carta se inclina hacia el puntero, el brillo holográfico y el reflejo lo siguen, y la luz recorre la franja de abajo.</p>
      </div>}
      spec={[
        ["Caja", "Blanca · radio 8 px · borde 1 px #E9E3FF · sombra 0 0 16px 4px rgba(0,0,0,.07); al pasar sube 3 px con sombra violeta 0 12px 20px"],
        ["Inclinación 3D", "perspective(700px) · rotateY hasta ±6° y rotateX hasta ±5° hacia el puntero (prop tilt, 12 por defecto) · transición 0.2 s"],
        ["Holográfico", "Degradado 115° lila/cian/naranja al 5–7 % (background-size 260 %): se mueve solo cada 5 s; con el puntero, sigue su posición"],
        ["Reflejo", "radial-gradient blanco al 28 % centrado en el puntero (radio 42 %), aparece al pasar (0.2 s)"],
        ["Foto", "132 px de alto (o llena el alto con fillMedia) · esquina inferior derecha curva (100 % 44 px)"],
        ["Pills", "Destacado (violeta), En vivo (naranja) o Recibe ofertas (cian → violeta) · 18 px de alto, 9 px mayúsculas"],
        ["Franja", "LightBar de 9 px (ver «Barra de luz»): en vivo se llena según progress; en negociable va llena"],
        ["Archivos", "FeaturedCard.tsx + featured-card.css + LightBar.tsx + light-bar.css (solo React)"],
      ]} />
    <LibCard id="barra-luz" name="Barra de luz" tag="LightBar" sources={sources} files={["LightBar.tsx", "light-bar.css"]} usage={USE_BAR}
      demo={<div className="lib-stage lib-stage--bars">
        <div><small>En vivo · 62 %</small><LightBar value={0.62} /></div>
        <div><small>Negociable · llena</small><LightBar value={1} tone="negotiable" /></div>
        <div><small>Suelta · redondeada, 6 px · 35 %</small><LightBar value={0.35} rounded height={6} label="Tiempo transcurrido" /></div>
      </div>}
      spec={[
        ["Pista", "Gris #ECEAF3 · 9 px de alto (prop height)"],
        ["Relleno", "En vivo: 90° #FF9639 → #EF852E 60 % → #BE3D00 · Negociable: 90° #00DAE0 → #008688 · el ancho anima en 0.4 s"],
        ["Luz", "Franja blanca al 40 % (30 % del ancho) que cruza el relleno de izquierda a derecha cada 1.8 s (prop speed), sin parar"],
        ["Accesibilidad", "Con label es role=\"progressbar\" con su valor; sin label es decorativa (aria-hidden)"],
      ]} />
    <LibCard id="tipo-oferta" name="Tipo de oferta" tag="OfferTypeCards" sources={sources} files={["OfferTypeCards.tsx", "offer-type-cards.css"]} usage={USE_OFFER}
      demo={<div className="lib-stage lib-stage--light"><OfferTypeCards items={OFFERS} /><p className="lib-hint">Pasa el mouse por una tarjeta: crece, el contenido se desenfoca y aparece el botón de vidrio. Cada 5 s cruza un destello de luz.</p></div>}
      spec={[
        ["Tarjeta", "Mín. 128 px de alto · radio 16 px · degradado de la modalidad + foto a la derecha (66 %) fundida con máscara"],
        ["Luz", "Brillo de vidrio arriba · foco blanco que respira en la esquina (5 s) · destello inclinado que cruza (5 s)"],
        ["Hover / foco", "Escala 1.035 en 0.35 s cubic-bezier(0.3,0,0,1) · texto y foto con blur(6px) y opacidad 0.55 · sombra del color más grande"],
        ["Botón", "Vidrio de 36 px al centro: aparece subiendo de -40 % a -50 % y de escala 0.92 a 1; al hacer clic baja y se tiñe de violeta"],
        ["Apilado", "Una columna por tarjeta; en contenedores de menos de 560 px se apilan en una sola columna"],
      ]} />
    <LibCard id="categorias" name="Categorías" tag="CategoryGrid" sources={sources} files={["CategoryGrid.tsx", "category-grid.css"]} usage={USE_CATS}
      demo={<div className="lib-stage lib-stage--light">
        <Seg label="Distribución" value={layout} onChange={setLayout} options={[["auto", "Se apilan solas"], ["columns", "3 columnas"], ["scroll", "Una fila con scroll"]]} />
        <div className="lib-resize"><CategoryGrid items={CATS} layout={layout} columns={3} /></div>
        <p className="lib-hint">{layout === "auto" ? "Arrastra la esquina inferior derecha del recuadro para achicarlo: las cards que no caben bajan a la fila siguiente." : layout === "scroll" ? "Desliza la fila; se detiene card por card." : "Siempre 3 por fila."}</p>
      </div>}
      spec={[
        ["Card", "Blanca · radio 8 px · sombra del Index · foto de 92 px (prop imageHeight) · ícono 32 px, nombre 12 px #3B1782, conteo 11 px"],
        ["Hover", "Sube 3 px · sombra violeta · la foto se acerca a 1.05 · la flecha se llena de violeta"],
        ["Apilado (auto)", "repeat(auto-fit, minmax(140px, 1fr)): caben tantas como permita el ancho; el resto baja (prop minWidth)"],
        ["Otras", "columns: columnas fijas (prop columns) · scroll: fila deslizable con snap y barra lila"],
        ["Ícono", "Cualquier ReactNode (en el Index son los íconos de vidrio esmerilado)"],
      ]} />
    <LibCard id="banner" name="Banner" tag="HeroBanner" sources={sources} files={["HeroBanner.tsx", "hero-banner.css"]} usage={USE_HERO}
      demo={<div className="lib-stage lib-stage--light">
        <Seg label="Efecto del texto" value={fx} onChange={setFx} options={[["letters", "Letras"], ["rise", "Subir"], ["blur", "Desenfoque"], ["mask", "Revelar"], ["none", "Sin efecto"]]} />
        <HeroBanner key={fx} slides={SLIDES} effect={fx} height={300} />
        <p className="lib-hint">Toca los puntos de la pestaña de vidrio de abajo para ver la transición. Avanza solo cada 7 s y se pausa con el mouse encima.</p>
      </div>}
      spec={[
        ["Transición", "Fundido de 0.5 s entre diapositivas · la foto entra con zoom de 108 % a 100 % en 7.5 s"],
        ["Texto", "Letras: cada letra sube 0.55 em, gira 8° y se enfoca, 22 ms entre letras; pill, texto y botón suben después (0.45–0.55 s)"],
        ["Puntos", "Montaña de vidrio de 132 × 26 px con blur(8px) y borde blanco; puntos de 6 px, el activo se alarga a 18 px en 0.3 s"],
        ["Autoplay", "Cada 7 s (prop interval; 0 lo apaga) · pausa con mouse o foco · flechas ← → del teclado"],
        ["Responsive", "Bajo 700 px el texto ocupa todo el ancho; bajo 480 px baja al pie con la foto arriba (container queries)"],
      ]} />
  </>;
}

const LIB_CSS = `
.lib-stage { display: flex; flex-direction: column; gap: 14px; padding: 20px; border-radius: 16px; background: #F4F2FA; }
.lib-stage--light { background: #fff; border: 1px solid #ECE8F7; }
.lib-stage--cards { flex-direction: row; flex-wrap: wrap; align-items: flex-start; gap: 24px; padding: 28px; background: radial-gradient(120% 120% at 0% 0%, #F4EFFF 0%, #EEE8FF 45%, #F8F5FF 100%); }
.lib-stage--cards .lib-hint { flex: 1 1 200px; align-self: center; }
.lib-stage--bars { display: grid; gap: 16px; }
.lib-stage--bars div { display: grid; gap: 6px; max-width: 420px; }
.lib-stage--bars small { font-size: 12px; font-weight: 600; color: #5E5785; }
.lib-hint { margin: 0; font-size: 13px; line-height: 1.5; color: #5E5785; }
.lib-resize { resize: horizontal; overflow: auto; min-width: 180px; max-width: 100%; padding: 6px; border: 1px dashed #D6CDF8; border-radius: 12px; }
.lib-seg { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.lib-seg span { margin-right: 4px; font-size: 13px; font-weight: 700; color: #3D2299; }
.lib-seg button { padding: 6px 12px; border: 1px solid #DCD5F3; border-radius: 999px; background: #fff; color: #3D2299; font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.lib-seg button[aria-pressed="true"] { background: #3D2299; border-color: #3D2299; color: #fff; }
.cmp-tabs--wrap { flex-wrap: wrap; }
`;
