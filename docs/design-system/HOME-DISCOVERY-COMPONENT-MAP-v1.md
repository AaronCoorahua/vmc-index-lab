# Concorde Component Map — Home / Descubrimiento v1

Estado: V1 — Concorde Fit aprobada para verificación. La composición vigente
no añade recetas visuales locales ni anatomía privada.

## Fuente verificada

- Configuración: `config/concorde-source.json`.
- Revisión: `40d1be50206021157d9d6ad81327df8ba25486a4`.
- Árbol Concorde: `5d142a656dba74518e46b2c192cce946d15b075f`.
- Gate: `npm run verify:concorde` aprobado el 2026-10-13.

## Mapa

| Elemento | Necesidad | Pieza verificada | Props/contrato observado | Decisión | Layout local permitido | Brecha o decisión requerida |
| --- | --- | --- | --- | --- | --- | --- |
| Hero de descubrimiento | Jerarquía editorial, oportunidad principal y CTA | `Button` | CTA pública; no existe bloque Hero público | componer | Grid, flujo, responsive y asset placement; no se convierte en componente compartido ni recrea Header/Sidebar | El tratamiento editorial mayor se difiere a V2. |
| Feed de actividad | Evento fijado, próximas oportunidades y fallback editorial | `BadgeStatus` | `live` y `proxima`; no existe feed/actividad público | componer | Lista local de página con piezas públicas; datos siempre fixture `Demo`/`Ejemplo` o fuente oficial enlazada | El fallback editorial no recibe una pill inventada. |
| Rail por tienda visual | Explorar oportunidades horizontalmente sin navegación | `OfferCard` | `variant=live|negotiable`; `size=full|short`; `interactive=false`; `badge`; `elevated` | componer | Contenedor local con scroll horizontal, título de tienda y cards estáticas dentro de un wrapper inerte | Sin destinos ni favoritos funcionales en este corte. |
| Card normal funcional | Oferta completa que entra al detalle | `OfferCard` | `short` no documenta activación por teclado; los favoritos están anidados en una card con rol botón | escalar | Ninguno | Diferida. No implementar navegación, parche local ni reconstrucción. Requiere contrato accesible oficial. |
| Card visual destacada | Jerarquía visible dentro del mismo rail | `OfferCard` | Existen tamaños públicos `full` y `short`; no existe `jumbo`, `deluxe` o `premium` | componer | Usar `full` para `Destacado · Ejemplo` y `short` para cards secundarias; sin afirmar regla comercial | Una variante comercial real sigue siendo una brecha separada. |
| Banner secundario | Pieza compacta entre oportunidades y categorías | `Button` | No existe bloque banner público con contenido/imagen | componer | Flujo, responsive y asset placement con CTA pública; sin panel decorativo local | Un tratamiento comercial es candidato V2. |
| Categorías | Descubrimiento por categoría | `CategoryCard` | Sólo recibe categoría, etiqueta y click; no admite imagen | reutilizar | Grid local; no anidar destinos interactivos | Categorías con imagen integrada requieren candidato/upgrade V2. |
| Resumen de dos tiendas | Identidad, especialización y enlace de exploración | `CardTitle`, `ProfileButton`, `OfferCard` | `AuctioneerSection` es fijo a 766×352 y a cuatro cards | componer | Sección local con piezas públicas, sin usar el bloque fijo como layout responsivo | Definir si el enlace lleva a tienda o catálogo demostrativo. |

## Nivel de decisión

`council`.

Motivos:

1. La jerarquía comercial de la card tiene posible impacto de modelo de negocio
   y no cuenta con variante Concorde pública.
2. El feed mezcla actividad de marketplace, contenidos editoriales y posibles
   reglas futuras de prioridad.
3. El shell todavía tiene una promoción pendiente y condiciona la integración
   visual, aunque no se modifica en este corte.

## Límites de implementación

- La referencia aprobada guía jerarquía y composición, no estilos nuevos.
- Los fixtures no pueden aparentar ser datos reales.
- Cards y CTAs de este corte son estáticos e inertes; navegación y favoritos se
  difieren hasta que su contrato accesible esté disponible.
- El shell es una dependencia bloqueada y fuera de alcance: no es una fila de
  implementación ni una extensión de este corte.
- Ninguna necesidad marcada `escalar` se resuelve modificando un repositorio
  vecino ni recreando internamente una pieza de Concorde.
- El próximo artefacto es un Decision Packet de council; no código.
