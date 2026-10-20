"use client";

/**
 * VmcAhora — feed «VMC ahora» (columna lateral junto a «Lotes») con eventos que van pasando: cada 4,5 s entra
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
import { BadgeStatus } from "@vmc/concorde-adapter";
import SectionHeader from "./SectionHeader";

export type FeedView = "normal" | "timeline" | "pulso";
type Kind = "live" | "bid" | "sold" | "new" | "deal" | "next";
type FeedEvent = { id: string; kind: Kind; who: string; title: string; detail: string; imageSrc: string; likes: number; replies: number };

const LOGO: Record<string, string | undefined> = {
  "SubasCars": "/assets/brand/logo-voyager.svg", "Pacífico": "/demo/empresas/pacifico.png", "Autoplan": "/demo/empresas/autoplan.png",
  "Trupal S.A.": "/demo/empresas/trupal.svg", "Mapfre": "/demo/empresas/mapfre.png",
};

const EVENTS: FeedEvent[] = [
  { id: "e1", kind: "live", who: "Empresa Industrial", title: "Subasta de vehículos en curso", detail: "32 participantes · Lote 12", imageSrc: "/demo/inventory-suv-v1.png", likes: 48, replies: 6 },
  { id: "e2", kind: "bid", who: "SubasCars", title: "Nueva puja en Toyota Yaris 2022", detail: "US$ 2,799 · +US$ 100", imageSrc: "/demo/inventory-suv-v1.png", likes: 31, replies: 4 },
  { id: "e3", kind: "sold", who: "SubasCars", title: "Hyundai Grand i10 adjudicado", detail: "Cerró en US$ 2,450", imageSrc: "/demo/inventory-mosaic-v1.png", likes: 57, replies: 9 },
  { id: "e4", kind: "new", who: "Pacífico", title: "Excavadora Caterpillar 320 publicada", detail: "Lote 88 · Lima", imageSrc: "/demo/inventory-excavator-v1.png", likes: 22, replies: 3 },
  { id: "e5", kind: "deal", who: "Autoplan", title: "Propuesta aceptada en Toyota Agya", detail: "Negociable · Lima", imageSrc: "/demo/inventory-suv-v1.png", likes: 19, replies: 2 },
  { id: "e6", kind: "next", who: "Trupal S.A.", title: "Equipos industriales empieza 10:00", detail: "14 lotes · Callao", imageSrc: "/demo/inventory-forklift-v1.png", likes: 15, replies: 1 },
  { id: "e7", kind: "bid", who: "Pacífico", title: "12 pujas en el último minuto", detail: "Caterpillar 320 · US$ 45,000", imageSrc: "/demo/inventory-excavator-v1.png", likes: 64, replies: 11 },
  { id: "e8", kind: "new", who: "Mapfre", title: "Kia Sportage 2020 publicada", detail: "52,300 km · Lima", imageSrc: "/demo/inventory-suv-v1.png", likes: 12, replies: 0 },
];
const AGO = ["Ahora", "hace 1 min", "hace 3 min", "hace 6 min", "hace 9 min"];
const AGO_SHORT = ["Ahora", "1 min", "3 min", "6 min", "9 min"]; // en la insignia de la vista Normal
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
function useLiveFeed(size: number, paused: boolean, events: FeedEvent[]): { items: FeedEvent[]; tick: number } {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setTick((n) => n + 1), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused]);
  const items = Array.from({ length: size }, (_, i) => events[(((tick - i) % events.length) + events.length) % events.length]);
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
// Acciones estilo Threads: me gusta · comentar · republicar · enviar (trazo 1.8, 18 px).
const Act = {
  heart: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M12 20.5s-8-4.9-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6.1-8 11-8 11z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
  reply: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.6L3.5 20.5l1.4-4.9A8.5 8.5 0 1 1 21 11.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
  repost: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M4 11V9a3 3 0 0 1 3-3h11M15 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H6M9 21l-3-3 3-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  send: <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M21 3L10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" /></svg>,
};
const Ico = {
  heart: <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
  reply: <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
  share: <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  arrowUp: <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const CSS = `
@keyframes va-in { from { opacity: 0; transform: translateY(-10px); } }
@keyframes va-flash { from { background: #F3EFFD; } to { background: transparent; } }
@keyframes va-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
@keyframes va-pill { 0% { opacity: 0; transform: translate(-50%, -6px); } 15%, 75% { opacity: 1; transform: translate(-50%, 0); } 100% { opacity: 0; transform: translate(-50%, -6px); } }
@keyframes va-ring { to { transform: rotate(360deg); } }
.va { position: relative; box-sizing: border-box; width: 100%; flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 16px;
  font-family: var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif); }
.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1); }
.va-av { box-sizing: border-box; display: inline-grid; flex: none; border-radius: 50%; }
.va-av__in { display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(59,23,130,0.1); }
.va-av__in img { max-width: 72%; max-height: 72%; object-fit: contain; }
.va-av__in b { font-size: 12px; font-weight: 800; color: #3B1782; }
.va-verified { flex: none; }
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
.va-tl__head { display: flex; align-items: center; justify-content: space-between; padding: 12px 12px 6px; border-bottom: 1px solid #EFEDF5; }
.va-live { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #E2531A; }
.va-live i { width: 6px; height: 6px; border-radius: 50%; background: #FF7A1A; animation: va-pulse 1.4s ease-in-out infinite; }
.va-newpill { position: absolute; top: 68px; left: 50%; z-index: 3; display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #8460E5, #3B1782); box-shadow: rgba(59,23,130,0.35) 0 6px 14px;
  opacity: 0; pointer-events: none; animation: va-pill 2.2s ease forwards; }
.va-posts { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; margin: 0; padding: 0; list-style: none; }
.va-post { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: 12px; padding: 14px 24px 4px; }
.va-post.va-enter { animation: va-in 0.45s cubic-bezier(0.3,0,0,1), va-flash 2.4s ease; }
/* Hilo: el avatar y una línea fina que lo une con la publicación siguiente (como Threads). */
.va-post__rail { display: flex; flex-direction: column; align-items: center; }
.va-post__line { flex: 1; width: 2px; min-height: 12px; margin-top: 8px; border-radius: 2px; background: #E4E0F0; }
.va-post:last-child .va-post__line { display: none; }
.va-post__main { min-width: 0; padding-bottom: 12px; }
.va-post__head { display: flex; align-items: center; gap: 5px; min-width: 0; font-size: 14px; line-height: 20px; }
.va-post__head b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; color: #14112B; }
.va-post__head span { flex: none; color: #8A879C; font-size: 13px; font-weight: 400; }
.va-post__text { margin: 2px 0 0; font-size: 14px; line-height: 1.4; color: #24203D; }
.va-post__text em { font-style: normal; font-weight: 700; color: #4A2CE0; }
.va-post__media { position: relative; display: block; margin-top: 10px; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 14px; background: #F3EFFD; }
.va-post__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.va-post__media b { position: absolute; left: 10px; bottom: 10px; padding: 3px 9px; border-radius: 999px; font-size: 12px; font-weight: 700; color: #fff; background: rgba(16,0,48,0.62); }
.va-acts { display: flex; gap: 18px; margin-top: 8px; margin-left: -6px; font-size: 13px; color: #6B6880; }
.va-acts span { display: inline-flex; align-items: center; gap: 6px; padding: 5px 6px; border-radius: 999px; }
.va-acts span:hover { background: #F3EFFD; color: #3B1782; }

/* Pulso (oscuro, en directo) */
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

export default function VmcAhora({ view }: { view: FeedView }): JSX.Element {
  const [paused, setPaused] = useState(false);
  const { items, tick } = useLiveFeed(view === "normal" ? 4 : view === "timeline" ? 5 : 5, paused, EVENTS);
  const pause = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) };
  // El evento de arriba entra animado (su key cambia en cada avance; los demás conservan la suya).
  const enter = (i: number) => (i === 0 ? " va-enter" : "");

  if (view === "timeline") {
    return (
      <aside className="va va--timeline" aria-label="VMC ahora" {...pause}>
        <SectionHeader title="VMC ahora" subtitle="Actividad en tiempo real" action={<span className="va-live"><i />En vivo</span>} />
        {tick > 0 ? <span key={tick} className="va-newpill" aria-hidden>{Ico.arrowUp}Nuevo</span> : null}
        <ol className="va-posts va-scroll" aria-live="polite">
          {items.map((e, i) => (
            <li key={e.id} className={`va-post${enter(i)}`}>
              <div className="va-post__rail"><Avatar who={e.who} size={36} /><span className="va-post__line" /></div>
              <div className="va-post__main">
                <div className="va-post__head"><b>{e.who}</b><Verified /><span>{AGO[i]}</span></div>
                <p className="va-post__text">{e.title}. <em>{e.detail}</em></p>
                {i === 0 ? <span className="va-post__media"><img src={e.imageSrc} alt="" /><b>{KIND[e.kind].label}</b></span> : null}
                <div className="va-acts"><span>{Act.heart}{e.likes}</span><span>{Act.reply}{e.replies}</span><span>{Act.repost}</span><span>{Act.send}</span></div>
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
        <ol className="va-tline va-scroll" aria-live="polite">
          {items.map((e, i) => (
            <li key={e.id} className={`va-ev${enter(i)}`} style={{ "--c": KIND[e.kind].color } as CSSProperties}>
              <div className="va-ev__meta"><span style={{ color: KIND[e.kind].color }}>{KIND[e.kind].label}</span><span className="va-ev__ago">{AGO[i]}</span></div>
              <p>{e.title}</p>
              <small>{e.detail}</small>
            </li>
          ))}
        </ol>
        <style>{CSS}</style>
      </aside>
    );
  }

  return (
    <aside className="va va--normal" aria-label="VMC ahora" {...pause}>
      <SectionHeader title="VMC ahora" subtitle="Actividad en tiempo real" />
      <ol className="va-list va-scroll" aria-live="polite">
        {items.map((e, i) => (
          <li key={e.id} className={`va-row${enter(i)}`}>
            <img src={e.imageSrc} alt="" />
            <div className="va-row__txt">
              <span><BadgeStatus variant={KIND[e.kind].badge} label={`${KIND[e.kind].label} · ${AGO_SHORT[i]}`} /></span>
              <strong>{e.title}</strong>
              <span className="va-row__detail">{e.detail}</span>
            </div>
          </li>
        ))}
      </ol>
      <style>{CSS}</style>
    </aside>
  );
}
