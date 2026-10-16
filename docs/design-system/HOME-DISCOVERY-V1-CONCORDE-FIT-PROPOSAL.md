# Propuesta V1 — Home / Concorde Fit

Estado: **reemplazada el 2026-10-13**. Esta propuesta trató un concepto local,
pero no partía del Index vigente. Se conserva como historial; no debe usarse
para implementar la V1 real.

## Qué promete esta V1

Conserva la intención que ya validamos —descubrimiento, actividad, dos tiendas,
rail, banner y categorías— pero reemplaza la receta visual local por piezas y
foundations comprobables de Concorde. El resultado será menos parecido al
mockup libre en los detalles decorativos y más parecido a VMC en su lenguaje
real. La optimización profunda de jerarquía comercial queda para V2.

## Fuente comprobada

- Concorde: `40d1be50206021157d9d6ad81327df8ba25486a4`.
- Árbol: `5d142a656dba74518e46b2c192cce946d15b075f`.
- Verificación: `npm run verify:concorde`, 2026-10-13.

## Component Map propuesto

| Necesidad | Pieza o foundation verificada | Decisión V1 | CSS local permitido | Brecha / siguiente decisión |
| --- | --- | --- | --- | --- |
| CTA de hero y banner | `Button` (`primary`, `negotiable`) | reutilizar | Sólo grid, flujo y breakpoint | Ninguna. |
| Cards de oportunidades | `OfferCard` (`full`, `short`; `live`, `negotiable`) | reutilizar + componer rail | Rail horizontal, orden y ancho responsivo; sin editar anatomía | No existe variante `premium`/`jumbo`. La primera `full` comunica destacado sólo por orden y presencia; una regla comercial real se difiere. |
| Estado de actividad | `BadgeStatus` (`live`, `proxima`) | reutilizar, si se expone explícitamente por el adapter | Lista y orden, no una nueva pill | El adapter aún no lo exporta. Exponerlo sería una corrección de frontera local, no un cambio de Concorde; se ejecuta sólo si esta propuesta se aprueba. |
| Feed lateral | No hay bloque Feed público | componer | Lista semántica y grid; fondo, color, radio y sombra sólo desde foundation verificada | El fallback editorial sigue siendo texto/fixture, sin inventar una card de blog. |
| Hero | No hay bloque Hero público | componer | Grid, orden y responsive | Sin gradiente, panel ni escala tipográfica local. Si hiciera falta una presencia editorial mayor, es decisión V2. |
| Banner secundario | `Button`; no hay bloque Banner | componer | Flujo y asset placement | En V1 se reduce a contenido editorial con CTA, sin tarjeta decorativa. Un banner con tratamiento comercial es candidato V2. |
| Categorías | `CategoryCard` | reutilizar | Grid y asset placement externo no interactivo | `CategoryCard` no admite imagen. V1 conserva la pieza oficial; categorías con imagen integrada requieren candidato/upgrade V2. |
| Dos tiendas | `CardTitle` es disponible en Concorde, pero no encaja de forma natural con el resumen actual | componer con texto semántico; no usar `CardTitle` por decoración | Grid y orden | Si la identidad de tienda necesita bloque propio reutilizable, formular candidato V2. |
| Bloque de subastador existente | `AuctioneerSection` | no reutilizar | Ninguno | Está fijado a 766×352 y cuatro cards: no satisface rail de tienda ni responsive de este corte. |

## Delta que debe resolverse antes de promover

`npm run readiness:v1` identifica en la línea base:

- 7 tokens locales;
- 66 recetas visuales locales (colores, degradados, sombras, radios o tipo);
- 13 propiedades CSS sin clasificar;
- una waiver amplia de concepto y autoridad visual no Concorde.

La V1 elimina esa waiver. El CSS de página se limita a `layout`, `responsive` y
`asset-placement`; cada valor visual se elimina o se reemplaza con una
foundation declarada. No se introducen componentes centrales nuevos.

## Cambios visibles que esta propuesta haría

1. Hero, feed y banner pierden su tratamiento violeta/degradado local y pasan a
   composición neutral con el CTA Concorde como elemento de énfasis.
2. La oportunidad destacada sigue dentro del rail, usando `OfferCard full` y
   el orden del rail; no habrá card premium simulada.
3. Las categorías conservan `CategoryCard` oficial; las fotos dejan de formar
   parte de la anatomía visual de la categoría en V1.
4. El feed usa sólo estados oficiales `live`/`proxima`; la pieza editorial no
   recibe un status inventado.

## Criterio de salida

Tras implementar estos cambios: `npm run readiness:v1` debe no devolver delta,
el contrato pasa a `concorde-fit` de manera atómica con `CURRENT.md` y el
Decision Packet, y finalmente `npm run verify` debe aprobar. La aceptación
visual de Julio ocurre después de esa evidencia.

## Decisión solicitada

Autorizar esta V1 sobria de Concorde, incluidos los cuatro cambios visibles
anteriores y, si se necesita, la exportación explícita de `BadgeStatus` desde
el adapter local. No autoriza crear una variante de card, modificar Concorde ni
iniciar V2.
