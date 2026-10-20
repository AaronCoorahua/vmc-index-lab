"use client";

/**
 * HomeIndexBlock — composición local del bloque Homepage de Concorde V2
 * (concorde/bloques/homepage/desktop/Homepage.tsx, que queda intacto).
 *
 * Mismo lienzo (798 × 1104) y mismas secciones; solo cambia el primer tramo:
 * Principal Banner y Secondary Banner van lado a lado, como en la referencia
 * elegida (hero a la izquierda, el feed «VMC ahora» a la derecha).
 * Debajo, en este orden: Lotes para explorar, el banner de campaña, Explora por
 * categoría, Empresas y vendedores y Tipo de oferta / Categorías.
 *
 * La sección del Subastador (AuctioneerSection, 766 × 352) se recompone aquí como
 * «Lotes para explorar» con los mismos componentes (CardTitle · ProfileButton ·
 * OfferCard · BadgeStatus): la de Concorde fija «Ir al Perfil» y todas las cards
 * en variante «live», y aquí hacen falta «Ver todos los lotes» y negociables.
 * Principal Banner y Secondary Banner: Concorde no tiene hero ni feed de actividad
 * (los banners del registry son 766 × 192 y ActivityCard son contadores de «Tu
 * actividad»), así que se componen aquí solo con piezas de Concorde (Button ·
 * CardTitle · BadgeStatus · ProfileButton) y layout mínimo, sin estilos que las imiten.
 * Contenido de ejemplo; sin inventario real.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { JSX } from "react";
import {
  BadgeStatus, Button, OfferCard, ProfileButton,
} from "@vmc/concorde-adapter";

import {
  CompactCurveCard, FichaCard, FichaLegend, FichaPlus, FichaPro, GlassCard, ImmersiveCard, LotCardStyles, ReliefCard, SummaryCard,
  type FichaLayout, type LegendTier, type LotData, type ProTheme,
} from "./LotCards";
import VmcAhora, { type FeedView } from "./VmcAhora";
import LogoLoop from "./reactbits/LogoLoop";
import SectionHeader from "./SectionHeader";
import Vidrio, { type VidrioName } from "./Vidrio";
import HeroPromo from "./HeroPromo";
import SellerSection from "./SellerSection";

const GAP = 16;

const FONT = "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)";
const SHADOW = "rgba(0,0,0,0.07) 0px 0px 16px 4px"; // sombra de las secciones del homepage
// Banner de campaña 766 × 168 (el del bloque es 100 de alto; aquí crece para que entre el contenido).
const BANNER_HEIGHT = 168;
const POINTS = [
  { Icon: () => <Vidrio s="empresa" size={40} />, text: "Activos de empresas de confianza" },
  { Icon: () => <Vidrio s="verificado" size={40} />, text: "Equipos verificados y listos para operar" },
  { Icon: () => <Vidrio s="crecimiento" size={40} />, text: "Oportunidades para hacer crecer tu negocio" },
];

function CampaignBanner(): JSX.Element {
  return (
    <section
      aria-label="Maquinaria que mueve tu negocio"
      style={{
        position: "relative", boxSizing: "border-box", width: "100%", height: BANNER_HEIGHT, overflow: "hidden", borderRadius: 16,
        display: "grid", gridTemplateColumns: "minmax(272px, 32%) minmax(0, 1fr) minmax(214px, 28%)", alignItems: "center",
        background: "linear-gradient(100deg, #F6F2FF 0%, #ECE4FF 55%, #F3EEFF 100%)", boxShadow: SHADOW, fontFamily: FONT,
      }}
    >
      <div style={{ position: "relative", zIndex: 1, display: "grid", justifyItems: "start", gap: 8, padding: "0 0 0 24px" }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.1, color: "#3b1782" }}>Maquinaria que mueve tu negocio</h2>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "#3f3f4a" }}>Equipos industriales y vehículos de empresas confiables, en un solo lugar.</p>
        <Button variant="primary">Ver maquinaria</Button>
      </div>
      <img
        src="/demo/inventory-excavator-v1.png" alt=""
        style={{
          width: "100%", height: BANNER_HEIGHT, objectFit: "cover",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
        }}
      />
      <ul style={{ display: "grid", gap: 10, margin: 0, padding: "0 20px 0 4px", listStyle: "none" }}>
        {POINTS.map(({ Icon, text }) => (
          <li key={text} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 10, alignItems: "center", fontSize: 12, lineHeight: 1.3, fontWeight: 600, color: "#3b1782" }}>
            <Icon />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

// «Explora por categoría»: cinco cards con la caja de OfferCard (radio 8, sombra y elevación al pasar).
// Íconos dúotono como los del banner. Las fotos son las de demo del lab (no hay una de artículos diversos).
// Íconos del CategoryCard de Concorde (paths exactos de su SVG de Figma; el componente no los exporta):
// auto → Vehicular · sierra → Equipos diversos · grúa → Maquinaria · laptop → Artículos diversos.
// Materiales no existe en Concorde: capas apiladas propias, con el mismo degradado.
// Caja como la del CategoryCard: blanco→#F4F5F9 con borde degradado lila.
type Paint = string;
type Shape = { viewBox: string; draw: (f: Paint) => JSX.Element };
const CAR: Shape = { viewBox: "41 29 31 27", draw: (f) => <path fill={f} d="M49.8053 30.4693C48.7705 30.7374 47.8575 31.8771 47.0662 33.7542C45.9705 36.3017 45.7271 36.5698 44.2053 36.1676C42.7445 35.8324 42.501 36.0335 42.501 37.2402C42.501 37.9777 42.8662 38.7821 43.2314 38.9162C43.8401 39.1844 43.9618 41.1955 43.8401 46.6257L43.5966 54H45.4836C46.9445 54 47.4314 53.6648 47.7358 52.324L48.101 50.648H56.501H64.901L65.2662 52.324C65.5705 53.6648 66.0575 54 67.5184 54H69.4053L69.1618 46.6257C69.0401 41.1955 69.1618 39.1844 69.7705 38.9162C70.1358 38.7821 70.501 37.9777 70.501 37.2402C70.501 36.0335 70.2575 35.8324 68.7966 36.1676C67.2749 36.5698 67.0314 36.3017 65.9358 33.7542C64.4749 30.3352 63.6227 30 56.501 30C53.6401 30 50.6575 30.2011 49.8053 30.4693ZM61.4923 32.2793C63.4401 32.6816 63.8053 33.0838 64.7184 35.6983C65.2662 37.3073 65.5705 38.8492 65.3271 39.1173C64.7792 39.7207 48.2227 39.7207 47.6749 39.1173C47.4314 38.8492 47.7358 37.3073 48.2836 35.6313C49.1358 33.2849 49.6836 32.5475 50.9618 32.3464C53.6401 31.8771 59.1184 31.8771 61.4923 32.2793ZM49.7445 42.5363C50.901 43.3408 50.0488 44.6145 48.2836 44.6145C47.4314 44.6145 46.5184 44.0112 46.1532 43.2737C45.5445 42.067 45.6662 41.933 47.1879 41.933C48.101 41.933 49.2575 42.2011 49.7445 42.5363ZM66.8488 43.2737C66.1184 44.7486 63.5618 45.0838 62.8314 43.8771C62.2836 42.8715 63.6836 41.933 65.814 41.933C67.3358 41.933 67.4575 42.067 66.8488 43.2737ZM60.9445 47.2961C60.6401 48.5028 60.0923 48.6369 56.501 48.6369C52.9097 48.6369 52.3618 48.5028 52.0575 47.2961C51.7532 46.0223 52.0575 45.9553 56.501 45.9553C60.9445 45.9553 61.2488 46.0223 60.9445 47.2961Z" /> };
const CRANE: Shape = { viewBox: "41 27 30 30", draw: (f) => <path fillRule="evenodd" clipRule="evenodd" fill={f} d="M70 32.5046V30.949C70 30.0905 69.303 29.3934 68.4444 29.3934H52.8889V27.8379H48.2222V29.3934H46.6667V32.5046H48.2222V46.5046H46.6667V43.3934H43.5556V46.5046H42V49.6157H43.5556V55.8379H46.6667V49.6157H54.4444V55.8379H57.5556V54.1579V49.6157H59.1111V46.5046H57.5556V43.3934H54.4444V46.5046H52.8889V32.5046H65.3333V39.6912C64.6022 39.9557 64.0733 40.6401 64.0733 41.4646C64.0733 42.149 64.4467 42.7712 65.0222 43.1134V44.949H65.9867C66.5156 44.949 66.9356 45.3846 66.9356 45.9134C66.9356 46.4423 66.5156 46.8779 65.9867 46.8779C65.6444 46.8779 65.3333 46.6912 65.1622 46.3957C64.8822 45.9446 64.3067 45.789 63.8556 46.0534C63.3889 46.3023 63.2333 46.8934 63.4978 47.3601C64.0111 48.2312 64.96 48.7912 65.9867 48.7912C67.5578 48.7912 68.8489 47.5001 68.8489 45.9134C68.8489 44.7001 68.0711 43.6112 66.9356 43.2068V43.1134C67.5267 42.7712 67.9 42.149 67.9 41.4646C67.9 40.749 67.48 40.1423 66.8889 39.8157V32.5046H70ZM51.3333 44.4201L49.7778 45.9757V43.7668L51.3333 42.2112V44.4201ZM51.3333 39.8312L49.7778 41.3868V39.1779L51.3333 37.6223V39.8312ZM49.7778 36.7201V34.5112L51.3333 32.9557V35.1646L49.7778 36.7201Z" /> };
const SAW: Shape = { viewBox: "40 25 30 24", draw: (f) => <path fillRule="evenodd" clipRule="evenodd" fill={f} d="M56.4 35.4479C57.1727 35.4479 57.8 36.0526 57.8 36.7975C57.8 37.5425 57.1727 38.1472 56.4 38.1472C55.6273 38.1472 55 37.5425 55 36.7975C55 36.0526 55.6273 35.4479 56.4 35.4479ZM49.204 29.0368C50.996 27.1742 53.558 26 56.4 26C61.3 26 65.416 29.5227 66.102 34.0982H69V36.7975H60.6C60.6 34.5628 58.718 32.7485 56.4 32.7485C54.082 32.7485 52.2 34.5628 52.2 36.7975H41V34.0982H41.07C41.35 31.0344 42.596 28.2405 44.5 26L49.204 29.0368ZM47.622 31.2503L45.284 29.7387C44.542 31.0613 44.052 32.5325 43.884 34.0982H46.698C46.852 33.0859 47.16 32.1276 47.622 31.2503ZM48.56 41.3865L46.6 39.4969H54.706C55.042 40.0638 55.7 40.4417 56.4 40.4417C57.1 40.4417 57.758 40.0638 58.094 39.4969H66.2V41.3865C63.946 40.0638 64.044 41.8589 64.044 41.8589V44.5043L61.3 47.1497C60.6 44.7877 59.34 46.1104 59.34 46.1104L57.38 48H53.46C54.832 45.827 52.97 45.9215 52.97 45.9215H50.226L47.482 43.2761C49.932 42.6147 48.56 41.3865 48.56 41.3865Z" /> };
const LAPTOP: Shape = { viewBox: "40 22 32 31", draw: (f) => <path fillRule="evenodd" clipRule="evenodd" fill={f} d="M45.5652 23.3989H66.4348C67.5146 23.3989 68.3913 24.3542 68.3913 25.5309V39.4598C68.3913 40.2443 67.8068 40.8812 67.087 40.8812H44.913C44.1932 40.8812 43.6087 40.2443 43.6087 39.4598V25.5309C43.6087 24.3542 44.4854 23.3989 45.5652 23.3989ZM44.913 40.3126H67.087L71 50.404H41L44.913 40.3126ZM41 50.8304H71V51.3989H41V50.8304ZM44.913 24.8202H67.087V38.0385H44.913V24.8202ZM56 24.2517C55.712 24.2521 55.4787 24.5067 55.4789 24.8206C55.4791 25.1345 55.7126 25.3888 56.0007 25.3888C56.2887 25.3888 56.5222 25.1345 56.5224 24.8206C56.5226 24.5067 56.2893 24.2521 56.0013 24.2517H56ZM45.8261 41.0233H66.1739L68.3913 47.135H43.6087L45.8261 41.0233ZM52.7391 47.8456H59.2609L59.5217 49.2669H52.4783L52.7391 47.8456ZM45.5652 25.5309H66.4348V37.3279H45.5652V25.5309ZM46.2174 41.4497H65.7826L66.1739 42.4446H45.8261L46.2174 41.4497ZM45.5652 43.0131H66.4348L66.9565 44.0081H45.0435L45.5652 43.0131ZM44.7826 44.5766H67.2174L67.7391 45.5715H44.2609L44.7826 44.5766ZM51.4348 45.9979H60.5652L60.8261 46.9928H51.1739L51.4348 45.9979ZM46.8696 26.9522L53.3913 36.1908H54.1739L47.6522 26.9522H46.8696ZM48.8261 26.9522L52.087 31.5004H52.8696L49.6087 26.9522H48.8261ZM61.8696 31.2162L65.3913 36.1908H66.1739L62.6522 31.2162H61.8696Z" /> };
const LAYERS: Shape = { viewBox: "0 0 40 40", draw: (f) => <><path d="M20 22l15 7-15 7-15-7z" fill={f} opacity="0.45" /><path d="M20 15l15 7-15 7-15-7z" fill={f} opacity="0.7" /><path d="M20 5l15 7-15 7-15-7z" fill={f} /></> };

const CATEGORIES = [
  { label: "Vehicular", count: "21 lotes", vd: "auto" as VidrioName, shape: CAR, imageSrc: "/demo/inventory-suv-v1.png" },
  { label: "Equipos diversos", count: "12 lotes", vd: "equipos" as VidrioName, shape: SAW, imageSrc: "/demo/inventory-forklift-v1.png" },
  { label: "Maquinaria", count: "2 lotes", vd: "maquinaria" as VidrioName, shape: CRANE, imageSrc: "/demo/inventory-excavator-v1.png" },
  { label: "Materiales", count: "1 lote", vd: "materiales" as VidrioName, shape: LAYERS, imageSrc: "/demo/inventory-steel-v1.png" },
  { label: "Artículos diversos", count: "1 lote", vd: "articulos" as VidrioName, shape: LAPTOP, imageSrc: "/demo/inventory-mosaic-v1.png" },
];
const CATEGORY_CSS = `
.hib-cat { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px; background: #fff; color: inherit; text-decoration: none;
  box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-cat:hover { transform: translateY(-3px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-cat:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-cat > img { display: block; width: 100%; height: 92px; object-fit: cover; }
.hib-cat__foot { flex: 1; display: grid; grid-template-columns: 34px minmax(0,1fr) 20px; gap: 6px; align-items: center; padding: 8px 6px 8px 8px; }
.hib-cat__icon { box-sizing: border-box; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; border: 0; background: none; box-shadow: none; /* el ícono de vidrio lleva su propio volumen */
  background: linear-gradient(160deg, #ffffff 0%, #f4f5f9 100%) padding-box, linear-gradient(135deg, #9c96f8 0%, rgba(255,255,255,0.65) 38%, #7364de 70%, #9c96f8 100%) border-box;
  box-shadow: rgba(32,0,104,0.12) 0 2px 6px; } /* = caja del CategoryCard de Concorde */
