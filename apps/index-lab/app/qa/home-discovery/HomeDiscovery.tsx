"use client";

import {
  BadgeStatus,
  Button,
  CategoryCard,
  OfferCard,
} from "@vmc/concorde-adapter";

import styles from "./HomeDiscovery.module.css";

const inventoryImage = {
  vehicle: "/demo/inventory-suv-v1.png",
  excavator: "/demo/inventory-excavator-v1.png",
  forklift: "/demo/inventory-forklift-v1.png",
  steel: "/demo/inventory-steel-v1.png",
} as const;

const mobility = [
  { name: "SUV familiar", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
  { name: "Auto urbano", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
  { name: "Pick-up", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
  { name: "Flota ligera", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
  { name: "Comercial", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
  { name: "Movilidad eléctrica", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
  { name: "Crossover", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
  { name: "Uso familiar", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
  { name: "Movilidad urbana", year: "Ejemplo", imageSrc: inventoryImage.vehicle },
];

const machinery = [
  { name: "Excavadora", year: "Ejemplo", imageSrc: inventoryImage.excavator },
  { name: "Montacargas", year: "Ejemplo", imageSrc: inventoryImage.forklift },
  { name: "Materiales", year: "Ejemplo", imageSrc: inventoryImage.steel },
  { name: "Equipo de obra", year: "Ejemplo", imageSrc: inventoryImage.excavator },
  { name: "Operación ligera", year: "Ejemplo", imageSrc: inventoryImage.forklift },
  { name: "Suministros", year: "Ejemplo", imageSrc: inventoryImage.steel },
  { name: "Trabajo pesado", year: "Ejemplo", imageSrc: inventoryImage.excavator },
  { name: "Bodega", year: "Ejemplo", imageSrc: inventoryImage.forklift },
  { name: "Estructuras", year: "Ejemplo", imageSrc: inventoryImage.steel },
];

function StaticAction({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div inert className={styles.staticAction}>{children}</div>;
}

function OfferRail({
  title,
  description,
  items,
}: Readonly<{
  title: string;
  description: string;
  items: readonly { name: string; year: string; imageSrc: string }[];
}>) {
  return (
    <section className={styles.railSection} aria-labelledby={`${title}-heading`}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Tienda · Demo</p>
          <h2 id={`${title}-heading`}>{title}</h2>
          <p>{description}</p>
        </div>
        <span className={styles.nonAction}>Muestra visual</span>
      </div>

      <div className={styles.rail} aria-label={`Oportunidades de ejemplo de ${title}`}>
        <div className={`${styles.cardSlot} ${styles.featuredSlot}`}>
          <p className={styles.featuredLabel}>Destacado · Ejemplo</p>
          <StaticAction>
            <OfferCard
              variant="live"
              size="full"
              name={items[0].name}
              year={items[0].year}
              price="Precio demo"
              imageSrc={items[0].imageSrc}
              imageAlt="Imagen demostrativa de inventario"
              interactive={false}
              elevated
            />
          </StaticAction>
        </div>
        {items.slice(1).map((item) => (
          <div key={item.name} className={styles.cardSlot}>
            <StaticAction>
              <OfferCard
                variant="negotiable"
                size="short"
                name={item.name}
                year={item.year}
                imageSrc={item.imageSrc}
                imageAlt="Imagen demostrativa de inventario"
                interactive={false}
              />
            </StaticAction>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomeDiscovery() {
  return (
    <main className={styles.page} data-cut="home-discovery-v1">
      <p className={styles.demoNotice} role="note">
        Maqueta visual de QA · datos e inventario demostrativos · sin navegación
      </p>

      <div className={styles.introGrid}>
        <section className={styles.hero} aria-labelledby="home-discovery-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>VMC Subastas · Demo</p>
            <h1 id="home-discovery-title">Explora oportunidades que encajan contigo</h1>
            <p className={styles.heroDescription}>
              Un Home orientado a descubrir inventario, tiendas y actividad sin
              convertir la experiencia en una landing estática.
            </p>
            <StaticAction>
              <Button variant="primary">Explorar oportunidades</Button>
            </StaticAction>
          </div>
          <img className={styles.heroVisual} src={inventoryImage.vehicle} alt="Inventario demostrativo" />
        </section>

        <aside className={styles.activity} aria-labelledby="activity-title">
          <div className={styles.activityHeading}>
            <div>
              <p className={styles.eyebrow}>Actividad de la plataforma</p>
              <h2 id="activity-title">Lo que está pasando</h2>
            </div>
          </div>
          <ol className={styles.activityList}>
            <li className={styles.pinnedActivity}>
              <BadgeStatus variant="live" label="En vivo · Demo" />
              <strong>Una oportunidad prioritaria se mantiene visible aquí.</strong>
              <span>Formato para una futura subasta o anuncio importante.</span>
            </li>
            <li>
              <BadgeStatus variant="proxima" label="Próxima · Demo" />
              <strong>Próxima actividad de una tienda especializada</strong>
              <span>La hora y los detalles aparecerán con una fuente conectada.</span>
            </li>
            <li>
              <span className={styles.activityType}>CONTENIDO · DEMO</span>
              <strong>Guía para evaluar una oportunidad</strong>
              <span>Fallback editorial cuando no exista actividad operativa.</span>
            </li>
          </ol>
        </aside>
      </div>

      <section className={styles.discovery} aria-labelledby="opportunities-title">
        <div className={styles.discoveryHeading}>
          <div>
            <p className={styles.eyebrow}>Descubrimiento</p>
            <h2 id="opportunities-title">Oportunidades por tienda</h2>
          </div>
          <p>Dos ejemplos especializados; el catálogo completo se definirá con datos reales.</p>
        </div>
        <OfferRail
          title="Movilidad seleccionada"
          description="Tienda demo enfocada en vehículos y flota ligera."
          items={mobility}
        />
        <OfferRail
          title="Equipos para operar"
          description="Tienda demo de maquinaria, equipos y materiales."
          items={machinery}
        />
      </section>

      <section className={styles.banner} aria-labelledby="banner-title">
        <div>
          <p className={styles.eyebrow}>Bloque editorial · Demo</p>
          <h2 id="banner-title">Encuentra equipos para el próximo movimiento de tu negocio</h2>
          <p>Un espacio compacto para una campaña, categoría o mensaje comercial futuro.</p>
          <StaticAction>
            <Button variant="negotiable">Ver oportunidades</Button>
          </StaticAction>
        </div>
        <img className={styles.bannerVisual} src={inventoryImage.excavator} alt="Equipo demostrativo" />
      </section>

      <section className={styles.categories} aria-labelledby="categories-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Exploración</p>
            <h2 id="categories-title">Explora por categoría</h2>
          </div>
          <span className={styles.nonAction}>Muestra visual</span>
        </div>
        <div className={styles.categoryGrid}>
          <article className={styles.categoryTile}>
            <StaticAction><CategoryCard category="vehicular" label="Vehicular" /></StaticAction>
          </article>
          <article className={styles.categoryTile}>
            <StaticAction><CategoryCard category="maquinaria" label="Maquinaria" /></StaticAction>
          </article>
          <article className={styles.categoryTile}>
            <StaticAction><CategoryCard category="equipos-diversos" label="Equipos" /></StaticAction>
          </article>
          <article className={styles.categoryTile}>
            <StaticAction><CategoryCard category="articulos-diversos" label="Artículos" /></StaticAction>
          </article>
        </div>
      </section>

      <section className={styles.stores} aria-labelledby="stores-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Tiendas y vendedores</p>
            <h2 id="stores-title">Dos tiendas para continuar explorando</h2>
          </div>
        </div>
        <div className={styles.storeGrid}>
          <article className={styles.storeCard}>
            <span className={styles.storeInitials}>MS</span>
            <div><h3>Movilidad seleccionada</h3><p>Vehículos y flota ligera · Demo</p></div>
            <span aria-hidden="true">→</span>
          </article>
          <article className={styles.storeCard}>
            <span className={styles.storeInitials}>EO</span>
            <div><h3>Equipos para operar</h3><p>Maquinaria y materiales · Demo</p></div>
            <span aria-hidden="true">→</span>
          </article>
        </div>
      </section>
    </main>
  );
}
