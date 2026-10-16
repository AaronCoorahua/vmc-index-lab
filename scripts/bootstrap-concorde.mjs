import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(root, "config", "concorde-source.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const vendorRoot = resolve(root, ".vendor");
const checkout = resolve(vendorRoot, "chatbot-final-vmc");
const verifyOnly = process.argv.includes("--verify-only");
const git = process.platform === "win32" ? "git.exe" : "git";

function run(args, options = {}) {
  const output = execFileSync(git, args, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    stdio: options.inherit ? "inherit" : ["ignore", "pipe", "pipe"],
  });
  return typeof output === "string" ? output.trim() : "";
}

function fail(message) {
  console.error(`Concorde gate failed: ${message}`);
  process.exit(1);
}

function objectAt(path) {
  return run(["rev-parse", `${config.revision}:${path}`], { cwd: checkout });
}

if (!existsSync(resolve(checkout, ".git"))) {
  if (verifyOnly) {
    fail("missing .vendor checkout; run npm run bootstrap:concorde first");
  }

  mkdirSync(vendorRoot, { recursive: true });
  const source = process.env.CONCORDE_SOURCE_REPOSITORY || config.repository;
  console.log(`Cloning Concorde source from ${source}`);
  run(["clone", "--no-checkout", source, checkout], { inherit: true });

  if (source !== config.repository) {
    run(["remote", "set-url", "origin", config.repository], { cwd: checkout });
  }
}

const bootstrapSource = process.env.CONCORDE_SOURCE_REPOSITORY;
let remote = run(["remote", "get-url", "origin"], { cwd: checkout });
if (bootstrapSource && remote === bootstrapSource && remote !== config.repository) {
  run(["remote", "set-url", "origin", config.repository], { cwd: checkout });
  remote = config.repository;
}
if (remote !== config.repository) {
  fail(`origin is ${remote}; expected ${config.repository}`);
}

let revisionAvailable = true;
try {
  run(["cat-file", "-e", `${config.revision}^{commit}`], { cwd: checkout });
} catch {
  revisionAvailable = false;
}

if (!revisionAvailable) {
  if (verifyOnly) fail(`revision ${config.revision} is unavailable locally`);
  run(["fetch", "--depth", "1", "origin", config.revision], {
    cwd: checkout,
    inherit: true,
  });
}

let head = "";
try {
  head = run(["rev-parse", "HEAD"], { cwd: checkout });
} catch {
  // A fresh --no-checkout clone has no checked-out HEAD yet.
}

const sourceMaterialized = Object.values(config.paths).every((path) =>
  existsSync(resolve(checkout, path)),
);

if (head !== config.revision || !sourceMaterialized) {
  if (verifyOnly) {
    const reason = head !== config.revision
      ? `HEAD is ${head || "unset"}; expected ${config.revision}`
      : "the pinned source files have not been checked out";
    fail(reason);
  }
  const dirty = run(["status", "--porcelain"], { cwd: checkout });
  const indexIsEmpty = !run(["ls-files", "--stage"], { cwd: checkout });
  if (dirty && !indexIsEmpty) {
    fail("vendor checkout has local changes; refusing to replace them");
  }
  run(["checkout", "--detach", config.revision], { cwd: checkout, inherit: true });
}

const expectedObjects = {
  [config.paths.concorde]: config.gitObjects.concordeTree,
  [config.paths.tokens]: config.gitObjects.tokensBlob,
  [config.paths.package]: config.gitObjects.packageBlob,
  [config.paths.lockfile]: config.gitObjects.lockfileBlob,
};

for (const [path, expected] of Object.entries(expectedObjects)) {
  const actual = objectAt(path);
  if (actual !== expected) fail(`${path} resolves to ${actual}; expected ${expected}`);
  if (!existsSync(resolve(checkout, path))) fail(`${path} is absent from the checkout`);
}

const dirty = run(["status", "--porcelain"], { cwd: checkout });
if (dirty) fail("vendor checkout is not read-only clean");

console.log(`Concorde verified at ${config.revision}`);
console.log(`Tree ${config.gitObjects.concordeTree}`);
