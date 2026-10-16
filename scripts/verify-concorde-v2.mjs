import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const source = JSON.parse(readFileSync(resolve(root, "config", "concorde-v2-source.json"), "utf8"));
const runtimeRoot = resolve(root, source.runtimeRoot);

if (source.kind !== "materialized-concorde-v2") fail("unsupported V2 source kind");
if (!existsSync(runtimeRoot)) fail(`missing runtime root: ${source.runtimeRoot}`);

const entries = [];
visit(runtimeRoot);
entries.sort();
const tree = createHash("sha256").update(`${entries.join("\n")}\n`).digest("hex");

if (entries.length !== source.runtimeFileCount) fail(`runtime file count is ${entries.length}; expected ${source.runtimeFileCount}`);
if (tree !== source.runtimeTreeSha256) fail(`runtime tree hash differs from the frozen Concorde V2 snapshot (${tree})`);

console.log(`Concorde V2 verified: ${source.snapshotId}`);
console.log(`Tree ${tree}`);

function visit(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) fail(`runtime must not contain links or junctions: ${relative(root, path)}`);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) visit(join(path, entry));
    return;
  }
  const display = relative(root, path).replaceAll("\\", "/");
  const digest = createHash("sha256").update(readFileSync(path)).digest("hex");
  entries.push(`${display}:${digest}`);
}

function fail(message) {
  console.error(`Concorde V2 gate failed: ${message}`);
  process.exit(1);
}
