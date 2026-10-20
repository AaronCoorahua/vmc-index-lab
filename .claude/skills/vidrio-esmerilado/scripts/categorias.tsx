import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync, readFileSync } from "node:fs";
import { Vidrio, type Sec } from "../assets/Vidrio";
const C: [Sec, string, string][] = [["vehicular","Vehicular","21 lotes"],["equipos","Equipos diversos","12 lotes"],["maquinaria","Maquinaria","2 lotes"],["materiales","Materiales","1 lote"],["articulos","Artículos diversos","1 lote"]];
const row = (z: number) => renderToStaticMarkup(<div className="row">{C.map(([s,t,n]) => <a key={s} className="card vd-host"><Vidrio s={s} size={z} /><span><b>{t}</b><small>{n}</small></span><i>→</i></a>)}</div>);
const css = readFileSync(process.argv[2] + "/vidrio.css", "utf8");
writeFileSync(process.argv[3], `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;800&display=block"><style>${css}
body{margin:0;padding:28px;background:linear-gradient(135deg,#6b5a45,#3d3428);font-family:'Plus Jakarta Sans',sans-serif}
h2{color:#fff;font-size:13px;font-weight:500;margin:0 0 10px;opacity:.85}.row{display:flex;gap:12px;margin-bottom:28px}
.card{flex:1;display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;padding:10px 12px;box-shadow:0 2px 8px #0002}
.card span{flex:1;display:grid}.card b{color:#3B1782;font-size:14px;font-weight:800;line-height:1.15}.card small{color:#666;font-size:12px}
.card i{font-style:normal;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#EDE6FF;color:#3B1782;font-size:12px;font-weight:800}</style></head><body>
<h2>A 32 px (como tu tarjeta)</h2>${row(32)}<h2>A 40 px</h2>${row(40)}</body></html>`);
