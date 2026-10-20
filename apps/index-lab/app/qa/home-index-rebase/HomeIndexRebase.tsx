"use client";

import { Header, Sidebar, SidebarMenuButton, SidebarMobile } from "@vmc/concorde-adapter";
import { useEffect, useState } from "react";

import HomeIndexBlock from "./HomeIndexBlock";
import styles from "./HomeIndexRebase.module.css";

function BrandLogo() {
  return <img className={styles.brandLogo} src="/assets/brand/logo-voyager.svg" alt="VMC Subastas" />;
}

export default function HomeIndexRebase() {
  const [sidebarHeight, setSidebarHeight] = useState(900);
  const [collapsed, setCollapsed] = useState(true); // sidebar cerrado por defecto
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const resize = () => setSidebarHeight(Math.max(720, window.innerHeight));
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <>
      <div className={styles.desktopShell} data-testid="home-desktop-canvas" data-collapsed={collapsed || undefined}>
        <Header width="100%" />
        <aside className={styles.sidebarRail} aria-label="Navegación de VMC">
          <Sidebar defaultActiveId="hoy" height={sidebarHeight} contentHeight={sidebarHeight} headerHeight={64} logo={<BrandLogo />}
            collapsed={collapsed} onCollapsedChange={setCollapsed} />
        </aside>
        <div className={styles.mainColumn}>
          <HomeIndexBlock />
        </div>
      </div>

      {/* Móvil y tablet: drawer de Concorde con hamburguesa + logo en el header y el mismo bloque en una columna. */}
      <div className={styles.mobileShell}>
        <SidebarMobile open={menuOpen} onOpenChange={setMenuOpen}>
          <Header width="100%" logo={
            <div className={styles.mobileBrand}>
              <SidebarMenuButton onClick={() => setMenuOpen(true)} expanded={menuOpen} />
              <img className={styles.mobileLogo} src="/assets/brand/logo-voyager.svg" alt="VMC Subastas" />
            </div>
          } />
          <HomeIndexBlock />
        </SidebarMobile>
      </div>
    </>
  );
}
