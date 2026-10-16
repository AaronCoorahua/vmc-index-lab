import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const currentPath = resolve(root, "docs", "decisions", "CURRENT.md");
const current = readFileSync(currentPath, "utf8");
const contractMatch = current.match(/^active_design_contract:\s*(.+)$/m);
if (!contractMatch) throw new Error("CURRENT.md is missing active_design_contract");
const contract = JSON.parse(readFileSync(resolve(root, contractMatch[1].trim()), "utf8"));
if (!['concorde-fit', 'system-candidate'].includes(contract.deliveryClass)) {
  throw new Error(`Unsupported active delivery class: ${contract.deliveryClass}`);
}

execFileSync(process.execPath, ["scripts/verify-design-system.mjs", "require", contract.deliveryClass], {
  cwd: root,
  stdio: "inherit",
});
