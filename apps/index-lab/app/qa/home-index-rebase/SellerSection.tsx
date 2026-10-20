"use client";

import type { JSX } from "react";
import { ProfileButton } from "@vmc/concorde-adapter";
import GlassButton from "./GlassButton";

const SUBASCARS_URL = "https://www.vmcsubastas.com/landing-subascars";

// Versión original de conversión: cards con fotografía y el panel morado de
// SubasCars. Se conserva como una sección secundaria, debajo de maquinaria.
const CSS = `
.hib-sell { box-sizing: border-box; width: 100%; padding-top: 2px; color: #191C1C; font-family: var(--vmc-font-display, "Plus Jakarta Sans", sans-serif); }
.hib-sell *, .hib-sell *::before, .hib-sell *::after { box-sizing: border-box; }
.hib-sell__head { display: grid; justify-items: start; width: 100%; gap: 2px; margin: 0 0 18px; padding-bottom: 10px; border-bottom: 1px solid #DEDCE4; text-align: left; }
.hib-sell__head h2 { margin: 0; color: #3B1782; font-size: 22px; line-height: 27px; font-weight: 700; letter-spacing: -.02em; }
.hib-sell__head p { margin: 0; color: #3F3F4A; font-size: 14px; line-height: 20px; }
.hib-sell__layout { display: grid; grid-template-columns: 766px minmax(320px, 1fr); gap: 16px; align-items: stretch; }
.hib-sell__choices { display: grid; gap: 12px; }
.hib-sell__choice { display: grid; grid-template-columns: 184px minmax(0, 1fr); min-height: 142px; overflow: hidden; border: 1px solid #DEDCE4; border-radius: 14px; background: #fff; text-decoration: none; color: inherit; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
.hib-sell__choice:hover { transform: translateY(-2px); border-color: #B7A5E9; box-shadow: rgb(32 0 104 / 14%) 0 12px 24px -16px; }
.hib-sell__photo { position: relative; overflow: hidden; background: #E8E5FF; }
.hib-sell__photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.hib-sell__photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 56%, rgb(255 255 255 / 92%) 100%); pointer-events: none; }
.hib-sell__choice--fleet .hib-sell__photo { background: #D9F0EE; }
.hib-sell__choice--fleet .hib-sell__photo img { object-position: 50% 45%; }
.hib-sell__copy { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; min-width: 0; padding: 18px 24px; }
.hib-sell__copy h3 { margin: 0; color: #191C1C; font-size: 17px; line-height: 22px; font-weight: 750; letter-spacing: -.015em; }
.hib-sell__copy p { margin: 5px 0 10px; color: #5B5B66; font-size: 13px; line-height: 19px; }
.hib-sell__copy .pprofilebtn { padding: 0; font-size: 13px; }
.hib-sell__benefit { position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: flex-start; min-height: 296px; overflow: hidden; padding: 22px; border-radius: 14px; color: #fff; background: radial-gradient(110% 100% at -10% 112%, rgb(239 133 46 / 88%) 0%, rgb(239 133 46 / 38%) 27%, transparent 56%), linear-gradient(145deg, #32136F 0%, #4E22A9 55%, #7B4BE3 100%); box-shadow: rgb(59 23 130 / 18%) 0 12px 24px -18px; }
.hib-sell__benefit::before { content: ""; position: absolute; z-index: -1; top: -85px; right: -48px; width: 250px; height: 210px; border: 42px solid rgb(255 255 255 / 10%); border-radius: 50%; }
.hib-sell__benefit::after { content: ""; position: absolute; z-index: -1; right: -74px; bottom: -118px; width: 270px; height: 210px; border: 42px solid rgb(255 255 255 / 8%); border-radius: 50%; }
.hib-sell__person { position: absolute; z-index: 0; right: -26px; bottom: -1px; width: min(68%, 238px); height: auto; pointer-events: none; }
.hib-sell__benefit > :not(.hib-sell__person) { position: relative; z-index: 1; }
.hib-sell__coin { display: inline-flex; align-items: center; height: 27px; padding: 0 12px; border: 1px solid rgb(255 255 255 / 28%); border-radius: 999px; background: rgb(255 255 255 / 12%); font-size: 11px; font-weight: 800; letter-spacing: .02em; }
.hib-sell__benefit h3 { max-width: 190px; margin: 16px 0 0; font-size: 21px; line-height: 25px; font-weight: 750; letter-spacing: -.025em; }
.hib-sell__benefit p { max-width: 190px; margin: 7px 0 0; color: rgb(255 255 255 / 88%); font-size: 13px; line-height: 19px; }
.hib-sell__benefit .hib-glass { height: 38px; margin-top: auto; padding-inline: 24px; font-size: 13px; }
@container hib-row (max-width: 1101px) { .hib-sell__layout { grid-template-columns: 620px minmax(320px, 1fr); } .hib-sell__choice { grid-template-columns: 164px minmax(0, 1fr); } .hib-sell__copy { padding-inline: 20px; } }
@container hib-row (max-width: 955px) { .hib-sell__layout { grid-template-columns: minmax(0, 1fr); } .hib-sell__benefit { min-height: 240px; } .hib-sell__person { width: min(48%, 270px); } }
/* Soft launch C: las opciones para vender permanecen a la izquierda y el banner de SubasCars a la derecha,
   incluso cuando el sidebar reduce el área útil del canvas de 1024. */
[data-soft-launch] .hib-sell__layout { grid-template-columns: minmax(0, 1fr) clamp(260px, 34%, 300px); gap: 16px; }
[data-soft-launch] .hib-sell__choice { grid-template-columns: 132px minmax(0, 1fr); min-height: 142px; }
[data-soft-launch] .hib-sell__copy { padding: 14px 16px; }
[data-soft-launch] .hib-sell__benefit { min-height: 296px; }
[data-soft-launch] .hib-sell__person { width: min(68%, 238px); }
@container hib-row (max-width: 820px) {
  [data-soft-launch] .hib-sell__layout { grid-template-columns: minmax(0, 1fr) 260px; }
  [data-soft-launch] .hib-sell__choice { grid-template-columns: 112px minmax(0, 1fr); }
  [data-soft-launch] .hib-sell__copy { padding: 12px; }
  [data-soft-launch] .hib-sell__copy h3 { font-size: 15px; line-height: 19px; }
  [data-soft-launch] .hib-sell__copy p { font-size: 12px; line-height: 16px; }
}
@media (max-width: 600px) { .hib-sell__head h2 { font-size: 22px; line-height: 27px; } .hib-sell__choice { grid-template-columns: 118px minmax(0, 1fr); min-height: 118px; } .hib-sell__copy { padding: 14px; } .hib-sell__copy h3 { font-size: 15px; line-height: 19px; } .hib-sell__copy p { font-size: 12px; line-height: 16px; } }
`;