.hib-cat__icon svg { width: 34px; height: 34px; }
.hib-cat__txt { display: grid; min-width: 0; }
.hib-cat__txt b { font-size: 12px; line-height: 1.2; color: #3b1782; } /* «Equipos diversos» va en 2 líneas: no se corta */
.hib-cat__txt small { font-size: 12px; color: #5b5b66; }
.hib-cat__go { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; color: #3b1782; background: #F3EFFD; }
@media (prefers-reduced-motion: reduce) { .hib-cat { transition: none; } }
/* Vista «Sin card»: el ícono suelto, sin la caja con borde degradado. */
.hib-cats--plain .hib-cat__icon { border: 0; background: none; box-shadow: none; }

`;
type CategoriesView = "normal" | "plain" | "premium";
const CATEGORIES_VIEWS: { id: CategoriesView; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "Ícono en caja degradada" },
  { id: "plain", label: "Sin card", hint: "Solo el ícono" },
  { id: "premium", label: "Premium", hint: "Fondo lila, ícono en cajita y destello" },
];

// Vista «Premium» (referencia de producto): sección con fondo lila suave, título sin corchetes y enlace
// con flecha; cards de vidrio blanco con la foto sobre lila, ícono en cajita blanca con sombra, flecha
// en círculo que se llena al pasar y un destello que cruza la card.
const CATEGORY_PREMIUM_CSS = `
.hib-pcats { box-sizing: border-box; width: 100%; padding: 18px 16px 16px; border-radius: 16px; font-family: ${FONT};
  background: radial-gradient(120% 140% at 0% 0%, #F4EFFF 0%, #EEE8FF 45%, #F8F5FF 100%); border: 1px solid #E6DEFF;
  box-shadow: rgba(92,56,214,0.12) 0 12px 28px -12px; }
.hib-pcats__head { display: flex; align-items: center; justify-content: space-between; padding: 0 4px 14px; }
.hib-pcats__head h2 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.01em; color: #1B1442; }
.hib-pcats__all { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #3B1782; text-decoration: none; }
.hib-pcats__all svg { transition: transform 0.2s; }
.hib-pcats__all:hover svg { transform: translateX(3px); }
.hib-pcats ul { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
.hib-pcat { position: relative; display: flex; flex-direction: column; height: 100%; overflow: hidden; border-radius: 14px; color: inherit; text-decoration: none;
  background: rgba(255,255,255,0.88); border: 1px solid rgba(255,255,255,0.95); box-shadow: rgba(76,40,200,0.12) 0 8px 22px -8px, inset 0 1px 0 #fff;
  transition: transform 0.2s cubic-bezier(0.3,0,0,1), box-shadow 0.2s; }
.hib-pcat:hover { transform: translateY(-4px); box-shadow: rgba(76,40,200,0.24) 0 16px 30px -10px; }
.hib-pcat:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-pcat::before { content: ""; position: absolute; top: 0; left: -60%; z-index: 2; width: 40%; height: 100%; pointer-events: none;
  transform: skewX(-18deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); transition: left 0.6s ease; }
.hib-pcat:hover::before { left: 130%; }
.hib-pcat__media { position: relative; height: 96px; margin: 6px 6px 0; overflow: hidden; border-radius: 10px;
  background: radial-gradient(80% 90% at 50% 40%, #FFFFFF 0%, #ECE6FF 100%); }
.hib-pcat__media img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
.hib-pcat:hover .hib-pcat__media img { transform: scale(1.06); }
.hib-pcat__media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(236,230,255,0) 55%, rgba(236,230,255,0.6) 100%); }
.hib-pcat__foot { flex: 1; display: grid; grid-template-columns: 34px minmax(0,1fr) 20px; gap: 6px; align-items: center; padding: 9px 6px 9px 7px; }
.hib-pcat__icon { display: grid; place-items: center; width: 34px; height: 34px; }
.hib-pcat__icon svg { width: 34px; height: 34px; }
.hib-pcat__txt { display: grid; min-width: 0; }
.hib-pcat__txt b { font-size: 12px; line-height: 1.2; color: #1B1442; }
.hib-pcat__txt small { font-size: 12px; color: #6B6880; }
.hib-pcat__go { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; color: #4A2CE0; background: #EEE8FF;
  transition: background 0.2s, color 0.2s; }
.hib-pcat:hover .hib-pcat__go { color: #fff; background: linear-gradient(135deg, #8460E5, #3B1782); }
`;
const ARROW = <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

function CategoryRail({ view }: { view: CategoriesView }): JSX.Element {
  if (view === "premium") {
    return (
      <section className="hib-pcats" aria-labelledby="hib-pcats-title">
        <header className="hib-pcats__head">
          <h2 id="hib-pcats-title">Explora por categoría</h2>
          <a href="#" className="hib-pcats__all">Ver todas las categorías{ARROW}</a>
        </header>
        <ul>
          {CATEGORIES.map(({ label, count, vd, imageSrc }) => (
            <li key={label} style={{ display: "flex" }}>
              <a href="#" className="hib-pcat vd-host" aria-label={`${label} · ${count}`}>
                <span className="hib-pcat__media"><img src={imageSrc} alt="" /></span>
                <span className="hib-pcat__foot">
                  <span className="hib-pcat__icon"><Vidrio s={vd} size={34} /></span>
                  <span className="hib-pcat__txt"><b>{label}</b><small>{count}</small></span>
                  <span className="hib-pcat__go" aria-hidden>{ARROW}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <style>{CATEGORY_PREMIUM_CSS}</style>
      </section>
    );
  }
  return (
    <section aria-label="Explora por categoría" style={{ boxSizing: "border-box", width: "100%", fontFamily: FONT }}>
      {/* Mismo estilo que «Empresas»: sin tarjeta blanca detrás y sin «Ver todas». */}
      <SectionHeader title="Explora por categoría" subtitle="Encuentra oportunidades por tipo de activo" flush />
      <ul className={view === "plain" ? "hib-cats--plain" : undefined} style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10, margin: "16px 0 0", padding: "4px 0 12px", listStyle: "none" }}>
        {CATEGORIES.map(({ label, count, vd, imageSrc }) => (
          <li key={label} style={{ display: "flex" }}>
            <a href="#" className="hib-cat vd-host" aria-label={`${label} · ${count}`}>
              <img src={imageSrc} alt="" />
              <span className="hib-cat__foot">
                <span className="hib-cat__icon"><Vidrio s={vd} size={34} /></span>
                <span className="hib-cat__txt"><b>{label}</b><small>{count}</small></span>
                <span className="hib-cat__go" aria-hidden><svg width="12" height="12" viewBox="0 0 20 20"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <style>{CATEGORY_CSS}</style>
    </section>
  );
}

// «Empresas y vendedores»: 2 × 2 filas con la caja de las cards (radio 8, sombra y elevación al pasar).
// Autoplan, Pacífico y Trupal (y sus conteos) salen del submenú «Empresas» del sidebar; Mapfre es de
// ejemplo (no está en el sidebar, su conteo es inventado). Logos oficiales bajados de sus sitios
// (autoplan.pe, pacifico.com.pe, mapfre.com.pe, trupal.com.pe) a public/demo/empresas.
const COMPANIES = [
  { name: "Autoplan", lots: "3 lotes", logo: "/demo/empresas/autoplan.png", tile: "#ffffff" },
  { name: "Pacífico", lots: "2 lotes", logo: "/demo/empresas/pacifico.png", tile: "#ffffff" },
  { name: "Mapfre", lots: "4 lotes", logo: "/demo/empresas/mapfre.png", tile: "#ffffff" },
  { name: "Trupal S.A.", lots: "2 lotes", logo: "/demo/empresas/trupal.svg", tile: "#ffffff" },
];
const COMPANY_CSS = `
.hib-emp { display: grid; grid-template-columns: 76px minmax(0,1fr) 24px; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 8px; background: #fff; color: inherit; text-decoration: none;
  box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-emp:hover { transform: translateY(-2px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-emp:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-emp__logo { box-sizing: border-box; display: grid; place-items: center; width: 76px; height: 44px; padding: 6px 8px; border-radius: 8px; border: 1px solid #ECE8F6; }
.hib-emp__logo img { display: block; max-width: 58px; max-height: 30px; object-fit: contain; }
.hib-emp__txt { display: grid; min-width: 0; gap: 2px; }
.hib-emp__txt b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #3b1782; }
.hib-emp__txt small { font-size: 12px; color: #5b5b66; }
.hib-emp__go { color: #3b1782; }
@media (prefers-reduced-motion: reduce) { .hib-emp { transition: none; } }

/* Slider: marquee de logos en bucle infinito. La pista lleva la lista dos veces y se desplaza -50%,
   así el corte no se ve. Se pausa con el puntero o el foco; bordes desvanecidos. Se mueve siempre,
   también con «reducir animaciones» activo en el sistema (pedido de producto). */
.hib-marquee { position: relative; overflow: hidden; margin-top: 16px; padding: 10px 0 14px;
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%); }
.hib-marquee__track { display: flex; gap: 16px; width: max-content; animation: hib-marquee 26s linear infinite; }
.hib-marquee:hover .hib-marquee__track, .hib-marquee:focus-within .hib-marquee__track { animation-play-state: paused; }
@keyframes hib-marquee { to { transform: translateX(calc(-50% - 8px)); } }
.hib-marquee__item { box-sizing: border-box; display: grid; justify-items: center; align-content: center; gap: 6px; width: 168px; height: 92px; padding: 10px;
  border-radius: 8px; background: #fff; color: inherit; text-decoration: none; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px;
  transition: transform 150ms cubic-bezier(0.3,0,0,1), box-shadow 150ms cubic-bezier(0.3,0,0,1); }
.hib-marquee__item:hover { transform: translateY(-2px); box-shadow: oklch(0.22 0.18 285 / 0.12) 0 12px 20px; }
.hib-marquee__item:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
.hib-marquee__item img { display: block; max-width: 120px; max-height: 40px; object-fit: contain; }
.hib-marquee__item small { font-size: 12px; color: #5b5b66; }
`;
type CompaniesView = "normal" | "slider" | "loop";
const COMPANIES_VIEWS: { id: CompaniesView; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "2 × 2 filas" },
  { id: "slider", label: "Slider", hint: "Logos en movimiento" },
  { id: "loop", label: "Logo loop", hint: "Efecto de React Bits" },
];

// Cada mitad de la pista repite la lista 2 veces (8 logos) para que siempre cubra los 734 de ancho.
const MARQUEE_HALF = [...COMPANIES, ...COMPANIES];

function CompaniesSection({ view }: { view: CompaniesView }): JSX.Element {
  return (
    <section aria-label="Empresas y vendedores" style={{ boxSizing: "border-box", width: "100%", fontFamily: FONT }}>
      {/* Solo el slide, con el mismo encabezado de las demás secciones (sin tarjeta ni «Ver todas»). */}
      <SectionHeader title="Empresas que publican en VMC" subtitle="Tiendas especializadas que publican en VMC" flush />
      {view === "normal" ? (
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, margin: "16px 0 0", padding: 0, listStyle: "none" }}>
          {COMPANIES.map((c) => (
            <li key={c.name}>
              <a href="#" className="hib-emp" aria-label={`${c.name} · ${c.lots}`}>
                <span className="hib-emp__logo" style={{ background: c.tile }}><img src={c.logo} alt="" /></span>
                <span className="hib-emp__txt"><b>{c.name}</b><small>{c.lots}</small></span>
                <svg className="hib-emp__go" width="18" height="18" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </li>
          ))}
        </ul>
      ) : view === "loop" ? (
        // Logo Loop de React Bits: loop continuo, bordes desvanecidos, se frena y agranda el logo al pasar el
        // mouse y se puede arrastrar. Nombre de la empresa debajo de cada logo.
        <div style={{ marginTop: 18 }}>
          <LogoLoop
            logos={COMPANIES.map((c) => ({ src: c.logo, alt: c.name, title: c.name, href: "#" }))}
            speed={50} gap={48} logoHeight={28} hoverSpeed={12} scaleOnHover labels="below" ariaLabel="Empresas que publican en VMC"
          />
        </div>
      ) : (
        <div className="hib-marquee" role="region" aria-label="Empresas que publican en VMC">
          <div className="hib-marquee__track">
            {[...MARQUEE_HALF, ...MARQUEE_HALF].map((c, k) => (
              // Solo la primera vuelta es navegable y la lee el lector de pantalla; las copias son decorativas.
              <a key={k} href="#" className="hib-marquee__item" aria-label={`${c.name} · ${c.lots}`}
                aria-hidden={k >= COMPANIES.length || undefined} tabIndex={k >= COMPANIES.length ? -1 : undefined}>
                <img src={c.logo} alt="" />
                <small>{c.lots}</small>
              </a>
            ))}
          </div>
        </div>
      )}
      <style>{COMPANY_CSS}</style>
    </section>
  );
}


// El primero es el destacado; los otros seis van en 2 filas de 3 a su derecha.
type Store = { name: string; logo: string; city: string };
const LOTS: LotData[] = [
  { name: "Toyota Yaris", year: 2022, price: "US$ 2,799", variant: "live", live: true, imageSrc: "/demo/vehicles/autoplan-yaris.png",
    kind: "Hatchback", photos: 12, km: "45,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "01:24:36", progress: 0.72 },
  { name: "Hyundai Grand i10", year: 2021, price: "US$ 2,199", variant: "live", imageSrc: "/demo/vehicles/autoplan-grand-i10.png",
    kind: "Hatchback", photos: 9, km: "38,200 km", transmission: "Mecánica", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "05:10:00", progress: 0.35 },
  { name: "Toyota Agya", year: 2023, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-agya.png",
    kind: "Hatchback", photos: 15, km: "32,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", owner: "Único dueño" },
  { name: "Jac Refine", year: 2022, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-refine.png",
    kind: "Van", photos: 8, km: "61,500 km", transmission: "Mecánica", fuel: "Diésel", seats: 8, city: "Arequipa", owner: "Empresa" },
  { name: "Caterpillar 320", year: 2019, price: "US$ 45,000", variant: "live", live: true, imageSrc: "/demo/inventory-excavator-v1.png",
    kind: "Excavadora", photos: 10, km: "6,200 h", transmission: "Hidráulica", fuel: "Diésel", city: "Lima", remaining: "03:02:10", progress: 0.5 },
  { name: "Lote de vigas", year: 2024, variant: "negotiable", imageSrc: "/demo/inventory-steel-v1.png",
    kind: "Materiales", photos: 6, km: "12 t", transmission: "Acero A36", fuel: "Vigas H", city: "Callao", owner: "Empresa" },
  { name: "Kia Sportage", year: 2020, price: "US$ 8,450", variant: "live", imageSrc: "/demo/vehicles/autoplan-suv.png",
    kind: "SUV", photos: 14, km: "52,300 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "07:45:00", progress: 0.2 },
  // Más lotes de ejemplo: al ensanchar el contenido se muestran más cards (tamaño fijo), no cards más grandes.
  { name: "Suzuki Swift", year: 2021, price: "US$ 3,350", variant: "live", imageSrc: "/demo/inventory-suv-v1.png",
    kind: "Hatchback", photos: 10, km: "29,800 km", transmission: "Manual", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "02:15:00", progress: 0.6 },
  { name: "Komatsu PC200", year: 2018, variant: "negotiable", imageSrc: "/demo/inventory-excavator-v1.png",
    kind: "Excavadora", photos: 9, km: "8,100 h", transmission: "Hidráulica", fuel: "Diésel", city: "Arequipa", owner: "Empresa" },
  { name: "Montacargas Toyota", year: 2020, price: "US$ 12,900", variant: "live", imageSrc: "/demo/inventory-forklift-v1.png",
    kind: "Montacargas", photos: 7, km: "3,400 h", transmission: "Automática", fuel: "GLP", city: "Callao", remaining: "04:30:00", progress: 0.45 },
  { name: "Planchas de acero", year: 2023, variant: "negotiable", imageSrc: "/demo/inventory-steel-v1.png",
    kind: "Materiales", photos: 5, km: "8 t", transmission: "Acero A36", fuel: "Planchas", city: "Lima", owner: "Empresa" },
  { name: "Nissan Kicks", year: 2021, price: "US$ 9,100", variant: "live", imageSrc: "/demo/inventory-suv-v1.png",
    kind: "SUV", photos: 13, km: "41,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Trujillo", remaining: "06:00:00", progress: 0.3 },
  { name: "Lote de equipos", year: 2022, variant: "negotiable", imageSrc: "/demo/inventory-mosaic-v1.png",
    kind: "Equipos", photos: 11, km: "12 piezas", transmission: "Varios", fuel: "Mixto", city: "Lima", owner: "Único dueño" },
];

// Dos tiendas con sus propios lotes: cada bloque «Lotes» lleva el nombre y el logo de la tienda (destacado + 6 cards).
const STORE_A: Store = { name: "Autoplan", logo: "/demo/empresas/autoplan.png", city: "Lima" };
const STORE_A_LOTS: LotData[] = LOTS.slice(0, 7);
const STORE_B: Store = { name: "Mapfre", logo: "/demo/empresas/mapfre.png", city: "Lima" };
const STORE_B_LOTS: LotData[] = [
  { name: "Hyundai Tucson", year: 2021, price: "US$ 11,400", variant: "live", live: true, imageSrc: "/demo/vehicles/mapfre-tucson.png",
    kind: "SUV", photos: 16, km: "34,500 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "02:48:10", progress: 0.55 },
  { name: "Kia Rio", year: 2020, price: "US$ 6,300", variant: "live", imageSrc: "/demo/vehicles/mapfre-rio.png",
    kind: "Sedán", photos: 11, km: "41,200 km", transmission: "Mecánica", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "04:20:00", progress: 0.3 },
  { name: "Toyota Hilux", year: 2019, variant: "negotiable", imageSrc: "/demo/vehicles/mapfre-pickup.png",
    kind: "Camioneta", photos: 13, km: "68,000 km", transmission: "Mecánica", fuel: "Diésel", seats: 5, city: "Piura", owner: "Empresa" },
  { name: "Nissan Versa", year: 2022, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-sedan.png",
    kind: "Sedán", photos: 9, km: "22,000 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", owner: "Único dueño" },
  { name: "Chevrolet Onix", year: 2021, price: "US$ 5,900", variant: "live", imageSrc: "/demo/vehicles/autoplan-grand-i10.png",
    kind: "Hatchback", photos: 10, km: "37,800 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Callao", remaining: "06:05:00", progress: 0.2 },
  { name: "Mitsubishi L200", year: 2018, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-pickup.png",
    kind: "Camioneta", photos: 12, km: "88,000 km", transmission: "Mecánica", fuel: "Diésel", seats: 5, city: "Arequipa", owner: "Empresa" },
  { name: "Suzuki Vitara", year: 2020, price: "US$ 8,700", variant: "live", imageSrc: "/demo/vehicles/autoplan-suv.png",
    kind: "SUV", photos: 14, km: "45,100 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "07:30:00", progress: 0.15 },  { name: "Honda HR-V", year: 2019, variant: "negotiable", imageSrc: "/demo/vehicles/autoplan-agya.png",
    kind: "SUV", photos: 12, km: "52,600 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", owner: "Único dueño" },
  { name: "Volkswagen Tiguan", year: 2020, price: "US$ 13,200", variant: "live", imageSrc: "/demo/vehicles/autoplan-yaris.png",
    kind: "SUV", photos: 15, km: "39,400 km", transmission: "Automática", fuel: "Gasolina", seats: 5, city: "Lima", remaining: "05:10:00", progress: 0.25 },
];

// Misma caja que AuctioneerSection de Concorde (766 de ancho, radio 16, sombra del homepage), con tres
// vistas para comparar (selector flotante a la derecha del bloque). Todas usan el OfferCard de Concorde;
// solo cambian medidas por clase.
//   · normal   → 4 OfferCard en fila, como la sección del Subastador.
//   · gallery  → tipo «Oferta del día» de Mercado Libre: destacado alto a la izquierda + 2 filas de 3 «short».
//   · featured → destacado más chico + 3 autos más grandes que las «short» (menos que el destacado).
type LotsView = "normal" | "gallery" | "featured";
const LOTS_VIEWS: { id: LotsView; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "4 cards en fila" },
  { id: "gallery", label: "Card gallery", hint: "Destacada + 2 filas de 3" },
  { id: "featured", label: "Card destacada", hint: "Destacada + 3 autos" },
];
const CAR_LOTS = ["Hyundai Grand i10", "Toyota Agya", "Kia Sportage"];

// Estilo de las cards de lote. «normal» es el OfferCard de Concorde; «ficha» e «inmersiva» son variantes
// nuevas del lab (LotCards.tsx). En «Card gallery» con un estilo nuevo, las chicas usan la Inmersiva chica.
type CardStyle = "normal" | "ficha" | `pro-${ProTheme}` | `leg-${LegendTier}` | `ficha-${FichaLayout}` | "inmersiva" | "resumen" | "relieve" | "cristal";
const CARD_STYLES: { id: CardStyle; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "OfferCard de Concorde" },
  { id: "ficha", label: "Ficha", hint: "Foto + datos, precio y estado" },
  { id: "pro-clasica", label: "Clásica", hint: "Blanca, flechas en la foto" },
  { id: "pro-nocturna", label: "Nocturna", hint: "Azul noche y ola naranja" },
  { id: "pro-curva", label: "Curva", hint: "Foto curva, datos en cajitas" },
  { id: "pro-fundido", label: "Fundido", hint: "Foto que se funde en oscuro" },
  { id: "leg-leyenda", label: "Leyenda", hint: "Borde que gira y placa de precio" },
  { id: "leg-holo", label: "Holo", hint: "Foil holográfico y franja-contador" },
  { id: "leg-elite", label: "Élite", hint: "Carta FIFA con stats y neón" },
  { id: "ficha-cta", label: "Ficha + botón", hint: "La Ficha con «Ver detalle»" },
  { id: "ficha-precio", label: "Precio primero", hint: "Precio bajo el título" },
  { id: "ficha-cuenta", label: "Cuenta regresiva", hint: "Tiempo sobre la foto" },
  { id: "ficha-compacta", label: "Ficha compacta", hint: "3 specs y precio" },
  { id: "ficha-social", label: "Prueba social", hint: "Ofertas y visitas" },
  { id: "inmersiva", label: "Inmersiva", hint: "Foto completa, datos encima" },
  { id: "resumen", label: "Resumen", hint: "Datos en una línea, ofertas, visitas y precio" },
  { id: "relieve", label: "Relieve", hint: "Como la normal, con sombras internas" },
  { id: "cristal", label: "Cristal", hint: "Degradado morado y foto con vidrio" },
];

const GALLERY_HEIGHT = 2 * 170 + 12;

const LOTS_CSS = `
/* Destacado de la Card gallery (352 de alto): foto más baja y detalles más chicos para que entre todo. */
.hib-dense .lc .lc-media { min-height: 84px !important; }
.hib-dense .lc .lc-body, .hib-dense .lp .lc-body { gap: 5px; padding: 8px 10px 12px; }
.hib-dense .lc .lc-name { font-size: 15px; }
.hib-dense .lc .lc-sub { margin-top: 0; font-size: 12px; }
.hib-dense .lc .lc-chip { padding: 3px 5px; font-size: 12px; }
.hib-dense .lc .lc-stats, .hib-dense .lc .lc-time, .hib-dense .lc .lc-inline, .hib-dense .lc .lc-social { font-size: 12px; }
.hib-dense .lc .lc-bar { height: 5px; }
.hib-dense .lc .lc-label { font-size: 12px; }
.hib-dense .lc .lc-price { font-size: 18px; }
.hib-dense .lc .lc-pricerow > svg { width: 24px; height: 26px; }
.hib-dense .lc .lc-offer { font-size: 12.5px; }
.hib-dense .lc .lc-cta { height: 30px; margin-top: 4px; }
.hib-dense .lc .lp-tiles span { padding: 4px 3px; }
.hib-dense .lc .lc-sum__head { padding: 6px 10px; }
.hib-dense .lc .lc-sum__stats span { padding: 4px; }
.hib-dense .lc .lc-sum__price { padding: 4px 8px 8px; }
.hib-dense .lc .lc-rel { padding: 10px 12px 12px; }
.hib-dense .lc .lc-rel__price { padding-top: 8px; }
.hib-dense .lc .lc-glass { padding: 10px 6px 2px; }
.hib-dense .lc .lc-glass__rule { margin-top: 6px; }
.hib-dense .lc .lc-glass__price { padding: 6px 10px; }
.pcard.hib-feat { width: 100%; height: 100%; }
/* Fila de tiendas: bloque A y B a la izquierda (766) y el feed a la derecha cubriendo los dos. */
.hib-storerow { display: grid; grid-template-columns: 766px minmax(320px, 1fr); grid-template-rows: auto auto; column-gap: 16px; row-gap: 24px; align-items: stretch; }
.hib-sa { grid-column: 1; grid-row: 1; min-width: 0; }
.hib-sb { grid-column: 1; grid-row: 2; min-width: 0; }
.hib-sfeed { position: absolute; top: 0; right: 0; bottom: 0; left: 782px; min-width: 0; min-height: 0; display: flex; overflow: hidden; border-radius: 16px; background: #fff; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; isolation: isolate; }
.hib-sfeed > aside { min-height: 0; border-radius: inherit; }
/* Propuesta B: el feed sube junto al hero. Los dos lotes usan todo el ancho disponible debajo. */
.hib-storerow--b { grid-template-columns: minmax(0, 1fr); }
.hib-storerow--b .hib-sa, .hib-storerow--b .hib-sb { grid-column: 1; }
.hib-storerow--b .hib-sb { grid-row: 2; }
/* Contenido 1024 de A: Autoplan y Mapfre conservan bloques compactos de 620 (destacada + 4 fichas).
   El feed ocupa la segunda columna y abarca ambas tiendas, igual que en A amplio. */
@container hib-row (max-width: 1101px) {
  .hib-storerow { grid-template-columns: 620px minmax(320px, 1fr); row-gap: 16px; }
  .hib-sfeed { position: relative; inset: auto; grid-column: 2; grid-row: 1 / span 2; }
  .hib-sfeed > aside { position: absolute; inset: 0; }
  .hib-sa .hib-smallgrid, .hib-sb .hib-smallgrid { grid-template-columns: repeat(2, 134px) !important; justify-content: end !important; }
  .hib-storerow:not(.hib-storerow--b) .hib-sb .hib-smallgrid > :nth-child(n + 5) { display: none; }
  .hib-storerow.hib-storerow--b { grid-template-columns: minmax(0, 1fr); row-gap: 16px; }
  .hib-storerow--b .hib-sb { grid-column: 1; }
  /* B a 1024: ambas tiendas conservan una grilla horizontal de cuatro columnas.
     Así Mapfre no se convierte en una columna alta y Autoplan no repite oportunidades. */
  .hib-storerow--b .hib-sa .hib-smallgrid, .hib-storerow--b .hib-sb .hib-smallgrid { grid-template-columns: repeat(4, 134px) !important; justify-content: space-between !important; }
}
/* Aún más angosto: todo en una columna. */
@container hib-row (max-width: 955px) {
  .hib-storerow { grid-template-columns: minmax(0, 1fr); }
  .hib-sa, .hib-sb, .hib-sfeed { grid-column: 1; max-width: 766px; }
  .hib-sb { grid-row: 2; grid-column: 1; }
  .hib-sb .hib-smallgrid { grid-template-columns: repeat(2, 134px) !important; justify-content: end !important; }
  .hib-sfeed { grid-row: 3; position: static; overflow: visible; }
  .hib-sfeed > aside { position: relative; }
}
/* En C, cuando el sidebar vuelve a 76 px, la fila recupera ancho suficiente para cuatro cards.
   Conservamos esa expansión para Autoplan y Mapfre en vez de dejar la grilla de sidebar expandido. */
@container hib-row (min-width: 880px) and (max-width: 955px) {
  /* El breakpoint general limita estas secciones a 766px. En C ese límite deja
     vacío el espacio recuperado al colapsar el rail; se elimina sólo allí. */
  [data-soft-launch] .hib-storerow--b .hib-sa, [data-soft-launch] .hib-storerow--b .hib-sb { max-width: none; }
  [data-soft-launch] .hib-storerow--b .hib-sa .hib-smallgrid, [data-soft-launch] .hib-storerow--b .hib-sb .hib-smallgrid { grid-template-columns: repeat(4, 134px) !important; justify-content: space-between !important; }
}
.pcard.hib-feat .pcard__img { flex: 1; min-height: 0; height: auto; }
.pcard.hib-featured-curve .pcard__img { overflow: hidden; border-bottom-right-radius: 100% 44px; }
.pcard.hib-featured-curve .pcard__img img { object-position: center; }
.pcard.hib-feat .pcard__name { font-size: 20px; line-height: 24px; }
.pcard.hib-feat .pcard__year { font-size: 12px; }
.pcard.hib-feat--sm .pcard__name { font-size: 18px; line-height: 22px; }
.pcard.hib-mid { width: 160px; height: 262px; }
.pcard.hib-mid .pcard__img { height: 142px; }
/* Precio y corazón más chicos que los del OfferCard (gema 30 × 32 · texto 13 · like 30). */
.pcard.hib-mid .pcard-pprice { width: 24px; height: 26px; }
.pcard.hib-mid .pcard-pprice svg { width: 22px; height: 24px; }
.pcard.hib-mid .pcard__price-left { gap: 4px; }
.pcard.hib-mid .pcard__price-text { font-size: 12px; }
.pcard.hib-mid .pcard-like { width: 24px; height: 24px; }
.pcard.hib-mid .pcard-like svg { width: 13px; height: 13px; }
/* Etiqueta de precio de las short, más chica que la de Concorde (24 de alto · texto 13). */
.pcard--short .pcard__price-badge { height: 20px; top: 7px; left: 6px; padding: 0 8px 0 2px; gap: 2px; border-radius: 10px; }
.pcard--short .pcard__price-badge::before { border-radius: 10px; }
.pcard--short .pcard__price-badge-gem { transform: scale(0.8); }
.pcard--short .pcard__price-badge-text { font-size: 12px; }
`;

/* Propuesta B: el feed comparte fila con el banner. La fila es más alta para que el timeline se lea
   como contenido (no como una previsualización) en 1024 y en ancho amplio. */
const HOME_LAYOUT_CSS = `
.hib-herorow--b, [data-proposal="a"] > [data-slot="principal-banner"] { min-width: 0; }
[data-proposal="a"] > [data-slot="principal-banner"] { flex: 1 1 auto; }
.hib-herorow--b > [data-slot="principal-banner"] .hp, [data-proposal="a"] > [data-slot="principal-banner"] .hp { min-width: 0; }
.hib-herorow--b { display: grid; grid-template-columns: minmax(0, 1fr) minmax(300px, 32%); gap: 16px; height: 368px; }
.hib-herorow--b > [data-slot] { min-width: 0; height: 100%; }
.hib-herorow--b .hp { height: 100%; min-height: 0; max-height: none; aspect-ratio: auto; }
.hib-hero-feed { display: flex; min-height: 0; overflow: hidden; border-radius: 16px; background: #fff; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; isolation: isolate; }
.hib-hero-feed > aside { min-height: 0; border-radius: inherit; }
@container hib-row (max-width: 955px) {
  .hib-herorow--b { grid-template-columns: minmax(0, 1fr); height: auto; }
  .hib-herorow--b > [data-slot] { height: 368px; }
}
`;

type Lot = LotData;
function badgeFor(lot: Lot, isFeatured: boolean, showLiveBadge: boolean): JSX.Element | undefined {
  const live = showLiveBadge && lot.live ? <BadgeStatus variant="live" /> : null;
  if (!isFeatured) return live ?? undefined;
  // Pill «Destacado»: el BadgeStatus morado de Concorde (variante «proxima») sin el reloj, a la izquierda de EN VIVO.
  return <span style={{ display: "inline-flex", gap: 6 }}><BadgeStatus variant="proxima" label="Destacado" icon={false} />{live}</span>;
}
function lotCard(lot: Lot, opts: { className?: string; size?: "short"; featured?: boolean; showLiveBadge?: boolean } = {}): JSX.Element {
  const className = [opts.className, opts.featured ? "hib-featured-curve" : ""].filter(Boolean).join(" ");
  return (
    <OfferCard key={lot.name} className={className} size={opts.size} variant={lot.variant} name={lot.name} year={lot.year}
      price={lot.price} imageSrc={lot.imageSrc} badge={badgeFor(lot, !!opts.featured, !!opts.showLiveBadge)} elevated />
  );
}

function LotsSection({ view, card, lots, store }: { view: LotsView; card: CardStyle; lots: Lot[]; store: Store }): JSX.Element {
  const [featured, ...rest] = lots;
  // Cada tienda muestra sólo sus oportunidades reales; no duplicamos cards para completar la grilla.
  const galleryRest = rest;
  const count = view === "featured" ? 4 : lots.length;
  // Solo el lote destacado de Autoplan conserva la señal de estado «En vivo».
  const showFeaturedLiveBadge = store.name === "Autoplan";
  // Card «grande» según el estilo elegido (en Normal, el OfferCard de Concorde).
  const big = (lot: Lot, o: { featured?: boolean; showLiveBadge?: boolean; width?: number | string; height?: number | string; fill?: boolean } = {}) =>
    card.startsWith("leg-") ? <FichaLegend key={lot.name} lot={lot} tier={card.slice(4) as LegendTier} featured={o.featured} showLiveBadge={o.showLiveBadge} width={o.width} height={o.height} mediaFill={o.fill} />
      : card.startsWith("pro-") ? <FichaPro key={lot.name} lot={lot} theme={card.slice(4) as ProTheme} featured={o.featured} showLiveBadge={o.showLiveBadge} width={o.width} height={o.height} mediaFill={o.fill} />
      : card.startsWith("ficha-") ? <FichaPlus key={lot.name} lot={lot} layout={card.slice(6) as FichaLayout} featured={o.featured} showLiveBadge={o.showLiveBadge} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "ficha" ? <FichaCard key={lot.name} lot={lot} featured={o.featured} showLiveBadge={o.showLiveBadge} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "resumen" ? <SummaryCard key={lot.name} lot={lot} featured={o.featured} showLiveBadge={o.showLiveBadge} width={o.width} height={o.height} mediaFill={o.fill} />
      : card === "relieve" ? <ReliefCard key={lot.name} lot={lot} featured={o.featured} showLiveBadge={o.showLiveBadge} width={o.width} height={o.height} mediaFill={o.fill} compact={view !== "gallery"} />
      : card === "cristal" ? <GlassCard key={lot.name} lot={lot} featured={o.featured} showLiveBadge={o.showLiveBadge} width={o.width} height={o.height} mediaFill={o.fill} />
      : <ImmersiveCard key={lot.name} lot={lot} featured={o.featured} showLiveBadge={o.showLiveBadge} width={o.width} height={o.height ?? 262} />;
  let body: JSX.Element;
  if (card === "normal") {
    if (view === "normal") {
      body = <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 170px)", justifyContent: "space-between", gridTemplateRows: "232px", gridAutoRows: 0, overflow: "hidden", gap: 12 }}>{lots.map((lot) => lotCard(lot))}</div>;
    } else if (view === "gallery") {
      body = (
        <div style={{ display: "grid", gridTemplateColumns: "292px minmax(0, 1fr)", gap: 16 }}>
          <div style={{ display: "flex", minWidth: 0 }}>{lotCard(featured, { className: "hib-feat", featured: true, showLiveBadge: showFeaturedLiveBadge })}</div>
          <div className="hib-smallgrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 134px)", justifyContent: "space-between", gridTemplateRows: "repeat(2, 170px)", gridAutoRows: 0, overflow: "hidden", gap: 12 }}>{galleryRest.map((lot, index) => <CompactCurveCard key={`${lot.name}-${index}`} lot={lot} />)}</div>
        </div>
      );
    } else {
      const cars = rest.filter((lot) => CAR_LOTS.includes(lot.name));
      body = (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 16, height: 300 }}>
          <div style={{ display: "flex", minWidth: 0 }}>{lotCard(featured, { className: "hib-feat hib-feat--sm", featured: true, showLiveBadge: showFeaturedLiveBadge })}</div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>{cars.map((lot) => lotCard(lot, { className: "hib-mid" }))}</div>
        </div>
      );
    }
  } else if (view === "normal") {
    body = <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, alignItems: "stretch" }}>{lots.slice(0, 4).map((lot) => big(lot))}</div>;
  } else if (view === "gallery") {
    // Mismas proporciones que la galería Normal: 2 filas de 170 (las «short» de Concorde) = 352 de alto.
    // El destacado (estilo elegido) entra en esos 352: en .hib-dense la foto cede alto y los detalles
    // van más chicos. Las seis chicas, Inmersiva «sm» de 134 × 170.
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "292px minmax(0, 1fr)", gap: 16 }}>
        <div className="hib-dense" style={{ display: "flex", minWidth: 0, height: GALLERY_HEIGHT }}>{big(featured, { featured: true, showLiveBadge: showFeaturedLiveBadge, height: "100%", fill: true })}</div>
        <div className="hib-smallgrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 134px)", justifyContent: "space-between", gridTemplateRows: "repeat(2, 170px)", gridAutoRows: 0, overflow: "hidden", gap: 12 }}>
          {galleryRest.map((lot, index) => <CompactCurveCard key={`${lot.name}-${index}`} lot={lot} />)}
        </div>
      </div>
    );
  } else {
    const cars = rest.filter((lot) => CAR_LOTS.includes(lot.name));
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 16, alignItems: "stretch" }}>
        <div style={{ display: "flex", minWidth: 0 }}>{big(featured, { featured: true, showLiveBadge: showFeaturedLiveBadge, height: "100%", fill: true })}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>{cars.map((lot) => big(lot, { width: 164 }))}</div>
      </div>
    );
  }
  return (
    <section
      aria-label={`Lotes de ${store.name}`}
      style={{
        boxSizing: "border-box", width: "100%", background: "#ffffff", borderRadius: 16,
        boxShadow: SHADOW, padding: "0 0 16px", display: "flex", flexDirection: "column", gap: 16, fontFamily: FONT,
      }}
    >
      <SectionHeader logo={store.logo} title={store.name} subtitle={`${count} oportunidades`} action={<ProfileButton>Ver todo el lote</ProfileButton>} />
      <div style={{ padding: "0 16px" }}>{body}</div>
      <style>{LOTS_CSS}</style>
      <LotCardStyles />
    </section>
  );
}

const FEED_VIEWS: { id: FeedView; label: string; hint: string }[] = [
  { id: "normal", label: "Normal", hint: "Insignia, título y foto" },
  { id: "timeline", label: "Timeline", hint: "Estilo X / Twitter" },
  { id: "pulso", label: "Pulso", hint: "En directo, con historias" },
];

// Editor de vistas de QA. Vive fuera del lienzo para no ensuciar las propuestas.
const SWITCH_CSS = `
.hib-view-editor { position: fixed; right: 270px; bottom: 14px; z-index: 52; width: min(340px, calc(100vw - 32px)); max-height: min(72vh, 620px); overflow: auto;
  box-sizing: border-box; padding: 10px; border: 1px solid #d9d3eb; border-radius: 14px; background: rgba(255,255,255,.98); box-shadow: rgba(32,0,104,.22) 0 10px 30px; font-family: ${FONT}; }
.hib-view-editor__head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 2px 9px; color: #4b227e; }
.hib-view-editor__head strong { font-size: 11px; letter-spacing: .07em; text-transform: uppercase; }
.hib-view-editor__head button { border: 0; background: transparent; color: #6240c4; cursor: pointer; font: inherit; font-size: 10px; font-weight: 800; text-decoration: underline; }
.hib-view-editor__list { display: grid; gap: 8px; }
.hib-view-editor-toggle { position: fixed; right: 270px; bottom: 14px; z-index: 52; min-height: 34px; padding: 0 12px; border: 1px solid #8a63d9; border-radius: 9px; background: #fff; color: #3b1782; box-shadow: rgba(32,0,104,.18) 0 6px 18px; cursor: pointer; font: 800 10px/1 ${FONT}; letter-spacing: .04em; text-transform: uppercase; }
.hib-view-editor-toggle:hover { border-color: #5b2bb8; background: #f5f0ff; }
.hib-switch { width: 100%; box-sizing: border-box; padding: 9px;
  border-radius: 12px; background: #fff; box-shadow: rgba(32,0,104,0.16) 0 6px 20px; font-family: ${FONT}; }
.hib-switch > span { display: block; margin: 0 2px 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #8a879c; }
.hib-switch__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 4px; }
.hib-switch button { display: block; width: 100%; padding: 7px 9px; border: 1px solid #e3e1ec; border-radius: 9px; font: inherit; text-align: left; background: #fff; cursor: pointer; }
.hib-switch button b { display: block; font-size: 12px; color: #191C1C; }
.hib-switch button small { display: block; margin-top: 1px; font-size: 12px; color: #6b6880; }
.hib-switch button:hover { border-color: #b9a8ef; }
.hib-switch button[aria-pressed="true"] { border-color: #8460e5; background: #f3effd; }
.hib-switch button[aria-pressed="true"] b { color: #3b1782; }
@media (max-width: 940px) { .hib-view-editor, .hib-view-editor-toggle { right: 14px; bottom: 86px; } }
@media (max-width: 640px) { .hib-view-editor, .hib-view-editor-toggle { display: none; } }
`;
function ViewSwitch<T extends string>({ title, suffix = "vista", options, value, onChange }: {
  title: string; suffix?: string; options: { id: T; label: string; hint: string }[]; value: T; onChange: (v: T) => void;
}): JSX.Element {
  return (
    <div className="hib-switch" role="group" aria-label={`${title} · ${suffix}`}>
      <span>{title}{suffix ? ` · ${suffix}` : ""}</span>
      <div className="hib-switch__grid">
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}><b>{o.label}</b><small>{o.hint}</small></button>
        ))}
      </div>
    </div>
  );
}

export default function HomeIndexBlock({ proposal = "a", softLaunch = false, deferCategories = false }: { proposal?: "a" | "b"; softLaunch?: boolean; deferCategories?: boolean }): JSX.Element {
  const [lotsView, setLotsView] = useState<LotsView>("gallery");
  const [cardStyle, setCardStyle] = useState<CardStyle>("leg-holo");
  const [companiesView, setCompaniesView] = useState<CompaniesView>("slider");
  const [feedView, setFeedView] = useState<FeedView>("timeline");
  const [viewEditorOpen, setViewEditorOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const [categoriesView, setCategoriesView] = useState<CategoriesView>("normal");
  // Orden habitual: hero · Explora por categoría · tiendas + actividad · banner de campaña · Empresas y vendedores ·
  // C y A amplia posponen categorías hasta antes del banner de maquinaria.
  // Tipo de oferta y Categorías.
  // Columna con el mismo margen (16) y separación (16) que el bloque de Concorde; el alto lo da el contenido.
  return (
    <div data-block="homepage" data-proposal={proposal} data-soft-launch={softLaunch || undefined} style={{ width: "100%", padding: "16px", boxSizing: "border-box", background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "stretch", gap: GAP }}>
      <style>{HOME_LAYOUT_CSS}</style>
      <div className={proposal === "b" ? "hib-herorow--b" : undefined} style={proposal === "a" ? { display: "flex", minWidth: 0, width: "100%" } : undefined}>
        <div data-slot="principal-banner" style={{ display: "flex", minWidth: 0, flex: proposal === "a" ? "1 1 100%" : undefined, width: proposal === "a" ? "100%" : undefined }}><HeroPromo /></div>
        {proposal === "b" ? <div className="hib-hero-feed" data-slot="secondary-banner"><VmcAhora view={feedView} /></div> : null}
      </div>
      {!deferCategories ? <CategoryRail view={categoriesView} /> : null}
      {/* En A, el feed vive a la derecha de los lotes. En B comparte fila con el hero y los lotes ganan ese ancho. */}
      <div className="hib-storewrap" style={{ position: "relative", containerType: "inline-size", containerName: "hib-row" }}>
        <div className={`hib-storerow${proposal === "b" ? " hib-storerow--b" : ""}`}>
          <div className="hib-sa"><LotsSection view={lotsView} card={cardStyle} lots={STORE_A_LOTS} store={STORE_A} /></div>
          <div className="hib-sb"><LotsSection view={lotsView} card={cardStyle} lots={STORE_B_LOTS} store={STORE_B} /></div>
          {proposal === "a" ? <div className="hib-sfeed" data-slot="secondary-banner"><VmcAhora view={feedView} /></div> : null}
        </div>
      </div>
      {deferCategories ? <CategoryRail view={categoriesView} /> : null}
      <div data-slot="banner"><CampaignBanner /></div>
      <div data-slot="sell-your-car" style={{ containerType: "inline-size", containerName: "hib-row" }}><SellerSection /></div>
      <CompaniesSection view={companiesView} />
      {mounted ? createPortal(
        <>
          <style>{SWITCH_CSS}</style>
          {viewEditorOpen ? <aside className="hib-view-editor" aria-label="Editor de vistas">
            <div className="hib-view-editor__head"><strong>Editar vistas</strong><button type="button" onClick={() => setViewEditorOpen(false)}>Cerrar</button></div>
            <div className="hib-view-editor__list">
              <ViewSwitch title="VMC ahora" options={FEED_VIEWS} value={feedView} onChange={setFeedView} />
              <ViewSwitch title="Lotes" options={LOTS_VIEWS} value={lotsView} onChange={setLotsView} />
              <ViewSwitch title="Detail card" suffix="" options={CARD_STYLES} value={cardStyle} onChange={setCardStyle} />
              <ViewSwitch title="Categorías" options={CATEGORIES_VIEWS} value={categoriesView} onChange={setCategoriesView} />
              <ViewSwitch title="Empresas" options={COMPANIES_VIEWS} value={companiesView} onChange={setCompaniesView} />
            </div>
          </aside> : <button className="hib-view-editor-toggle" type="button" onClick={() => setViewEditorOpen(true)} aria-expanded="false">Editar vistas</button>}
        </>,
        document.body,
      ) : null}
    </div>
  );
}
