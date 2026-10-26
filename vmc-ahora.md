# VMC ahora

VMC ahora es el feed de novedades del Index (`/qa/home-index-rebase`): entradas cortas tipo post que van apareciendo mientras la persona está en la página. No son notificaciones push ni ventanas emergentes.

Este documento explica las reglas y dónde están en el código. La versión para revisar con el equipo está en `escenarios.pdf` (completa) y `escenarios-short.pdf` (corta).

Estado: las reglas marcadas como propuesta siguen pendientes de aprobación de Julio. Las propuestas y los registros son simulados hasta que se conecten los reales (Francis).

## Dónde está el código

| Archivo | Qué hace |
|---|---|
| `apps/index-lab/app/qa/home-index-rebase/feedPlan.ts` | Reglas y fórmulas. Módulo puro, sin React: arma el plan del día, los textos y los contadores. |
| `apps/index-lab/app/qa/home-index-rebase/VmcAhora.tsx` | El feed: reloj de la demo, vistas (timeline, X en móvil, listado, franja) y panel de QA del reloj. |
| `apps/index-lab/app/qa/home-index-rebase/HomeIndexBlock.tsx` | Controles de QA (`QA_CONTROLS`) que cambian el escenario, la velocidad y el diseño. |
| `scripts/escenarios-pdf.mjs` | Genera `escenarios.pdf` con las mismas fórmulas de `feedPlan.ts`. |
| `scripts/escenarios-short-pdf.mjs` | Genera `escenarios-short.pdf`. |

Si cambias una fórmula en `feedPlan.ts`, la demo y los PDF cambian juntos. Para regenerar los PDF:

```
node scripts/escenarios-pdf.mjs
node scripts/escenarios-short-pdf.mjs
```

## Variables

| Variable | Qué cuenta |
|---|---|
| `V` | Ofertas en vivo publicadas |
| `N` | Ofertas negociables publicadas (las que reciben propuestas) |
| `T` | `V + N`, todas las ofertas publicadas, de cualquier tipo de bien |
| `A` | Actividad del día: rotación + propuestas + registros + nuevas |
| Día | De 9:00 a 24:00 (`DAY_START`, `DAY_MIN`) |

`T` decide la rotación y los registros. `N` decide las propuestas. Las propuestas de los compradores no cuentan como ofertas.

## Tipos de entrada

| `kind` | Autor | Ejemplo de texto | Hoy | Acciones |
|---|---|---|---|---|
| `nueva` | La empresa | Publicó una nueva oferta en vivo: Toyota Yaris 2022 | Real | Me gusta, participantes, visitas, compartir |
| `nueva-subascars` | SubasCars | Publicó una nueva oferta negociable: Toyota Hilux 2019 | Real | Me gusta, negociaciones, visitas, compartir |
| `rotacion` | Dueño de la oferta | Disponible en vivo: Kia Rio 2020 | Real | Igual que la nueva, según su tipo |
| `propuesta` | VMC | Se ha enviado una propuesta a la OFERTA 67942 | Simulada | Visitas, compartir |
| `registro` | VMC | Se registró un nuevo usuario en VMC | Simulado | Visitas, compartir |
| `ad-valoriza` | VMC | Valoriza tu auto en VMC | Contenido de VMC | Botón Valorizar, visitas, compartir |
| `ad-publica` | VMC | Publica tu auto en VMC y recibe ofertas | Contenido de VMC | Botón Publicar, visitas, compartir |
| `blog` | Blog VMC | Cómo funciona una subasta en VMC, paso a paso | Contenido de VMC | Botón Leer, visitas, compartir |

El aviso de propuesta no tiene enlace y dice que la propuesta se envió, no que se aceptó.

## Reglas

