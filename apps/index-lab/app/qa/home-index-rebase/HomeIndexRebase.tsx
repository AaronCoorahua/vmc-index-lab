"use client";

import { BusinessIcon, CategoryIcon, Header, HomepageMobile, OfferIcon, ServiceCenterIcon, Sidebar, TodayIcon } from "@vmc/concorde-adapter";
import type { SidebarNavItem } from "@vmc/concorde-adapter";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import HomeIndexBlock from "./HomeIndexBlock";
import SubastasTicker from "./SubastasTicker";
import TextAuditor from "./TextAuditor";
import { VidrioStyles } from "./Vidrio";
import VersionZero from "./version-zero/HomeIndexRebase";
import styles from "./HomeIndexRebase.module.css";

function BrandLogo() {
  return <img className={styles.brandLogo} src="/assets/brand/logo-voyager.svg" alt="VMC Subastas" />;
}

// Hamburguesa del header: mismas tres líneas con degradado que la del sidebar de Concorde (SidebarHeader).
function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  const uid = useId().replace(/:/g, "-");
  const stops = (<><stop stopColor="#CFBAFF" /><stop offset="0.35" stopColor="white" /><stop offset="0.65" stopColor="#AE8EFF" /><stop offset="1" stopColor="#CFBAFF" /></>);
  return (
    <button type="button" className={styles.menuButton} onClick={onClick} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="vmc-menu">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path d="M2.75 5.5H19.25" stroke={`url(#${uid}a)`} strokeWidth="1.83333" strokeLinecap="round" />
        <path d="M2.75 11H19.25" stroke={`url(#${uid}b)`} strokeWidth="1.83333" strokeLinecap="round" />
        <path d="M2.75 16.5H19.25" stroke={`url(#${uid}c)`} strokeWidth="1.83333" strokeLinecap="round" />
        <defs>
          <linearGradient id={`${uid}a`} x1="5.708" y1="4.866" x2="6.637" y2="9.202" gradientUnits="userSpaceOnUse">{stops}</linearGradient>
          <linearGradient id={`${uid}b`} x1="5.708" y1="10.366" x2="6.637" y2="14.702" gradientUnits="userSpaceOnUse">{stops}</linearGradient>
          <linearGradient id={`${uid}c`} x1="5.708" y1="15.866" x2="6.637" y2="20.202" gradientUnits="userSpaceOnUse">{stops}</linearGradient>
        </defs>
      </svg>
    </button>
  );
}

// Navegación: los mismos ítems e íconos de Concorde (tamaño 22), pero con submenú también en Categoría y Empresas (los datos del index:
// categorías con su cantidad de lotes y empresas del slider). El contador del badge = cantidad de subítems.
const NAV_PRIMARY: SidebarNavItem[] = [
  { id: "hoy", icon: (s) => <TodayIcon size={22} state={s} />, label: "Hoy" },
  { id: "oferta", icon: (s) => <OfferIcon size={22} state={s} />, label: "Tipo de oferta", count: 2,
    subitems: [{ id: "en-vivo", label: "En Vivo", count: 38 }, { id: "negociable", label: "Negociable" }] },
  { id: "categoria", icon: (s) => <CategoryIcon size={22} state={s} />, label: "Categoría", count: 5,
    subitems: [{ id: "vehicular", label: "Vehicular", count: 21 }, { id: "equipos", label: "Equipos diversos", count: 12 }, { id: "maquinaria", label: "Maquinaria", count: 2 }, { id: "materiales", label: "Materiales", count: 1 }, { id: "articulos", label: "Artículos diversos", count: 1 }] },
  { id: "empresas", icon: (s) => <BusinessIcon size={22} state={s} />, label: "Empresas", count: 3,
    subitems: [{ id: "autoplan", label: "Autoplan", count: 3 }, { id: "pacifico", label: "Pacífico", count: 2 }, { id: "trupal", label: "Trupal S.A.", count: 2 }] },
];
const NAV_SECONDARY: SidebarNavItem[] = [{ id: "centro", icon: (s) => <ServiceCenterIcon size={22} state={s} />, label: "Centro de Ayuda" }];
// Los ítems con submenú abren su lista dentro del panel; solo los ítems finales cierran el menú.
const ITEMS_WITH_SUBMENU = new Set(NAV_PRIMARY.filter((i) => i.subitems?.length).map((i) => i.id));

