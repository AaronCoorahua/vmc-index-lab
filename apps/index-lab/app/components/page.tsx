import type { Metadata } from "next";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import ComponentsLibrary from "./ComponentsLibrary";

export const metadata: Metadata = {
  title: "Componentes · VMC UX/UI Lab",
  description: "Componentes del Index con su animación y su código para copiar.",
};

// Archivos de la librería (./lib): se leen al compilar y se muestran tal cual en las pestañas de código.
const LIB_FILES = [
  "FeaturedCard.tsx", "featured-card.css", "LightBar.tsx", "light-bar.css", "OfferTypeCards.tsx", "offer-type-cards.css",
  "LotGallery.tsx", "lot-gallery.css",
];
function libSources(): Record<string, string> {
  const dir = [path.join(process.cwd(), "app/components/lib"), path.join(process.cwd(), "apps/index-lab/app/components/lib")].find((d) => existsSync(d));
  return Object.fromEntries(LIB_FILES.map((f) => [f, dir ? readFileSync(path.join(dir, f), "utf8") : `// No se encontró lib/${f}`]));
}

export default function ComponentsPage() {
  return <ComponentsLibrary sources={libSources()} />;
}
