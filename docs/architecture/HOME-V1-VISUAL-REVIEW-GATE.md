# Gate visual de Home V1

Estado: activo desde 2026-10-13 para `home-index-rebase-v1`.

## Incidente que lo origina

La primera QA de `home-index-rebase-v1` superó build, lint, contrato,
procedencia, rutas y ausencia de overflow. Julio la rechazó visualmente porque
se percibía como un storybook, no como una Home. Por tanto esos gates eran
necesarios, pero no suficientes.

La causa no fue Concorde: fue un corte demasiado amplio y criterios que
validaban presencia técnica de bloques, pero no su lectura como producto.

## Gate antes de mostrar un corte al dueño

1. El cambio se limita a una experiencia observable (para Home: la primera
   pantalla) antes de avanzar secciones posteriores.
2. El lienzo de producto no exhibe etiquetas de QA, versión, snapshot,
   contenido estático ni explicaciones de restricciones. Esa trazabilidad vive
   en Decision Packet, manifest y evidencia.
3. La primera pantalla debe mostrar una jerarquía comprobable: foco principal
   de oportunidad con asset documentado, actividad secundaria de lectura
   rápida y una continuación visible hacia oportunidades. No basta con que
   los tres bloques existan en el DOM.
4. La evidencia incluye captura de viewport desktop y mobile, además de
   consola, overflow y foco. La captura se revisa antes de construir la
   siguiente sección.
5. Un rechazo de Julio bloquea el avance de secciones nuevas: se actualizan
   memoria, Packet y Component Map; no se reinterpreta como aprobación técnica.

## Regla de ejecución

Los gates de integración continúan ejecutándose. Este gate se agrega antes de
la revisión humana, no la sustituye. El resultado sólo puede ser:

- **listo para revisión visual:** satisface los criterios observables;
- **bloqueado para revisión:** alguno falla; se corrige sólo esa vertical;
- **aceptado por Julio:** decisión humana explícita, registrada aparte.
