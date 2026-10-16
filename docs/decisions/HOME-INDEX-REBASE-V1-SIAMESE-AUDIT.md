# Auditoría siamesa — Home Index rebase / V1

Fecha: 2026-10-13  
Objeto: `docs/design-system/HOME-INDEX-REBASE-V1-COMPONENT-MAP.md`  
Estado: **NO-GO para código; GO WITH CHANGES al cerrar los puntos de abajo.**

## VP Experiencia

La transformación conserva correctamente Sidebar, Centro de Ayuda, footer,
modalidades, campañas, categorías y el patrón de tiendas. No debe, sin embargo,
convertir navegación agregada en un feed ficticio ni fijar la campaña de
captación como hero por defecto.

- El fallback inicial del feed es Centro de Ayuda.
- Una actividad exige id/URL, título, estado explícito, fecha/hora y captura
  vigente; los contadores de navegación no bastan.
- La primera pantalla requiere decisión explícita: descubrimiento comprador o
  campaña de captación como foco principal.
- La QA muestra dos rails de tiendas reales, conforme a la decisión de Julio;
  las demás rutas siguen disponibles en la VMC vigente, no como cinco bloques
  del prototipo.
- Centro de Ayuda se conserva lateralmente y en el cierre del Home.

## VP Integridad

El pin de Concorde coincide con `config/concorde-source.json`; no se detectó
un desajuste de revisión. La implementación sigue bloqueada porque el contrato
de los componentes no soporta varias promesas funcionales:

- `Header` no expone ruta ni callback para `Ingresa`.
- `Sidebar` no propaga clicks de subítems y necesita iconos que el adaptador no
  exporta para recrear exactamente el menú vigente.
- `SidebarBanner` no acepta contenido real; `onCta` no se usa.
- `OfferCard` no permite rail funcional sin problemas de teclado/interacción
  anidada y favorito local; el tamaño `short` no maneja Enter/Espacio.
- La URL viva no es aún un snapshot reproducible de ofertas, destinos, estados,
  campañas y assets.

## Correcciones incorporadas al mapa

1. V1 se declara visual; no promete login, navegación, favorito ni detalle.
2. El feed pasa a Centro de Ayuda por defecto.
3. Las cards son estáticas y se usan dos rails de tiendas.
4. Header, Sidebar y publicidad se reclasifican con sus brechas públicas.
5. Se exige un manifest con captura, hash, TTL, destinos y procedencia antes de
   activar una QA o cualquier badge temporal.

## Condiciones de paso a `GO WITH CHANGES`

1. Decisión de foco para la primera zona: descubrimiento o campaña.
2. Manifest de snapshot congelado y verificable.
3. Decision Packet específico para `home-index-rebase-v1` y actualización de
   `CURRENT.md`; la autorización histórica de `home-discovery-v1` no se hereda.
4. Contrato de rutas y accesibilidad resuelto o V1 limitado explícitamente a
   presentación estática.

Después aplican los gates de contrato, procedencia, estilos, ruta, consola,
overflow/rail, teclado y revisión visual humana.
