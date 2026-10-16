# Evidencia — Home Index rebase / V1

Estado: **primera pantalla recuperada y lista para revisión visual de Julio;
no es aprobación de producto.**

## Alcance implementado

- Ruta QA creada: `apps/index-lab/app/qa/home-index-rebase`.
- Shell desktop compuesto con `Header` y `Sidebar` completos desde el
  adaptador Concorde.
- Primera zona de descubrimiento para compradores, fallback de Centro de Ayuda,
  dos rails estáticos (Pacífico y SubasCars), campaña secundaria, categorías,
  ayuda y footer.
- Datos proceden del snapshot local. Las imágenes son fixtures generados con
  procedencia existente; las URLs de VMC son sólo referencia externa de lectura.

## Recuperación de primera pantalla — 2026-10-13

Julio rechazó la QA anterior porque se percibía como storybook. Se corrigió el
corte sin añadir un componente nuevo a Concorde:

- Se eliminó del lienzo todo lenguaje de laboratorio: V1, QA, snapshot,
  contenido estático y explicaciones de límites técnicos.
- La primera pantalla ahora combina foco de oportunidad con imagen fixture
  documentada, actividad secundaria y modalidades; el primer rail continúa
  inmediatamente debajo.
- Se incorporó el gate
  `docs/architecture/HOME-V1-VISUAL-REVIEW-GATE.md` y la comprobación de
  estructura `npm run verify:home-first-fold`.
- Se añadió `npm run evidence:home-index-rebase`, que captura la primera
  pantalla en móvil y desktop antes de avanzar al resto de la Home.

El primer intento de evidencia falló correctamente: el selector elegía la
copia desktop oculta al medir móvil. Se reparó el selector para elegir sólo el
bloque visible y el segundo intento pasó. Es una reparación objetiva dentro
del límite automático; no se ocultó el fallo.

## Verificaciones ejecutadas

| Comando | Resultado |
| --- | --- |
| `npm run verify:concorde` | PASS; commit `40d1be50206021157d9d6ad81327df8ba25486a4`, tree `5d142a656dba74518e46b2c192cce946d15b075f` |
| `npm run verify:provenance` | PASS |
| `npm run verify:cut-contract` | PASS |
| `npm run verify:concorde-contract` | PASS después de alinear imports y props públicas |
| `npm run verify:styles` | PASS |
| `npm run verify` | PASS: build, lint, rutas, fronteras y `concorde-fit` |
| `npm run verify:home-first-fold` | PASS: composición mínima, asset local y ausencia de copy de laboratorio |
| `npm run evidence:home-index-rebase` | PASS: Edge local, 390×844 y 1440×900; consola limpia y sin overflow |

## Corrección autorizada del gate

El validador `scripts/verify-design-system.mjs` trata el valor
`var(--vmc-color-orange-400)` como un primitive raw porque su detección busca
la palabra `orange` dentro del nombre del token. El token existe en el CSS
fijado de Concorde; no es un color local.

Julio autorizó corregir el gate local. `hasRawVisualPrimitive` ahora excluye
una referencia exacta `var(--vmc-...)` antes de buscar primitives raw; un token
con nombre semántico como `orange` deja de producir un falso positivo. No se
modificó Concorde ni VMC.

## Evidencia de navegador

- Ruta verificada: `/qa/home-index-rebase`.
- Sin errores ni warnings de consola.
- `scrollWidth === clientWidth` en 390, 768, 1024 y 1440 px.
- El título de descubrimiento y el fallback de Centro de Ayuda aparecen en los
  cuatro tamaños.
- Los 12 controles internos de OfferCard están dentro de contenedores `inert`;
  cero quedan activos fuera de esa protección. Los links de Centro de Ayuda
  son los únicos destinos externos visibles del cuerpo V1.
- La QA quedó abierta como entregable local para la revisión humana.
- Evidencia de recuperación:
  `evidence/home-index-rebase-2026-10-13T19-51-48-469Z/`; incluye
  `mobile-390x844-first-fold.png`, `desktop-1440x900-first-fold.png` y
  `metrics.json` con hashes.

## Resultado y siguiente decisión

Commit base observado: `b26d60f`. Design Contract SHA-256 actualizado:
`68D266488FB8C9CECD774DC9A1E0586E0479EAB633C409E81FF3246E22C94C90`.

El corte cumple gates técnicos y el nuevo gate de primera pantalla. Julio debe
evaluar ahora la jerarquía, densidad y sensación de Home antes de extender
rails, campaña, categorías o el resto. Su reacción no cambia las brechas
conocidas de navegación, publicidad real, card destacada o categorías
fotográficas.
