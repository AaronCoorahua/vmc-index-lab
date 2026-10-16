# Component Map — Home Index rebase / V1

Estado: **QA V1 implementada y validada técnicamente; pendiente de revisión visual de Julio.**

Fuentes contrastadas:

- Index vigente: `https://www.vmcsubastas.com/`, revisado el 2026-10-13.
- Referencia de Julio: `references/source/vmc-home-reference-approved.png`.
- Concorde fijado: `40d1be50206021157d9d6ad81327df8ba25486a4`
  (`frontend/concorde` tree `5d142a656dba74518e46b2c192cce946d15b075f`).

## Regla de lectura

La columna **delta V1** no copia la imagen. Explica cómo el bloque real del
Index cambia de posición o jerarquía sin perder su tarea, su destino o su
contenido. La referencia manda en el recorrido; Concorde manda en apariencia,
anatomía y comportamiento.

## Mapa paralelo

| Bloque actual comprobado | Cambio que propone la referencia | Delta V1 preservando VMC | Concorde / API pública verificada | Clasificación | Decisión |
| --- | --- | --- | --- | --- | --- |
| Header de VMC, menú, marca y acceso | Franja superior compacta; la referencia añadía búsqueda | Se conserva compacto, **sin buscador ni altura adicional**. En esta V1 sólo se valida su forma: el CTA `Ingresa` no se declara navegable hasta que exista API pública. | `Header`, `width="100%"`; bloque entero mediante el adaptador. No expone `href` ni callback del CTA. | reutilizar visualmente; escalar para acceso funcional | standard |
| Sidebar con Próximas, modalidades, categorías, empresas, Vende tu auto y Centro de Ayuda; anuncios inferiores | Sidebar persistente, largo y con publicidad visible | Se conserva como unidad visual y de scroll. V1 no promete aún conservar cada destino: los subítems no propagan click, sus iconos no están expuestos por el adaptador y `Vende tu auto` no existe en el set por defecto. | `Sidebar`, `height`, `contentHeight` y bloque completo. `onItemClick` no cubre subítems; `SidebarNavItem` requiere iconos no exportados. | reutilizar visualmente; escalar para navegación exacta y anuncio real | council para las brechas del shell |
| Anuncios reales del Sidebar actual | Espacio publicitario visible en sidebar largo | V1 conserva el **espacio**, no inventa campaña, imagen o URL. El QA sólo puede mostrar el placeholder canónico etiquetado; publicidad real requiere el contrato de fuente y un slot público. | `SidebarBanner` sólo tiene `onCta` y renderiza placeholder fijo; no recibe contenido, imagen ni href. | escalar | council / `concorde-upgrade` separado |
| Banner actual de publicar/vender (`/landing-subascars`) | Hero dominante compartiendo atención con actividad | Se conserva como campaña con su destino, pero queda secundaria tras los rails. Julio confirmó descubrimiento comprador como foco de V1. | No hay Hero o Banner público parametrizable. `Homepage` sólo trae placeholders de canvas fijo 798×1104 y no sirve como bloque responsive. `Button` sirve únicamente si el CTA ya existe en la campaña. | extender con autorización | standard |
| Banner actual Subaspass (`/subaspass`) | Banner secundario, más corto, después de oportunidades | Se conserva su destino; se desplaza debajo del primer rail para alternar descubrimiento y campaña, sin competir con el hero ni extender el alto innecesariamente. | No hay banner público. Mismo wrapper de campaña V1, sin receta visual nueva. | extender con autorización | standard |
| Próximas / En Vivo presentes en la navegación | Feed lateral de actividad, con evento urgente fijado | No se infiere un evento desde contadores o navegación. El estado V1 por defecto es un fallback oficial de Centro de Ayuda. Una fila de actividad sólo entra con identificador/URL, título, estado explícito, fecha u hora y fecha de captura en el manifest. | `BadgeStatus` `variant="live" | "proxima"`, `label`; composición de `section > ol > li` sin card nueva. | componer, condicionado a snapshot | standard |
| Tipo de oferta actual: En Vivo y Negociable | Entrada de descubrimiento más visible, no dashboard | Mantiene ambos caminos y sus destinos; se coloca inmediatamente después de la zona hero/actividad o antes del primer rail según el ancho. | `OfferType`, `variant="live" | "negotiable"`, `label`, `ctaLabel`, `onClick`. `CategoriesSection` no se reutiliza: fija 766×184 y mezcla dos bloques que V1 necesita ordenar responsivamente. | reutilizar por piezas; componer layout | light |
| Categorías actuales | Categorías más visuales y reubicadas más abajo | Se mantienen como punto de exploración y conservan sus destinos. V1 usa la anatomía e iconos de `CategoryCard`; las imágenes de categoría de la referencia quedan explícitamente para V2, pues no caben en su API pública. | `CategoryCard`, `category`, `label`, `onClick`; no acepta imagen, contador ni href. | reutilizar por piezas; componer layout | standard para la decisión de diferir imagen |
| Secciones actuales por tienda: Pacífico, SubasCars, Empresa Industrial, Inversiones F&B y Trupal, con perfil y ofertas | Descubrimiento por tiendas especializadas en filmstrip | La QA de revisión muestra **exactamente dos rails** de tiendas reales del snapshot, como Julio decidió. Las cinco rutas permanecen alcanzables desde Empresas en la VMC real; V1 no las convierte en cinco secciones verticales. Perfil/oferta se presentan estáticos hasta verificar su ruta y accesibilidad. | `OfferCard` `variant="live" | "negotiable"`, `size="full" | "short"`, `name`, `year`, `price`, `imageSrc`, `imageAlt`, `badge`, `interactive=false`; `CardTitle`. `ProfileButton href` queda fuera hasta snapshot de destino. | reutilizar por piezas; componer rail visual | standard |
| Cards actuales de oferta | Una oportunidad comercial más grande entre oportunidades normales | V1 usa OfferCards estáticas: `full` responde teclado, `short` no; ambas incluyen favorito interno y no permiten card/enlace funcional sin interacción anidada. No se promete que abran el detalle hasta resolver ese contrato. Tampoco se simula una “premium/jumbo” redimensionando o envolviendo. | `OfferCard` no expone tamaño grande ni metadatos de campaña; sólo `full` y `short`; el contrato interactivo no resuelve el caso de rail funcional. | escalar para card funcional y variante destacada | council, después de fuente de negocio |
| Centro de Ayuda actual, incluido en Sidebar y contenido | No aparece en la referencia | Se conserva tanto en Sidebar como en el cierre del Home. Además puede ser fallback del feed si no hay actividad comprobada. La referencia no autoriza eliminarlo. | `Sidebar` para el acceso; enlace semántico existente para el bloque editorial. No hay card de ayuda pública. | reutilizar + componer | light |
| Footer actual | No está representado en la referencia | Se conserva tras el Centro de Ayuda. No se convierte en pieza decorativa ni se recorta para igualar la imagen. | No aplica componente Concorde público en el corte; conservar contenido actual. | componer de contenido existente | light |