1. Entra una entrada simulada cada 45 segundos (`GAP_S`). Una acción real entra al momento y la cuenta de 45 segundos empieza desde ella.
2. Al abrir la página, la primera entrada es una publicidad: la que ya estaba entre las últimas o, si no hay, la próxima del plan. Sale como "Ahora", sin el aviso de nuevo, y no cuenta para los 45 segundos. En producción se propone alternar las dos publicidades en cada visita.
3. Sin negociables no hay avisos de propuesta. Ese espacio pasa al blog (+2 entradas).
4. Sin ofertas no se simula nada: ni propuestas ni registros.
5. La rotación muestra la oferta como disponible, nunca como nueva. Una oferta publicada hoy no rota ese día.
6. Por privacidad, los avisos de propuestas y registros no muestran quién fue.
7. La propuesta simulada usa un código de oferta al azar (que no choca con uno real) y una foto genérica. No apunta a ninguna oferta del feed, así que no cambia ningún contador.
8. Cada hecho real reemplaza a uno simulado del mismo tipo: simulados del día = máx(0, objetivo − reales). Los reales no tienen tope y nunca se ocultan.
9. Como mucho 2 propuestas al día por cada negociable publicada, por eso P(N) nunca pasa de 2N.
10. Nunca dos entradas de publicidad o blog seguidas si hay actividad en los 30 minutos siguientes.
11. Visitas, me gusta y participantes empiezan en 0 al publicarse y crecen con el tiempo.

## Fórmulas

```
R(T)  rotaciones al día      0 si T = 0
                             3T si 1 ≤ T ≤ 5      (cada oferta 3 veces, 5 h o más entre una y otra)
                             T si 6 ≤ T ≤ 30      (cada oferta una vez al día)
                             30 si T > 30         (por prioridad; el resto, al día siguiente)

P(N)  propuestas al día      mín(2N, tope)
      tope                   0 si N = 0, 5 si 1 ≤ N ≤ 4, 8 si 5 ≤ N ≤ 11, 12 si N ≥ 12

U(T)  registros al día       0 si T = 0, si no mín(6, 1 + ⌊T / 4⌋)

nuevas                       en la demo: con T ≥ 6, una en vivo y una negociable

A                            R + P + U + nuevas
Pub   publicidad + blog      mín(15, máx(6, ⌈A / 2⌉)), más 2 de blog si N = 0
Blog                         un tercio de Pub (el resto alterna las dos publicidades)

visitas(t)                   tope × (1 − e^(−t / 6 h))
me gusta, participantes      4 % a 8 % de las visitas
```

Cada tipo se reparte parejo entre las 9:00 y las 24:00: una rotación cada `900 / R` minutos, una propuesta cada `900 / P` minutos, y así.

Funciones en `feedPlan.ts`: `rotationPerDay`, `rotationCap`, `proposalsPerDay`, `proposalMax`, `registrosPerDay`, `newPerDay`, `promoPerDay`, `counts`, `mockupsLeft`, `offerStats`.

## Cómo se arma el día

`planDay(V, N)` devuelve la lista de entradas del día ordenada por hora:

1. Las ofertas nuevas: la de la empresa a media mañana y la de SubasCars a media tarde.
2. La rotación: ofertas que ya estaban publicadas, intercaladas en vivo y negociables en proporción para que no salgan cinco seguidas del mismo tipo.
3. Las propuestas simuladas, con código al azar.
4. Los registros, la publicidad (alternando las dos) y el blog, cada tipo repartido parejo en el día.
5. Se ordena por hora. Si quedan dos de publicidad o blog seguidas y hay actividad en los 30 minutos siguientes, esa actividad se adelanta entre las dos.
6. Las negociaciones de cada oferta: las que ya tenía más las propuestas reales del día.

`checkPlan(plan)` revisa el resultado (lo usa el PDF).

## Reloj de la demo

El estado vive en un store del módulo `VmcAhora.tsx` (`useSyncExternalStore`). Hay un solo reloj para toda la página, así todas las vistas muestran el mismo feed.

- El tiempo es simulado y avanza `TICK_MS × velocidad`. A ×10, los 45 segundos se cumplen en 4,5 segundos reales y los "hace X min" también corren diez veces más rápido.
- Al abrir la página ya hay 8 entradas (`BACKLOG`) y la publicidad va primero (regla 2).
- Cada 45 segundos simulados entra la siguiente entrada del plan. El plan se repite cuando termina.
- `simulateRealAction()` mete una acción real (una propuesta si hay negociables; si no, un registro), reinicia los 45 segundos y descuenta el siguiente simulado del mismo tipo.
- Con el puntero encima del feed, el reloj se pausa.
- `setFeedConfig(escenario, velocidad)` y `setFeedDesign(diseño)` los llama `HomeIndexBlock` desde los controles de QA.

## Contadores

`describe(entrada, inventario, minutosDesdeQueSalió)` calcula los textos y los contadores en el momento de mostrar la entrada, así que los números suben mientras la entrada está en pantalla.

