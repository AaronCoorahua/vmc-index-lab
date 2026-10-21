---
name: banners-subastop
description: Banners de la campaña «Venta para empresas» de Subastop (5 variantes × 4 formatos, en HTML con el design system de subastop.com) y cómo insertarlos en el index de VMC u otra página. Úsala cuando pidan poner, cambiar o crear un banner/publicidad de Subastop, «Venta para empresas», los banners de activos/maquinaria/tecnología/flotas/repuestos, o el tamaño/UTM/estilo de esos banners.
---

# Banners «Venta para empresas» · Subastop

Actualizado: 2026-10-21 · Autor: Abraham Huacchillo (diseño) · Copy rev. 3 de POPs.

Todo sale de **una sola plantilla**: `assets/banners/venta-empresa.html`. Se elige la pieza por query string:

```
venta-empresa.html?v=<variante>&f=<formato>
```

`assets/banners/galeria.html` muestra las 20 piezas juntas. `assets/banners/originales/*.jpg` son los JPG originales de POPs y solo sirven de referencia visual, no se publican.

## Variantes (`v`)

| v | Etiqueta | Titular | CTA |
|---|---|---|---|
| `01-general` | Activos sin uso | ¿Tu empresa necesita liquidez? | Quiero saber cómo vender |
| `02-maquinaria` | Maquinaria y equipos | ¿Maquinaria parada? Ponla en venta. | Quiero vender mis equipos |
| `03-tecnologia` | Tecnología | ¿Renovaste tecnología? Vende la anterior. | Quiero vender tecnología |
| `04-flotas` | Vehículos y flotas | ¿Vehículos parados? Ponlos a la venta. | Quiero vender mi flota |
| `05-inventario` | Materiales y repuestos | ¿Repuestos que no se mueven? Véndelos. | Quiero vender mi stock |

Por defecto: `04-flotas`. El copy está aprobado, **no se cambia** sin pasar por POPs/Abraham. Vive en el objeto `V` del `<script>` de la plantilla.

## Formatos (`f`)

| f | Tamaño (ancho × alto) | Dónde va | Bajada |
|---|---|---|---|
| `side264` | 200 × 264 | Barra lateral izquierda (hueco fijo) | corta |
| `side400` | 200 × 400 | Riel derecho | larga |
| `strip776` | 776 × 232 | Franja en columna central / móvil | corta |
| `strip1532` | 1532 × 200 | Franja a todo el ancho | larga |

Por defecto: `side400`.

## Cómo insertarlo en el index

1. Copia `venta-empresa.html` al sitio, p. ej. `public/banners/venta-empresa.html` (mismo dominio que el index).
2. Pon un `<iframe>` con el tamaño del formato:

```html
<!-- Barra lateral -->
<iframe src="/banners/venta-empresa.html?v=05-inventario&f=side264"
        title="Venta para empresas: ¿Repuestos que no se mueven? Véndelos."
        width="200" height="264" loading="lazy"
        style="border:0;border-radius:16px;display:block"></iframe>

<!-- Riel derecho -->
<iframe src="/banners/venta-empresa.html?v=05-inventario&f=side400"
        title="Venta para empresas" width="200" height="400" loading="lazy"
        style="border:0;border-radius:16px;display:block;width:100%"></iframe>

<!-- Franja responsiva -->
<iframe src="/banners/venta-empresa.html?v=05-inventario&f=strip776"
        title="Venta para empresas" loading="lazy"
        style="border:0;border-radius:16px;display:block;width:100%;max-width:776px;aspect-ratio:776/232"></iframe>
```

3. **Alto automático en el riel** (si el riel cambia de ancho, el texto ocupa más líneas y un alto fijo corta el botón). Solo funciona en el mismo dominio:

```js
function fitBanner(f) {
  const go = () => {
    const d = f.contentDocument, w = f.contentWindow;
    if (!d || !w || d.location.href === "about:blank") return;
    const fit = () => { const c = d.querySelector(".cta"); if (c) f.style.height = Math.ceil(c.getBoundingClientRect().bottom) + 16 + "px"; };
    fit(); d.fonts.ready.then(fit); w.addEventListener("resize", fit);
  };
  if (f.contentDocument?.readyState === "complete") go();
  f.addEventListener("load", go);
}
document.querySelectorAll('iframe[src*="f=side400"]').forEach(fitBanner);
```

En React/Next, pásalo como `ref={fitBanner}` (no `onLoad`: el iframe puede cargar antes de la hidratación).

Si el banner se sirve desde **otro dominio**, `fitBanner` no puede leerlo: usa el alto fijo de la tabla.

4. Para rotar variantes, solo cambia `v` (p. ej. al azar o por sección). No dupliques la plantilla.

## Enlace y medición

El banner entero es un único `<a>` que abre en pestaña nueva:

```
https://www.subastop.com/cita?utm_source=vmc&utm_medium=banner&utm_campaign=venta_empresa&utm_content=<v>_<f>#contact-form
```

Si lo pones fuera de VMC, cambia **solo** `utm_source` (p. ej. `subascars`). No envuelvas el iframe en otro enlace.

## Design system (DS v3 de subastop.com)

Tokens (están dentro de la plantilla, no hace falta otro CSS):

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#08152F` | Titular, texto principal |
| `--paper` | `#F4F2EC` | Fondo del banner |
| `--blue` | `#1A56DB` | Borde superior (6 px; 8 px en strip1532), etiqueta, raya |
| `--amber` | `#F59E0B` | Fondo del CTA (texto `#412402`) |
| `--muted` | `#5B6473` | Segunda etiqueta y bajada |
| `--line` | `rgba(8,21,47,.14)` | Separador en strip1532 |

Tipografías (Google Fonts):
- **Outfit 800** → titular, interlineado .98, tracking −.04em.
- **Inter 400** → bajada.
- **IBM Plex Mono 600** → etiquetas y CTA, MAYÚSCULAS con tracking.

Estructura fija de cada pieza: borde azul arriba → «VENTA PARA EMPRESAS» (azul) → etiqueta de la variante (gris) → titular → bajada → botón ámbar (radio 12 px). Hover: el botón sube 2 px.

## Reglas

- Sin íconos ni logo de Subastop dentro del banner (README de POPs).
- No cambiar colores, fuentes ni copy; si hace falta otro formato, agrégalo en la plantilla como bloque `[data-f=nuevo]` y en el array `F`, con el mismo esquema.
- Fondo del banner siempre `paper`, aunque la página sea oscura (en VMC va sobre el violeta, ver captura del riel).
- Es publicidad: el contenedor lleva `aria-label="Publicidad"` y el iframe un `title` descriptivo.
