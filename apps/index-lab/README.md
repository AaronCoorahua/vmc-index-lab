# Index Lab

Única aplicación activa del laboratorio. Nace desde cero y no hereda el shell
rechazado de `index-council-review`.

La ruta `/` es temporalmente un gate de arquitectura. No constituye una
propuesta visual del Home. Las piezas visibles se incorporarán por cortes una
vez aprobado su Concorde Component Map.

Todo consumo del sistema de diseño debe entrar por
`@vmc/concorde-adapter`. El alias interno `@/*` existe únicamente para resolver
imports propios del checkout canónico mientras la transición C siga vigente.

## Home Index (QA)

La propuesta vigente del Home vive en `/qa/home-index-rebase`: bloque Homepage
de Concorde entre el header y el sidebar, con selectores a la derecha de cada
bloque para comparar variantes (VMC ahora, Lotes, Detail card, Categorías y
Empresas). El contenido es de ejemplo.

```sh
npm ci                      # en la raíz del monorepo
cd apps/index-lab
npx next dev --port 3001    # http://localhost:3001/qa/home-index-rebase
```
.