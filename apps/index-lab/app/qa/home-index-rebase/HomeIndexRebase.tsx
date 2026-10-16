"use client";

import { Header, HomepageMobile, Sidebar } from "@vmc/concorde-adapter";
import { useEffect, useState } from "react";

import HomeIndexBlock from "./HomeIndexBlock";
import SubastasTicker from "./SubastasTicker";
import styles from "./HomeIndexRebase.module.css";

function BrandLogo() {
  return <img className={styles.brandLogo} src="/assets/brand/logo-voyager.svg" alt="VMC Subastas" />;
}

export default function HomeIndexRebase() {
  const [sidebarHeight, setSidebarHeight] = useState(900);

  useEffect(() => {
    const resize = () => setSidebarHeight(Math.max(720, window.innerHeight));
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <>
      <div className={styles.desktopShell} data-testid="home-desktop-canvas">
        {/* Franja «hoy en subastas»: arriba del header y de su mismo ancho (columna derecha). */}
        <div className={styles.tickerRow}><SubastasTicker /></div>
        <Header width="100%" />
        <aside className={styles.sidebarRail} aria-label="Navegación de VMC">
          <Sidebar defaultActiveId="hoy" height={sidebarHeight} contentHeight={sidebarHeight} headerHeight={64} logo={<BrandLogo />} />
        </aside>
        <div className={styles.mainColumn}>
          <HomeIndexBlock />
        </div>
      </div>

      <div className={styles.mobileShell}>
        <SubastasTicker />
        <HomepageMobile />
      </div>
    </>
  );
}
