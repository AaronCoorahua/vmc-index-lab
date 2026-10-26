# VMC ahora

VMC ahora es el feed de novedades del Index (`/qa/home-index-rebase`). Muestra entradas cortas, parecidas a posts, que van apareciendo mientras la persona está en la página: ofertas publicadas, avisos de propuestas, nuevos usuarios, publicidad y artículos del blog. No son notificaciones push ni ventanas emergentes.

Este documento explica cómo funciona hoy la demo y dónde está cada cosa en el código. Lo que todavía no está hecho va al final, en "Todavía no implementado". Las mismas reglas, en formato presentación, están en `escenarios.pdf` (completa) y `eleccion.pdf` (corta).

Hoy las propuestas y los registros de usuarios son simulados: la demo los inventa hasta que se conecten los reales. Todo lo demás muestra contenido real o de VMC.

## Dónde está el código

| Archivo | Qué hace |
|---|---|
| `apps/index-lab/app/qa/home-index-rebase/feedPlan.ts` | Reglas y fórmulas. Módulo puro, sin React: arma el plan del día, los textos y los contadores. |
| `apps/index-lab/app/qa/home-index-rebase/VmcAhora.tsx` | El feed: reloj de la demo, vistas (timeline, X en móvil, listado, franja) y panel de QA del reloj. |
| `apps/index-lab/app/qa/home-index-rebase/HomeIndexBlock.tsx` | Controles de QA (`QA_CONTROLS`) que cambian el escenario, la velocidad y el diseño. |
| `scripts/escenarios-pdf.mjs` | Genera `escenarios.pdf` con las mismas fórmulas de `feedPlan.ts`. |
| `scripts/eleccion-pdf.mjs` | Genera `eleccion.pdf`, la versión corta. |

Si cambias una fórmula en `feedPlan.ts`, la demo y los PDF cambian juntos. Para regenerar los PDF:

```
node scripts/escenarios-pdf.mjs
node scripts/eleccion-pdf.mjs
```

## Palabras que se usan

| Palabra | Qué significa |
|---|---|
| `V` | Cantidad de ofertas en vivo publicadas (subastas en vivo) |
| `N` | Cantidad de ofertas negociables publicadas (las que reciben propuestas de compradores) |
| `T` | `V + N`: todas las ofertas publicadas, de cualquier tipo de bien |
| Día | De 9:00 a 24:00. Todo lo que sale en el feed se reparte en esas 15 horas |
| Rotación | Volver a mostrar en el feed una oferta que ya estaba publicada, para que se siga viendo. Sale como "Disponible en vivo" o "Disponible para negociar", nunca como recién publicada |
| Propuesta | Un comprador le envía una propuesta a una oferta negociable. El feed muestra el aviso "Se ha enviado una propuesta a la OFERTA 67942" |
| Simulado | Una entrada que la demo inventa porque todavía no hay datos reales conectados (hoy: propuestas y registros) |
| Actividad del día | Rotaciones + propuestas + registros + ofertas nuevas del día. Sirve para calcular cuánta publicidad sale |

Las propuestas de los compradores no cuentan como ofertas: si hay 8 en vivo y 2 negociables, `T` es 10 aunque haya 20 propuestas.

## Tipos de entrada

| `kind` | Autor | Ejemplo de texto | Origen hoy | Acciones |
|---|---|---|---|---|
| `nueva` | La empresa | Publicó una nueva oferta en vivo: Toyota Yaris 2022 | Real | Me gusta, participantes, visitas, compartir |
| `nueva-subascars` | SubasCars | Publicó una nueva oferta negociable: Toyota Hilux 2019 | Real | Me gusta, negociaciones, visitas, compartir |
| `rotacion` | Dueño de la oferta | Disponible en vivo: Kia Rio 2020 | Real | Igual que la nueva, según su tipo |
| `propuesta` | VMC | Se ha enviado una propuesta a la OFERTA 67942 | Simulada | Visitas, compartir |
| `registro` | VMC | Se registró un nuevo usuario en VMC | Simulado | Visitas, compartir |
| `ad-valoriza` | VMC | Valoriza tu auto en VMC | Publicidad de VMC | Botón Valorizar, visitas, compartir |
| `ad-publica` | VMC | Publica tu auto en VMC y recibe ofertas | Publicidad de VMC | Botón Publicar, visitas, compartir |
| `blog` | Blog VMC | Cómo funciona una subasta en VMC, paso a paso | Artículo de VMC | Portada, botón Leer, visitas, compartir |

