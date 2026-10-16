import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const scanRoots = [resolve(root, "apps"), resolve(root, "packages")];
const textExtensions = new Set([".css", ".js", ".jsx", ".json", ".mjs", ".ts", ".tsx"]);
const errors = [];

function visit(path) {
  const stat = lstatSync(path);
  const display = relative(root, path).replaceAll("\\", "/");

  if (stat.isSymbolicLink()) {
    errors.push(`${display}: source tree must not contain links or junctions`);
    return;
  }

  if (stat.isDirectory()) {
    if ([".next", "node_modules"].includes(display.split("/").at(-1))) return;
    for (const entry of readdirSync(path)) visit(join(path, entry));
    return;
  }

  if (!textExtensions.has(extname(path))) return;
  const text = readFileSync(path, "utf8");

  if (/(?:^|[\s"'(=])[A-Za-z]:[\\/]/m.test(text)) {
    errors.push(`${display}: absolute Windows path`);
  }
  if (/ux-ui-agent|DesignSystem[\\/]DesignSystem[\\/]concorde/.test(text)) {
    errors.push(`${display}: secondary Concorde source`);
  }

  const allowedVendorReferences = new Set([
    "apps/index-lab/tsconfig.json",
    "packages/concorde-adapter/src/index.ts",
    "packages/concorde-adapter/src/tokens.css",
  ]);
  if (text.includes(".vendor/chatbot-final-vmc/frontend") && !allowedVendorReferences.has(display)) {
    errors.push(`${display}: direct vendor reference outside the integration boundary`);
  }
  const isInstalledConcordeSource = display.startsWith("apps/index-lab/concorde/");
  if (!isInstalledConcordeSource && display.startsWith("apps/") && /frontend[\\/]concorde|@\/["']?concorde/.test(text)) {
    errors.push(`${display}: application bypasses @vmc/concorde-adapter`);
  }
}

for (const path of scanRoots) visit(path);

if (errors.length) {
  console.error("Boundary verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Boundary verification passed: one app, one Concorde adapter, no local paths.");
