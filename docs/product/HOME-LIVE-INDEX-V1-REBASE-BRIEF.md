# Brief de rebase — V1 real del Index

Estado: el primer intento QA fue validado técnicamente pero **rechazado
visualmente** por Julio el 2026-10-13: se percibe como storybook y no como una
Home. Una recuperación del primer fold también fue rechazada el mismo día.
Se conserva como evidencia de integración; no es baseline visual y el corte
queda bloqueado hasta un Visual Intent Packet aprobado.

## Pista declarada

**V1 — Concorde Fit.** No rediseña el negocio ni inventa una Home genérica.
Toma el Index real, conserva sus bloques y sus destinos, y traduce su jerarquía
hacia la referencia de Julio usando únicamente Concorde y foundations
verificadas. V2 sólo comienza después de revisar este delta.

## Baseline actual comprobado

Fuente: `https://www.vmcsubastas.com/`, revisada el 2026-10-13.

El Index vigente contiene:

1. Header, Sidebar expandible y dos espacios de publicidad del Sidebar.
2. Dos banners principales: publicar/vender y Subaspass.
3. El bloque `Tipo de oferta` y `Categorías`.
4. Tiendas con nombre, número de ofertas, perfil y `OfferCard` vinculadas a su
   detalle: Pacífico, SubasCars, Empresa Industrial, Inversiones F&B y Trupal.
5. Centro de Ayuda y footer.

Los ejemplos de oferta, nombres, contadores y destinos de V1 deben salir de
una captura/snapshot de esta fuente, no de inventario ficticio. Si el Index no
ofrece una fuente de datos consumible por el laboratorio, se etiquetan como
“snapshot del Index — fecha de captura”, no como datos en vivo.

## Traducción V1 propuesta

| Index actual | Dirección de la referencia | Regla V1 |
| --- | --- | --- |
| Header + Sidebar + anuncios | Sidebar persistente con publicidad visible | Reutilizar los bloques completos de Concorde; no reconstruir sus partes. |
| Dos banners de entrada | Hero de oportunidad y zona secundaria | Conservar ambos mensajes y destinos reales; por decisión de Julio, descubrimiento ocupa el hero y las campañas quedan como zona secundaria después de los rails. |
| Tipo de oferta + categorías | Entrada rápida a descubrir | Conservar destinos y contenido, usando sus componentes oficiales. |
| Tiendas y sus cards | Rails de descubrimiento por tienda | Conservar tiendas, offers y links reales del snapshot; pasar de filas rígidas a rail horizontal donde Concorde lo soporte. |
| Próximas / En vivo de la navegación | Feed lateral de actividad | Mostrar sólo actividad verificable desde el snapshot: próxima, en vivo o un fallback de Centro de Ayuda. No inventar urgencias. |
| Centro de Ayuda + footer | Cierre de Home | Conservarlos; no sustituirlos por una sección decorativa. |

## Límites

- No se eliminan Header, Sidebar, anuncios, Centro de Ayuda, footer ni los
  destinos existentes para conseguir la apariencia de la referencia.
- No se introduce una card premium, una regla de pago, personalización o una
  fuente de datos nueva.
- La imagen de Julio guía la jerarquía y el ritmo; Concorde gobierna la
  apariencia, anatomía y variantes.
- El experimento anterior `home-discovery-v1` queda fuera de este corte.

## Corrección de dirección pendiente

La siguiente propuesta no debe intentar "mejorar" la QA actual añadiendo más
etiquetas o secciones. Debe partir de una primera pantalla con jerarquía de
Home: un foco de oportunidad real, actividad lateral de lectura rápida y una
entrada continua al inventario. La trazabilidad de snapshot, estado QA y
limitaciones técnicas se conserva en la documentación y evidencia, no como
copy dominante en el lienzo de la Home. Antes de modificar el corte se debe
cerrar con Julio la composición de esa primera pantalla y actualizar el
Component Map/Packet si la alternativa exige una brecha nueva de Concorde.

El artefacto siguiente es un **Visual Intent Packet**, no otro mockup: traduce
la referencia en zonas, proporciones, agrupación, densidad, orden responsive y
continuidad al rail. Incluye un contact sheet de los componentes Concorde
candidatos. Si esos componentes no forman el hero/superficie/feed necesarios,
declara un gap y pide una decisión explícita de `system-candidate` o
`concorde-upgrade`.

## Component Map preparado

El contraste completo quedó en
`docs/design-system/HOME-INDEX-REBASE-V1-COMPONENT-MAP.md`. La auditoría
siamesa y la decisión de primera pantalla ya están incorporadas. Falta cerrar
procedencia de assets/destinos y activar una ruta QA antes de cambiar UI.
