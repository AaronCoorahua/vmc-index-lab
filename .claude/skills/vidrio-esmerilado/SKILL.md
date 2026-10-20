---
name: vidrio-esmerilado
description: Diseña y construye íconos de «vidrio esmerilado» de VMC / Mi Garaje (dos formas por ícono, una sólida violeta detrás y una de vidrio lila translúcido delante que la desenfoca donde se cruzan, con detalle en blanco; SVG puro en retícula de 48 px, con estados y microanimación). Úsala cuando pidan un ícono nuevo «esmerilado», «de vidrio», «glass», «como los de Mi Garaje / Tu actividad», cuando haya que agregar uno al set de Vidrio.tsx, exportarlo a SVG/Figma o usarlo en un componente.
---

# Íconos de vidrio esmerilado (VMC · Mi Garaje)

Componente de referencia: `assets/Vidrio.tsx` y `assets/vidrio.css`. El original vive en
`mi-garaje-lab/app/iconos/` del repo VMC-Laptop; la lámina con estados y tamaños está en `/iconos` del lab.

## Para que salga idéntico (lo primero)

El objetivo es que cualquiera obtenga **exactamente** los mismos íconos que el set original. Por eso:

1. **Copia, no reescribas.** Lleva `assets/Vidrio.tsx` y `assets/vidrio.css` **juntos y sin cambios** a la misma carpeta del
   proyecto (`Vidrio.tsx` importa `./vidrio.css`). No los «mejores», no los pases a Tailwind, no cambies colores, blur
   (3.2), opacidad (.72), borde (1,5 px al 45 %) ni la retícula de 48. Un ícono nuevo es **solo una entrada más en `PARTS`**
   (y su clave en el tipo `Sec`).
2. **Tipografía:** los textos («S/», «km», «$») usan **Plus Jakarta Sans 800**. Cárgala en el proyecto
   (`next/font/google` o Google Fonts); si falta, el navegador pone otra y el ícono cambia.
3. **Fondo blanco o lila muy claro.** Sobre fondos oscuros el vidrio translúcido se ve distinto.
4. **Compara con la referencia antes de entregar.** `assets/referencia.png` (y `referencia.html`, que se abre en el
   navegador y tiene hover) muestra los 18 íconos a 72/48/32/24 px. Lo nuevo tiene que parecer del mismo set:
   mismo peso, mismos colores, mismo desenfoque.
5. **Regenera la referencia** tras agregar un ícono (sumarlo también a `KEYS` en `scripts/referencia.tsx`), desde un
   proyecto que tenga `react` y `react-dom` instalados:
   ```
   NODE_PATH=$PWD/node_modules npx -y esbuild@0.24.0 <skill>/scripts/referencia.tsx --bundle --platform=node --jsx=automatic \
     --loader:.css=empty --outfile=/tmp/ref.cjs && node /tmp/ref.cjs <skill>/assets
   ```
   Para la captura: `google-chrome --headless=new --window-size=1100,1100 --virtual-time-budget=4000 --screenshot=<skill>/assets/referencia.png file://<skill>/assets/referencia.html`.
   Luego **mira la imagen** y compárala con los demás íconos.

## Íconos de categoría · versión 2 (21/10/2026)

`vehicular`, `equipos`, `maquinaria`, `materiales` y `articulos` (tarjetas de categoría de la home: Vehicular,
Equipos diversos, Maquinaria, Materiales, Artículos diversos). La v2 corrige los «débiles» de la v1 con la regla de
accesibilidad de abajo: el rasgo que identifica al objeto va en la parte **sólida**. Maqueta en `assets/categorias-v2.png`
(tarjetas a 32 y 40 px).

Para probarlos: `<Vidrio s="vehicular" size={32} />` dentro de un contenedor `vd-host`. Para regenerar la maqueta,
usa el mismo comando de la referencia con `scripts/categorias.tsx`, pasando `<skill>/assets` y la ruta del HTML de salida.

| Ícono | v2 | Notas |
|---|---|---|
| `vehicular` | Auto de perfil: cabina y ruedas sólidas, carrocería de vidrio con faro | Antes casi todo vidrio, pálido. |
| `equipos` | Sierra circular: disco dentado sólido, cuerpo de vidrio con mango de pistola | Antes se leía como engranaje. |
| `maquinaria` | Excavadora (como la foto de la tarjeta): brazo, cucharón y orugas sólidos, cabina de vidrio | Antes era grúa pórtico. |
| `materiales` | Sin cambios: dos capas apiladas | — |
| `articulos` | Caja de vidrio con objetos sólidos que asoman (pelota y un equipo) | Antes laptop con gráfico («estadísticas»). Alternativa: laptop sin gráfico. |

Al cambiarlos: misma receta, mismos colores, comparar con `referencia.png` y regenerar ambas imágenes.

