# Cuarentena de experimento fuera de alcance — 2026-10-13

## Motivo

Se ejecutó una prueba temporal de extensión de componentes de Concorde para el
diagnóstico `/qa/shell`. No se adopta como baseline de este laboratorio ni como
versión de Concorde. El laboratorio vuelve a consumir exclusivamente la
revisión declarada en `config/concorde-source.json`.

No se modificó ni se publica ningún repositorio externo como parte de esta
corrección de alcance.

## Artefactos movidos

Destino recuperable: `D:\JULIO\VMC\ux-ui-upgrades-quarantine-20261013\evidence`

| Origen relativo | Archivos | Tamaño aproximado |
| --- | ---: | ---: |
| `evidence/shell-spike-20261013-concorde-upgrade` | 17 | 946,503 bytes |
| `evidence/shell-spike-20261013-concorde-upgrade-r2` | 17 | 1,020,232 bytes |
| `evidence/shell-spike-20261013-concorde-upgrade-r3` | 0 | 0 bytes |
| `evidence/shell-spike-20261013-concorde-upgrade-r4` | 17 | 1,024,725 bytes |
| `evidence/shell-spike-20261013-concorde-upgrade-r5` | 17 | 1,022,866 bytes |

## Recuperación

Si el propietario decide retomar este experimento de forma explícita, puede
mover los directorios de regreso a `evidence/`. No constituyen evidencia de
promoción: la fuente usada durante la prueba no quedó publicada ni fijada para
un clon limpio.