## Lectura de la primera pantalla

La propuesta no es “poner la referencia encima” del Index. Antes de avanzar el
resto, la primera pantalla se compone como una unidad: `OfferCard` visual de
mayor presencia con su asset local ya documentado, texto de descubrimiento y
modalidades a la izquierda; actividad/fallback oficial a la derecha; el inicio
del primer rail aparece a continuación. No se escribe copy de QA o de
limitaciones técnicas dentro del lienzo. El orden V1 sería:

1. Header y Sidebar reales, completos y persistentes.
2. Descubrimiento comprador como foco principal.
3. Actividad sólo si el snapshot la prueba; Centro de Ayuda como estado
   predeterminado si no existe.
4. Modalidades y dos rails de tiendas reales, debajo de la primera zona de
   atención; no se comprimen dentro del hero.
5. Subaspass como banner secundario compacto.
6. Categorías Concorde, rails restantes por tienda, Centro de Ayuda y footer.

Así se conserva el inventario y los caminos reales de VMC mientras se adopta
el ritmo de descubrimiento de la referencia.

## Límites explícitos de V1

- No usa datos inventados para que el feed parezca activo.
- Es una V1 visual: no promete navegación, login, favoritos o detalle hasta
  que las APIs públicas y el manifest de destinos lo permitan.