El aviso de propuesta no tiene enlace y dice que la propuesta se envió, no que se aceptó.

## Reglas

Todo esto ya funciona en la demo.

1. Entra una entrada simulada cada 45 segundos (`GAP_S`). Una acción real entra al momento y la cuenta de 45 segundos empieza de nuevo desde ella. Ejemplo: entrada a las 10:00:00, acción real a las 10:00:30; la siguiente simulada puede salir desde las 10:01:15.
2. Al abrir la página, la primera entrada es siempre una publicidad: la que ya estaba entre las últimas o, si no hay, la próxima del plan. Sale como "Ahora", sin el aviso de nuevo, y no cuenta para los 45 segundos.
3. Sin negociables no hay avisos de propuesta. Ese espacio pasa al blog (2 entradas más al día).
4. Sin ofertas publicadas no se simula nada: ni propuestas ni registros. Ese día el feed muestra solo publicidad y blog.
5. Una oferta publicada hoy sale como nueva y no rota ese día, para que no aparezca primero como nueva y después como disponible.
6. Por privacidad, los avisos de propuestas y registros no muestran quién fue.
7. La propuesta simulada usa un código de oferta al azar (que no choca con uno real) y no lleva foto, porque esa oferta no existe. Como no apunta a ninguna oferta del feed, no cambia ningún contador. La propuesta real lleva la foto de su oferta. La regla vale para lo que traiga el backend: si la propuesta no tiene una oferta real detrás, va sin foto.
8. Las ofertas (nuevas y en rotación) llevan siempre su foto. El blog lleva su portada.
9. Cada hecho real reemplaza a uno simulado del mismo tipo: simulados del día = máx(0, objetivo − reales). Los reales no tienen tope y nunca se ocultan.
10. Nunca salen dos entradas de publicidad o blog seguidas si hay actividad en los 30 minutos siguientes.
11. Visitas, me gusta y participantes cuentan desde que la entrada sale en el feed, así que cuadran con su hora: una entrada de hace un minuto tiene pocas visitas. Ver "Contadores".

## Cuántas entradas de cada tipo salen al día

### Rotaciones: `R(T)`

Cuántas veces al día se vuelve a mostrar una oferta que ya estaba publicada. Depende del total de ofertas.

| Ofertas publicadas (`T`) | Rotaciones al día | Cada oferta sale |
|---|---|---|
| 0 | 0 | |
| 1 a 5 | 3 × `T` (con 5 ofertas: 15, una por hora) | 3 veces, con 5 horas o más entre una y otra |
| 6 a 30 | `T` | 1 vez |
| Más de 30 | 30 | 1 vez las 30 primeras por prioridad; el resto, al día siguiente |

### Avisos de propuesta: `P(N)`

Cuántos avisos "Se ha enviado una propuesta" simulados salen al día. Depende de cuántas negociables hay publicadas. Los números 5, 8 y 12 son el máximo de avisos al día (el tope), no los rangos. El rango es la cantidad de negociables:

| Negociables publicadas (`N`) | Tope de avisos al día |
|---|---|
| 0 | 0 |
| 1 a 4 | 5 |
| 5 a 11 | 8 (uno cada 2 horas, más o menos) |
| 12 o más | 12 |

Además, nunca más de 2 avisos al día por cada negociable: `P(N) = mín(2N, tope)`. Por eso con 1 negociable salen 2, con 2 salen 4 y con 3 o 4 ya se llega al tope de 5. El tope es solo para los simulados; las propuestas reales salen todas.

