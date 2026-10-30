import type { Metadata } from "next";
import ComponentsLibrary from "./ComponentsLibrary";

export const metadata: Metadata = {
  title: "Componentes · VMC UX/UI Lab",
  description: "Componentes del Index con su animación y su código para copiar.",
};

export default function ComponentsPage() {
  return <ComponentsLibrary />;
}
