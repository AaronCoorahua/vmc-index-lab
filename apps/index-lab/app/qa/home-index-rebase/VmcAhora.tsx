"use client";

/**
 * VmcAhora — feed «VMC ahora» (Secondary Banner, 236 × 388) con eventos que van pasando: cada 4,5 s entra
 * uno nuevo arriba y los tiempos se recorren («Ahora», «hace 1 min»…). Se pausa con el puntero encima.
 * Contenido de ejemplo. Tres vistas:
 *  · normal    el diseño aprobado: insignia + título + detalle + miniatura.
 *  · timeline  estilo X/Twitter: avatar de la empresa, verificado, texto, foto en la primera, acciones
 *              (me gusta · comentarios · compartir) y aviso «Nuevo» cuando entra una publicación.
 *  · pulso     «en directo» (claro): contador de personas pujando, historias de empresas con aro y una
 *              línea de tiempo con puntos que brillan.
 */
import { useEffect, useState } from "react";
import type { CSSProperties, JSX } from "react";

export type FeedView = "normal" | "ebay" | "timeline" | "pulso";
type Kind = "live" | "bid" | "sold" | "new" | "deal" | "next";
type FeedEvent = {
  id: string; kind: Kind; who: string; title: string; detail: string; imageSrc: string; likes: number; replies: number;
  /** Para la vista Timeline (fila tipo eBay): el lote, su precio (si hay) y la ciudad. */
  lot: string; price?: string; city: string;
};

const LOGO: Record<string, string | undefined> = {
  "SubasCars": "/assets/brand/logo-voyager.svg", "Pacífico": "/demo/empresas/pacifico.png", "Autoplan": "/demo/empresas/autoplan.png",
  "Trupal S.A.": "/demo/empresas/trupal.svg", "Mapfre": "/demo/empresas/mapfre.png",
};

const EVENTS: FeedEvent[] = [
  { id: "e1", kind: "live", who: "Empresa Industrial", title: "Subasta de vehículos en curso", detail: "32 participantes · Lote 12", imageSrc: "/demo/vehicles/autoplan-yaris.png", likes: 48, replies: 6,
    lot: "Toyota Yaris 2022", price: "US$ 2,799", city: "Lima" },
  { id: "e2", kind: "bid", who: "SubasCars", title: "Nueva puja en Kia Rio 2020", detail: "US$ 6,300 · +US$ 100", imageSrc: "/demo/vehicles/mapfre-rio.png", likes: 31, replies: 4,
    lot: "Kia Rio 2020", price: "US$ 6,300", city: "Lima" },
  { id: "e3", kind: "sold", who: "SubasCars", title: "Hyundai Grand i10 adjudicado", detail: "Cerró en US$ 2,450", imageSrc: "/demo/vehicles/autoplan-grand-i10.png", likes: 57, replies: 9,
    lot: "Hyundai Grand i10 2021", price: "US$ 2,450", city: "Lima" },
  { id: "e4", kind: "new", who: "Pacífico", title: "Excavadora Caterpillar 320 publicada", detail: "Lote 88 · Lima", imageSrc: "/demo/inventory-excavator-v1.png", likes: 22, replies: 3,
    lot: "Caterpillar 320 2019", price: "US$ 45,000", city: "Lima" },
  { id: "e5", kind: "deal", who: "Autoplan", title: "Propuesta aceptada en Toyota Agya", detail: "Negociable · Lima", imageSrc: "/demo/vehicles/autoplan-agya.png", likes: 19, replies: 2,
    lot: "Toyota Agya 2023", city: "Lima" },
  { id: "e6", kind: "next", who: "Trupal S.A.", title: "Equipos industriales empieza 10:00", detail: "14 lotes · Callao", imageSrc: "/demo/inventory-forklift-v1.png", likes: 15, replies: 1,
    lot: "Montacargas Toyota 2018", city: "Callao" },
  { id: "e7", kind: "bid", who: "Pacífico", title: "12 pujas en el último minuto", detail: "Hyundai Tucson · US$ 11,400", imageSrc: "/demo/vehicles/mapfre-tucson.png", likes: 64, replies: 11,
    lot: "Hyundai Tucson 2021", price: "US$ 11,400", city: "Lima" },
  { id: "e8", kind: "new", who: "Mapfre", title: "Toyota Hilux 2019 publicada", detail: "Negociable · Arequipa", imageSrc: "/demo/vehicles/mapfre-pickup.png", likes: 12, replies: 0,
    lot: "Toyota Hilux 2019", city: "Arequipa" },
];
const AGO = ["Ahora", "hace 1 min", "hace 3 min", "hace 6 min", "hace 9 min"];
const KIND: Record<Kind, { label: string; badge: "live" | "proxima"; color: string; verb: string }> = {
  live: { label: "En vivo", badge: "live", color: "#F2701D", verb: "está en vivo" },
  bid: { label: "Puja", badge: "live", color: "#F2701D", verb: "recibió una puja" },
  sold: { label: "Vendido", badge: "proxima", color: "#7B5CE6", verb: "cerró una venta" },
  new: { label: "Nuevo lote", badge: "proxima", color: "#8460E5", verb: "publicó un lote" },
  deal: { label: "Aceptada", badge: "proxima", color: "#00A8AB", verb: "aceptó una propuesta" },
  next: { label: "Próxima", badge: "proxima", color: "#9A7BF0", verb: "abre pronto" },
};
const INTERVAL_MS = 4500;