const CLASSIC_SHELL_WIDTH = 1024; // modo clásico: todo cabe en 1024
const MAX_CONTENT_WIDTH = 1280; // modo ancho: tope del contenido (fluido, sin escalar)
const REVIEW_VERSION_KEY = "hib-review-version";
const MENU_HEIGHT = 330; // alto del menú desplegable (solo la navegación; sin el banner del sidebar)

type ReviewVersion = "v1" | "classic-a" | "classic-b" | "wide-a" | "wide-b" | "winner-c";
const REVIEW_VERSIONS: { id: ReviewVersion; label: string; wide: boolean; proposal?: "a" | "b" }[] = [
  { id: "v1", label: "Default", wide: false },
  { id: "classic-a", label: "1024", wide: false, proposal: "a" },
  { id: "wide-a", label: "Amplio", wide: true, proposal: "a" },
  { id: "classic-b", label: "1024", wide: false, proposal: "b" },
  { id: "wide-b", label: "Amplio", wide: true, proposal: "b" },
  { id: "winner-c", label: "Elegida", wide: false, proposal: "b" },
];

export default function HomeIndexRebase() {
  const [reviewVersion, setReviewVersion] = useState<ReviewVersion>("winner-c");
  const [reviewOpen, setReviewOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false); // sin transiciones hasta tener la primera medición (evita el salto al cargar)
  const [menuOpen, setMenuOpen] = useState(false);
  const [winnerSidebarCollapsed, setWinnerSidebarCollapsed] = useState(true);
  const [winnerSidebarHeight, setWinnerSidebarHeight] = useState(900);
  const [shellWidth, setShellWidth] = useState(MAX_CONTENT_WIDTH);
  const shellRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Contenido fluido, centrado en la ventana (sin sidebar fijo: la navegación vive en el menú del header).
  const selectedVersion = REVIEW_VERSIONS.find((version) => version.id === reviewVersion) ?? REVIEW_VERSIONS[1];
  const wide = selectedVersion.wide;
  const selectedProposal = selectedVersion.proposal;
  const isVersionZero = reviewVersion === "v1";
  const isWinner = reviewVersion === "winner-c";
  // C conserva el canvas total de 1024: el contenido usa el espacio restante del sidebar
  // para no desbordar ni quedar cortado al colapsarlo/expandirlo.
  const winnerContentWidth = CLASSIC_SHELL_WIDTH - (winnerSidebarCollapsed ? 76 : 226);
  const contentWidth = Math.min(shellWidth, isWinner ? winnerContentWidth : wide ? MAX_CONTENT_WIDTH : CLASSIC_SHELL_WIDTH);
  const offsetLeft = Math.max(0, (shellWidth - contentWidth) / 2);
  const selectVersion = (version: ReviewVersion) => {
    setReviewVersion(version);
    try { localStorage.setItem(REVIEW_VERSION_KEY, version); } catch { /* sin storage */ }
  };

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setReady(true), 120);
    try {
      // C reemplaza cualquier preferencia histórica como punto de partida del soft launch.
      // Las demás propuestas siguen disponibles en el comparador durante esta sesión.
      const saved = localStorage.getItem(REVIEW_VERSION_KEY) as ReviewVersion | null;
      if (saved === "winner-c") setReviewVersion(saved);
    } catch { /* sin storage */ }
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isVersionZero) return;
    const shell = shellRef.current;
    if (!shell) return;
    const update = () => setShellWidth(shell.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(shell);
    return () => ro.disconnect();
  }, [isVersionZero, isWinner]);

  useEffect(() => {
    if (!isWinner) return;
    const update = () => setWinnerSidebarHeight(Math.max(720, window.innerHeight));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isWinner]);

  // Cierra el menú con Escape o al hacer clic fuera del header/menú.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    const onDown = (e: MouseEvent) => { if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [menuOpen]);

  const frame = { width: contentWidth, marginLeft: offsetLeft, transition: ready ? undefined : "none" } as const;

  return (
    <>
      {isVersionZero ? <VersionZero /> : isWinner ? <>
        <VidrioStyles />
        <TextAuditor />
        <div className={styles.winnerBackdrop}>
        <div className={styles.winnerShell} data-sidebar-collapsed={winnerSidebarCollapsed} data-testid="home-desktop-canvas">
          <aside className={styles.winnerSidebar} aria-label="Navegación de VMC">
            <Sidebar
              primaryItems={NAV_PRIMARY}
              secondaryItems={NAV_SECONDARY}
              defaultActiveId="hoy"
              height={winnerSidebarHeight}
              contentHeight={winnerSidebarHeight}
              headerHeight={64}
              logo={<BrandLogo />}
              collapsed={winnerSidebarCollapsed}
              onCollapsedChange={setWinnerSidebarCollapsed}
            />
          </aside>
          <div className={styles.winnerHeader}><Header width="100%" /></div>
          <main ref={shellRef} className={styles.winnerMain}>
            <div className={styles.contentFrame} style={frame}>
              <HomeIndexBlock proposal="b" softLaunch deferCategories />
            </div>
          </main>
        </div>
        <svg className={styles.winnerFeedArrow} viewBox="0 0 200 240" aria-hidden="true" focusable="false">
          <path d="M181 216V114H35" />
          <path d="M35 114L72 80M35 114L72 148" />
          <text x="94" y="237">Por revisar</text>
        </svg>
        <div className={styles.mobileShell}>
          <HomepageMobile />
        </div>
        </div>
      </> : <>
        <VidrioStyles />
        <TextAuditor />
        <div ref={shellRef} className={`${styles.desktopShell}${wide ? ` ${styles.wide}` : ""}`} data-testid="home-desktop-canvas">
          <div className={styles.tickerRow}><SubastasTicker /></div>
          {/* Barra morada de punta a punta (como Best Buy); hamburguesa, logo e «Ingresa» van dentro del ancho del contenido. */}
          <div className={styles.headerWrap} ref={headerRef}>
            <div className={`${styles.contentFrame} ${styles.headerFrame}`} style={frame}>
              <Header
                width="100%"
                logo={<span className={styles.brandRow}><MenuButton open={menuOpen} onClick={() => setMenuOpen((o) => !o)} /><BrandLogo /></span>}
                className={styles.topbar}
              />
              {/* Menú que se abre debajo del header: vidrio translúcido para que se vea el contenido de atrás. */}
              <nav id="vmc-menu" className={styles.menuPanel} data-open={menuOpen} aria-label="Navegación de VMC" aria-hidden={!menuOpen}>
                <Sidebar primaryItems={NAV_PRIMARY} secondaryItems={NAV_SECONDARY} defaultActiveId="hoy" height={MENU_HEIGHT} contentHeight={MENU_HEIGHT} headerHeight={0} logo={<span />} collapsed={false} onItemClick={(id) => { if (!ITEMS_WITH_SUBMENU.has(id)) setMenuOpen(false); }} />
              </nav>
            </div>
          </div>
          <div className={styles.mainColumn}>
            <div className={styles.contentFrame} style={frame}>
              <HomeIndexBlock proposal={selectedProposal === "b" ? "b" : "a"} deferCategories={reviewVersion === "wide-a"} />
            </div>
          </div>
        </div>
        <div className={styles.mobileShell}>
          <SubastasTicker />
          <HomepageMobile />
        </div>
      </>}

      {mounted ? createPortal(
        <aside className={`${styles.reviewControls}${reviewOpen ? ` ${styles.reviewControlsOpen}` : ""}`} aria-label="Comparador de versiones de diseño">
          {reviewOpen ? <>
            <div className={styles.reviewRoadmap} aria-label="Ruta de versiones">
              <div className={styles.reviewRoadmapHeadline}>
                <strong>Ganadora ahora</strong>
                <span>“Soft launch” por facilidad de implementación</span>
              </div>
              <div className={styles.reviewRoadmapStop}>
                <span className={styles.reviewRoadmapMarker}>Ahora</span>
                <strong>Versión C</strong>
                <small>Ruta de salida inmediata</small>
              </div>
              <span className={styles.reviewRoadmapLine} aria-hidden="true" />
              <div className={`${styles.reviewRoadmapStop} ${styles.reviewRoadmapFuture}`}>
                <span className={styles.reviewRoadmapMarker}>Futuro</span>
                <strong>Versión A amplia</strong>
                <small>Meta de evolución</small>
              </div>
            </div>
            {isWinner ? <div className={styles.reviewWinnerNote} role="note">
              <strong>Recomendación para el soft launch</strong>
              <p>Como el sidebar consume parte del canvas, “VMC ahora” tipo Twitter podría quedar fuera por ahora. Se mantiene visible porque Fernando pidió evaluarlo; se incorpora en la siguiente etapa, cuando el layout tenga espacio para mostrarlo bien.</p>
            </div> : <div className={styles.reviewNote} role="note">
              <strong>Compara las propuestas</strong>
              <p>Elige una propuesta y luego compara sus anchos. Puedes ocultar esta guía cuando termines.</p>
            </div>}
            <div className={styles.reviewDock}>
              <div className={styles.reviewDockHeader}>
                <span className={styles.reviewDockTitle}>Versiones</span>
                <button className={styles.reviewClose} type="button" onClick={() => setReviewOpen(false)} aria-label="Ocultar comparador">Ocultar</button>
              </div>
              <div className={styles.reviewOrigin}>
                <span>Versión 0</span>
                <button type="button" aria-pressed={reviewVersion === "v1"} onClick={() => selectVersion("v1")}>Default</button>
              </div>
              {(["a", "b"] as const).map((proposal) => (
                <section className={styles.reviewGroup} key={proposal} aria-label={`Propuesta ${proposal.toUpperCase()}`}>
                  <div>
                    <strong>Versión {proposal.toUpperCase()}</strong>
                    <small>{proposal === "a" ? "Feed tipo Twitter debajo del banner principal." : "Feed integrado junto al banner principal."}</small>
                  </div>
                  <div className={styles.reviewOptions}>
                    {REVIEW_VERSIONS.filter((version) => version.proposal === proposal && version.id !== "winner-c").map((version) => (
                      <button className={version.id === "wide-a" ? styles.reviewFutureButton : undefined} key={version.id} type="button" aria-pressed={reviewVersion === version.id} onClick={() => selectVersion(version.id)}>{version.label}{version.id === "wide-a" ? <span>Futuro</span> : null}</button>
                    ))}
                  </div>
                </section>
              ))}
              <section className={`${styles.reviewGroup} ${styles.reviewWinner}`} aria-label="Versión C, ganadora soft launch">
                <div>
                  <strong>Versión C <span>Ganadora</span></strong>
                  <small>Ganadora ahora por facilidad de implementación (“soft launch”).</small>
                </div>
                <button className={styles.reviewWinnerButton} type="button" aria-pressed={isWinner} onClick={() => selectVersion("winner-c")}>Elegida</button>
              </section>
              <p className={styles.reviewRationale}>
                {isWinner
                  ? "Versión ganadora ahora por facilidad de implementación (“soft launch”): mantiene B a 1024 y suma navegación lateral persistente para un pase rápido."
                  : reviewVersion === "v1"
                  ? "Referencia del punto de partida antes de las propuestas A y B."
                  : <>{selectedProposal === "a" ? "A mantiene el feed debajo del banner. " : "B integra el feed junto al banner principal. "}{wide
                    ? "El ancho amplio no replica los frames actuales; sigue referencias de e-commerce y requiere validar el comportamiento en detalle, por lo que puede mover la salida."
                    : "El ancho 1024 respeta los frames actuales de VMC Subastas y es la ruta recomendada para la siguiente entrega."}</>}
              </p>
            </div>
          </> : <button className={styles.reviewOpen} type="button" onClick={() => setReviewOpen(true)} aria-label="Abrir comparador de versiones">Abrir</button>}
        </aside>,
        document.body,
      ) : null}

    </>
  );
}
