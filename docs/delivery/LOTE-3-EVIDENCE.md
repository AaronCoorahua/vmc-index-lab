# Evidencia — Lote 3

Fecha: 2026-10-12

Resultado: PASS.

## Alcance comprobado

- única app activa creada desde cero en `apps/index-lab`;
- checkout Concorde separado, ignorado y fijado a un commit;
- adaptador como única frontera de componentes y tokens;
- Node `24.19.0`, npm `11.17.x`, Next `16.4.0`, React y React DOM `19.2.8`;
- instalación independiente con `npm ci`;
- build, TypeScript, lint y manifiesto de rutas;
- auditoría npm sin vulnerabilidades conocidas;
- ausencia de rutas absolutas, imports desde la copia secundaria y links en el
  árbol fuente activo.

## Fuente Concorde verificada

- commit: `40d1be50206021157d9d6ad81327df8ba25486a4`;
- árbol Concorde: `5d142a656dba74518e46b2c192cce946d15b075f`;
- blob de tokens: `0dcaf3d86030659c41c339ea2185772ae99601fc`;
- `origin` normalizado a `https://github.com/subascorp/chatbot-ai-vmc.git`;
- working tree del checkout: limpio.

El bootstrap se probó creando un clon independiente desde el repositorio local
y después reemplazando su `origin` por la URL canónica. Así se confirmó que los
cambios sin commit del working tree del producto no entran al laboratorio. Una
máquina nueva seguirá necesitando acceso Git autorizado al repositorio remoto.

## Instalación y seguridad

- `npm ci`: PASS, 144 paquetes añadidos desde el lockfile definitivo;
- `npm audit --audit-level=low`: PASS, 0 vulnerabilidades;
- SHA-256 `package-lock.json`:
  `3D69CAE0F1532A1111A120062BB69AFFB5359F1802DC2660E519C0AAF9AEA8EF`;
- una sola resolución de ESLint: `10.12.0`.

La versión inicial `next@16.3.4`, heredada del producto, fue descartada porque
la auditoría la ubicó dentro de rangos vulnerables. El laboratorio usa
`next@16.4.0`, compatible con React `19.2.8`, y la auditoría final queda limpia.

## Pipeline final

`npm run verify` ejecutó en orden:

1. `verify:concorde`: PASS;
2. `verify:boundaries`: PASS;
3. build de producción con Webpack: PASS;
4. TypeScript: PASS;
5. lint: PASS, cero warnings;
6. `test:routes`: PASS;
7. rutas emitidas: `/` y `/_not-found`.

## Hallazgo registrado

El Sidebar canónico usa cinco imports `@/concorde/components/*` que no resuelven
con el alias principal `frontend/src/*`. El adaptador mantiene ese destino como
primera opción y usa `frontend/*` como fallback. Concorde permanece sin cambios;
la deuda está descrita en `docs/design-system/CONCORDE-SOURCE.md`.

## Fuera de alcance deliberado

- no se rediseñó el Home;
- no se promovieron assets o fixtures históricos;
- no se mostraron todavía Header ni Sidebar;
- no se alteró el repositorio `chatbot-final-vmc`;
- no se creó una segunda copia versionada de Concorde.

La ruta `/` actual es un diagnóstico de arquitectura, no una propuesta visual.
El siguiente gate corresponde al workflow mínimo de Design Ops y al Component
Map del Corte 1.
