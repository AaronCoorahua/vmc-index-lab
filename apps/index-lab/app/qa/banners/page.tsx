import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties } from "react";

import { GLASS_CSS } from "../home-index-rebase/glass";
import CampSlots from "./CampSlots";
import ScaledFrame from "./ScaledFrame";

// Galería de banners del index (QA): las 4 secciones con sus 3 piezas, las piezas por tipo y las fotos de public/banners.
// ponytail: listas fijas copiadas de las plantillas y de HomeIndexBlock; si se agrega una pieza, se suma aquí.
export const metadata = { title: "Banners · VMC index" };

const FMT = { side264: [200, 264], side400: [200, 400], strip776: [776, 232], strip1532: [1532, 200] } as const;
type Fmt = keyof typeof FMT;

// Tipos como en Mi Garaje (RIEL_TIPOS). Regla: dos secciones a la vez nunca muestran el mismo tipo. Max fuera por ahora (02/11).
const TIPOS = {
  A: { nombre: "Subastop", color: "#1D4ED8", tpl: "venta-empresa", e: "",
    piezas: [["01-general", "Liquidez"], ["02-maquinaria", "Maquinaria"], ["03-tecnologia", "Tecnología"], ["04-flotas", "Flotas"], ["05-inventario", "Repuestos"]] },
  B: { nombre: "Publica", color: "#6B48DD", tpl: "publica-vmc", e: "&e=personaje",
    piezas: [["04-pasos", "En 3 pasos"], ["01-auto", "Tu auto, tu precio"], ["03-moto", "Publica tu moto"]] },
  C: { nombre: "Valoriza", color: "#0E8F8A", tpl: "publica-vmc", e: "&e=personaje",
    piezas: [["08-valor", "¿Cuánto vale?"], ["09-valor-pasos", "En 3 pasos"], ["10-valor-publica", "Conoce su valor"]] },
} as const;
type Tipo = keyof typeof TIPOS;
const DL = "/banners/descargas";
// ponytail: PNG pre-exportados con scripts/export-banners.mjs; si cambia una pieza, se vuelve a correr.
const src = (t: Tipo, v: string, f: Fmt) => `/banners/${TIPOS[t].tpl}.html?v=${v}&f=${f}${TIPOS[t].e}`;

// Hero (23/11): fotos SIN texto a las medidas reales de vmcsubastas.com; el texto lo pone el HTML del sitio.
// El CSS del sitio fija el <img> a 300 px de alto (anula aspect-[388/598] md:aspect-[766/272]): escritorio 447 × 300, celular 380 × 300.
// Se generan con scripts/hero-sizes.py. La vista previa pinta el texto con el CSS real del Hero (≤ 700 px: texto abajo, velo inferior).
const HERO_FMT = { desktop: { w: 447, h: 300, nombre: "Escritorio" }, mobile: { w: 380, h: 300, nombre: "Celular" } } as const;
const HERO = [
  { id: "01-whatsapp", pill: "Canal de WhatsApp", title: <>Entérate <em>primero</em> de las subastas</>, lead: "Únete al canal de VMC y recibe los lotes nuevos antes que nadie.", cta: "Unirme al canal" },
  { id: "02-publica", pill: "Publica en VMC", title: <>Publica tu auto y <em>recibe ofertas</em></>, lead: "Recibe propuestas y elige la que más te convenga.", cta: "Publicar mi auto" },
  { id: "03-negociable", pill: "Recibe ofertas", title: <>Tú pones el precio y <em>ellos te proponen</em></>, lead: "Activa «Recibe ofertas» y negocia directo con los compradores.", cta: "Publicar con Recibe ofertas" },
  { id: "04-valoriza-hoy", pill: "Valoriza", title: <>¿Quieres saber cuánto <em>vale tu auto hoy</em>?</>, lead: "Conoce su valor actual y sigue su evolución en el tiempo con AVT.", cta: "¡Valoriza ahora!" },
  { id: "05-valoriza-tiempo", pill: "Valoriza", title: <>¿Cómo cambia el valor de tu carro <em>en el tiempo</em>?</>, lead: "Con AVT, sigue su evolución y mantente informado.", cta: "¡Quiero valorizar!" },
];

