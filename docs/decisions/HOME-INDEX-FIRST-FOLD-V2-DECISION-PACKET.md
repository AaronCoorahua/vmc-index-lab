---
cut_id: home-index-first-fold-v2
status: system-candidate-first-fold-authorized
concorde_source: config/concorde-source.json
discovery_brief: docs/product/HOME-LIVE-INDEX-V1-REBASE-BRIEF.md
component_map: docs/design-system/HOME-INDEX-FIRST-FOLD-V2-COMPONENT-MAP.md
visual_intent: docs/design-system/HOME-INDEX-FIRST-FOLD-VISUAL-INTENT.md
source_ids: [VMC-WEB-HOME, VMC-HELP-BUYER, HOME-GRILLME, HOME-REFERENCE]
acceptance_criteria: [AC-FF-01, AC-FF-02, AC-FF-03, AC-FF-04, AC-FF-05, AC-FF-06]
---

# Decision Packet — Home Index / primer fold V2

## Autorización y alcance

Julio autorizó el 2026-10-13 los candidatos locales `HomeOpportunityHero` y
`ActivityFeedPanel`. Son `system-candidate`: viven sólo en este laboratorio y
no modifican ni promueven Concorde.

Incluido: Header/Sidebar completos, hero, panel de actividad fallback y el
inicio del rail SubasCars. Excluido: segundo rail, campañas, categorías,
footer, navegación real, favoritos, publicidad real y cambios a Concorde.

## Aceptación observable

- **AC-FF-01:** desktop muestra exactamente dos superficies en la primera
  fila: hero y actividad; hero mide 2.2–2.6 veces el ancho de actividad.
- **AC-FF-02:** asset, H1 y CTA viven dentro del hero; no quedan como columnas
  o samples independientes. Las modalidades permanecen en la navegación de
  Concorde hasta contar con una franja oficial que no funcione como muestra.
- **AC-FF-03:** actividad contiene filas editoriales de fuente oficial; no
  afirma eventos vivos, horas ni ofertas sin fuente.
- **AC-FF-04:** el patrón oficial de tienda SubasCars empieza a máximo 32 px
  de la primera fila y declara sólo su nombre y “4 ofertas”; no añade títulos
  genéricos de sección. En desktop deja ver cuatro oportunidades. En móvil
  conserva el rail horizontal, con una oportunidad completa y continuidad
  disponible hacia la siguiente.
- **AC-FF-05:** sólo se usan componentes públicos de Concorde y las recetas
  exactas declaradas para los dos candidatos locales; no hay selectores de
  anatomía privada ni modificación de Concorde.
- **AC-FF-06:** no hay overflow, errores de consola ni foco dentro de controles
  inertes en 390, 768, 1024 y 1440 px; se entrega comparación visual antes de
  tocar cualquier sección posterior.

## Decisión posterior

La aceptación de Julio decide si se extiende este patrón a la segunda tienda y
resto del Home. Una promoción de cualquiera de los candidatos exige un nuevo
`concorde-upgrade` explícito; esta autorización no lo concede.
