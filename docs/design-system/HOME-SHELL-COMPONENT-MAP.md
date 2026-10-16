# Concorde Component Map — Home / Corte 1 Shell

Estado: listo para council; contiene una brecha candidata de Concorde.

Fuente Concorde: commit `40d1be50206021157d9d6ad81327df8ba25486a4`.

| Elemento | Necesidad | Pieza real | Variante y props verificadas | Layout local permitido | Decisión | Brecha |
| --- | --- | --- | --- | --- | --- | --- |
| Header desktop | Barra de acceso sin buscador y sin altura adicional | `bloques/header/desktop/Header` | `width="100%"`; sin `logo`; sin `username`; altura encapsulada de 64 px | ancho dentro de la columna principal | reutilizar | ninguna para el piloto |
| Acceso | CTA `Ingresa` | encapsulado por `Header` mediante `Button sm-guest` | comportamiento actual de Header | ninguno | reutilizar para geometría | Header no expone callback ni destino del CTA |
| Navegación desktop | Hoy, modalidad, categorías, empresas y ayuda | `bloques/sidebar/desktop/Sidebar` | defaults; `logo`; activo y colapso internos; `height`, `contentHeight` | columna, relación con scroll y breakpoint | reutilizar como baseline | expandido pasa; al colapsar la publicidad deja de verse y falta decidir si producto lo acepta |
| Publicidad inferior | espacio visible y persistente para publicidad | `SidebarBanner` dentro de `Sidebar` | sólo placeholder fijo 200×264; `onBannerCta` se recibe pero no se usa | ninguno sin alterar anatomía | escalar | no admite imagen, contenido, enlace ni CTA real |
| Persistencia desktop | navegación y publicidad disponibles durante el recorrido | `Sidebar` + layout de página | el componente no define sticky ni scroll del documento | `position`, track de grid y contención de scroll | componer | validar que 1171 px y viewport no oculten el banner |
| Header mobile | marca, menú y acceso sin clipping | `Header` | `logo`, `compact`, ancho `100%` | slot de marca y breakpoint | reutilizar | asset de logo pendiente de procedencia |
| Menú mobile | drawer, no bottom bar | `SidebarMobile` + `SidebarMenuButton` | controlado; `closeOnItemClick`; `drawerContentHeight` | ubicación del trigger dentro del logo slot | escalar después del spike | brecha comprobada: sin foco inicial, trap, retorno ni `inert`; controles cerrados pueden seguir tabulables |
| Navegación | click de ítems del shell | callbacks de Sidebar | `onItemClick`, `onCollapsedChange` | router/adaptación de rutas | componer | destinos reales se definirán por corte |
| Tokens | apariencia Concorde | `src/app/globals.css` por adaptador | `@vmc/concorde-adapter/tokens.css` | resets neutrales exclusivamente | reutilizar | ninguna |

## Resultado

- Header puede entrar al Corte 1 sin extensión.
- Sidebar puede probarse únicamente como bloque completo y con sus defaults.
- Mostrar publicidad real dentro del Sidebar no es posible con la API actual.
- Inyectar contenido por overlay, recrear el banner o importar piezas internas
  violaría Concorde.
- El drawer puede probarse geométricamente, pero no aprobarse como navegación
  accesible con su contrato actual.

Las extensiones candidatas son dos iniciativas separadas:

1. convertir `SidebarBanner` en un slot público accesible desde `Sidebar`,
   conservando la variante placeholder como default;
2. completar el comportamiento modal de `SidebarMobile`: foco inicial, trap,
   retorno al trigger e inactividad real del panel cerrado.

La prueba está registrada en `docs/delivery/HOME-SHELL-SPIKE-EVIDENCE.md`.
Confirma 64 px de Header, ausencia de overflow y persistencia expandida. También
confirma que el ciclo de foco mobile requiere un cambio canónico. La publicidad
colapsada requiere primero una decisión de producto y después, si corresponde,
una extensión canónica; no un parche del Home.
