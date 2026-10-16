# Evidencia — Home Index / primer fold V2

## Estado

El corte `home-index-first-fold-v2` está técnicamente verificado y espera sólo
la aceptación visual de Julio. No está promovido a producción ni autoriza
cambios posteriores del Home.

## Ejecución más reciente

- Fecha: 2026-10-13.
- Preview revisado: `http://localhost:3001/qa/home-index-rebase`.
- Evidencia visual: `evidence/home-index-rebase-2026-10-13T20-30-06-119Z/`.
- Resultado de captura: `PASS`.
- Concorde fijado: revisión `40d1be50206021157d9d6ad81327df8ba25486a4`,
  árbol `5d142a656dba74518e46b2c192cce946d15b075f`.

## Gates superados

- Build de producción, TypeScript, lint y rutas: `npm run verify` — PASS.
- Auditoría de diseño y límites de repositorio: PASS.
- Contrato `system-candidate`: PASS.
- Primer fold: PASS.
- Captura Playwright en 390×844 y 1440×900: asset visible, jerarquía desktop,
  rail continuo, sin overflow ni errores de consola.

## Ajuste posterior a la reauditoría

- Se reemplazó la marca recreada por el asset canónico de VMC, trazado a la
  revisión fijada de Concorde.
- Se retiraron los títulos genéricos de sección y las modalidades que quedaban
  recortadas dentro del hero.
- El rail comienza directamente con el patrón oficial `CardTitle`:
  `SubasCars · 4 ofertas`.

## Límite de la evidencia

Los checks automáticos prueban integración y criterios observables. No
sustituyen la aceptación de Julio sobre calidad visual, prioridad o dirección
de producto.
