"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, JSX } from "react";

/**
 * Selector de dispositivo de QA (sobre «Opción A / B»): laptop = la vista normal; celular = la misma página dentro de
 * un iPhone 14 Pro (pantalla 393 × 852, radio 55, Dynamic Island 126 × 37, barra de estado 54). El teléfono carga la
 * ruta en un iframe de 393 de ancho, así que se ve el layout móvil real (sus media queries). «Opción A / B» también
 * cambia el teléfono: el bloque avisa con el evento `hib-preset` y aquí se reenvía al iframe con postMessage.
 */
type Device = "desktop" | "mobile";
type PresetId = "a" | "b";

const SCREEN_W = 393;
const SCREEN_H = 852;
const BEZEL = 11;
const PHONE_H = SCREEN_H + BEZEL * 2;

const CSS = `
.hdp-toggle { position: fixed; right: 18px; bottom: 138px; z-index: 10; display: inline-flex; gap: 2px; padding: 3px; border: 1px solid #d9d0f2; border-radius: 999px;
  background: rgba(255,255,255,0.94); box-shadow: rgba(32,0,104,0.16) 0 4px 14px; }
.hdp-toggle button { display: grid; place-items: center; width: 34px; height: 26px; padding: 0; border: 0; border-radius: 999px; color: #3b1782; background: transparent; cursor: pointer;
  transition: background 0.2s, color 0.2s; }
.hdp-toggle button:hover { background: #f3effd; }
.hdp-toggle button[aria-pressed="true"] { color: #fff; background: #3b1782; }
.hdp-toggle button:focus-visible { outline: 2px solid #8460e5; outline-offset: 2px; }
html[data-hib-device="mobile"] { overflow: hidden; }
html[data-hib-device="mobile"] .hib-controls-toggle { display: none; }
.hdp-stage { position: fixed; inset: 0; z-index: 9; display: grid; place-items: center; overflow: hidden;
  background: radial-gradient(60% 70% at 50% 45%, #4A1FA8 0%, #2E0F70 70%); }
.hdp-phone { position: relative; box-sizing: border-box; width: ${SCREEN_W + BEZEL * 2}px; height: ${PHONE_H}px; padding: ${BEZEL}px; border-radius: ${55 + BEZEL}px;
  background: #1B1A20; box-shadow: inset 0 0 0 2px #3C3A44, 0 0 0 1px #0B0B0F, 0 40px 90px -30px rgba(0,0,0,0.7);
  transform: scale(var(--s, 1)); transform-origin: 50% 50%; }
/* Botones laterales: acción + volumen a la izquierda, encendido a la derecha. */
.hdp-phone::before { content: ""; position: absolute; left: -3px; top: 168px; width: 3px; height: 150px; border-radius: 2px 0 0 2px;
  background: linear-gradient(#2A2930 0 20%, transparent 20% 33%, #2A2930 33% 63%, transparent 63% 70%, #2A2930 70%); }
.hdp-phone::after { content: ""; position: absolute; right: -3px; top: 250px; width: 3px; height: 96px; border-radius: 0 2px 2px 0; background: #2A2930; }
.hdp-screen { position: relative; display: flex; flex-direction: column; width: ${SCREEN_W}px; height: ${SCREEN_H}px; overflow: hidden; border-radius: 55px; background: #2E0F70; }
.hdp-status { flex: none; display: flex; align-items: center; justify-content: space-between; height: 54px; padding: 6px 30px 0 52px; color: #fff;
  font: 600 16px/1 -apple-system, "SF Pro Text", "Plus Jakarta Sans", system-ui, sans-serif; }
.hdp-status__icons { display: inline-flex; align-items: center; gap: 6px; }
.hdp-island { position: absolute; top: 11px; left: 50%; z-index: 2; width: 126px; height: 37px; margin-left: -63px; border-radius: 20px; background: #000; }
.hdp-screen iframe { flex: 1; display: block; width: ${SCREEN_W}px; border: 0; background: #fff; }
.hdp-home { position: absolute; left: 50%; bottom: 8px; z-index: 2; width: 134px; height: 5px; margin-left: -67px; border-radius: 3px; background: rgba(20,17,43,0.85); pointer-events: none; }
`;

const LaptopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="5" width="16" height="11" rx="1.6" /><path d="M2 19h20" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="7" y="2.5" width="10" height="19" rx="2.4" /><path d="M11 18.5h2" />
  </svg>
);
const StatusIcons = () => (
  <span className="hdp-status__icons" aria-hidden>
    <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .8 10.4 10.4 0 0 0 .8 3.7L2 5c1.6-1.5 3.7-2.4 6-2.4zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.7 6.7 0 0 0 8 4.4c-1.8 0-3.4.7-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3zm0 3.6c.4 0 .8.2 1.1.4L8 11.4 6.9 10.2c.3-.2.7-.4 1.1-.4z" /></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="#fff" strokeOpacity="0.4" /><rect x="2" y="2" width="20" height="9" rx="2.5" fill="#fff" /><path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2z" fill="#fff" fillOpacity="0.4" /></svg>
  </span>
);

export default function DevicePreview(): JSX.Element {
  const [device, setDevice] = useState<Device>("desktop");
  const [src, setSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const preset = useRef<PresetId>("a");
  const frame = useRef<HTMLIFrameElement>(null);

  // Opción A / B: se recuerda la última y, si el teléfono está abierto, se le reenvía.
  useEffect(() => {
    const onPreset = (e: Event) => {
      const id = (e as CustomEvent<PresetId>).detail;
      preset.current = id;
      frame.current?.contentWindow?.postMessage({ type: "hib-preset", id }, window.location.origin);
    };
    window.addEventListener("hib-preset", onPreset);
    return () => window.removeEventListener("hib-preset", onPreset);
  }, []);

  // El teléfono se escala para entrar en el alto de la ventana (nunca más grande que 1:1).
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 40) / PHONE_H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (device === "mobile") root.dataset.hibDevice = "mobile";
    else delete root.dataset.hibDevice;
    window.dispatchEvent(new CustomEvent("hib-device", { detail: device }));
    return () => { delete root.dataset.hibDevice; };
  }, [device]);

  const choose = (d: Device) => {
    if (d === "mobile" && device !== "mobile") setSrc(`${window.location.pathname}?opcion=${preset.current}`);
    setDevice(d);
  };

  return (
    <>
      <div className="hdp-toggle" role="group" aria-label="Vista de dispositivo">
        <button type="button" aria-pressed={device === "desktop"} aria-label="Vista normal (laptop)" title="Vista normal" onClick={() => choose("desktop")}><LaptopIcon /></button>
        <button type="button" aria-pressed={device === "mobile"} aria-label="Vista mobile (iPhone 14 Pro)" title="Vista mobile · iPhone 14 Pro" onClick={() => choose("mobile")}><PhoneIcon /></button>
      </div>
      {device === "mobile" && src ? (
        <div className="hdp-stage">
          <div className="hdp-phone" style={{ "--s": scale } as CSSProperties}>
            <div className="hdp-screen">
              <span className="hdp-island" aria-hidden />
              <div className="hdp-status"><span>9:41</span><StatusIcons /></div>
              <iframe ref={frame} src={src} title="Vista mobile · iPhone 14 Pro" />
              <span className="hdp-home" aria-hidden />
            </div>
          </div>
        </div>
      ) : null}
      <style>{CSS}</style>
    </>
  );
}
