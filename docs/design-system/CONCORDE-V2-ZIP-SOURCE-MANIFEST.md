# Concorde V2 ZIP — manifiesto de instalación

## Fuente

- Archivo entregado por Julio: `C:\Users\APU\Downloads\borrar 2\DesignSystem.zip`.
- SHA-256: `9cd470486a35e6b3f894099f1d8a5ee05c8b9c4d913e2865be182af2a5fab99c`.
- Fecha de recepción: 2026-10-13.

## Allowlist exacta

Se instalarán las 49 entradas regulares del ZIP, sin sobrescribir la fuente
Concorde existente:

- 45 archivos en `DesignSystem/concorde/**`;
- 1 skill en `DesignSystem/.claude/skills/concorde-ui/SKILL.md`;
- 3 documentos de guía: `README.md`, `DESIGN.md`, `PROMPT.md`.

## Destino aislado y rollback

- Biblioteca: `.vendor/concorde-v2-zip-2026-10-13/DesignSystem/`.
- Skill instalado: `.agents/skills/concorde-ui/SKILL.md`.
- Runtime allowlist para este corte: los bloques oficiales instalados por el
  CLI de Concorde V2 en `apps/index-lab/concorde/`: `header`, `sidebar`,
  `banners`, `homepage`, `activitycard`, `categorycard`, `userprofilecard` y
  el estante `OfferShelf` con sus dependencias. No se editan localmente; la
  aplicación sólo llega a ellos mediante
  `@vmc/concorde-adapter`.
- Registro vivo usado por el CLI: `https://concorde-v2-theta.vercel.app/r/`;
  elementos: `header`, `sidebar`, `banners`, `homepage`, `activitycard`,
  `categorycard`, `userprofilecard`; consultado el 2026-10-13. El `OfferShelf`
  procede del ZIP entregado. Huellas SHA-256 de los artefactos
  activos: `Header.tsx` `B4017C219773DD733BB3E9868F`, `Sidebar.tsx`
  `E22EEBFAF460EA152148659CCA`, `PromoBanner.tsx`
  `892DA8B009F9752860CE47A47D`, `OfferShelf.tsx`
  `1FA56B3CCDD9DFD5404CC56D`.
- Rollback: eliminar únicamente `.vendor/concorde-v2-zip-2026-10-13/` y
  `.agents/skills/concorde-ui/`, y los archivos permitidos dentro de
  `apps/index-lab/concorde/`. No toca
  `.vendor/chatbot-final-vmc/` ni ningún repositorio vecino.

## Estado

Esta instalación es la fuente activa del corte aislado
`/qa/home-index-rebase`. No sustituye Concorde en ningún repositorio vecino ni
autoriza una promoción a producción.
