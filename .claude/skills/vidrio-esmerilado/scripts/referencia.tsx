import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync, readFileSync } from "node:fs";
import { Vidrio, type Sec } from "../assets/Vidrio";
const KEYS: Sec[] = ["negociaciones","participaciones","compras","publicaciones","valorizaciones","billetera","auto","alertas","publicar","km","caja","combustible","fecha","ubicacion","equipo","docs","texto","precio","vehicular","equipos","maquinaria","materiales","articulos","empresa","verificado","crecimiento"];
const css = readFileSync(process.argv[2] + "/vidrio.css", "utf8");
// Todo en un solo render: useId solo da IDs únicos dentro de una misma raíz (si no, todos comparten el clipPath del primero).
const grid = renderToStaticMarkup(<>{KEYS.map((k) => <figure key={k} className="vd-host"><Vidrio s={k} size={72} /><div>{[48, 32, 24].map((z) => <Vidrio key={z} s={k} size={z} />)}</div><figcaption>{k}</figcaption></figure>)}</>);
writeFileSync(process.argv[2] + "/referencia.html", `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vidrio esmerilado · referencia</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=block">
<style>${css}
body{margin:0;padding:24px;background:#fff;color:#1b1530;font:14px system-ui,sans-serif}h1{font-size:18px}p{max-width:60ch;color:#555}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}figure{margin:0;padding:12px;border:1px solid #eee;border-radius:12px;display:grid;justify-items:center;gap:8px}
figure div{display:flex;align-items:end;gap:8px}figcaption{font:12px ui-monospace,monospace;color:#666}</style></head><body>
<h1>Vidrio esmerilado · referencia</h1><p>Así deben verse los íconos (72, 48, 32 y 24 px) sobre fondo blanco. Generado desde Vidrio.tsx + vidrio.css; pasa el mouse para ver el movimiento. Si tu versión no se ve idéntica, revisa la tipografía (Plus Jakarta Sans 800), el CSS y el fondo.</p>
<div class="g">${grid}</div></body></html>`);