## La receta (no la cambies)

Cada ícono son **tres piezas** en `viewBox="0 0 48 48"`:

| Pieza | Qué es | Pintura |
|---|---|---|
| `back` | Forma **sólida** detrás: la parte secundaria del objeto (asa, aguja, tarjeta, sombra, punto de aviso). | `--solid` `#5A35C2` |
| `front` | Forma de **vidrio** delante: la silueta principal, grande y simple. | `--glass` `#B9A6F2` al 72 % + borde blanco 1,5 px al 45 % |
| `detail` | Detalle **blanco** encima del vidrio (puntos, check, «S/», renglones). | `#fff`; trazo 2–3 px, `round` |

El efecto esmerilado sale de pintar `back` dos veces: nítido detrás y **desenfocado** (`feGaussianBlur stdDeviation 3.2`)
recortado por la silueta de `front` (`clipPath`). Es SVG puro, sin `backdrop-filter`: se ve igual en Chrome, Safari y
Firefox (`backdrop-filter` con filtros SVG solo funciona en Chromium). **Ojo:** Figma descarta el `feGaussianBlur` al
importar SVG; ver «Exportar a Figma».

```
<svg viewBox="0 0 48 48">
  <defs>
    <clipPath id="c">FRONT</clipPath>
    <filter id="f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2"/></filter>
  </defs>
  <g fill="#5A35C2" color="#5A35C2">BACK</g>
  <g clip-path="url(#c)">
    <g fill="#5A35C2" color="#5A35C2" filter="url(#f)">BACK</g>
    <g fill="#B9A6F2" fill-opacity=".72">FRONT</g>
    <g fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.5">FRONT</g>
  </g>
  DETAIL
</svg>
```

En React no escribas esto a mano: agrega una entrada a `PARTS` en `Vidrio.tsx` y usa `<Vidrio s="clave" size={40} />`.
Los IDs ya salen de `useId`, así que varios íconos en la misma página no chocan.

## Cómo diseñar uno nuevo

1. **Elige el objeto y pártelo en dos.** ¿Qué es lo principal (va de vidrio, delante) y qué asoma detrás (sólido)?
   Ej.: bolsa de vidrio + asa sólida; dial de vidrio + aguja sólida; etiqueta de vidrio + tarjeta sólida girada.
2. **Que se crucen.** El sólido tiene que quedar **parcialmente** bajo el vidrio; si no se tocan, no hay desenfoque y el efecto desaparece.
   Si queda totalmente tapado, no se ve el sólido nítido.
3. **Formas gordas y redondeadas.** `rx` 3–7, trazos sólidos de 4–5 px con `strokeLinecap="round"`
   (para trazos en `back` usa `stroke="currentColor" fill="none"`). Nada de detalles finos: a 24 px se pierden.
4. **Ocupa la retícula.** Margen de ~4–6 px dentro de los 48; compara el peso visual con la bolsa y la billetera (son la referencia de tamaño).
5. **Detalle mínimo en blanco**: 1 a 5 elementos. Texto con la constante `T` (800, centrado); trazos con `W`.
6. **Comenta la intención** en una línea encima de la entrada, como el resto: `// Asa sólida detrás, bolsa de vidrio con check.`

## Estados y movimiento (ya resueltos en `vidrio.css`)

El contenedor lleva la clase `vd-host` (y `vd-btn` si es un botón de 64 px).

- **Hover / foco:** el vidrio sube 1,5 px y el sólido baja (parallax). Foco suma anillo violeta `#8460E5` de 2 px.
- **Presionado:** las capas se juntan y el ícono escala a 0,94 en 90 ms.
- **Seleccionado** (`aria-current="page"` o `aria-pressed="true"`): pasa a naranja de marca (`--solid #ED8936`, `--glass #FFC995`) más una barra inferior.
- **Deshabilitado** (`disabled`): gris (`#A9A6B5` / `#E2E0E9`) sin movimiento.
- **Gesto propio (opcional):** una sola pasada, 150–500 ms, solo `transform`. Ponle una clase `vd-xxx` a la pieza que se mueve,
  o anima `.vd--<clave> .vd-gx` con su `transform-origin` en coordenadas del viewBox. Copia el patrón de los que ya existen
  (martillo que golpea, campana que suena). `prefers-reduced-motion` ya lo apaga todo.

## Checklist antes de entregar

- [ ] Se ve a **24, 32, 40 y 48 px** (a 24 las capas tienden a confundirse: simplifica si hace falta).
- [ ] El sólido se cruza con el vidrio y se nota el desenfoque.
- [ ] El detalle blanco se lee sobre el vidrio claro (el «S/» y los textos pequeños son los que más fallan).
- [ ] Mismo peso visual que el resto del set.
- [ ] `aria-hidden` en el SVG; el nombre accesible va en el texto o en el `aria-label` del botón.
- [ ] Sin colores nuevos: solo `--solid`, `--glass`, blanco y los de estado.

