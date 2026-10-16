# Evidencia — spike técnico del shell Home

Fecha: 2026-10-12

Ruta: `/qa/shell`
Etiqueta obligatoria: `diagnóstico técnico — no propuesta visual`

## Veredicto

`GO WITH CHANGES` para continuar el trabajo de arquitectura. `NO-GO` para
promover este shell a la Home visible.

El spike confirma que Header y Sidebar pueden consumirse desde Concorde sin
recrear su anatomía. También confirma una brecha accesible de la biblioteca y
una decisión de producto pendiente que no deben ocultarse con CSS local: el
comportamiento modal del drawer y qué debe ocurrir con la publicidad al
colapsar.

## Ejecución

- Concorde: `40d1be50206021157d9d6ad81327df8ba25486a4`.
- Fuente del run: commit limpio
  `bd10c3855efcf33a6acd276737b5f49c2c89ee60`.
- Lockfile SHA-256:
  `a3a2531bd8715e1a49d88bb19f9b281131a3d7c20148ef4e98bbe9fedb0809f1`.
- Build productivo Next: `IUrF4pKW07pAfC0F7MpNd`.
- Navegador: Microsoft Edge instalado, conducido por `playwright-core`.
  Versión del run: `155.0.4283.45`.
- Viewports: 390×844, 768×1024, 1024×768 y 1440×900.
- Estados: página larga y corta, inicio y fin de scroll, Sidebar expandido y
  colapsado, drawer cerrado y abierto, teclado y preferencia de movimiento
  reducido.
- Datos completos: `evidence/shell-spike-20261012-c1/metrics.json`.
- Instalación limpia: `npm ci`, PASS, 146 paquetes instalados.
- Gate del repositorio: `npm run verify`, PASS; revisión Concorde, fronteras,
  build, TypeScript, lint y rutas `/` y `/qa/shell`.
- Dependencias: `npm audit --audit-level=low`, PASS, cero vulnerabilidades.

## Resultados objetivos

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Header | PASS | altura 64 px en los cuatro viewports; sin buscador |
| Sidebar expandido | PASS técnico | 226 px de ancho; `top: 0` al inicio y al final del documento |
| Publicidad expandida | PASS técnico | banner 200×264 completamente visible: termina en y=716/768 y y=848/900 |
| Overflow horizontal | PASS | `scrollWidth === clientWidth` en los cuatro viewports |
| Consola y recursos | PASS | cero errores y cero recursos fallidos |
| Movimiento reducido | PASS | transición computada `0s` en Sidebar y drawer |
| Geometría del drawer | PASS | panel 226 px, contenido dentro de 390×844 y 768×1024 |
| Publicidad al colapsar | DECISIÓN PENDIENTE | sidebar 76 px; el placeholder fijo conserva 200×264 y queda oculto/desplazado, coherente con el comportamiento canónico pero sin una regla de producto aprobada |
| Panel mobile cerrado | FAIL | sus controles reciben foco aunque el panel está bajo `aria-hidden` |
| Foco al abrir | FAIL | permanece en `Abrir menú`; no entra al drawer |
| Trap de foco | FAIL | la secuencia de Tab alcanza `Ingresa` y otros elementos externos |
| Cierre con Escape | PASS parcial | cierra, pero el foco permanece en un control oculto del panel y no vuelve al trigger |

## Interpretación

El layout exterior permitido resuelve la relación entre contenido, Header y
Sidebar sin elevar el Header ni crear overflow. La persistencia desktop también
funciona con scroll del documento y sin scroll anidado.

El placeholder de publicidad sólo se presenta completo en estado expandido. Al
colapsar desaparece de la experiencia, comportamiento compatible con el bloque
canónico actual. Esto no se clasifica como defecto de Concorde: el requisito de
producto aún debe decidir entre ocultarlo, mostrar un teaser reducido o impedir
el colapso en el contexto publicitario. La futura API sí debe definir
explícitamente ambos estados; no basta con exponer un nodo arbitrario.

El drawer mobile no puede aprobarse como navegación accesible hasta retirar los
controles cerrados del orden de tabulación, mover el foco al abrir, contenerlo
mientras está abierto y devolverlo al trigger al cerrar.

## Evidencia visual

- `desktop-1024x768-long-top.png` y `desktop-1024x768-long-bottom.png`:
  persistencia expandida.
- `desktop-1440x900-collapsed.png`: clipping del banner al colapsar.
- `mobile-390x844-drawer-open.png`: geometría del drawer; la secuencia de foco
  está en `metrics.json`.

Las capturas son diagnóstico interno. No constituyen una propuesta del Home ni
una aceptación visual.

El recolector emitió seis assertions PASS y cuatro FAIL, por lo que
`promotionGate` es `FAIL`. `npm run gate:shell` devuelve un código de error
mientras estas condiciones bloqueantes permanezcan.

## Gate siguiente

Se requieren dos autorizaciones `concorde-upgrade`, tratadas por separado:

1. contrato público de publicidad para Sidebar, con fallback, después de que
   Julio defina qué debe ocurrir al colapsar;
2. patrón modal accesible para SidebarMobile.

Hasta cerrar ambas, `/` permanece neutral y `/qa/shell` continúa aislado.