### El resto

| Entrada | Al día |
|---|---|
| Registros simulados `U(T)` | 0 sin ofertas; si no, `mín(6, 1 + ⌊T / 4⌋)`: 1 con 1 a 3 ofertas, 3 con 8, 6 con 20 o más |
| Ofertas nuevas | Las que se publiquen. En la demo, con 6 ofertas o más: una en vivo a media mañana y una negociable a media tarde |
| Publicidad + blog | La mitad de la actividad del día, entre 6 y 15: `mín(15, máx(6, ⌈A / 2⌉))`. Un tercio es blog; el resto alterna las dos publicidades. Con 0 negociables, 2 de blog más |

Cada tipo se reparte parejo entre las 9:00 y las 24:00: una rotación cada `900 / R` minutos, un aviso de propuesta cada `900 / P` minutos, y así.

Ejemplo con 8 en vivo y 2 negociables (`T` = 10, `N` = 2): 8 rotaciones, 4 avisos de propuesta, 3 registros, 2 ofertas nuevas, 6 publicidades y 3 artículos del blog. En total, 26 entradas en el día.

Funciones en `feedPlan.ts`: `rotationPerDay`, `rotationCap`, `proposalsPerDay`, `proposalMax`, `registrosPerDay`, `newPerDay`, `promoPerDay`, `counts`, `mockupsLeft`, `entryViews`, `offerStats`.

## Cómo se arma el día

`planDay(V, N)` devuelve la lista de entradas del día ordenada por hora:

1. Las ofertas nuevas: la de la empresa a media mañana y la de SubasCars a media tarde.
2. La rotación: ofertas que ya estaban publicadas, intercaladas en vivo y negociables en proporción, para que no salgan cinco seguidas del mismo tipo.
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

Las visitas cuentan desde que la entrada sale en el feed: arrancan en un valor de inicio y crecen hacia un tope, `visitas(t) = inicio + (tope − inicio) × (1 − e^(−t / τ))`.

| Entrada | Visitas al salir | Tope | τ |
|---|---|---|---|
| Oferta nueva | 0 | 120 a 500 (muy buenas: 600 a 800) | 6 h |
| Oferta en rotación | 30 a 60 (la oferta ya era conocida) | igual | 6 h |
| Publicidad | 8 a 15 | 120 a 300 | 4 h |
| Blog | 5 a 12 | 80 a 200 | 5 h |
| Propuesta y registro | 0 | 40 a 200 | 3 h |

- Me gusta y participantes: entre el 4 % y el 8 % de las visitas de la oferta (`offerStats`).
- Negociaciones: solo cuentan las propuestas reales. Las simuladas nunca suman.
- En 0 se muestra solo el ícono, sin el número. Participantes en 0 dice "Sé el primero en participar"; negociaciones en 0, "Sin negociaciones aún".

## Colores y texto

Cada tipo tiene un color: naranja para en vivo, cian para negociable y propuestas, morado para lo demás. Ese color solo se usa en las insignias del tipo (EN VIVO, NEGOCIABLE, BLOG…), que por defecto están apagadas. El texto destacado (el tipo, el número de OFERTA, el detalle) va en negrita y en negro, y el ícono de participantes y negociaciones también va en negro.

| Tono (control "tono de color") | En vivo | Negociable y propuestas |
|---|---|---|
| Oscuro, por defecto (card de Tipo de oferta, `COLORS` en `feedPlan.ts`) | `#C2410C` | `#00777A` |
| Medio | `#EF852E` | `#00AEB1` |
| Design system | `#FF9639` | `#00D2D3` |

Lo demás (registros, publicidad, blog) va en morado (`#7B5CE6`, `#3B1782`, `#4A2CE0`).

La publicidad y el blog usan las fotos de `apps/index-lab/public/banners/vmc` (fondo morado) y el botón de vidrio del banner principal (`va-glass`, copia de `hib-glass`), siempre sobre la foto y sin flecha. Ningún botón de VMC ahora usa otro estilo.