// Las 4 secciones del index con sus 3 piezas (02/11). Subastop solo va en la franja; el lateral es Publica.
const SECCIONES: { id: string; nombre: string; donde: string; tipo: Tipo; fmt: string; slots: ({ v: string; corto: string; f: Fmt; t?: Tipo } | null)[] | "hero" | "camp" }[] = [
  { id: "hero", nombre: "Hero", donde: "Carrusel principal, arriba del index", tipo: "B", fmt: "447 × 300 escritorio · 380 × 300 celular · sin texto", slots: "hero" },
  { id: "abajo", nombre: "Banner de abajo", donde: "Después de categorías · mismo alto que la franja", tipo: "C", fmt: "1532 × 200", slots: "camp" },
  { id: "lateral", nombre: "Lateral", donde: "Barra lateral y menú del celular · una por carga · Publica + Subastop", tipo: "B", fmt: "200 × 264",
    slots: [{ v: "01-auto", corto: "Tu auto, tu precio", f: "side264" }, { v: "03-moto", corto: "Publica tu moto", f: "side264" },
      { v: "03-tecnologia", corto: "Subastop · Tecnología", f: "side264", t: "A" }, { v: "05-inventario", corto: "Subastop · Repuestos", f: "side264", t: "A" },
      { v: "04-flotas", corto: "Subastop · Flotas", f: "side264", t: "A" }] },
  { id: "franja", nombre: "Franja", donde: "Entre Autoplan y Mapfre", tipo: "A", fmt: "1532 × 200",
    slots: [{ v: "03-tecnologia", corto: "Tecnología", f: "strip1532" }, { v: "05-inventario", corto: "Repuestos", f: "strip1532" }, { v: "04-flotas", corto: "Flotas", f: "strip1532" }] },
];

