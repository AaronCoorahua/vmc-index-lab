# Discovery Brief — Home VMC v1

Estado: línea base `concept-prototype` disponible sólo en QA. Sirve para el
pase V1 — Concorde Fit; no autoriza funcionalidad, aprobación sistémica ni
promoción a producción.

## Objetivo y audiencia

- Objetivo de negocio: convertir la Home en un feed de descubrimiento de
  oportunidades, actividad y tiendas especializadas.
- Audiencia principal: compradores que exploran oportunidades actuales y
  próximas; secundariamente, empresas o vendedores que evalúan publicar.
- Tarea principal: entender qué está ocurriendo ahora, descubrir oportunidades
  relevantes y entrar al detalle de un lote.
- Problema observable: el Home no debe sentirse como una landing estática ni
  como un dashboard de contadores; debe facilitar descubrimiento con jerarquía.

## Evidencia de entrada

- Decision Memory: `docs/product/HOME-DECISION-MEMORY.md`.
- Reference Record: `docs/research/HOME-REFERENCE-RECORD.md`.
- Fuentes de negocio: `VMC-WEB-HOME`, `VMC-TERMS` y `VMC-HELP-BUYER` en
  `docs/product/BUSINESS-SOURCE-REGISTER.md`.
- Datos disponibles: fixtures demostrativas; no hay feed, inventario ni reglas
  comerciales conectados.

## Estado del conocimiento

### Confirmado

- Header sin buscador y sin aumento de altura.
- Feed lateral: evento fuerte fijado, después próximas subastas o novedades;
  fallback editorial si falta actividad.
- Oportunidades agrupadas por tienda; ejemplo con dos tiendas y rail horizontal.
- Cualquier card lleva al detalle.
- Hay card normal y oportunidad comercial más jerárquica dentro del mismo rail.
- Después de oportunidades existe espacio para banner secundario compacto,
  categorías con imágenes y resumen de tiendas.

### Hipótesis

- La jerarquía comercial puede representar promoción pagada.
- El ranking futuro puede personalizarse por interés.
- Blog o Centro de Ayuda puede suministrar fallback editorial.

### Ejemplos demostrativos

- Dos tiendas especializadas con inventario ficticio.
- Actividad, horarios, cierres y cards con etiqueta persistente `Demo` o
  `Ejemplo`; nunca aparentan actividad o urgencia real sin fuente conectada.
- Este corte se concentra en la Home visual: no requiere que un botón, CTA,
  card o tienda lleve a un destino todavía.

### Asset demostrativo aprobado

- `apps/index-lab/public/demo/inventory-{suv,excavator,forklift,steel}-v1.png`:
  fixtures individuales generados con la herramienta de imagen integrada el
  2026-10-13 para representar inventario ficticio. No incluyen datos conectados,
  licencia externa ni pretenden ser inventario de VMC. Se usan sólo como
  `imageSrc` público de `OfferCard` y como imágenes locales del corte.
- `apps/index-lab/public/demo/inventory-mosaic-v1.png`: fixture compuesto
  anterior preservado como historial visual; ya no es una dependencia de la
  maqueta activa.

### Preguntas abiertas que no bloquean este discovery

- Regla comercial definitiva de una oportunidad destacada.
- Fuente y contrato de datos para actividad, blog y próximas subastas.
- Si la jerarquía se resuelve localmente o requiere una variante oficial.
- Densidad y comportamiento final por breakpoint.

No se formulan nuevas preguntas a Julio: la memoria existente permite planificar
un corte demostrativo y las dudas restantes no se deben inventar como reglas.

## Señales de éxito

- Una persona identifica rápidamente actividad actual, próxima oportunidad y
  caminos de exploración.
- Las oportunidades se perciben como catálogo de tiendas, no una lista plana.
- La jerarquía comercial se entiende sin simular datos o políticas reales.
- La composición se apoya en Concorde y no copia estilos de la referencia.

## Alcance

- Incluido: definición del corte de descubrimiento, sus datos demostrativos y
  sus necesidades de componentes.
- Excluido: datos reales, personalización, reglas de pago, publicación real de
  autos, navegación real, modificación de Concorde y promoción del shell aún
  bloqueado.
- Siguiente corte: propuesta V1 — Concorde Fit. Debe resolver foundations,
  CSS local y brechas que el gate `npm run readiness:v1` reporte, sin cambiar
  todavía el modelo de negocio ni inventar un componente central.