## Controles de QA

Están en "Abrir controles" (y en el panel de la vista móvil, que usa la misma lista `QA_CONTROLS`). Los de diseño solo cambian cómo se ve, no cuándo aparece cada entrada.

| Clave | Control | Por defecto | Otras opciones |
|---|---|---|---|
| `feedView` | VMC ahora | Timeline | Listado |
| `feedScenario` | Inventario | 8 en vivo + 2 negociables | 0 ofertas, 1 negociable, 5 negociables, 3 + 2, 10 negociables, 10 en vivo, 6 + 6, 15 + 15 |
| `feedSpeed` | Velocidad | ×1 (45 s reales) | ×10 (4,5 s) |
| `feedAd` | Publicidad | Tarjeta | Post, Banner |
| `feedAdBadge` | Badge de publicidad | Sin badge | Sobre la foto, Insignia, En la hora |
| `feedViews` | Visualizaciones | Ojo (1,2 mil) | Ojo y número (1,234), Ojo y palabra, Texto |
| `feedShare` | Compartir | Flecha y caja | Tres puntos, Avión |
| `feedActs` | Fila de acciones | Palabra completa ("1,234 visualizaciones" cuando solo hay visitas y compartir) | Extremos, A la izquierda, A la derecha |
| `feedScroll` | Scroll | Gris claro | Vidrio, Morado |
| `feedTone` | Tono de color | Oscuro | Medio, Design system |
| `feedTags` | Insignias | Sin insignia | Con insignia |

El panel "VMC ahora · reloj" muestra cuánto falta para la próxima entrada simulada, el plan del día y el botón "Simular acción real".

## Para producción

La demo inventa el inventario (`buildInventory`) y pasa un día completo en pocos minutos. En producción:

1. El inventario (`V`, `N`, ofertas abiertas) viene de la API, no de `buildInventory`.
2. Las nuevas ofertas, las propuestas y los registros reales entran cuando ocurren, desde un canal de eventos. Cada uno reinicia los 45 segundos y descuenta un simulado de su tipo.
3. Visitas, me gusta, participantes y negociaciones son los reales de la ficha de la oferta. `entryViews` y `offerStats` son solo para la demo.
4. El plan sigue la hora real: la rotación y lo simulado se reparten entre las 9:00 y las 24:00.
5. Las ofertas que cierran dejan de rotar, y el plan que queda se recalcula cuando cambia `T`.
6. Cuando se conecten las propuestas y los registros reales, se apagan sus simulados.

## Todavía no implementado

Ideas que salieron al definir el feed y que la demo todavía no hace:

1. Alternar la publicidad en cada visita. Hoy la primera entrada siempre es una publicidad, pero sale la misma cada vez que se abre la página. La idea es alternar entre "Valoriza tu auto" y "Publica tu auto", para que la misma persona no vea siempre la misma.
2. "En vivo" en la cabecera solo cuando hay ofertas en vivo. Hoy la cabecera del feed dice "En vivo" aunque no haya ninguna subasta en vivo. La idea es mostrarlo solo si `V` > 0 y, si no, "Actividad de hoy".
3. Juntar avisos reales seguidos. Si llegan 3 propuestas reales seguidas a la misma oferta, en vez de 3 avisos iguales saldría uno: "Se enviaron 3 propuestas a la OFERTA 67942". Lo mismo con los registros: "5 personas se registraron en la última hora".
4. Mismas palabras en el contador. La ficha de la oferta dice "X ofertas" (en vivo) y "X propuestas" (negociable); VMC ahora dice "participantes" y "negociaciones". Falta elegir unas y usarlas en los dos lados.
5. Otras opciones sin ofertas publicadas. Hoy el feed muestra solo publicidad y blog. Las alternativas serían ocultar VMC ahora o mostrar una entrada fija "Pronto nuevas ofertas".
