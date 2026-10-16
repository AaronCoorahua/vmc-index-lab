# Decision Packet v0 — Home / Corte 1 Shell

Tipo: council, por posible extensión de Concorde.

## Objetivo y alcance

Incluye Header, Sidebar desktop, navegación mobile y relación básica con el
viewport. No incluye hero, feed, cards, categorías, tiendas ni contenido
publicitario definitivo.

## Decisiones confirmadas

- Header de 64 px, sin buscador.
- Header y Sidebar parten de bloques Concorde reales.
- Sidebar visible durante el recorrido desktop.
- Mobile usa el drawer `SidebarMobile`; no se inventa bottom bar.
- Los snapshots anteriores no son baseline visual.

## Hipótesis visibles

- `position: sticky` puede satisfacer la persistencia desktop si no impide
  acceder al banner ni crea doble scroll.
- El placeholder canónico puede servir únicamente durante la prueba geométrica,
  no como aceptación final de publicidad.

## Pregunta que requiere decisión

¿Se autorizan dos iniciativas separadas `concorde-upgrade`?

1. Sidebar acepta contenido publicitario real mediante un slot, manteniendo su
   placeholder actual como fallback.
2. SidebarMobile completa foco inicial, trap, retorno al trigger e inactividad
   del panel cerrado.

No se solicita todavía cambiar radios, colores, iconos, ancho, animación ni
estructura de navegación.

## Criterios de aceptación del corte

- Header conserva exactamente 64 px y no presenta buscador.
- No hay clipping del acceso a 390, 768, 1024 y 1440 px.
- Desktop usa Sidebar completo; ningún fragmento se recrea manualmente.
- El contenido principal no queda debajo del Sidebar al expandir o colapsar.
- El comportamiento sticky no oculta la zona inferior ni crea scroll anidado
  sin justificación.
- Mobile abre y cierra el drawer mediante botón, backdrop y Escape.
- Antes de promoción, el foco entra al drawer, queda contenido, vuelve al
  trigger y no alcanza controles del panel cerrado.
- Teclado, foco visible y reducción de movimiento se verifican manualmente.
- Cualquier placeholder se etiqueta como tal y no se presenta como anuncio real.

## Evidencia requerida

- build, lint y ruta;
- capturas en los cuatro viewports;
- consola sin errores;
- overflow horizontal igual a cero;
- secuencia de teclado y foco;
- comparación contra los bloques canónicos;
- aceptación visual de Julio, sólo para el corte promocionable.

## Estado

El council autorizó un spike técnico timeboxed en `/qa/shell`, no una propuesta
del Home. Header, geometría y drawer pueden probarse con el placeholder siempre
que la evidencia diga `diagnóstico técnico — no propuesta visual`.

El Corte 1 permanece bloqueado para promoción hasta resolver publicidad real y
accesibilidad modal o hasta que Julio sustituya expresamente esas decisiones.

El spike fue ejecutado y documentado en
`docs/delivery/HOME-SHELL-SPIKE-EVIDENCE.md`. La geometría expandida, los 64 px
del Header, el sticky, el overflow y movimiento reducido pasan. El ciclo de
foco mobile falla objetivamente. El banner colapsado queda oculto conforme al
componente actual, pero producto aún no ha decidido si ese es el comportamiento
deseado; por tanto el estado continúa `GO WITH CHANGES`, no aceptación visual.

## Arbitraje siamés

VP Experiencia y VP Integridad emitieron `GO WITH CHANGES` para una secuencia C:

1. spike aislado con bloques completos, layout exterior y cero overlays;
2. medir largo/corto, sticky, colapso, scroll, overflow y drawer;
3. tramitar las dos extensiones por separado;
4. promover a `/` sólo después de cerrar los gaps.

El spike no requiere aceptación visual de Julio y no debe mostrarse como una
iteración del Home.
