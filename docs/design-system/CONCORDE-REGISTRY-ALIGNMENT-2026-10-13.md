# Alineación con el registro oficial — 2026-10-13

Autorización: Julio pidió usar fielmente la librería y confirmó «ok go» para
el pase referencia → mapa Concorde → implementación.

Allowlist: `components/OfferCard.tsx`, `components/BadgeStatus.tsx` y
`components/CardTitle.tsx`, dentro de `apps/index-lab/concorde/`.
Origen: los JSON homónimos de `https://concorde-v2-theta.vercel.app/r/`.
Se instalará exactamente `files[].content`, sin ajustes de estilos locales.

La comparación del catálogo detectó diferencias reales de paleta y gradientes
respecto al snapshot anterior. Header, Sidebar, CategoriesSection,
AuctioneerSection, CategoryCard y los banners coinciden al normalizar CRLF/LF.
OfferShelf sólo difiere en imports relativos frente al alias `@/concorde/`.

Preservación previa: copia textual de los tres archivos anteriores en
`.vendor/concorde-v2-before-registry-alignment-2026-10-13/components/`.
Rollback: restaurar esos tres contenidos con `apply_patch` y restituir el
snapshot `concorde-v2-2026-10-13`, árbol
`1e53a4428356dd9c608a5be76c1ca413b3e1b20091bb9922c545ec5a83a347ae`,
en el manifiesto y contrato. No se borra historial ni se cambia otro repositorio.

El registro remoto es una consulta de instalación. La verificación posterior
usa el nuevo hash congelado; no descarga ni actualiza la biblioteca.

Árbol final instalado:
`31b86922bd412953d2a4dadb28dbe217c75c1a5606fc53a0c24ee7d479508291`.
Pruebas y comparación final:
`docs/delivery/HOME-CONCORDE-ALIGNMENT-EVIDENCE.md`.