const fotos = (dir: string) =>
  readdirSync(join(process.cwd(), "public/banners", dir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).map((f) => `/banners/${dir}/${f}`);

function Chip({ t }: { t: Tipo }) {
  return <span className="chip" style={{ "--c": TIPOS[t].color } as CSSProperties}>Tipo {t} · {TIPOS[t].nombre}</span>;
}

function Frame({ s, f, label }: { s: string; f: Fmt; label: string }) {
  const [w, h] = FMT[f];
  return f.startsWith("strip") ? <ScaledFrame src={s} w={w} h={h} title={label} /> : <iframe className="side" src={s} width={w} height={h} title={label} loading="lazy" />;
}

function Seccion({ s, n }: { s: (typeof SECCIONES)[number]; n: number }) {
  const ancha = typeof s.slots !== "string" && s.slots.some((x) => x?.f.startsWith("strip"));
  return (
    <section className="sec" id={s.id}>
      <header className="sec__head">
        <span className="sec__n">{String(n).padStart(2, "0")}</span>
        <div><h3>{s.nombre}</h3><p>{s.donde} · {s.fmt}</p></div>
        <Chip t={s.tipo} />
      </header>
      {s.slots === "hero" ? <label className="hh-toggle"><input id="hero-txt" type="checkbox" defaultChecked /> Mostrar el texto HTML encima (vista previa; las imágenes van sin texto)</label> : null}
      <ol className={`slots ${s.slots === "hero" ? "slots--hero" : ancha || s.slots === "camp" ? "slots--ancha" : "slots--side"}`}>
        {s.slots === "camp"
          ? <CampSlots />
          : s.slots === "hero"
          ? HERO.map((h, i) => (
            <li key={h.id} className="hero-row">
              <span className="slot__n slot__n--in">{i + 1}</span>
              {(Object.keys(HERO_FMT) as (keyof typeof HERO_FMT)[]).map((f) => {
                const { w, h: alto, nombre } = HERO_FMT[f], base = `/banners/hero/hero-${h.id}-${f}`;
                return (
                  <figure key={f} className="hh-fig">
                    <div className="hh" style={{ width: w, height: alto }}>
                      <img src={`${base}.jpg`} srcSet={`${base}.jpg 1x, ${base}@2x.jpg 2x`} width={w} height={alto} alt="" />
                      <div className="hh__txt"><span className="hh__veil" />
                        <span className="hh__in"><i>{h.pill}</i><b>{h.title}</b><span>{h.lead}</span><u>{h.cta}</u></span></div>
                    </div>
                    <figcaption className="slot__cap">{nombre} <code>{w} × {alto} · @2x {w * 2} × {alto * 2}</code>
                      <a className="dl" href={`${base}.jpg`} download>Descargar ↓</a><a className="dl" href={`${base}@2x.jpg`} download>@2x ↓</a></figcaption>
                  </figure>
                );
              })}
            </li>
          ))
          : s.slots.map((x, i) => (
            <li key={x?.v ?? i}>
              {x ? <>
                <Frame s={src(x.t ?? s.tipo, x.v, x.f)} f={x.f} label={`${s.nombre} · ${x.corto}`} />
                <p className="slot__cap"><span className="slot__n slot__n--in">{i + 1}</span>{x.corto} <code>{x.v}</code> <a href={src(x.t ?? s.tipo, x.v, x.f)} target="_blank">abrir ↗</a>
                  <a className="dl" href={`${DL}/${TIPOS[x.t ?? s.tipo].tpl}-${x.v}-${x.f}.png`} data-src={src(x.t ?? s.tipo, x.v, x.f)} data-w={FMT[x.f][0]} data-h={FMT[x.f][1]} download>Descargar ↓</a></p>
              </> : <div className="vacio" style={{ aspectRatio: "1532 / 200" }}>{i + 1} · Por definir · Tipo {s.tipo} sin pieza libre</div>}
            </li>
          ))}
      </ol>
    </section>
  );
}

const CSS = `
:root{--bg:#F5F3FA;--card:#fff;--ink:#17112E;--muted:#6B6585;--line:#E7E2F3;--accent:#6B48DD}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#0F0B1E;--card:#1A1530;--ink:#F2EEFF;--muted:#A69FC2;--line:#2C2547;--accent:#A88BFF}}
body{margin:0;background:var(--bg);color:var(--ink);font-family:"Plus Jakarta Sans",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1280px;margin:0 auto;padding:40px 16px 80px}
.top h1{margin:0;font-size:32px;letter-spacing:-.02em}
.top p{margin:6px 0 0;color:var(--muted);font-size:15px;max-width:720px}
.leyenda{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0}
nav{position:sticky;top:0;z-index:5;display:flex;gap:4px;margin:28px -16px 16px;padding:10px 16px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);overflow-x:auto}
nav a{flex:none;padding:7px 14px;border-radius:99px;color:var(--muted);font-size:13px;font-weight:600;text-decoration:none}
nav a:hover{background:var(--card);color:var(--ink)}
.wrap>h2{margin:48px 0 16px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.chip{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;border-radius:99px;font-size:12px;font-weight:700;white-space:nowrap;
  color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)}
.chip::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--c)}
.sec{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px;margin:0 0 16px;scroll-margin-top:64px}
.sec__head{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;margin:0 0 18px}
.sec__n{font-size:13px;font-weight:800;color:var(--accent);font-variant-numeric:tabular-nums}
.sec__head h3{margin:0;font-size:18px} .sec__head p{margin:2px 0 0;font-size:13px;color:var(--muted)}
.slots{list-style:none;margin:0;padding:0;display:grid;gap:16px}
.slots li{position:relative;min-width:0}
.slots--hero{grid-template-columns:minmax(0,1fr)}
.hero-row{display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px 24px}
.hero-row>.slot__n{flex:none;margin-top:8px}
.hh-fig{margin:0;max-width:100%}
.hh{position:relative;max-width:100%;overflow:hidden;border-radius:16px;background:#2A1670;color:#fff;container-type:inline-size;font-family:"Plus Jakarta Sans",sans-serif}
.hh img{display:block;width:100%;height:100%;object-fit:cover;object-position:82% 18%} /* como el sitio con contenedor ≤ 480 px */
.hh__txt{position:absolute;inset:0;transition:opacity .2s}
.sec:has(#hero-txt:not(:checked)) .hh__txt{opacity:0}
/* Copia del CSS del Hero de vmcsubastas.com con contenedor ≤ 700 px (sus dos medidas): velo abajo, texto abajo a todo el ancho. */
.hh__veil{position:absolute;inset:0;background:linear-gradient(#2a167000 18%,#22105cb8 50%,#1c0c50f5 100%)}
.hh__in{position:absolute;left:18px;right:18px;top:0;bottom:0;padding-bottom:46px;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:8px}
.hh__in i{font-style:normal;height:18px;padding:0 8px;border-radius:999px;display:inline-flex;align-items:center;font-size:9px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;background:linear-gradient(135deg,#8460e5 0%,#3b1782 100%)}
.hh__in b{font-size:23px;line-height:27px;font-weight:800;letter-spacing:-.03em} .hh__in b em{font-style:normal;color:#FFE2C2}
.hh__in span{max-width:34ch;font-size:13px;line-height:18px;font-weight:600}
.hh__in u{text-decoration:none;height:34px;padding:0 22px;display:inline-flex;align-items:center;border-radius:100px;font-size:14px;font-weight:600;
  background:linear-gradient(#ffffff59 0%,#ffffff14 45%,#fff0 100%);box-shadow:0 8px 24px #0000001a,inset 0 1px 6px #ffffff73;border:1.5px solid #f4ac59}
.hh-toggle{display:inline-flex;align-items:center;gap:8px;margin:0 0 14px;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer}
.slot__cap a.dl+a.dl{margin-left:0}
.slots--side{grid-template-columns:repeat(3,200px);justify-content:start;gap:24px}
.slot__n{position:absolute;z-index:2;top:8px;left:8px;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;
  background:rgb(255 255 255 / 92%);color:#17112E;font-size:11px;font-weight:800;box-shadow:0 2px 6px rgb(0 0 0 / 18%)}
.slot__n--in{position:static;background:var(--accent);color:#fff;box-shadow:none}
.slot__cap{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0 0;font-size:13px;font-weight:600}
.slot__cap code{font-size:11px;color:var(--muted);font-weight:500} .slot__cap a{color:var(--accent);font-size:12px;text-decoration:none}
.slot__cap a:first-of-type{margin-left:auto}
.slot__cap a.dl{padding:6px 14px;border-radius:99px;background:var(--accent);color:#fff;font-weight:700}
.side{display:block;border:0;border-radius:16px}
.sf{position:relative;overflow:hidden;border-radius:14px;background:var(--line)} .sf iframe{position:absolute;top:0;left:0;border:0;transform-origin:0 0}
.vacio{display:grid;place-items:center;border:1.5px dashed var(--line);border-radius:14px;color:var(--muted);font-size:13px;font-weight:600;text-align:center;padding:8px}
.mas{margin:32px 0 0}
.mas>summary{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 18px;border-radius:99px;background:var(--card);border:1px solid var(--line);
  color:var(--ink);font-size:14px;font-weight:700;cursor:pointer;list-style:none}
.mas>summary::-webkit-details-marker{display:none}
.mas>summary::after{content:"";width:7px;height:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-2px) rotate(45deg);transition:transform .2s}
.mas[open]>summary::after{transform:translateY(2px) rotate(-135deg)}
.mas>summary:hover{border-color:var(--accent)}
.mas>summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.tipos{display:grid;gap:16px}
.tipo{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px}
.tipo__row{display:flex;gap:16px;overflow-x:auto;padding:14px 0 4px}
.tipo__row figure{margin:0;flex:none} .tipo__row figcaption{margin:8px 0 0;font-size:12px;font-weight:600}
.fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.fotos a{display:block} .fotos img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:12px;background:var(--line)}
.fotos span{display:block;margin:4px 0 0;font-size:11px;color:var(--muted);word-break:break-all}
@media (max-width: 860px){
  .slots--hero,.slots--side{grid-template-columns:minmax(0,1fr)}
  .slots--side li{justify-self:start}
  .sec__head{grid-template-columns:auto 1fr} .sec__head .chip{grid-column:2;justify-self:start}
}
`;

export default function BannersPage() {
  return (
    <div className="wrap">
      <style>{CSS + GLASS_CSS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />
      <header className="top">
        <h1>Banners del index</h1>
        <p>Cuatro secciones, tres piezas en cada una. Regla: dos secciones nunca muestran el mismo tipo a la vez (el hero y el lateral comparten Publica, con piezas distintas).</p>
        <div className="leyenda">{(Object.keys(TIPOS) as Tipo[]).map((t) => <Chip key={t} t={t} />)}</div>
      </header>
      <nav>
        {SECCIONES.map((s) => <a key={s.id} href={`#${s.id}`}>{s.nombre}</a>)}
        <a href="/qa/home-index-rebase">← Index</a>
      </nav>


      {SECCIONES.map((s, i) => <Seccion key={s.id} s={s} n={i + 1} />)}

      <details className="mas">
        <summary>Ver todo lo demás · piezas por tipo y fotos</summary>
      <h2 id="tipos">Por tipo</h2>
      <div className="tipos">
        {(Object.keys(TIPOS) as Tipo[]).map((t) => (
          <div key={t} className="tipo">
            <Chip t={t} />
            <div className="tipo__row">
              {TIPOS[t].piezas.map(([v, corto]) => (
                <figure key={v}>
                  <iframe className="side" src={src(t, v, "side264")} width={200} height={264} title={corto} loading="lazy" />
                  <figcaption>{corto}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 id="fotos">Fotos</h2>
      {["vmc", "personaje", "publica"].map((d) => (
        <div key={d} style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700 }}>{d}/</p>
          <div className="fotos">{fotos(d).map((s) => <a key={s} href={s} target="_blank"><img src={s} alt="" loading="lazy" /><span>{s.split("/").pop()}</span></a>)}</div>
        </div>
      ))}
      </details>
    </div>
  );
}
