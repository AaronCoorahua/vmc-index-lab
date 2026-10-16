---
cut_id: home-index-rebase-v1
status: concorde-fit-visual-rejected
concorde_source: config/concorde-source.json
discovery_brief: docs/product/HOME-LIVE-INDEX-V1-REBASE-BRIEF.md
component_map: docs/design-system/HOME-INDEX-REBASE-V1-COMPONENT-MAP.md
snapshot_manifest: docs/product/HOME-INDEX-SNAPSHOT-2026-10-13.json
source_ids: [VMC-WEB-HOME, VMC-HELP-BUYER, VMC-PUBLISH-CAR, HOME-GRILLME, HOME-REFERENCE]
acceptance_criteria: [AC-IR-01, AC-IR-02, AC-IR-03, AC-IR-04, AC-IR-05, AC-IR-06, AC-IR-07]
---

# Decision Packet — Home Index rebase / V1

## Objetivo y alcance

V1 traduce el Index vigente hacia una Home de descubrimiento para compradores.
La primera zona presenta descubrimiento y actividad verificable; la campaña de
publicar/vender se conserva como contenido secundario después de los rails.

Incluido: la primera pantalla de Home como corte vertical —oportunidad con
imagen documentada, actividad secundaria, modalidades y continuación hacia el
primer rail—; después, dos rails de tiendas capturadas, categorías oficiales,
fallback de Centro de Ayuda, campañas preservadas como destinos y cierre con
Centro de Ayuda/footer.

Fuera de alcance: login, navegación funcional de shell/cards, favoritos,
anuncios reales, assets remotos sin registro, datos en vivo, card destacada,
categorías con imagen, publicación funcional y cambios a Concorde.

## Decisiones

### Confirmadas

- Julio eligió **descubrimiento primero** el 2026-10-13.
- Header sin buscador ni aumento de altura.
- Sidebar, publicidad como espacio, Centro de Ayuda y footer se preservan.
- La QA visual muestra dos rails: Pacífico y SubasCars.
- El feed inicia con el fallback oficial de Centro de Ayuda. Sólo muestra una
  actividad cuando el manifest cumple todos sus criterios de elegibilidad.
- Campaña `landing-subascars` y Subaspass conservan destino, pero quedan tras
  los rails y no dominan el primer vistazo.
- La oportunidad domina visualmente la primera pantalla mediante el fixture
  local documentado; no se presenta como inventario en vivo. La actividad
  ocupa una columna secundaria y las modalidades quedan integradas a ese foco,
  no como dos muestras aisladas de componente.
- El lienzo no exhibe copy de implementación: "V1", "QA", "snapshot",
  "contenido estático" o explicaciones de que una pieza es inerte. La
  trazabilidad permanece en este Packet y en la evidencia.

### Hipótesis visibles

- Ninguna actividad se muestra como actual mientras no haya evento verificable.
- La publicidad Sidebar conserva placeholder canónico, no una campaña real.

### Preguntas abiertas

- Procedencia, hash y permiso de assets de campañas e inventario.
- Matriz de destino/detalle por oferta y adaptación accesible de OfferCard.
- Extensiones de Sidebar, OfferCard premium y categorías con imagen: V2 o
  `concorde-upgrade`, no parte de este Packet.

### Sustituidas

- La campaña de captación como hero principal fue descartada para V1; permanece
  secundaria sin perder su destino.
- El experimento `home-discovery-v1` no es baseline ni autorización de este
  corte.

## Contratos

- Datos: el snapshot fechado gobierna esta V1; no es un feed vivo.
- Component Map: referencia obligatoria del rebase y de cada brecha.
- Clase: `concorde-fit` planificada. El contrato no se activa hasta que exista
  la ruta QA y sus archivos reales.
- Foundations: sólo componentes públicos y tokens del pin Concorde. CSS futuro
  limitado a layout, responsive y placement de assets con procedencia.
- Referencia: la imagen de Julio dirige jerarquía; no transfiere estilos.
- Responsive/navegación: la V1 QA es estática; no declara navegación preservada
  donde la API pública no la expone.

## Aceptación

- **AC-IR-01:** primera zona comunica descubrimiento comprador; no contiene
  buscador ni eleva publicar/vender a hero; tiene una oportunidad visual
  dominante, actividad secundaria y una continuación hacia el inventario.
- **AC-IR-02:** Header y Sidebar se usan completos por adaptador; publicidad,
  Centro de Ayuda y footer siguen presentes.
- **AC-IR-03:** hay dos rails del snapshot; OfferCards permanecen estáticas
  hasta que detalle, teclado y favorito tengan contrato.
- **AC-IR-04:** actividad sólo aparece con datos elegibles; de lo contrario el
  feed enlaza al Centro de Ayuda oficial.
- **AC-IR-05:** no entra asset remoto, anuncio, monto, contador o fecha sin
  procedencia, hash y vigencia documentadas.
- **AC-IR-06:** no hay overflow a 390, 768, 1024 y 1440 px; rail, foco y
  reduced motion se prueban antes de revisión visual de Julio.
- **AC-IR-07:** la vista de producto no muestra lenguaje de laboratorio ni
  restricciones técnicas. La captura desktop y mobile de la primera pantalla
  se revisa antes de modificar secciones posteriores.

La ruta QA usa únicamente fixtures locales con SHA-256; las URLs de VMC quedan
como referencia externa de sólo lectura. Después aplican gates de Concorde,
procedencia, estilos, ruta, consola, viewport y revisión humana.

## Resultado técnico — 2026-10-13

- Gates de Concorde, contrato, procedencia, estilos, build, lint y rutas: PASS.
- La ruta QA es `/qa/home-index-rebase`.
- No hay errores/warnings de consola ni overflow horizontal en 390, 768, 1024
  o 1440 px.
- Ese resultado técnico no sustituyó el gate visual. Julio rechazó esa primera
  QA por parecer storybook; se inicia un nuevo corte vertical de primera
  pantalla bajo `docs/architecture/HOME-V1-VISUAL-REVIEW-GATE.md`. No promueve
  la ruta al Home productivo ni cierra las brechas de sistema registradas.

## Rechazo visual y bloqueo — 2026-10-13

Julio rechazó también la recuperación de primera pantalla: sigue percibiéndose
como una galería/storybook. La evidencia automatizada PASS sólo acredita
estructura mínima, asset local, consola y overflow; no acredita que la
composición se lea como una Home.

No se autoriza más código visible en este Packet hasta que exista un **Visual
Intent Packet** aprobado para el primer fold. Debe definir, antes de CSS:

1. el hero como una superficie unificada, no tres columnas independientes;
2. proporción hero/actividad, densidad y contenido visible en desktop y móvil;
3. la continuidad visible hacia el primer rail;
4. qué candidatos Concorde satisfacen cada zona y qué gap exige `system-candidate`
   o un `concorde-upgrade` autorizado.

La implementación posterior queda limitada exclusivamente a ese fold. Rails,
campañas, categorías y cierre no pueden modificarse hasta su aceptación visual.