- Oferta nueva: su edad es el tiempo desde que salió su entrada. Empieza en 0 visitas, 0 me gusta y 0 participantes.
- Oferta en rotación: lleva `ageDays` días publicada, así que ya tiene visitas acumuladas.
- Tope de visitas por oferta: 120 a 500. Las muy buenas, 600 a 800.
- Publicidad y blog: llevan días publicados, entre 140 y 470 visitas.
- Propuestas y registros: empiezan en 0 y suben hasta 40 a 200.
- Negociaciones: solo cuentan las propuestas reales. Las simuladas nunca suman.
- En 0 se muestra solo el ícono, sin el número. Participantes en 0 dice "Sé el primero en participar"; negociaciones en 0, "Sin negociaciones aún".

## Colores

Son los de la card de Tipo de oferta (`COLORS` en `feedPlan.ts`):

| Tipo | Color |
|---|---|
| En vivo | `#C2410C` |
| Negociable y propuestas | `#00777A` |
| Lo demás (registros, publicidad, blog) | morado (`#7B5CE6`, `#3B1782`, `#4A2CE0`) |

La insignia y el detalle de cada entrada van del mismo color.

## Controles de QA

Están en "Abrir controles" (y en el panel de la vista móvil, que usa la misma lista `QA_CONTROLS`). Los de diseño solo cambian cómo se ve, no cuándo aparece cada entrada.

| Clave | Control | Opciones (la primera es la de por defecto) |
|---|---|---|
| `feedView` | VMC ahora | Timeline, Listado |
| `feedScenario` | Inventario | 0 ofertas, 1 negociable, 5 negociables, 3 + 2, 8 + 2, 10 negociables, 10 en vivo, 6 + 6, 15 + 15 (por defecto 8 + 2) |
| `feedSpeed` | Velocidad | ×1, ×10 |
| `feedAd` | Publicidad | Post, Tarjeta, Banner |
| `feedAdBadge` | Badge de publicidad | Sin badge, Sobre la foto, Insignia, En la hora |
| `feedViews` | Visualizaciones | Ojo (1,2 mil), Ojo y número (1,234), Ojo y palabra, Texto |
| `feedShare` | Compartir | Flecha y caja, Tres puntos, Avión |
| `feedActs` | Fila de acciones | Palabra completa ("1,234 visualizaciones" cuando solo hay visitas y compartir), Extremos, A la izquierda, A la derecha |
| `feedTags` | Insignias | Sin insignia (quita EN VIVO, NEGOCIABLE, BLOG… de todas las entradas), Con insignia |

El panel "VMC ahora · reloj" muestra cuánto falta para la próxima entrada simulada, el plan del día y el botón "Simular acción real".

La publicidad usa las fotos de `apps/index-lab/public/banners/vmc` y el botón de vidrio del banner principal (`va-glass`, copia de `hib-glass`), siempre sobre la foto.

## Para producción

La demo inventa el inventario (`buildInventory`) y reproduce el día comprimido. En producción:

1. El inventario (`V`, `N`, ofertas abiertas, días de publicadas) viene de la API, no de `buildInventory`.
2. Las nuevas ofertas, las propuestas y los registros reales entran cuando ocurren, desde un canal de eventos. Cada uno reinicia los 45 segundos y descuenta un simulado de su tipo.
3. Visitas, me gusta, participantes y negociaciones son los reales de la ficha de la oferta. `offerStats` es solo para la demo.
4. El plan sigue la hora real: la rotación y lo simulado se reparten entre las 9:00 y las 24:00.
5. Las ofertas que cierran dejan de rotar, y el plan que queda se recalcula cuando cambia `T`.
6. Cuando se conecten las propuestas y los registros reales, se apagan sus simulados.

## Pendiente con Julio

- Topes de propuestas: 5, 8 y 12 al día.
- Vueltas con 1 a 5 ofertas: 3 al día (con 5 ofertas, una por hora). Desde 6, una vez, como pidió Julio, lo que da un salto de 15 a 6 rotaciones.
- Qué mostrar sin ofertas: solo publicidad y blog, ocultar VMC ahora o poner "Pronto nuevas ofertas".
- "En vivo" en la cabecera solo cuando hay ofertas en vivo.
- Juntar propuestas y registros reales cuando llegan varios seguidos.
- Foto de la propuesta simulada: genérica o sin foto.
- Mismas palabras en el contador de la ficha ("ofertas", "propuestas") y de VMC ahora ("participantes", "negociaciones").
- Publicidad siempre primera al abrir, alternando las dos en cada visita.
