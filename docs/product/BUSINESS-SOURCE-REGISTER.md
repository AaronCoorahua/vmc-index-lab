# Registro de fuentes de negocio VMC

Fecha de revisión: 2026-10-12

Este registro gobierna afirmaciones del producto. Una fuente oficial no vuelve
permanente un número de ofertas, tarifa o fecha: los datos volátiles deben
consultarse nuevamente antes de publicarse como reales.

| ID | Fuente | Propietario | Estado | Vigencia | Uso autorizado |
| --- | --- | --- | --- | --- | --- |
| VMC-WEB-HOME | `https://www.vmcsubastas.com/` | VMC/Subastop | oficial | revisada 2026-10-12; inventario volátil | IA vigente, modalidades, categorías, empresas y enlace de publicación |
| VMC-TERMS | `https://www.vmcsubastas.com/condiciones-y-terminos` | VMC/Subastop | oficial contractual | revisada 2026-10-12; comprobar cambios antes de flujos sensibles | definiciones de marketplace, oferta, vendedor, En Vivo, Negociable y responsabilidades |
| VMC-HELP-BUYER | `https://ayuda.vmcsubastas.com/es/collections/3079940-centro-de-ayuda-comprador` | VMC/Subastop | oficial de ayuda | revisada 2026-10-12 | contenidos de apoyo y fallback editorial para compradores |
| VMC-PUBLISH-CAR | `https://www.vmcsubastas.com/landing-subascars` | VMC/Subastop | oficial comercial | revisada 2026-10-12; precio y condiciones volátiles | ejemplo de CTA para publicar un vehículo; no regla universal para empresas |
| HOME-GRILLME | `docs/product/HOME-DECISION-MEMORY.md` | Julio | decisión de producto | vigente hasta sustitución explícita | jerarquía, feed, tiendas, cards y shell deseados |
| HOME-REFERENCE | `docs/research/HOME-REFERENCE-RECORD.md` | Julio | referencia aprobada | vigente como dirección, no estilo | composición, ritmo y patrones visuales |

## Reglas extraídas para el Home

- VMC es un marketplace e intermediario tecnológico; no es el vendedor ni
  garantiza por sí mismo la condición de los activos.
- Una oferta representa digitalmente una oportunidad de compra y el detalle
  contiene sus condiciones específicas.
- `En Vivo` implica competencia en tiempo real; `Negociable` permite iniciar
  una negociación directa con el vendedor.
- El precio base no representa necesariamente el costo final y no debe
  comunicarse como tal.
- La información de activos proviene principalmente de vendedores y debe
  presentarse con la diligencia y condiciones correspondientes.
- La Home oficial ya ofrece navegación por modalidad, categorías y empresas;
  esos ejes pueden informar el feed y los rails del piloto.
- El Centro de Ayuda es una fuente válida para fallback editorial, siempre que
  la pieza lleve al contenido oficial y no reescriba reglas sensibles.

## Hipótesis que continúan sin fuente oficial

- pagar para obtener una card de mayor jerarquía;
- ranking personalizado del Home;
- reglas exactas para fijar actividad urgente;
- inventario editorial automático cuando no hay eventos.

Estas hipótesis pueden mostrarse como ejemplo etiquetado, no como política VMC.
