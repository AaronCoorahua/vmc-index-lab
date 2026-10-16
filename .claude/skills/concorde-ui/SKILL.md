---
name: concorde-ui
description: Traer componentes y bloques del design system de Subastop (Concorde) a un proyecto. Úsalo cuando el usuario quiera UI de Subastop, pedir un componente (botón, card de oferta, sala de subasta, etc.) o montar una página. Sabe dónde fetchear el catálogo y cómo instalarlos con el CLI.
---

# Concorde UI — traer componentes de Subastop

Concorde es el design system de Subastop. Cada componente es **un solo archivo
`.tsx` autocontenido** (CSS-in-JS, sin deps salvo React). Tu trabajo: identificar
qué componente/bloque necesita el usuario y traerlo a su proyecto.

## 1. Descubre qué hay

Antes de asumir nombres, fetchea el catálogo vivo:

- Índice: `https://concorde-v2-theta.vercel.app/r/registry.json`
  → `items[]` con `name`, `type` (`registry:component` | `registry:block`), `title`;
  los bloques traen `components[]` (qué componentes usan).
- Guía completa para IA: `https://concorde-v2-theta.vercel.app/llms.txt`

Para ver el código/props de un item: `https://concorde-v2-theta.vercel.app/r/<nombre>.json`
(trae `files[]` con `{ target, content }`). Preview humano: `/handoff/<nombre>` y `/blocks/<id>`.

## 2. Instálalo

Preferido — CLI (copia el/los archivos al proyecto):

    npx github:AaronCoorahua/ConcordeV2#cli add <nombre>

- Instala en `./concorde`: componentes → `concorde/components/<Name>.tsx`, bloques → `concorde/bloques/<Block>/`.
- Imports con alias `@/concorde/...` (el proyecto debe mapear `@/*` a la raíz de `concorde/`).
- Un componente → un archivo. Un bloque → sus secciones + componentes. Flags: `--force`, `--skip`.

Sin terminal: fetchea `<nombre>.json` y escribe cada `files[].content` en un archivo
(los imports entre archivos son relativos `./X`, así que guarda los dependientes juntos).

## 3. Úsalo

- Importa por defecto: `import Button from "./Button"` y usa sus props/variantes.
- No reescribas estilos; ajusta vía props. Edita el archivo solo si necesitas algo custom.

## Catálogo (snapshot — confirma con /r/registry.json)

Componentes: accordion, amountoptiongroup, auctionstatus, avatarzone, badgestatus,
bidbutton, bidmessage, bidposition, bidproposal, button, cardtitle, cardviewer,
categorycard, checkicon, conditionpill, detailcard, docbutton, input, likebutton,
offercard, offertype, pricebadge, priceicon, profilebutton, progressbar, salastatus,
sendbidicon, sidebar, signal, staricon, table, tabselector, termsselector, timericon

Bloques: homepage, detalle, sala, salamobile (cada uno instala sus componentes).
