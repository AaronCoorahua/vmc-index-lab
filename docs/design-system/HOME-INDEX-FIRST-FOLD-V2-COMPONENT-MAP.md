# Component Map — Home Index / primer fold V2

Estado: **autorizado para implementación local; no es una extensión publicada
de Concorde.**

Autorización: Julio aprobó el 2026-10-13 crear `HomeOpportunityHero` y
`ActivityFeedPanel` como candidatos locales V2 después de revisar el Visual
Intent Packet.

| Zona | Pieza | Clasificación | Contrato |
| --- | --- | --- | --- |
| Header | `Header` completo del adaptador | reutilizar | Sin buscador; no tocar anatomía. |
| Marca | `logo-voyager.svg` fijado con Concorde | reutilizar | Asset canónico servido desde el laboratorio; no se sustituye con copy o una marca recreada. |
| Sidebar | `Sidebar` completo del adaptador | reutilizar | Mantiene banner canónico y recibe el asset de marca; rutas exactas siguen como brecha previa. |
| Hero | `HomeOpportunityHero` local | extender con autorización | Compone asset documentado y `Button` en una superficie. No modifica sus APIs ni se promociona a Concorde. |
| Modalidades | `OfferType` dentro de Sidebar | reutilizar | Se mantienen en su patrón canónico hasta que exista una franja oficial adecuada. |
| Actividad | `ActivityFeedPanel` local | extender con autorización | Compone filas editoriales con enlaces oficiales de ayuda. No declara eventos en vivo. |
| Estado | `BadgeStatus` | reutilizar condicionado | Sólo una etiqueta editorial/fallback; live/proxima requieren evento verificable. |
| Inicio de rail | `CardTitle`, `OfferCard` | reutilizar | SubasCars aporta cuatro ofertas del snapshot; cards siguen estáticas en esta V2. |

## Hallazgo de reauditoría

Concorde incluye `AuctioneerSection`, el bloque visual más cercano a una tienda
con cuatro ofertas. No se usa aún porque su API fija cada `OfferCard` como
`live`; el snapshot actual no autoriza declarar ese estado. Reproducir su
anatomía localmente para evitar ese límite violaría la frontera de Concorde.

La siguiente decisión debe ser una de estas dos, explícita:

1. autorizar un `concorde-upgrade` que exponga `variant` por oferta en
   `AuctioneerSection`; o
2. autorizar un candidato local `HomeStoreSection`, compuesto con APIs públicas
   de Concorde y con estados provenientes de una fuente verificable.

## Foundations y receta local autorizada

Los candidatos usan solamente `--vmc-font-display` y los tokens de color
fijados. La receta de superficie (radio, escala de título y sombra) se declara
por valor exacto en el Design Contract para que el verificador la acepte sólo
en estos dos archivos. No se convierte en token ni se propaga a Concorde.

## Límites

- No se edita `.vendor/`, el adaptador ni el repositorio de Concorde.
- No se crea card premium, categoría fotográfica ni shell nuevo.
- Actividad usa fallback editorial con enlaces oficiales; no simula evento vivo.
- Sólo hero, actividad y primer rail pueden cambiar antes de aceptación visual.
