---
initiative: vmc-home
active_cut: home-index-concorde-only-v1
status: system-candidate-in-progress
initiative_track: system-candidate
initiative_pipeline: v1-v2-design-initiative
home_status: shell-not-promoted
concorde_source: config/concorde-v2-source.json
active_discovery_brief: docs/product/HOME-LIVE-INDEX-V1-REBASE-BRIEF.md
active_component_map: docs/design-system/HOME-INDEX-CONCORDE-ONLY-V1-COMPONENT-MAP.md
active_decision_packet: docs/decisions/HOME-INDEX-CONCORDE-ONLY-V1-DECISION-PACKET.md
active_evidence_report: docs/delivery/HOME-CONCORDE-ALIGNMENT-EVIDENCE.md
active_design_contract: docs/design-contracts/home-index-concorde-only-v1.json
active_visual_intent: docs/design-system/HOME-INDEX-FIRST-FOLD-VISUAL-INTENT.md
source_ids: [VMC-WEB-HOME, VMC-TERMS, VMC-HELP-BUYER, HOME-GRILLME, HOME-REFERENCE]
acceptance_criteria: [AC-SC-01, AC-SC-02, AC-SC-03, AC-SC-04, AC-SC-05]
updated_at: 2026-10-13
---

# Estado actual

## Qué está activo

El corte activo es `home-index-concorde-only-v1`, una QA visual aislada que usa
bloques oficiales de Concorde V2 y tres candidatos locales autorizados por
Julio. `HomeOpportunityHero`, `ActivityFeedPanel` y `HomeCampaignBanner`
existen únicamente para las brechas documentadas de la referencia. El foco
sigue siendo descubrimiento para compradores y la implementación permanece
aislada en una ruta QA.

El experimento `home-discovery-v1` se conserva como `concept-prototype`
histórico; no es baseline ni candidato para V2. La V1 real parte del Index
vigente y traduce su jerarquía usando Concorde.

## Hechos vigentes

- La única app activa es `apps/index-lab`.
- Concorde se consume sólo mediante `@vmc/concorde-adapter`, fijado por el
  manifiesto V2 del corte.
- No se modifican ni se publican repositorios vecinos desde este laboratorio.
- La memoria, referencia, fuentes, Component Map y Decision Packet del Home
  ya existen y deben consultarse antes de reabrir el GrillMe.

## Contexto reutilizable del Home

- Decision Memory: `docs/product/HOME-DECISION-MEMORY.md`
- Reference Record: `docs/research/HOME-REFERENCE-RECORD.md`
- Source Register: `docs/product/BUSINESS-SOURCE-REGISTER.md`
- Component Map existente: `docs/design-system/HOME-SHELL-COMPONENT-MAP.md`
- Decision Packet existente: `docs/decisions/HOME-SHELL-DECISION-PACKET-v0.md`
- Evidence Report existente: `docs/delivery/HOME-SHELL-SPIKE-EVIDENCE.md`

Estos artefactos son contexto y linaje del Home. El Discovery Brief, Component
Map, Decision Packet y Evidence Report activos están declarados en el
frontmatter. Ninguno sustituye la aceptación visual de Julio.

## Estado del Home

El shell sigue sin promoción. Julio rechazó la fidelidad de la composición
anterior porque repetía una galería de bloques. El blueprint confirmado ahora
es: hero y feed en paralelo, un filmstrip de lotes, banner editorial ancho,
categorías visuales y resumen de dos tiendas. Las tres brechas que no cubre
Concorde se resuelven mediante candidatos locales de alcance explícito; la
evidencia técnica no implica aceptación visual.

## Siguiente gate

Verificar el snapshot alineado, fuentes cargadas, anuncio visible, composición
hero/feed, scroll horizontal de rail y ausencia de overflow. El mapa activo
registra zonas, candidatos y sus límites; la ruta no se presenta como baseline
sin aceptación visual de Julio.

Al cerrar o sustituir este corte, actualizar este archivo y el Decision Packet
afectado. No borrar decisiones sustituidas: marcar su reemplazo y enlazarlo.
