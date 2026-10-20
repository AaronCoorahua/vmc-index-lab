# Entrega portable — VMC Index Final Review

Fecha de empaquetado: 2026-10-20 UTC

## Correspondencia verificada

Esta entrega proviene de `D:\JULIO\VMC\vmc-index-lab-main\vmc-index-lab-main`.

La carpeta contiene el metadato local `.vercel/project.json` cuyo `projectName` es `vmc-index-final-review`; por ello está vinculada al proyecto de `https://vmc-index-final-review.vercel.app/qa/home-index-rebase`.

- Repositorio: `https://github.com/AaronCoorahua/vmc-index-lab`
- Rama: `main`
- HEAD local: `96009e41e050b5f5d04212a598c8b9514e5df32c`
- Estado Git al inspeccionarlo: limpio (sin cambios locales ni archivos nuevos detectados).

Comprobación pública breve: la URL respondió `200` desde Vercel, reportó la ruta coincidente `/qa/home-index-rebase` y su HTML incluyó marcadores de la aplicación local (`Autoplan`, `Toyota Yaris` y assets `/assets/brand/logo-voyager.svg`). No se obtuvo un identificador de commit/deployment en el HTML ni un registro local de despliegues; por tanto, esta evidencia confirma la vinculación del proyecto y la coherencia de marcadores, **no una equivalencia criptográfica del árbol desplegado**.

No se ejecutaron `pull`, `reset`, `checkout`, `commit`, `push` ni despliegues; tampoco se alteraron ni detuvieron servidores.

## Instalación y ejecución

Requiere Node `24.19.x` y npm `11.17.x` (ver `.nvmrc` y `package.json`). En la raíz extraída:

```powershell
npm ci
npm run dev -- --port 3002
```

Referencia local: http://localhost:3002/qa/home-index-rebase

Para producción local: `npm run build` y después `npm run start -- --port 3002`.

Comprobaciones declaradas por el repositorio: `npm run lint`, `npm run test:routes`, `npm run verify:home-first-fold`, `npm run verify:technical` y `npm run verify`.

## Estado y límites

- Este paquete no declara aprobación visual de QA; dicha aprobación seguía pendiente.
- No se corrieron build, lint, pruebas ni QA visual durante este empaquetado, para mantener el alcance exclusivo de empaquetado.
- Existe una copia posterior distinta (`vmc-index-lab-aaron-dev-2026-10-19`) en el mismo HEAD con cinco modificaciones locales sin commit. No se incluyó porque no contiene el vínculo local al proyecto Vercel y no se verificó como fuente de la URL solicitada.

## Exclusiones de seguridad

Se excluyeron `.git`, `.vercel`, `node_modules`, `.next`, cachés (incluidos `*.tsbuildinfo`), logs, `.claude`, `coverage`, credenciales y archivos `.env`/`.env.*`. No se inspeccionaron contenidos de secretos. Si se requieren variables de entorno, cree `.env.local` después de extraer el ZIP y solicite los valores por el canal seguro del equipo. No almacene secretos en el paquete ni en el repositorio.

El detalle está en `CURRENT_CHANGES.md` y `PACKAGE_MANIFEST.json`.
