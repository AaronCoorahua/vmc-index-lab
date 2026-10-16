# Decision Packet — Motor de iniciativas V1/V2

## Decisión

Adoptar un pipeline reutilizable de dos pases para toda iniciativa UX/UI del
laboratorio: V1 — Concorde Fit rápido y V2 — Diseño a medida guiado.

## Alcance

- Incluido: contrato de corte, clasificación de entrega, skills, templates y
  gates locales de diseño/procedencia.
- Fuera de alcance: cambiar el repositorio vecino de Concorde, promover el
  Home, crear un componente compartido o resolver un flujo funcional.

## Contrato operativo

- V1 convierte una referencia a componentes y foundations Concorde disponibles
  y entrega un delta visible. No inventa componentes ni reglas de negocio.
- V2 empieza tras la revisión de V1. El council propone mejoras, pero consulta
  a Julio antes de una alternativa material, candidato local, upgrade o cambio
  de negocio.
- `concept-prototype` puede explorarse, pero el gate lo reporta como tal y no
  permite que se presente como Concorde Fit.

## Gates

- `verify:provenance`: assets y referencias declarados.
- `verify:cut-contract`: coherencia entre CURRENT, Packet, Map y contrato.
- `verify:concorde-contract`: revisión/árbol, exports y tokens de Concorde.
- `verify:styles`: recetas visuales locales y selectores de anatomía privada.

`npm run verify` incorpora el gate agregado. Los contratos estrictos fallan
ante primitives visuales no cubiertas; los conceptos dejan una advertencia
auditable y bloquean promoción.

## Estado del Home existente

`home-discovery-v1` queda preservado como `concept-prototype`. Su próxima tarea
no es pulirlo, sino ejecutar V1 Concorde Fit hasta resolver su delta de
foundations. No se confunde una captura previa con la aceptación de ese pase.
