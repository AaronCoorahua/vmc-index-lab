import { concordeSource } from "@vmc/concorde-adapter/source";

export default function ArchitectureGatePage() {
  return (
    <main>
      <h1>VMC UX/UI Lab</h1>
      <p>Gate de arquitectura listo para validar.</p>
      <dl>
        <dt>Concorde activo</dt>
        <dd>{concordeSource.revision}</dd>
        <dt>Estado del Home</dt>
        <dd>Home V2 aislado en revisión visual.</dd>
      </dl>
    </main>
  );
}
