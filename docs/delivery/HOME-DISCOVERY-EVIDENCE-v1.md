# Evidencia — Home / Descubrimiento visual v1

Fecha: 2026-10-13  
Estado sistémico actual: **experimento técnico preservado; no es la V1 del Index**  
Aceptación visual/de producto: **pendiente de Julio**

## Alcance verificado

- Ruta QA: `/qa/home-discovery`.
- Corte visual estático: hero, feed demostrativo, dos rails por tienda, banner,
  categorías oficiales y resumen de tiendas.
- Fuera de alcance y no modificado: `/`, Header, Sidebar, navegación, datos
  conectados, favoritos, pagos y repositorios vecinos.

## Procedencia

- Commit inicial de trabajo: `b26d60f1b4d9a53b85093897c18a6c35a960f90b`.
- Estado inicial: worktree ya contenía los artefactos de migración, discovery,
  skills y cuarentena enumerados por `git status --short`; no se hizo stage ni
  commit por el migration gate vigente.
- Concorde: revisión `40d1be50206021157d9d6ad81327df8ba25486a4`; árbol
  `5d142a656dba74518e46b2c192cce946d15b075f`.
- Assets activos: `apps/index-lab/public/demo/inventory-{suv,excavator,forklift,steel}-v1.png`,
  fixtures generados localmente para esta maqueta. Sus hashes y los hashes de
  código, CSS, Decision Packet y script están en las métricas reproducibles.
- Contrato V1 (SHA-256):
  `9c93470e0532c7c5a2733a9b1368b39203db041ecb56f8ca7bdb40218ca2e182`.
- Capturas y métricas finales: artefacto reproducible ignorado
  `evidence/home-discovery-2026-10-13T17-13-20-655Z/`.

## Comandos y resultados

| Comando | Resultado |
| --- | --- |
| `npm run verify:technical` | PASS: fuente Concorde, auditoría, boundaries, build, TypeScript, lint y rutas. |
| `npm run readiness:v1` | PASS: no queda delta para `concorde-fit`. |
| `npm run verify` | PASS: contrato y corte `concorde-fit`. |
| `npm run evidence:home-discovery` | PASS: Edge en 390, 768, 1024 y 1440 px. |

La primera ejecución de `npm run verify` detectó una exportación duplicada de
`BadgeStatus` en el adapter. Se eliminó la duplicación; el segundo gate pasó.
La primera evidencia apuntó a un servidor previo y la segunda a un servidor de
desarrollo cuyo WebSocket HMR falla en headless. La evidencia final se tomó
contra `next start` de producción y pasó.

## Criterios de aceptación observados

| ID | Resultado | Evidencia |
| --- | --- | --- |
| AC-01 | PASS | La ruta QA no importa ni cambia Header/Sidebar; no presenta el shell como aprobado. |
| AC-02 | PASS | Feed estático con actividad destacada, próxima y fallback editorial, todos marcados Demo/Ejemplo. |
| AC-03 | PASS | Dos tiendas, rails con `OfferCard` `full` + `short`, y etiqueta persistente `Destacado · Ejemplo`. |
| AC-04 | PASS | 24 controles bajo wrappers `inert`; 0 aceptaron foco programático, la tabulación no entró a esos wrappers y un clic de usuario fue bloqueado en cada viewport. |
| AC-05 | PASS | `scrollWidth === clientWidth` en 390, 768, 1024 y 1440 px. |
| AC-06 | PASS técnico / pendiente humano | Asset con procedencia y hash; build, rutas, consola y cuatro capturas correctos. Julio debe aprobar la dirección visual. |

## Métricas de la captura final

- Consola: 0 errores y 0 recursos fallidos en los cuatro viewports.
- Artefactos finales (SHA-256): escritorio 1440
  `a73211edb7cc627147195ca68833e748f437971dd1e02c05bf323b6a85db4da9`; móvil
  390 `4381e59007529653b9d12e078abc2144b55e8bf998bf7c38c941c49fb467a670`.
- Movimiento reducido: `transitionDuration: 0s`, `animationName: none` en el
  `OfferCard` inspeccionado.
- Browser: Microsoft Edge 155.0.4283.45; Node v24.19.0; Windows 10.0.26200 x64.

## Siguiente decisión

Este reporte prueba sólo el experimento local. La V1 correcta debe tomar como
baseline el Index vigente de `https://www.vmcsubastas.com/`, contrastarlo con
la referencia de Julio y recién entonces proponer la traducción Concorde.