- No introduce búsqueda, una nueva card premium, imágenes dentro de
  `CategoryCard`, reglas pagadas, personalización ni publicación funcional.
- No usa `Homepage`, `CategoriesSection` ni `AuctioneerSection` como atajo:
  sus dimensiones, placeholders y composición fija no representan el Index
  real ni son responsive para este corte.
- No oculta el Centro de Ayuda, publicidad, Sidebar, footer, tiendas o destinos
  existentes sólo porque no figuren en la imagen.

## Brechas y camino seguro

1. **Shell funcional.** `Header` no entrega una ruta/callback para `Ingresa`.
   `Sidebar` no propaga subítems y sus iconos no se exportan por el adaptador.
   V1 los usa sólo como bloque visual completo; una preservación navegable
   requiere corrección canónica o un adaptador aprobado.
2. **Publicidad del Sidebar.** El componente conserva un placeholder, pero no
   admite contenido real. V1 puede mantener el hueco canónico y etiquetarlo;
   no puede publicar anuncios reales hasta un `concorde-upgrade` autorizado.
3. **Campañas.** Un wrapper V1 puede reubicar la campaña actual como contenido
   existente. No puede crear un nuevo Hero de Concorde ni estilizar una copia
   de la referencia. La procedencia/captura de los assets de campaña debe
   quedar registrada antes de código.
4. **Card funcional y jerarquía comercial.** La API de `OfferCard` no permite
   un rail navegable sin interacción anidada/favorito local; una variante
   destacada tampoco existe. Ambas se escalan después de validar negocio y
   accesibilidad.
5. **Categorías con imagen.** V1 usa la categoría oficial; una variante con
   imagen requiere propuesta de sistema en V2.
6. **Mobile Sidebar.** Conserva la brecha accesible ya registrada en
   `HOME-SHELL-COMPONENT-MAP.md`; no se promociona como resuelta.

## Criterios observables propuestos antes de código

- Antes de UI existe un manifest de snapshot: fecha/hora, URL fuente, hash,
  TTL, etiqueta, destino, asset/procedencia y datos explícitos por ítem.
- La QA V1 usa contenido del snapshot; todo dato volátil queda marcado como
  snapshot, no como tiempo real. Sin actividad completa y vigente, sólo se
  muestra el fallback de Centro de Ayuda.
- Header y Sidebar entran como bloques completos del adaptador; el header mide
  64 px y no muestra buscador.
- La campaña principal y Subaspass conservan sus respectivos destinos actuales.
- Las OfferCards V1 son estáticas hasta que se resuelva su contrato de detalle,
  favorito e interacción anidada. Los perfiles y destinos se prueban después
  de capturar su manifest, no se declaran conservados por su sola etiqueta.
- El rail no produce overflow de página; su desplazamiento horizontal es
  teclado y táctilmente alcanzable.
- Centro de Ayuda y footer siguen presentes y accesibles.
- No se presenta un anuncio, una actividad o una card comercial como real si
  su fuente no está registrada.

## Recomendación

Nivel **standard** para el corte V1 visual, con escalaciones fuera de la
implementación: shell funcional, publicidad real del Sidebar y OfferCard
funcional/destacada. El arbitraje siamés devuelve **NO-GO para implementación**
hasta cerrar assets/destinos del manifest; después puede pasar a `GO WITH
CHANGES`.
