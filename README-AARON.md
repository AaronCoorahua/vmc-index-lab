# VMC Index Lab — handoff reproducible

Fecha de empaquetado: 2026-10-15 

## Propósito

Este paquete contiene el estado local reproducible de `apps/index-lab` para
continuar el corte QA de Home VMC. No es una promoción a producción ni una
aceptación visual del producto.

## Punto de partida Git conocido localmente

- Raíz local original: `D:/JULIO/VMC/ux-ui-upgrades`
- Rama: `main`
- HEAD local: `b26d60f1b4d9a53b85093897c18a6c35a960f90b`
- Commit: `test(shell): freeze diagnostic evidence`
- No había `remote` ni upstream configurado en el clon local al empaquetar.
- El avance de `apps/index-lab`, sus documentos y scripts contiene cambios
  locales sin commit; están incluidos en este ZIP para no perder el trabajo.

Por ello no debe asumirse que ningún cambio esté publicado en GitHub. Este ZIP
es la fuente de continuidad hasta que el propietario decida crear un remoto o
un commit explícito.

## Ejecutar

Requisitos: Node `24.19.x` y npm `11.17.x` (ver `.nvmrc` y `package.json`).

```powershell
npm ci
npm run build
npm run start -- --port 3001
```

Abrir localmente `http://127.0.0.1:3001/qa/home-index-rebase`.

Comprobaciones disponibles:

```powershell
npm run lint
npm run test:routes
npm run verify:home-first-fold
npm run verify:concorde-v2
npm run verify:concorde-only
npm run audit:design-system
```

## Estado y límites

- Corte activo: `home-index-concorde-only-v1`.
- La captura incluida es el último render técnico verificable del primer fold.
  Superó los gates técnicos, pero sigue pendiente de aceptación visual de Julio.
- La referencia aprobada es `references/source/vmc-home-reference-approved.png`.
- No continuar la implementación de secciones posteriores como si existiera
  aprobación visual. Consultar `docs/decisions/CURRENT.md` y el Decision Packet.

## Contenido

- `apps/index-lab/`: aplicación QA, snapshot local de Concorde y assets locales.
- `packages/concorde-adapter/`: adaptador local requerido por la aplicación.
- `config/` y `scripts/`: contrato V2 y verificaciones/capturas locales.
- `docs/`: decisión activa, Component Map, intención visual y evidencia.
- `references/` y `evidence/`: imagen de referencia aprobada y última captura.

.