# Home Decision Memory v0

Estado: memoria inicial extraída de la conversación; no es todavía el Decision
Packet de implementación.

Fecha: 2026-10-12
Propietario de producto: Julio

## Intención de producto

La Home de VMC debe funcionar como un feed de descubrimiento de oportunidades,
no como una landing estática ni como un dashboard de contadores. Debe ayudar a
compradores a descubrir qué está ocurriendo ahora, qué ocurrirá después y qué
oportunidades ofrecen tiendas especializadas.

A futuro el feed puede personalizarse según intereses. Esa personalización no
forma parte del primer ejemplo.

## Decisiones confirmadas

### Shell

- El header no tendrá buscador en este corte. No debe crecer innecesariamente
  en altura.
- Header y Sidebar deben partir de Concorde y de sus contratos reales; no se
  recrearán visualmente con piezas sueltas.
- El Sidebar debe acompañar el recorrido desktop y mantener una zona de
  publicidad visible hacia su parte inferior.
- La solución mobile se decidirá desde el contrato real de Concorde; no se
  asume automáticamente una bottom bar.

### Foco de la primera pantalla

- La Home V1 prioriza **descubrimiento para compradores**: oportunidad y
  actividad ocupan la primera zona de atención.
- La campaña para publicar/vender se conserva, pero queda como contenido
  secundario después de los rails; no reemplaza el foco de descubrimiento.
- Esta decisión de Julio, tomada el 2026-10-13, sustituye la alternativa de
  usar la campaña como hero principal en V1.

### Feed de actividad

- El panel lateral se comporta como un feed o red social de compradores y
  vendedores.
- Un evento fuerte o una subasta en vivo queda fijado arriba.
- Después aparecen próximas subastas y novedades relevantes.
- Si no hay actividad suficiente, el espacio puede mostrar contenido útil del
  blog o Centro de Ayuda.
- El ejemplo basta para demostrar ubicación y jerarquía; no necesita datos
  conectados todavía.

### Oportunidades y tiendas

- La Home presenta las oportunidades agrupadas por tienda.
- Para el ejemplo se muestran dos tiendas.
- Una tienda suele especializarse: vehículos, maquinaria, siniestrados u otro
  inventario específico.
- Cada tienda usa un filmstrip/rail horizontal para continuar explorando hacia
  la derecha.
- Cualquier click principal sobre una offer card conduce al detalle.

### Jerarquía de cards

- Existirá una card normal y al menos una card comercial/destacada de mayor
  jerarquía dentro del mismo conjunto de oportunidades.
- La destacada debe notarse más grande o dominante sin convertirse
  necesariamente en un banner separado.
- El posible pago publicitario o alto interés comercial sirve como hipótesis
  para el ejemplo, pero la regla definitiva está pendiente de validación.
- Los nombres `jumbo`, `deluxe` o `premium` son exploratorios, no nomenclatura
  aprobada de Concorde.

### Tiempo y estado

- El estado de modalidad y la información temporal son conceptos distintos.
- Las oportunidades en vivo comunican cuándo inician o que están ocurriendo.
- Las negociables comunican cuándo cierran.
- Si faltan menos de 24 horas se muestran horas; si cierra mañana, se comunica
  `cierra mañana`; para plazos posteriores se usa una fecha comprensible.
- No deben inventarse contadores o actividad presentada como real.

### Descubrimiento secundario

- Después de los lotes puede existir un banner secundario compacto.
- El banner no debe alargar innecesariamente la página ni competir con el
  Sidebar persistente.
- Las categorías deben usar imágenes además de iconografía cuando ayude al
  descubrimiento.
- La Home incluirá un resumen de las dos tiendas, sin convertirlo en un segundo
  catálogo completo.

## Hipótesis visibles

- La card destacada puede corresponder a promoción pagada.
- El ranking futuro podría personalizarse mediante señales de interés.
- El blog o Centro de Ayuda puede alimentar el fallback editorial del feed.
- Las tiendas y lotes usados durante la revisión son fixtures demostrativas.

Las hipótesis pueden aparecer en un prototipo si se etiquetan como ejemplo. No
pueden presentarse como regla oficial de VMC.

## Decisiones rechazadas o sustituidas

- Header con buscador en el corte actual.
- Header y Sidebar recreados manualmente en `FullIndexReview`.
- Elegir una propuesta solamente porque sea la más reciente.
- Repetir el mismo catálogo genérico sin jerarquía ni especialización por
  tienda.
- Usar cifras, fechas, pujas o cuentas regresivas como si fueran datos reales.
- Convertir una referencia visual completa en un nuevo sistema de estilos que
  sustituya Concorde.
- La QA `home-index-rebase-v1` tal como fue presentada el 2026-10-13 como
  baseline visual de Home. Julio la rechazó porque se percibe como un
  *storybook*: exhibe etiquetas internas ("V1", "snapshot", "contenido
  estático"), explica sus límites dentro del lienzo y apila bloques de igual
  jerarquía. Su evidencia técnica se conserva, pero no es una referencia
  visual para continuar.
- La recuperación posterior de la primera pantalla como baseline visual. Julio
  confirmó que sigue siendo "basura": retiró copy de QA, pero mantuvo la
  composición de componentes aislados. No debe intentarse una tercera
  corrección estética sin blueprint espacial aprobado.

## Preguntas abiertas reales

- ¿Qué regla comercial definitiva habilita una card destacada?
- ¿La jerarquía vive como composición local del Home o merece una variante
  oficial de OfferCard?
- ¿Qué bloque exacto de Sidebar satisface persistencia y publicidad sin romper
  Concorde?
- ¿Qué fuentes reales alimentarán actividad, blog y próximas subastas?
- ¿Qué comportamiento y densidad necesita cada breakpoint?
- ¿Cuál es la composición concreta de la primera pantalla que haga que el
  recorrido se perciba como una Home de oportunidades —y no como una galería
  de componentes— antes de retomar la implementación?

Estas preguntas se resolverán por cortes. GrillMe no debe repetir las decisiones
confirmadas arriba.
