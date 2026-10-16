# Component Map — Home Concorde V2 completa

Estado: V1 Concorde Fit para la ruta QA `/qa/home-index-rebase`.

La referencia de Julio gobierna orden, densidad y jerarquía; los bloques de
Concorde V2 gobiernan las piezas y su anatomía.

| Zona de la referencia | Pieza | Decisión | Límite |
| --- | --- | --- | --- |
| Header y Sidebar | `Header`, `Sidebar` | reutilizar | Bloques completos; sin buscador ni recreación interna. |
| Oportunidad principal | `PromoBanner` | reutilizar | Sólo props públicas; no se modifica la receta visual. |
| Actividad de plataforma | `CardTitle`, `BadgeStatus`, `OfferCard` | componer | Feed local de fixtures declaradas; no constituye un componente de Concorde ni afirma datos en vivo. |
| Tienda / rail horizontal | `OfferShelf` | reutilizar | Una instancia por cada una de las dos tiendas demostrativas. |
| Campaña secundaria | `PromoBanner` | reutilizar | Contenido de ejemplo, posterior a los rails. |
| Categorías | `CategoriesSection` | reutilizar | La versión V2 disponible usa tarjetas canónicas; fotos de categoría son una brecha para V2, no se inventan. |
| Resumen de tiendas | `CardTitle`, `ProfileButton` | componer | Sólo disposición de accesos a las dos tiendas ya presentes en los rails. |

## Criterios observables

1. La ruta se percibe como Home de oportunidades: hero con actividad, dos
   tiendas, campaña secundaria, categorías y resumen de tiendas.
2. Ningún bloque se redibuja mediante CSS local ni se cambia dentro de
   `apps/index-lab/concorde`.
3. Los datos de oferta y actividad se presentan como ejemplos, no como inventario
   ni eventos en vivo conectados.
4. El sidebar permanece visible en desktop y conserva su banner oficial.
