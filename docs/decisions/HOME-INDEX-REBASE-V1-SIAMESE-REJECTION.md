# Auditoría siamesa — Rechazo visual del Home V1

Fecha: 2026-10-13  
Estado: **NO-GO para seguir codificando**

## Dictamen conjunto

La ruta no falla por usar Concorde ni por la ausencia de un gradiente. Falla
porque la unidad de diseño implementada es un componente aislado, mientras que
la referencia de Julio es una composición editorial de experiencias.

La implementación convirtió el primer fold en tres columnas independientes:
copy, imagen y actividad. Eso no crea un hero. CTA, `OfferType` y
`BadgeStatus` seguidos se leen como una muestra de variantes. El rail de dos
cards deja gran vacío y se lee como specimens, no como inventario continuo.

## VP Experiencia: lectura de producto

- Hero debe ser un bloque unificado de aproximadamente 70–75 % de la zona;
  actividad, un panel secundario de 25–30 %.
- El H1 debe dominar inequívocamente; modalidades son una franja contextual,
  no dos piezas demostrativas bajo otro CTA.
- El primer rail debe iniciar inmediatamente después y enseñar continuidad:
  3.5–4.5 cards en desktop; 1.1–1.3 en móvil.
- No avanzar módulos secundarios antes de que se lea el recorrido:
  oportunidad dominante → actividad escaneable → inventario.

## VP Integridad: fallo de proceso

- Los gates PASS comprobaron imports, tokens, strings, test IDs, asset local,
  overflow y medidas mínimas. Ninguno comprobó agrupación, ratio, densidad,
  whitespace o relación entre bloques.
- El Component Map describía "dominante" e "integrada" sin convertirlos a un
  contrato espacial verificable.
- "Concorde Fit" se interpretó como no usar CSS visual local, no como evaluar
  si los componentes existentes permiten una composición válida. El vacío de
  hero, superficie y feed debió escalarse como gap, no rellenarse con layout
  neutro.
- Se construyeron módulos posteriores antes de aceptar el primer fold, lo que
  rompió el corte vertical.

## Corrección obligatoria del pipeline

1. Crear Visual Intent Packet antes de código: referencia anotada, blueprint
   con zonas/proporciones/densidad, contact sheet Concorde y variantes mobile.
2. Julio aprueba una composición concreta o decide la alternativa cuando hay
   gap: delta aceptado, `system-candidate` o `concorde-upgrade`.
3. Implementar sólo el primer fold y rechazar cambios fuera de ese alcance.
4. Revisar lado a lado referencia → blueprint → render, con rúbrica de Home:
   cohesión, oportunidad dominante, feed escaneable, continuidad de rail y
   densidad. Sólo entonces llega a revisión de Julio.

El gate actual de primera pantalla puede conservarse como comprobación técnica,
pero no es criterio de readiness ni sustituto de la rúbrica visual.
