# Component Map — referencia → Concorde + candidatos de Home

Plano: `references/source/vmc-home-reference-approved.png`.
Autoridad: `config/concorde-v2-source.json`, snapshot
`concorde-v2-registry-aligned-2026-10-13`. Catálogo completo consultado:
`https://concorde-v2-theta.vercel.app/r/registry.json`.

| Zona del plano | Archivo/props públicas evaluadas | Decisión y diferencia observable |
| --- | --- | --- |
| Barra compacta | `bloques/header/desktop/Header.tsx`: width, compact | Reutilizar completa, 798 × 64 px, en la columna principal; sin buscador por decisión de Julio. |
| Sidebar y anuncio | `bloques/sidebar/desktop/Sidebar.tsx`: logo, primaryItems, secondaryItems, height, contentHeight, headerHeight | Reutilizar completo a 226 px; ocupa la columna izquierda con logo y hamburguesa. Su marco oficial de navegación empieza debajo de su cabecera, por lo que queda visualmente separado del Header sin recortes ni intervención de anatomía. |
| Hero fotográfico con CTA | `Button`: variant=primary; candidato `HomeOpportunityHero` | Candidato autorizado: compone Button y tokens públicos alrededor del asset fixture, glass y controles de carrusel. No recrea Button, Header ni Sidebar. |
| Feed lateral | `CardTitle`, `BadgeStatus`; candidato `ActivityFeedPanel` | Candidato autorizado: feed con evento vivo fijado por orden y próximas novedades; no usa `ActivityCard` de cuentas personales. |
| Lotes destacados | `components/OfferCard.tsx`: variant, size=full, name, year, price, imageSrc, badge; CardTitle; ProfileButton | Un único filmstrip de SubasCars, tal como el blueprint visual actual. AuctioneerSection se descarta: fuerza live en todas las cards. |
| Campaña de maquinaria | `Button`: variant=primary; candidato `HomeCampaignBanner` | Candidato autorizado: composición editorial compacta de copy, imagen fixture y beneficios. |
| Categorías fotográficas | `CategoryCard`: category, label, onClick | Una imagen fixture se ubica antes de cada CategoryCard público. CategoryCard conserva su anatomía, icono y comportamiento. |
| Resumen final de tiendas | CardTitle + ProfileButton en layout | Dos filas para SubasCars y Pacífico, no un segundo catálogo de ofertas. |

El canvas desktop total es 1024 px: 226 px de Sidebar + 798 px de Header y
columna principal. Recorrido: Header/Sidebar → hero + actividad en paralelo → lotes destacados →
campaña editorial → categorías visuales → resumen de las dos tiendas.

Los inventarios son ejemplos de maqueta, sin datos conectados ni reglas nuevas.
Fuentes: Plus Jakarta Sans y Roboto Mono cargadas mediante next/font en el
layout de la ruta. Las superficies de los tres candidatos están declaradas en
el Design Contract con la autorización de Julio, usan sólo tokens `--vmc-*`
auditados y no modifican clases privadas de Concorde.

El snapshot anterior mezclaba piezas ZIP/registro y tres paletas no coincidían
con las publicadas hoy. La app nombraba fuentes sin cargarlas. Los gates de
importación no probaban esas fuentes ni fidelidad espacial. Esta auditoría no
declara aceptada visualmente la Home: verifica el origen y límite de cada pieza.
