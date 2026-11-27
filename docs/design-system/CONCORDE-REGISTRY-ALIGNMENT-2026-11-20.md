# Alineación con el registro oficial — 2026-11-20

Contexto: unificación de Subastop sobre Concorde V2. Fuente única
`AaronCoorahua/ConcordeV2` rama `master` @ `50ab6c3` (2026-11-19), la misma que
publica `https://concorde-v2-theta.vercel.app/r/registry.json`. Paso 2 de la
auditoría `DESIGN-SYSTEM-AUDIT-2026-11-20.md` (carpeta madre de Subastop).

## Componentes reinstalados

Se compararon las 20 copias de `apps/index-lab/concorde/components/` con
`files[].content` de su item en el registro vivo, normalizando CRLF/LF.
Desvío real encontrado y reinstalado tal cual (`files[].content`):

| Archivo | Líneas | Qué traía distinto |
|---|---|---|
| `BadgeStatus.tsx` | 15 | gradientes naranja/morado viejos (`#ff9639`, `#be3d00`, `#8776ff`), sin `min-width` |
| `LikeButton.tsx` | 10 | `#e8ddff` y glow `#200068` (Concorde: `#e8deff`, `#22005c`) |
| `OfferShelf.tsx` | 6 | imports relativos `./X` (Concorde: alias `@/concorde/components/X`) |
| `OfferType.tsx` | 2 | etiqueta por defecto «RECIBE OFERTAS» (Concorde: «NEGOCIABLE») |
| `ProfileButton.tsx` | 8 | anillo naranja viejo (`#ef852e`, `#be3d00`) |

`ActivityCard` y `UserProfileCard`, listados en la auditoría, ya coinciden con
el registro (0 líneas de diferencia), igual que los otros 13 archivos.
`OfferType.tsx` se sirve en CRLF; se guardó en LF como el resto del repo.

`OfferType` sólo lo montan los bloques `Homepage`/`HomepageMobile`, que ninguna
ruta activa renderiza; el texto «Recibe ofertas» de las rutas del lab viene de
`app/components/lib/OfferTypeCards.tsx` y no cambia. Si el bloque debe decir
«Recibe ofertas», el cambio va a Concorde y luego se reinstala.

## Tokens

`packages/concorde-adapter/src/concorde/tokens.css` es copia literal de
`src/styles/tokens.css` de Concorde master (md5 `0720b884…`).
`@vmc/concorde-adapter/tokens.css` lo importa primero y sólo agrega variables
que Concorde aún no publica. Cambian a valor Concorde: `--vmc-color-neutral-700`
(`#667085` → `#99a1af`) y `--vmc-color-vault-300` (`#cfbaff` → `oklch(0.82 0.13 285)`).

## Snapshot

Árbol anterior `31b86922…` (42 archivos; el gate ya fallaba porque
`LikeButton.tsx` se agregó el 2026-10-19 sin actualizarlo). Árbol nuevo:
`fd5f4a92f6e1f80ff3be02946707d9fb2dc9c80e89159de5e7f8c8f9d30789be` (43 archivos),
fijado en `config/concorde-v2-source.json`.

Rollback: `git revert` del commit que introduce este registro.
