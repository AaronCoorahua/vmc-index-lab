import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(appRoot, ".next", "server", "app-paths-manifest.json");

if (!existsSync(manifestPath)) {
  console.error("Route gate failed: build manifest is missing. Run npm run build first.");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
if (!Object.hasOwn(manifest, "/page")) {
  console.error("Route gate failed: / was not emitted by the App Router build.");
  process.exit(1);
}

if (!Object.hasOwn(manifest, "/qa/shell/page")) {
  console.error("Route gate failed: /qa/shell was not emitted for technical evidence.");
  process.exit(1);
}

if (!Object.hasOwn(manifest, "/qa/home-discovery/page")) {
  console.error("Route gate failed: /qa/home-discovery was not emitted for Home visual evidence.");
  process.exit(1);
}

if (!Object.hasOwn(manifest, "/qa/home-index-rebase/page")) {
  console.error("Route gate failed: /qa/home-index-rebase was not emitted for the current-index V1 evidence.");
  process.exit(1);
}

console.log("Route gate passed: /, /qa/shell, /qa/home-discovery and /qa/home-index-rebase are present in the production build.");
