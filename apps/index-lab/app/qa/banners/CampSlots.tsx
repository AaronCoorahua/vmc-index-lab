"use client";

import { CAMPAIGNS, CampaignBanner } from "../home-index-rebase/HomeIndexBlock";

// Las 3 campañas del banner de abajo, con el componente real del index (vista «Foto de fondo»).
export default function CampSlots() {
  return CAMPAIGNS.map((c, i) => (
    <li key={c.id}>
      <div data-dl={`abajo-${c.id}`}><CampaignBanner view="fondo" camp={c.id} /></div>
      <p className="slot__cap"><span className="slot__n slot__n--in">{i + 1}</span>{c.label} <code>{c.img.split("/").pop()}</code>
        <a className="dl" href={`/banners/descargas/abajo-${c.id}.png`} download>Descargar ↓</a></p>
    </li>
  ));
}
