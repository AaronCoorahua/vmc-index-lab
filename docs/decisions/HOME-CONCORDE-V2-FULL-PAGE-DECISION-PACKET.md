---
cut_id: home-concorde-v2-full-page
status: visual-rejected-concorde-only-reset
concorde_source: docs/design-system/CONCORDE-V2-ZIP-SOURCE-MANIFEST.md
component_map: docs/design-system/HOME-CONCORDE-V2-FULL-PAGE-COMPONENT-MAP.md
source_ids: [HOME-GRILLME, HOME-REFERENCE, VMC-HELP-BUYER]
acceptance_criteria: [AC-HOME-01, AC-HOME-02, AC-HOME-03, AC-HOME-04]
---

# Decision Packet — Home VMC completa con Concorde V2

Julio autorizó el 2026-10-13 trasladar literalmente la **jerarquía** de la
referencia aprobada usando el Lego de Concorde, no una página de muestras.

- **AC-HOME-01:** hero y feed de actividad comparten la primera zona desktop.
- **AC-HOME-02:** existen dos rails de tiendas, un banner secundario y categorías
  antes del resumen de tiendas.
- **AC-HOME-03:** header, sidebar, banners, rails y categorías son piezas V2
  completas o composición local permitida por el Component Map.
- **AC-HOME-04:** preview desktop no tiene overflow horizontal, errores de
  compilación, lint ni imports directos de Concorde desde la ruta.

No se promueve a producción ni se crea una extensión de Concorde. Este paquete
queda sustituido por la regla Concorde-only: no autoriza composiciones visuales
locales. Cualquier card premium/fotográfica, feed de actividad o bloque que no
exista en Concorde se registra como brecha y requiere una solicitud explícita
de Julio antes de continuar.
