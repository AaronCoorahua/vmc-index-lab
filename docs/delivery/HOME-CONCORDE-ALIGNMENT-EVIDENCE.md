# Evidencia de alineación Concorde — 2026-10-13

Resultado técnico: PASS. Aceptación visual/producto: pendiente; el primer
pliegue fue refinado con Header global, Sidebar desprendido, hero fotográfico
con capas de vidrio y controles laterales, y feed a la derecha. La referencia
completa sigue pendiente de aceptación y de posteriores iteraciones.

Última evidencia de esta iteración: `evidence/home-index-rebase-2026-10-14T00-15-16-439Z/`.
El canvas desktop completo mide 1024 px y está centrado: Sidebar oficial de
226 px + Header/columna principal oficial de 798 px. El gate de primer pliegue
pasó en 1440×900 y 390×844: estructura, imagen local visible, jerarquía,
continuidad del rail, ausencia de overflow horizontal, consola limpia y
medición explícita del canvas. La captura se tomó contra el build de producción
local; `npm run build`, `npm run test:routes`, `npm run verify:home-first-fold`,
`npm run verify:concorde-contract`, `npm run verify:concorde-only`,
`npm run audit:design-system` y `npm run lint` también pasaron.

Fuente: `concorde-v2-registry-aligned-2026-10-13`, árbol
`31b86922bd412953d2a4dadb28dbe217c75c1a5606fc53a0c24ee7d479508291`.
Comparación de contenido oficial: OfferCard, BadgeStatus y CardTitle coinciden
tras normalizar BOM y fin de línea. Sus SHA-256 instalados:

- OfferCard: `56abf175e63989e82daf82b1d61834875cc914f82ff5388815022e880dfc1b1c`.
- BadgeStatus: `72c4339f9dab06b26ab2b17c36085904eb08c20a43780b5c1f97fad12582193d`.
- CardTitle: `2e9b3403cd7ad98a6205930391cef20f623cf3c01ce46302a7e6d9dd38ecb745`.

Artefactos: `evidence/concorde-alignment-1791933270538/` contiene capturas desktop
1440×900, mobile 390×844, métricas y hashes de capturas/fuentes/contrato.
Reproducción: `node scripts/capture-concorde-alignment-evidence.mjs`, con el
preview activo en `http://localhost:3001/qa/home-index-rebase`.

| Criterio | Evidencia |
| --- | --- |
| AC-CO-01 | Snapshot verificado; paleta computada de OfferCard `rgb(76, 30, 188)`. |
| AC-CO-02 | concorde-only, audit, boundaries y lint PASS; CSS estructural. |
| AC-CO-03 | No se renderiza ActivityCard como feed. Brecha abierta. |
| AC-CO-04 | Dos rails antes de campaña; categorías y resumen de vendedores al final. |
| AC-CO-05 | Familias Jakarta/Roboto cargadas; anuncio desktop visible; scroll de teclado móvil efectivo; sin overflow de documento. |

Build y pruebas de rutas: PASS. Consola: limpia en ambos tamaños. Favoritos:
el botón oficial alterna `aria-pressed` y etiqueta. Los ensayos fallidos previos
se conservan: revelaron la pieza desalineada y una medición prematura del scroll
nativo. No se borró trabajo histórico ni se tocó otro repositorio.

La validación móvil confirma contención/scroll, no una anatomía mobile final.
Los banners y las categorías actuales siguen siendo alternativas provisionales;
no satisfacen la anatomía fotográfica de la referencia. No se promociona la QA.