## Contraste y accesibilidad (medido, oct 2026)

Medido con la fórmula de WCAG sobre fondo blanco:

| Par | Contraste | Lectura |
|---|---|---|
| Sólido `#5A35C2` vs blanco | **7,7:1** | La silueta sólida carga la legibilidad. |
| Vidrio (72 %) vs blanco | 1,7:1 | El vidrio solo **no** basta para identificar el ícono. |
| Detalle blanco sobre vidrio claro | 1,7:1 | Por eso fallan «S/», los faros y los textos chicos. |
| Detalle blanco donde el vidrio cubre el sólido | 3,0:1 | Justo en el mínimo. |
| Seleccionado naranja `#ED8936` vs blanco | 2,6:1 | Bajo 3:1: la barra inferior es la señal obligatoria. |

WCAG 1.4.11 exige 3:1 solo si el ícono hace falta para entender: **si va junto a un texto que dice lo mismo, no aplica**.
Reglas que salen de esto:
- Úsalos **siempre con etiqueta visible** (como en Tu actividad). En un botón solo-ícono, el `aria-label` no basta:
  la forma tiene que reconocerse por la parte **sólida**, así que el sólido debe dibujar el rasgo que identifica al objeto.
- Ningún detalle blanco puede ser la única pista (nada de «S/» como único significado).
- Al medir, usa el punto **menos contrastado** del vidrio, no un color promedio.

## Tamaños chicos

Las referencias (Primer/Octicons, Material Symbols) no escalan un solo dibujo: Primer dibuja **dos versiones**
(16 y 24 px) y Material ajusta el grosor con su eje de tamaño óptico (20–48). Aquí: retícula de 48 diseñada para
**32–72 px**. Bajo 32 px, haz una variante simplificada (sin detalle blanco, sólido más grueso) en lugar de achicar.
No uses estos íconos bajo 24 px.

## Rendimiento

- No animes `stdDeviation` (Safari deja residuos); anima solo `transform`/`opacity`, como hace `vidrio.css`.
- Cada ícono lleva su propio filtro: bien para decenas, no para cientos en una lista. Para listas largas, exporta a
  SVG estático o PNG @2x.

## Exportar a SVG suelto / Figma

- **SVG suelto:** renderiza el componente y copia el `<svg>` del DOM, o arma la plantilla de arriba con los paths de
  `PARTS` (reemplaza `currentColor` por `#5A35C2`). Funciona en navegador.
- **Figma:** el importador de SVG **descarta el `feGaussianBlur`** (y otras apps como Illustrator también). Reconstrúyelo:
  `back` → duplicarlo → *Layer blur* ≈ 6 en la copia → meter la copia en un grupo con la forma `front` como **máscara** →
  encima `front` con `#B9A6F2` al 72 % y trazo interior blanco 1,5 al 45 %. No uses *Background blur*: se pierde al exportar.
  Prueba siempre importando un archivo de verdad antes de dar por buena la versión de Figma.
- Los gestos y estados no viajan a Figma: son CSS.

## Fuentes (investigación 20/10/2026)

- W3C · [G207 contraste de íconos](https://www.w3.org/WAI/WCAG22/Techniques/general/G207) · [Deque · 1.4.11](https://dequeuniversity.com/resources/wcag2.1/1.4.11-non-text-contrast) · [Calgary · probar el punto menos contrastado](https://summit-prd-cdn.calgary.ca/user-experience-design/accessibility/web-content-accessibility-guidelines-2-1/perceivable-principle/1411-non-text-contrast.html)
- Navegadores · [DEV · Liquid Glass en la web](https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07) · [WebKit 139417 (animar blur)](https://bugs.webkit.org/show_bug.cgi?id=139417) · [Viget · vidrio con filtros y máscaras](https://www.viget.com/articles/frosted-glass-effect-with-blur-filters-and-masks/)
- Figma · [Rive (blur perdido al importar)](https://rive.app/community/forums/support/fsnLLkXUaA62/unable-to-stop-uploading-assets/ftcxyE1dlflw) · [Grida · layer vs background blur](https://grida.co/docs/@designto-code/figma-blur-effects) — testimonios, no doc oficial.
- Tamaños · [Primer · Octicons](https://primer.style/octicons/guidelines/design) · [Google · Material Symbols](https://developers.google.com/fonts/docs/material_symbols)
- Capas · [Apple · Icon Composer](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer) (capas atrás→adelante, efectos aplicados al final) · [Krumzi · glassmorphism 2026](https://www.krumzi.com/blog/glassmorphism-design-guide)