function SellerChoice({ fleet = false, title, description, cta, imageSrc }: { fleet?: boolean; title: string; description: string; cta: string; imageSrc: string }): JSX.Element {
  return (
    <article className={`hib-sell__choice${fleet ? " hib-sell__choice--fleet" : ""}`}>
      <div className="hib-sell__photo"><img src={imageSrc} alt="" /></div>
      <div className="hib-sell__copy">
        <h3>{title}</h3>
        <p>{description}</p>
        <ProfileButton href={SUBASCARS_URL}>{cta}</ProfileButton>
      </div>
    </article>
  );
}

export default function SellerSection(): JSX.Element {
  return (
    <section className="hib-sell" aria-labelledby="sell-title">
      <div className="hib-sell__head">
        <h2 id="sell-title">Vende tu vehículo</h2>
        <p>Publica tu auto y recibe ofertas de compradores verificados.</p>
      </div>
      <div className="hib-sell__layout">
        <div className="hib-sell__choices">
          <SellerChoice title="¿Vendes tu vehículo?" description="Registra tu publicación en minutos y deja que VMC filtre las ofertas por ti." cta="Publica tu auto" imageSrc="/demo/inventory-suv-v1.png" />
          <SellerChoice fleet title="¿Vendes varios vehículos?" description="Una alternativa para propietarios, empresas y concesionarios que buscan vender sus vehículos seminuevos." cta="Conoce SubasCars" imageSrc="/demo/inventory-mosaic-v1.png" />
        </div>
        <aside className="hib-sell__benefit" aria-label="Beneficios de SubasCars">
          <img className="hib-sell__person" src="/demo/sell/seller-phone-man.png" alt="" />
          <span className="hib-sell__coin">25 SubasCoins · 0% comisión</span>
          <h3>Un solo pago, hasta que lo vendas</h3>
          <p>Sin pagos mensuales ni renovaciones: el 100% de la venta es tuyo.</p>
          <GlassButton onClick={() => window.location.assign(SUBASCARS_URL)}>Publica ahora</GlassButton>
        </aside>
      </div>
      <style>{CSS}</style>
    </section>
  );
}
