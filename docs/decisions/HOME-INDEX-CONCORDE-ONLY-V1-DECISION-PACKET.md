---
cut_id: home-index-concorde-only-v1
status: system-candidate-in-progress
concorde_source: config/concorde-v2-source.json
component_map: docs/design-system/HOME-INDEX-CONCORDE-ONLY-V1-COMPONENT-MAP.md
source_ids: [HOME-GRILLME, HOME-REFERENCE, VMC-HELP-BUYER]
acceptance_criteria: [AC-SC-01, AC-SC-02, AC-SC-03, AC-SC-04, AC-SC-05]
---

# Decision Packet — Home Index System Candidate

- **AC-SC-01:** A 1440 px la composición total se centra en un canvas de
  1024 px: Sidebar oficial de 226 px y Header oficial de 798 px. El primer
  bloque dispone hero fotográfico y feed de actividad en paralelo. El hero
  utiliza glass y controles anterior/siguiente; el contenido del Sidebar queda
  visualmente separado debajo de su propia cabecera y el anuncio lateral
  permanece visible.
- **AC-SC-02:** Tras la primera pantalla hay un único filmstrip de lotes,
  campaña editorial de maquinaria, categorías visuales y directorio de dos
  tiendas; no hay un segundo catálogo que replique el mismo rail.
- **AC-SC-03:** OfferCard, BadgeStatus, Button, CardTitle, CategoryCard y
  ProfileButton se consumen por su API pública y sin selectores privados.
- **AC-SC-04:** Los tres candidatos locales autorizados resuelven sólo las
  brechas hero/feed/campaña; usan exclusivamente tokens `--vmc-*` auditados y
  assets fixture declarados. Header y Sidebar se usan como bloques completos,
  sin modificar Concorde.
- **AC-SC-05:** Se cargan Plus Jakarta Sans y Roboto Mono, no hay overflow
  horizontal de página, los rails conservan scroll y las superficies candidatas
  tienen foco/semántica verificable.

Alcance: ruta QA, su layout de fuentes, CSS estructural, adapter y tres
candidatos locales explicitamente autorizados por Julio para la composición de
la referencia. Se mantienen live/negotiable de OfferCard. No se introduce ni
se modifica un componente core de Concorde.

El blueprint espacial proviene de la referencia primaria de Julio: hero/feed,
un rail, campaña, categorías y directorio. La evidencia técnica no implica la
aceptación visual de Julio.
