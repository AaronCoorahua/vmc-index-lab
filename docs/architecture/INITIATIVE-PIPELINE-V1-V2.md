# Motor de iniciativas V1/V2

## Promesa visible al iniciar

Una iniciativa no entra directamente a una implementación final. El sistema
declara su pista antes de producir UI:

1. **V1 — Concorde Fit:** “Trae la referencia como esté. La convertimos
   rápidamente a la gramática visual disponible de VMC: componentes, tokens y
   patrones verificados. Verás avance temprano y el delta respecto de la
   referencia.”
2. **V2 — Diseño a medida:** “Una vez revisada la base, profundizamos con
   GrillMe, fuentes, UX/UI, negocio y council. Las mejoras materiales se
   presentan con alternativas antes de implementarse.”

V1 no es una promesa de UX definitivo; V2 no es licencia para rediseñar sin
decisión del dueño.

## Estados de entrega

| Clase | Permitido | No permitido |
| --- | --- | --- |
| `concept-prototype` | Explorar jerarquía y contenido con fixtures explícitos. | Declarar compatibilidad Concorde, promover o reutilizar como patrón. |
| `concorde-fit` | Componer con componentes y foundations verificadas; mostrar delta V1. | Crear recetas visuales o componentes nuevos sin contrato. |
| `system-candidate` | Ejecutar V2 y preparar revisión humana formal. | Pasar con waivers vencidos, brechas ocultas o negocio sin fuente. |

## Contrato por corte

Cada corte tiene un `design-contract.json` enlazado desde `CURRENT.md` y el
Decision Packet. Es la fuente legible por máquinas para:

- clase de entrega y fase V1/V2;
- revisión y árbol Concorde;
- componentes y props públicas usados;
- foundations/tokens aplicables;
- CSS local permitido;
- referencias externas, incluido Voyager cuando exista evidencia verificable;
- assets, procedencia y alcance;
- excepciones, dueño y fecha de vencimiento.

Voyager es evidencia de investigación, no autoridad implícita de implementación.
Sin fuente, nodo/URL, fecha y correspondencia declarada, se marca `unverified`
y no puede transferir estilo a un `concorde-fit`.

## Decisiones y permisos

El agente puede aplicar sin consulta una corrección objetiva dentro del contrato
activo. Debe pedir decisión antes de: cambiar la regla de negocio, elegir una
alternativa UX material, crear un candidato local, extender Concorde, promover
un corte, o usar una excepción visual nueva.

Los candidatos locales viven en la iniciativa y usan el contrato Concorde. Sólo
un `concorde-upgrade` autorizado puede promoverlos a la librería compartida.

## Gates

La cadena local es:

`verify:concorde → verify:provenance → verify:cut-contract → verify:concorde-contract → verify:boundaries → verify:styles → build/lint/routes → evidencia`

Los conceptos pueden generar evidencia, pero el gate comunica que no son
candidatos sistémicos. `concorde-fit` y `system-candidate` fallan si los
foundations, props, assets o CSS no están cubiertos por contrato.
