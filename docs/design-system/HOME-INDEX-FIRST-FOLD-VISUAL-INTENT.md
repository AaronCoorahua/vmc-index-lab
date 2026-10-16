# Visual Intent Packet — Home Index / primer fold

Estado: **propuesta para decisión de Julio; no autoriza código todavía.**  
Fecha: 2026-10-13  
Referencia: `references/source/vmc-home-reference-approved.png`  
SHA-256 de referencia: `D9BD98ED6006BCF81A20F61F99327667198027CDE03C06600A63E3D30A601AA1`

## El problema que este Packet corrige

La referencia se había traducido como una lista de piezas: texto + imagen +
badge + cards. Esa lectura produjo una galería. Esta propuesta transfiere
solamente su **gramática espacial**:

- un foco de oportunidad contenido en una sola superficie;
- un panel de actividad claramente secundario, pero denso y escaneable;
- inventario que continúa inmediatamente después, no secciones flotantes;
- una navegación lateral útil y una publicidad inferior visible sin competir
  con el recorrido.

No transfiere sus colores, degradados, iconos, sombras, búsqueda ni datos.

## Decisiones ya confirmadas que este blueprint respeta

- Descubrimiento de compradores primero; publicar/vender es secundario.
- No hay buscador ni crecimiento innecesario del Header.
- Sidebar, publicidad, Centro de Ayuda y footer permanecen.
- Dos tiendas para el ejemplo: SubasCars y Pacífico.
- Las cards pertenecen a rails por tienda; una card principal lleva al detalle
  cuando exista contrato de interacción.
- Actividad urgente sólo usa datos verificables; mientras tanto usa contenido
  oficial de ayuda/blog correctamente capturado, no falsos eventos.

## Blueprint desktop (1440 px)

| Zona | Proporción y posición | Qué debe leerse | Contenido permitido |
| --- | --- | --- | --- |
| Shell | Header compacto de 64 px; Sidebar completo de 226 px, persistente | VMC antes que laboratorio | `Header` + `Sidebar` completos; no reconstruir internos. |
| Foco principal | 68–72 % del ancho disponible, 360–400 px de alto | **Una oportunidad por descubrir** | Imagen fixture documentada, H1, descripción breve, CTA y modalidades integrados en la misma superficie. No son tres columnas ni tres cards consecutivas. |
| Actividad | 28–32 % del ancho, misma altura del foco | “qué ocurre / qué viene” en lectura vertical rápida | 3–5 filas sólo con fuente verificable. Sin eventos elegibles: 2–3 accesos editoriales de Centro de Ayuda/blog, cada uno con título y enlace fuente. |
| Continuidad | 24–32 px después de la fila principal | “hay inventario para seguir” | Título de la primera tienda y rail. En desktop se deben ver al menos 3 cards completas y parte de una cuarta; para el snapshot actual, SubasCars provee las primeras 4. |
| Segunda tienda | Después del primer rail, fuera de la validación inicial | Especialización por tienda | Rail Pacífico; no se implementa hasta aceptar las cuatro zonas anteriores. |

La regla visual es simple: si se ocultan los textos menores, el ojo debe seguir
**hero → actividad → rail**. Si cada elemento parece poder moverse a un
storybook sin alterar el resultado, el fold está mal compuesto.

## Blueprint mobile (390 px)

| Orden | Requisito |
| --- | --- |
| 1. Header | Conserva marca y acceso; no añade buscador. |
| 2. Hero | Una única superficie compacta: H1, copy breve, imagen integrada y CTA. La imagen no puede iniciar una sección independiente después de una larga introducción. |
| 3. Modalidades | Franja contextual al pie del hero o inmediatamente después; no dos muestras aisladas que empujen el rail fuera de la lectura inicial. |
| 4. Actividad | Una vista resumida con una fila anclada y una continuación; al tocar/abrir se expande en V2. |
| 5. Rail | Debe verse una card completa y parte de la siguiente para comunicar desplazamiento horizontal. |

## Contact sheet de Concorde: decisiones por zona

| Necesidad | Pieza verificada | Veredicto | Por qué |
| --- | --- | --- |
| Header | `Header` | reutilizar | Bloque completo, compacto, sin buscador. |
| Sidebar y slot inferior | `Sidebar` | reutilizar con gap funcional conocido | Conserva bloque y banner canónico; rutas/subítems y anuncio real siguen fuera del corte. |
| CTA | `Button` | reutilizar | Resuelve acción dentro de una composición, no el hero completo. |
| Modalidades | `OfferType` | reutilizar | Válida como franja contextual; inválida como piezas principales del hero. |
| Estado de fila | `BadgeStatus` | reutilizar condicionado | Sólo para estado comprobado; no inventa actividad. |
| Rail normal | `OfferCard` | reutilizar condicionado | Sirve para oportunidades normales; no para hero ni card comercial destacada. |
| Título de tienda | `CardTitle` | reutilizar | Encabezado de rail. |
| Hero/superficie de oportunidad | Ninguna | **gap** | `Homepage` es un canvas fijo con placeholders y `OfferCard` mide 170×232; ninguno contiene copy, asset, CTA y modalidades como una experiencia. |
| Panel/feed de actividad | Ninguna | **gap** | No hay item/feed público para filas escaneables, fallback editorial o estado fijado. |
| Rail responsive con abundancia | `AuctioneerSection` interno | no reutilizar | Es fijo a 766×352, no está expuesto por el adaptador y su composición no responde al Home. |

## Decisión requerida antes de código

La alternativa de “sólo layout neutro alrededor de los componentes existentes”
ya fue probada y rechazada. Para cumplir este blueprint sin tocar el repo de
Concorde se necesita autorización explícita para crear **dos candidatos locales
V2**, derivados de sus tokens y componentes públicos:

1. `HomeOpportunityHero`: superficie de composición que integra asset, copy,
   CTA y `OfferType`; no altera la anatomía de `Button` ni `OfferType`.
2. `ActivityFeedPanel`: superficie con filas de actividad/fallback editorial;
   las filas siempre exigen fuente, fecha de captura y destino.

Alternativas consideradas:

- Usar `Homepage`: descartado por canvas fijo y placeholders.
- Agrandar o envolver `OfferCard`: descartado; simula una variante nueva y no
  resuelve la anatomía del hero.
- Construir hero/feed con divs neutros: descartado; fue el origen del resultado
  storybook.
- Modificar Concorde ahora: no procede sin un `concorde-upgrade` de Julio.

La recomendación de los siameses es autorizar los candidatos **dentro de este
laboratorio**, como `system-candidate`, y evaluar su promoción a Concorde sólo
después de aceptación visual.

## Criterios de aceptación antes de implementar el segundo rail

1. En la captura desktop, hero y actividad comparten una fila y forman dos
   superficies, no tres columnas independientes.
2. Hero ocupa aproximadamente 2.2–2.6 veces el ancho del panel de actividad.
3. El inicio del rail queda visible a menos de 32 px bajo la fila principal y
   expone tres cards completas más parte de una cuarta.
4. En móvil, imagen, copy y CTA pertenecen al mismo hero; la primera card del
   rail aparece con continuidad horizontal visible.
5. No hay copy QA, datos falsamente vivos ni assets sin procedencia.
6. La revisión lado a lado referencia → blueprint → render recibe una decisión
   humana de Julio. Sólo después se habilita segunda tienda, campaña, categorías
   y cierre.

## Estado del corte

Este documento reemplaza cualquier criterio ambiguo como “dominante” o
“integrado” por relaciones observables. Mientras no exista la decisión de
autorización indicada arriba, `home-index-rebase-v1` permanece bloqueado.
