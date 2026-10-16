"use client";

import { useEffect, useState } from "react";
import {
  Header,
  Sidebar,
  SidebarMenuButton,
  SidebarMobile,
} from "@vmc/concorde-adapter";
import styles from "./shell-spike.module.css";

const DEFAULT_VIEWPORT_HEIGHT = 900;

export default function ShellSpike({ long }: { long: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT_HEIGHT);

  useEffect(() => {
    function measureViewport() {
      setViewportHeight(window.innerHeight);
    }

    measureViewport();
    window.addEventListener("resize", measureViewport);
    return () => window.removeEventListener("resize", measureViewport);
  }, []);

  const logo = <span className={styles.logoPlaceholder}>VMC</span>;

  return (
    <>
      <div className={styles.desktopShell}>
        <aside className={styles.sidebarRail} aria-label="Diagnóstico Sidebar desktop">
          <Sidebar
            logo={logo}
            defaultActiveId="hoy"
            height="100dvh"
            contentHeight={viewportHeight}
          />
        </aside>
        <div className={styles.mainColumn}>
          <Header width="100%" />
          <DiagnosticContent long={long} />
        </div>
      </div>

      <div className={styles.mobileShell}>
        <SidebarMobile
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          logo={logo}
          defaultActiveId="hoy"
          closeOnItemClick
          drawerContentHeight={viewportHeight}
        >
          <Header
            width="100%"
            compact
            logo={
              <span className={styles.mobileBrandSlot}>
                <SidebarMenuButton
                  expanded={drawerOpen}
                  onClick={() => setDrawerOpen(true)}
                />
                {logo}
              </span>
            }
          />
          <DiagnosticContent long={long} />
        </SidebarMobile>
      </div>
    </>
  );
}

function DiagnosticContent({ long }: { long: boolean }) {
  const sections = long ? [1, 2, 3, 4] : [1];

  return (
    <main className={styles.diagnosticContent}>
      <p className={styles.diagnosticLabel}>Diagnóstico técnico — no propuesta visual</p>
      <h1>Prueba geométrica del shell canónico</h1>
      <p>
        Esta ruta mide Header, Sidebar, sticky, scroll, colapso y drawer sin
        rediseñar componentes ni representar el Home final.
      </p>
      {sections.map((section) => (
        <section className={styles.measurementSection} key={section}>
          <h2>Tramo de medición {section}</h2>
          <p>
            Contenido neutro para comprobar una página {long ? "larga" : "corta"},
            el acceso al banner placeholder y la ausencia de overflow horizontal.
          </p>
        </section>
      ))}
    </main>
  );
}
