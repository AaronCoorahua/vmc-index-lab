# Contrato de fuente Concorde

Estado: transición C aprobada para el piloto.

## Fuente fijada

- Repositorio: `https://github.com/subascorp/chatbot-ai-vmc.git`
- Revisión: `40d1be50206021157d9d6ad81327df8ba25486a4`
- Árbol `frontend/concorde`: `5d142a656dba74518e46b2c192cce946d15b075f`
- Blob de tokens: `0dcaf3d86030659c41c339ea2185772ae99601fc`
- Captura: 2026-10-12

El contrato completo, incluyendo los hashes de manifiestos, vive en
`config/concorde-source.json`.

## Frontera

El bootstrap crea un checkout separado bajo `.vendor/`, excluido de Git. Nunca
consume el working tree del repositorio de producto y no copia credenciales. El
adaptador es la única entrada permitida desde código activo.

### Compatibilidad conocida

`Sidebar.tsx` importa cinco iconos como `@/concorde/components/*`, mientras el
`tsconfig.json` del producto resuelve `@/*` primero contra `frontend/src/*` y
esa ubicación sólo contiene dos componentes distintos. El laboratorio conserva
la preferencia por `frontend/src/*` y añade `frontend/*` como segundo destino,
sin modificar Concorde. Esta compatibilidad debe eliminarse cuando el paquete
durable publique imports internos coherentes.

Los tokens se cargan mediante el subpath público
`@vmc/concorde-adapter/tokens.css`; la aplicación no conoce su ubicación física.

Next se fija en `16.4.0`, en lugar del `16.3.4` del repositorio fuente, porque
la versión heredada está dentro de rangos de seguridad corregidos posteriormente.
Concorde mantiene React y React DOM `19.2.8`, que son compatibles con ese cambio.

Cambiar la revisión requiere:

1. actualizar SHA y objetos Git esperados;
2. ejecutar verificación de fronteras, build y regresión visual;
3. revisar el Component Map afectado;
4. registrar explícitamente el cambio.

## Salida hacia el paquete durable

Esta solución es transitoria. Se propone crear `@vmc/concorde` cuando aparezca
un segundo consumidor, se repitan adaptaciones entre páginas o la coordinación
de revisiones empiece a dominar el trabajo de producto.
