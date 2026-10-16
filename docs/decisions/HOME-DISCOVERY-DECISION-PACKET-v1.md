---
cut_id: home-discovery-v1
status: concept-prototype-requires-current-index-rebase
concorde_source: config/concorde-source.json
discovery_brief: docs/product/HOME-DISCOVERY-BRIEF-v1.md
component_map: docs/design-system/HOME-DISCOVERY-COMPONENT-MAP-v1.md
source_ids: [VMC-WEB-HOME, VMC-TERMS, VMC-HELP-BUYER, HOME-GRILLME, HOME-REFERENCE]
acceptance_criteria: [AC-01, AC-02, AC-03, AC-04, AC-05, AC-06]
---

# Decision Packet — Home / Descubrimiento visual v1

## Caso y evidencia

- Decisión: crear una maqueta visual del cuerpo de la Home, sin navegación ni
  reglas comerciales funcionales.
- Motivo del council: la jerarquía de cards y el feed rozan modelo de negocio,
  mientras el shell y la navegación accesible de `OfferCard` permanecen
  bloqueados.
- Fuentes y restricciones: IDs del frontmatter; la imagen aprobada gobierna
  jerarquía, no estilos; Concorde gobierna piezas verificadas.
- Alternativas descartadas: simular rutas o datos en vivo, recrear OfferCard,
  modificar Concorde, o convertir el corte en una landing independiente.

## Debate adversarial

- VP Experiencia: avanzar con el cuerpo visual permite validar jerarquía,
  descubrimiento y densidad sin repetir GrillMe.
- VP Integridad: sólo es válido si los fixtures se identifican como demo, las
  cards no son interactivas y las brechas de Concorde no se esconden.
- Puntos de acuerdo V1: dos tiendas, rails, feed y banner compacto se
  componen con piezas Concorde; las categorías usan `CategoryCard` oficial sin
  añadir imágenes a su anatomía.
- Conflictos diferidos: variante comercial oficial, regla de pago, navegación
  completa de cards y promoción del shell.

## Arbitraje

- Decisión: aprobar el corte exclusivamente como maqueta visual en una ruta de
  QA; no se promueve a `/`.
- Trade-off: la jerarquía se expresa con tamaños públicos `full` y `short`, no
  con una variante premium inexistente.
- Condiciones obligatorias: no modificar repositorios vecinos; un único destino
  interactivo por categoría; assets con procedencia; cards y CTAs inertes;
  etiquetas persistentes `Demo` o `Ejemplo`.
- Señales para escalar: solicitud de navegación real, favoritos, pago,
  patrocinio, datos en vivo o una card mayor que `full`.

## Alcance y ownership

- Incluido: hero sobrio, feed demostrativo, rails de dos tiendas, banner
  compacto, `CategoryCard` oficial y resumen de tiendas.
- Excluido: Header/Sidebar, navegación, datos conectados, login, publicación,
  pagos, favoritos funcionales y cambios a Concorde.
- Ownership: código y fixtures locales exclusivamente dentro de
  `apps/index-lab`; la aceptación visual corresponde a Julio.

## Criterios de aceptación

- **AC-01:** el header no gana buscador ni altura adicional; el shell no se
  presenta como aprobado.
- **AC-02:** el feed comunica actividad demostrativa, próximo evento y fallback
  editorial sin simular datos reales.
- **AC-03:** se ven dos tiendas especializadas y sus rails; la jerarquía usa
  `full`/`short` y la etiqueta `Destacado · Ejemplo`.
- **AC-04:** cards, CTAs y categorías no anuncian navegación funcional; ningún
  control inerte recibe foco.
- **AC-05:** no hay overflow horizontal en 390, 768, 1024 y 1440 px; imágenes
  y contenido conservan jerarquía legible.
- **AC-06:** se registran procedencia/licencia de assets, build, rutas, consola,
  evidencia visual y aceptación humana separada.

## Entrega y gate

- Plan: implementar un único corte en una ruta QA, verificarlo, y sólo después
  pedir revisión visual de Julio.
- Gate histórico de integración: `npm run verify:technical`; promoción V1:
  `npm run readiness:v1` sin delta y después `npm run verify` como
  `concorde-fit`. Máximo dos reparaciones automáticas de fallos objetivos.
- Evidencia: commit/status inicial, comandos y exit codes, revisión/árbol
  Concorde, capturas por viewport y hashes de artefactos.
- Excepción vigente: Julio autorizó expresamente `home-discovery-v1` como
  ruta QA visual. La excepción queda registrada en `AGENTS.md`; no autoriza
  promoción a `/`, interacción funcional, cambios a Concorde ni cambios a
  repositorios vecinos.

## Observación de entrega — 2026-10-13

- La maqueta existe en `/qa/home-discovery` y no modifica `/`, Header, Sidebar
  ni Concorde.
- El gate técnico y las capturas reproducibles se registran en
  `docs/delivery/HOME-DISCOVERY-EVIDENCE-v1.md`.
- Resultado automático: integración técnica aprobada, pero no conformidad
  Concorde. El corte permanece como `concept-prototype` hasta completar V1.
  La aceptación visual y de producto continúa pendiente de Julio.

## Aprobación V1 — 2026-10-13

- Julio aprobó la propuesta
  `docs/design-system/HOME-DISCOVERY-V1-CONCORDE-FIT-PROPOSAL.md`.
- Se autoriza sustituir recetas visuales locales por composición y foundations
  verificadas, y exponer `BadgeStatus` desde el adapter local.
- No se autoriza una variante premium, un candidato nuevo, cambio a Concorde,
  V2 ni funcionalidad de navegación.

## Resultado V1 — 2026-10-13

- El pase técnico anterior comprobó una composición local con Concorde, pero
  Julio aclaró que no representa la V1 solicitada.
- La V1 real debe partir del Index vigente de `https://www.vmcsubastas.com/`,
  conservar su estructura y oportunidades reales donde corresponda, y aplicar
  la referencia como dirección de jerarquía con Concorde.
- Este Packet no autoriza llamar al experimento anterior `concorde-fit`, abrir
  V2 ni promoverlo como base visual.