/** Ventana de `size` eventos, el más nuevo primero; avanza cada INTERVAL_MS salvo en pausa. */
function useLiveFeed(size: number, paused: boolean): { items: FeedEvent[]; tick: number } {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setTick((n) => n + 1), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused]);
  const items = Array.from({ length: size }, (_, i) => EVENTS[(((tick - i) % EVENTS.length) + EVENTS.length) % EVENTS.length]);
  return { items, tick };
}

function Avatar({ who, size = 32, ring }: { who: string; size?: number; ring?: string }): JSX.Element {
  const logo = LOGO[who];
  const vmc = who === "SubasCars";
  const initials = who.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="va-av" style={{ width: size, height: size, ...(ring ? { background: ring, padding: 2 } : {}) } as CSSProperties}>
      <span className="va-av__in" style={{ background: vmc ? "#3B1782" : logo ? "#fff" : "#EEE8FF" }}>
        {logo ? <img src={logo} alt="" /> : <b>{initials}</b>}
      </span>
    </span>
  );
}

const Verified = () => (
  <svg className="va-verified" width="12" height="12" viewBox="0 0 24 24" aria-label="Verificado"><path d="M12 1.8l2.6 1.9 3.2-.2 1 3 2.6 1.9-1 3.1 1 3-2.6 1.9-1 3.1-3.2-.2L12 22.2l-2.6-1.9-3.2.2-1-3.1L2.6 15.5l1-3-1-3.1 2.6-1.9 1-3 3.2.2z" fill="url(#va-vg)" /><defs><linearGradient id="va-vg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8460E5" /><stop offset="1" stopColor="#3B1782" /></linearGradient></defs><path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Ico = {
  heart: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6.1-8 11-8 11z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
  reply: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.6L3.5 20.5l1.4-4.9A8.5 8.5 0 1 1 21 11.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
  repost: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M4 11V9a3 3 0 0 1 3-3h11M15 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H6M9 21l-3-3 3-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  share: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>,
  arrowUp: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const CSS = `
@keyframes va-in { from { opacity: 0; transform: translateY(-10px); } }
@keyframes va-flash { from { background: #F3EFFD; } to { background: transparent; } }
@keyframes va-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
@keyframes va-pill { 0% { opacity: 0; transform: translate(-50%, -6px); } 15%, 75% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -6px); } }
@keyframes va-ring { to { transform: rotate(360deg); } }
.va { position: relative; box-sizing: border-box; width: 100%; height: 100%; flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 16px;
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif); }
.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1); }
.va-av { box-sizing: border-box; display: inline-grid; flex: none; border-radius: 50%; }
.va-av__in { display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(59,23,130,0.1); }
.va-av__in img { max-width: 72%; max-height: 72%; object-fit: contain; }
.va-av__in b { font-size: 12px; font-weight: 800; color: #3B1782; }
.va-verified { flex: none; }
/* Cabecera de la referencia: 68 de alto, padding 0 24, título 20 + bajada 14, «En vivo» a la derecha. */
.va-head { box-sizing: border-box; flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; height: 60px; padding: 0 20px; border-bottom: 1px solid #E8DDFF; }
.va-head h3 { margin: 0; font-size: 16px; line-height: 20px; font-weight: 700; letter-spacing: -0.01em; color: #3B1782; white-space: nowrap; }
.va-head p { margin: 0; font-size: 12px; line-height: 16.8px; color: #6B6878; white-space: nowrap; }
.va-live { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #E2531A; }
.va-live i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; animation: va-pulse 1.4s ease-in-out infinite; }
/* Scroll integrado al sistema visual: discreto, redondeado y consistente entre vistas. */
.va-scroll { scrollbar-width: thin; scrollbar-color: #8460E5 transparent; scrollbar-gutter: stable; }
.va-scroll::-webkit-scrollbar { width: 8px; }
.va-scroll::-webkit-scrollbar-track { margin: 8px 0; background: transparent; }
.va-scroll::-webkit-scrollbar-thumb { border: 2px solid transparent; border-radius: 999px; background: linear-gradient(180deg, #CDBBFF, #7B5CE6) padding-box; box-shadow: 0 2px 7px rgba(59,23,130,0.18); }
.va-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #B295FF, #5A36C9) padding-box; }

/* Normal */
.va--normal { padding: 0 0 8px; background: #fff; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; }
.va-list { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-around; overflow-y: auto; overscroll-behavior: contain; margin: 4px 16px 0; padding: 0; list-style: none; }
.va-row { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 10px; align-items: center; padding: 8px 0; }
.va-row + .va-row { border-top: 1px solid #E1E3E2; }
.va-row > img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; }
.va-row__txt { display: grid; gap: 3px; min-width: 0; }
.va-row__txt strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #3b1782; }
.va-row__detail { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: #5b5b66; }

/* Timeline (X / Twitter) */
.va--timeline { background: #fff; box-shadow: rgba(0,0,0,0.07) 0 0 16px 4px; }
.va-live { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #E2531A; }
.va-live i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; animation: va-pulse 1.4s ease-in-out infinite; }
.va-newpill { position: absolute; top: 60px; left: 50%; z-index: 3; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #8460E5, #3B1782); box-shadow: rgba(59,23,130,0.35) 0 6px 14px;
  opacity: 0; pointer-events: none; animation: va-pill 2.2s ease forwards; }
.va-posts { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; margin: 0; padding: 0; list-style: none; }
.va-post { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 10px; padding: 12px 20px 2px; }
.va-post.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1), va-flash 2.4s ease; }
/* Hilo: el avatar y una línea fina que lo une con la publicación siguiente (como Threads). */
.va-post__rail { display: flex; flex-direction: column; align-items: center; }
.va-post__line { flex: 1; width: 2px; min-height: 12px; margin-top: 8px; border-radius: 2px; background: #E4E0F0; }
.va-post:last-child .va-post__line { display: none; }
.va-post__main { min-width: 0; padding-bottom: 12px; }
.va-post__head { display: flex; align-items: center; gap: 5px; min-width: 0; font-size: 13px; line-height: 18px; }
.va-post__head b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; color: #14112B; }
.va-post__head span { flex: none; color: #8A879C; font-size: 12px; font-weight: 400; }
.va-post__text { margin: 2px 0 0; font-size: 13px; line-height: 18px; color: #24203D; }
.va-post__text em { font-style: normal; font-weight: 700; color: #4A2CE0; }
.va-post__media { position: relative; display: block; margin-top: 10px; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 14px; background: #F3EFFD; }
.va-post__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.va-post__media b { position: absolute; left: 10px; bottom: 10px; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; color: #fff; background: rgba(16,0,48,0.62); }
.va-acts { display: flex; gap: 16px; margin-top: 6px; margin-left: -6px; font-size: 12px; color: #6B6880; }
.va-acts span { display: inline-flex; align-items: center; gap: 6px; padding: 5px 6px; border-radius: 999px; }
.va-acts span:hover { background: #F3EFFD; color: #3B1782; }

/* Timeline · fila tipo listado de eBay (escala de las cards chicas) */
.va-item { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 12px; align-items: center; padding: 12px 18px 12px 20px; }
.va-item + .va-item { border-top: 1px solid #EFEDF5; }
.va-item.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1), va-flash 2.4s ease; }
.va-item__thumb { display: block; width: 72px; height: 72px; overflow: hidden; border-radius: 12px; background: #F3EFFD; }
.va-item__thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
.va-item__main { display: grid; gap: 3px; min-width: 0; }
.va-item__pill { justify-self: start; display: inline-flex; align-items: center; height: 18px; padding: 0 8px; border-radius: 999px; border: 1.5px solid var(--k);
  font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--k); background: color-mix(in srgb, var(--k) 10%, #fff); }
.va-item__title { margin: 1px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; line-height: 1.2; font-weight: 800; color: #14112B; }
.va-item__value { font-size: 14px; line-height: 1.2; font-weight: 800; letter-spacing: -0.01em; color: #4C1EBC; }
.va-item__meta { display: flex; align-items: center; gap: 3px; min-width: 0; font-size: 11px; color: #6B6880; white-space: nowrap; }
.va-item__meta > span:last-child { overflow: hidden; text-overflow: ellipsis; }
.va-item__who { flex: none; max-width: 84px; overflow: hidden; text-overflow: ellipsis; }
.va-item__meta .va-verified { width: 10px; height: 10px; }

/* eBay: listado completo (sin compactar) con me gusta y compartir */
.va-eb { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 14px; align-items: start; padding: 16px 18px 16px 20px; }
.va-eb + .va-eb { border-top: 1px solid #EFEDF5; }
.va-eb.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1), va-flash 2.4s ease; }
.va-eb__thumb { display: block; width: 92px; height: 92px; overflow: hidden; border-radius: 14px; background: #F3EFFD; }
.va-eb__thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
.va-eb__main { display: grid; gap: 3px; min-width: 0; }
.va-eb__pill { justify-self: start; display: inline-flex; align-items: center; height: 22px; padding: 0 10px; border-radius: 999px; border: 1.5px solid var(--k);
  font-size: 11.5px; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; color: var(--k); }
.va-eb__title { margin: 4px 0 0; font-size: 15px; line-height: 1.22; font-weight: 800; color: #14112B; text-transform: uppercase; }
.va-eb__who { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: #8A879C; }
.va-eb__value { margin-top: 4px; font-size: 20px; line-height: 1.15; font-weight: 800; letter-spacing: -0.01em; color: #14112B; }
.va-eb__rest { margin-top: 4px; font-size: 13px; font-weight: 600; color: #8A879C; }
.va-eb__foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; white-space: nowrap; font-size: 13px; font-weight: 600; color: #8A879C; }
.va-eb__acts { display: inline-flex; gap: 6px; }
.va-eb__acts button { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 50%; color: #3B1782; background: #F3EFFD; cursor: pointer; transition: background 0.2s, color 0.2s; }
.va-eb__acts button:hover { background: #E6DEFF; }
.va-eb__acts button[aria-pressed="true"] { color: #fff; background: linear-gradient(135deg, #8460E5, #3B1782); }
.va-eb__acts svg { width: 16px; height: 16px; }

/* Pulso (claro, en directo) */
.va--pulso { color: #14112B;
  background: radial-gradient(110% 55% at 100% 0%, rgba(166,139,255,0.30) 0%, transparent 62%), radial-gradient(90% 40% at 0% 100%, rgba(255,150,57,0.12) 0%, transparent 70%), #fff;
  box-shadow: 0 14px 30px -14px rgba(59,23,130,0.35); }
.va-pu__head { padding: 12px 12px 0; }
.va-pu__title { display: flex; align-items: center; justify-content: space-between; }
.va-pu__title h3 { margin: 0; font-size: 15px; font-weight: 800; letter-spacing: -0.01em; color: #3B1782; }
.va-pu__count { margin: 4px 0 0; font-size: 12px; color: #5B5870; }
.va-pu__count b { color: #E2531A; font-variant-numeric: tabular-nums; }
.va-pu__live { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 999px; font-size: 12px; font-weight: 800; letter-spacing: 0.06em;
  background: #FFF1E6; border: 1px solid rgba(255,150,57,0.45); color: #E2531A; }
.va-pu__live i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; box-shadow: 0 0 8px 2px rgba(255,122,26,0.7); animation: va-pulse 1.4s ease-in-out infinite; }
.va-stories { display: flex; justify-content: space-between; padding: 10px 12px 8px; border-bottom: 1px solid #EFEDF5; }
.va-story { display: grid; justify-items: center; gap: 4px; width: 38px; font-size: 12px; color: #5B5870; white-space: nowrap; }
.va-story__name { max-width: 42px; overflow: hidden; text-overflow: ellipsis; }
.va-story__ring { position: relative; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; }
.va-story__ring::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(#FF9639, #8460E5, #00DAE0, #FF9639); animation: va-ring 4s linear infinite; }
.va-story__ring.is-idle::before { background: #E6E1F5; animation: none; }
.va-story__ring > .va-av { position: relative; padding: 2px; background: #fff; }
.va-tline { position: relative; flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; margin: 0; padding: 8px 12px 0 30px; list-style: none; }
.va-tline::before { content: ""; position: absolute; top: 14px; bottom: 0; left: 17px; width: 2px; border-radius: 2px;
  background: linear-gradient(180deg, rgba(255,150,57,0.9), rgba(132,96,229,0.6) 50%, rgba(132,96,229,0)); }
.va-ev { position: relative; padding: 0 0 11px; }
.va-ev::before { content: ""; position: absolute; top: 4px; left: -17px; width: 8px; height: 8px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 3px #fff, 0 0 10px 2px var(--c); }
.va-ev:first-child::before { animation: va-pulse 1.4s ease-in-out infinite; }
.va-ev__meta { display: flex; justify-content: space-between; gap: 6px; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
.va-ev__ago { font-weight: 600; letter-spacing: 0; text-transform: none; color: #8A879C; }
.va-ev p { margin: 2px 0 0; font-size: 12px; font-weight: 700; line-height: 1.3; color: #14112B; }
.va-ev small { display: block; margin-top: 1px; font-size: 12px; color: #5B5870; }
.va-pu__foot { padding: 6px 12px 10px; text-align: right; }
.va-pu__foot a { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #3B1782; text-decoration: none; }
.va-pu__foot a:hover { color: #E2531A; }
`;

function LikeBtn({ n }: { n: number }): JSX.Element {
  const [on, setOn] = useState(false);
  return <button type="button" aria-pressed={on} aria-label={`Me gusta · ${n + (on ? 1 : 0)}`} onClick={() => setOn((v) => !v)}>{Ico.heart}</button>;
}

// Franja de una línea (móvil, alternativa a la card): el último evento en vivo; al tocarla se abre el feed completo.
const TICKER_CSS = `
@keyframes va-tk-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes va-tk-pulse { 50% { opacity: 0.35; } }
.va-ticker { box-sizing: border-box; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; width: 100%; height: 44px;
  padding: 0 12px; border: 1px solid #ECE8F6; border-radius: 12px; background: #fff; color: #14112B; text-align: left; cursor: pointer;
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif); box-shadow: rgba(0,0,0,0.05) 0 2px 10px; }
.va-ticker:focus-visible { outline: 2px solid #8460E5; outline-offset: 2px; }
.va-ticker__live { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: #E2531A; }
.va-ticker__live i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; animation: va-tk-pulse 1.4s ease-in-out infinite; }
.va-ticker__txt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: #3F3F4A; animation: va-tk-in 0.4s cubic-bezier(0.3,0,0,1); }
.va-ticker__txt b { font-weight: 700; color: #14112B; }
.va-ticker__go { color: #3B1782; }
@media (prefers-reduced-motion: reduce) { .va-ticker__txt, .va-ticker__live i { animation: none; } }
`;
export function VmcAhoraTicker({ onOpen }: { onOpen: () => void }): JSX.Element {
  const { items, tick } = useLiveFeed(1, false);
  const e = items[0];
  return (
    <button type="button" className="va-ticker" onClick={onOpen} aria-label={`VMC ahora, en vivo: ${e.who}, ${e.title}. Abrir el feed`}>
      <span className="va-ticker__live"><i />En vivo</span>
      <span key={tick} className="va-ticker__txt"><b>{e.who}</b> · {e.title}</span>
      <svg className="va-ticker__go" width="16" height="16" viewBox="0 0 20 20" aria-hidden><path d="M7.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <style>{TICKER_CSS}</style>
    </button>
  );
}

function Head(): JSX.Element {
  return (
    <header className="va-head">
      <div style={{ display: "grid", gap: 2, minWidth: 0 }}><h3>VMC ahora</h3><p>Actividad en tiempo real</p></div>
      <span className="va-live"><i />En vivo</span>
    </header>
  );
}

export default function VmcAhora({ view }: { view: FeedView }): JSX.Element {
  const [paused, setPaused] = useState(false);
  const { items, tick } = useLiveFeed(view === "pulso" ? 4 : 5, paused);
  const pause = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) };
  // El evento de arriba entra animado (su key cambia en cada avance; los demás conservan la suya).
  const enter = (i: number) => (i === 0 ? " va-enter" : "");

  if (view === "ebay") {
    return (
      <aside className="va va--timeline" aria-label="VMC ahora" {...pause}>
        <Head />
        {tick > 0 ? <span key={tick} className="va-newpill" aria-hidden>{Ico.arrowUp}Nuevo</span> : null}
        <ol className="va-posts va-scroll" aria-live="polite">
          {items.map((e, i) => (
            <li key={e.id} className={`va-eb${enter(i)}`}>
              <span className="va-eb__thumb"><img src={e.imageSrc} alt="" /></span>
              <div className="va-eb__main">
                <span className="va-eb__pill" style={{ "--k": KIND[e.kind].color } as CSSProperties}>{KIND[e.kind].label}</span>
                <p className="va-eb__title">{e.lot}</p>
                <span className="va-eb__who">{e.who}<Verified /></span>
                <b className="va-eb__value">{e.price ?? "Negociable"}</b>
                <span className="va-eb__rest">{e.detail}</span>
                <span className="va-eb__foot"><span>{e.city} · {AGO[i]}</span>
                  <span className="va-eb__acts"><LikeBtn n={e.likes} /><button type="button" aria-label="Compartir">{Ico.share}</button></span>
                </span>
              </div>
            </li>
          ))}
        </ol>
        <style>{CSS}</style>
      </aside>
    );
  }

  if (view === "timeline") {
    return (
      <aside className="va va--timeline" aria-label="VMC ahora" {...pause}>
        <Head />
        {tick > 0 ? <span key={tick} className="va-newpill" aria-hidden>{Ico.arrowUp}Nuevo</span> : null}
        <ol className="va-posts va-scroll" aria-live="polite">
          {items.map((e, i) => (
            <li key={e.id} className={`va-post${enter(i)}`}>
              <div className="va-post__rail"><Avatar who={e.who} size={32} /><span className="va-post__line" /></div>
              <div className="va-post__main">
                <div className="va-post__head"><b>{e.who}</b><Verified /><span>{AGO[i]}</span></div>
                <p className="va-post__text">{e.title}. <em>{e.detail}</em></p>
                {i === 0 ? <span className="va-post__media"><img src={e.imageSrc} alt="" /><b>{KIND[e.kind].label}</b></span> : null}
                <div className="va-acts"><span>{Ico.heart}{e.likes}</span><span>{Ico.reply}{e.replies}</span><span>{Ico.repost}</span><span>{Ico.share}</span></div>
              </div>
            </li>
          ))}
        </ol>
        <style>{CSS}</style>
      </aside>
    );
  }

  if (view === "pulso") {
    const bidders = 128 + ((tick * 7) % 23);
    const stories = ["SubasCars", "Pacífico", "Autoplan", "Mapfre", "Trupal S.A."];
    const liveWho = new Set(items.slice(0, 2).map((e) => e.who));
    return (
      <aside className="va va--pulso" aria-label="VMC ahora" {...pause}>
        <header className="va-pu__head">
          <div className="va-pu__title"><h3>VMC ahora</h3><span className="va-pu__live"><i />EN DIRECTO</span></div>
          <p className="va-pu__count"><b>{bidders}</b> personas pujando ahora</p>
        </header>
        <div className="va-stories" aria-label="Empresas activas">
          {stories.map((w) => (
            <span key={w} className="va-story">
              <span className={`va-story__ring${liveWho.has(w) ? "" : " is-idle"}`}><Avatar who={w} size={32} /></span>
              <span className="va-story__name">{w.replace(" S.A.", "")}</span>
            </span>
          ))}
        </div>
        <ol className="va-tline" aria-live="polite">
          {items.map((e, i) => (
            <li key={e.id} className={`va-ev${enter(i)}`} style={{ "--c": KIND[e.kind].color } as CSSProperties}>
              <div className="va-ev__meta"><span style={{ color: KIND[e.kind].color }}>{KIND[e.kind].label}</span><span className="va-ev__ago">{AGO[i]}</span></div>
              <p>{e.title}</p>
              <small>{e.detail}</small>
            </li>
          ))}
        </ol>
        <div className="va-pu__foot"><a href="#">Ver toda la actividad<svg width="12" height="12" viewBox="0 0 20 20" aria-hidden><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></a></div>
        <style>{CSS}</style>
      </aside>
    );
  }

  return (
    <aside className="va va--normal" aria-label="VMC ahora" {...pause}>
      <Head />
      {tick > 0 ? <span key={tick} className="va-newpill" aria-hidden>{Ico.arrowUp}Nuevo</span> : null}
      <ol className="va-posts va-scroll" aria-live="polite">
        {/* Fila tipo listado de eBay, 4 líneas a la altura de la foto: la pill cuenta el evento, el título es el
            lote, un solo dato fuerte (el precio, si hay) y una línea gris con empresa · ciudad · tiempo. */}
        {items.map((e, i) => (
          <li key={e.id} className={`va-item${enter(i)}`}>
            <span className="va-item__thumb"><img src={e.imageSrc} alt="" /></span>
            <div className="va-item__main">
              <span className="va-item__pill" style={{ "--k": KIND[e.kind].color } as CSSProperties}>{KIND[e.kind].label}</span>
              <p className="va-item__title">{e.lot}</p>
              {e.price ? <b className="va-item__value">{e.price}</b> : null}
              <span className="va-item__meta"><span className="va-item__who">{e.who}</span><Verified /><span>· {e.city} · {AGO[i]}</span></span>
            </div>
          </li>
        ))}
      </ol>
      <style>{CSS}</style>
    </aside>
  );
}
