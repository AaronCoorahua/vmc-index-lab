import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const requested = process.argv[2] || "audit";
const expectedClass = process.argv[3];
const validModes = new Set(["audit", "readiness", "cut-contract", "concorde-contract", "concorde-only", "provenance", "styles", "require"]);
if (!validModes.has(requested)) {
  console.error(`Unknown design-system gate mode: ${requested}`);
  process.exit(2);
}
if (requested === "require" && !["concorde-fit", "system-candidate"].includes(expectedClass)) {
  console.error("require mode needs an expected class: concorde-fit or system-candidate");
  process.exit(2);
}
const current = readFrontmatter(resolve(root, "docs", "decisions", "CURRENT.md"));
const contractPath = resolveInsideRoot(required(current, "active_design_contract"));
const contract = readJson(contractPath);
const source = readJson(resolveInsideRoot(contract.concorde?.source || "config/concorde-source.json"));
const materializedV2 = source.kind === "materialized-concorde-v2";
const adapter = readText(resolve(root, "packages", "concorde-adapter", "src", "index.ts"));
const tokenSource = materializedV2 ? readText(resolve(root, "packages", "concorde-adapter", "src", "tokens.css")) : readText(resolve(root, ".vendor", "chatbot-final-vmc", "frontend", "src", "app", "globals.css"));
const errors = [];
const warnings = [];

const phases = new Set(["pre-v1-baseline", "v1-concorde-fit", "v2-tailored-design"]);
const classes = new Set(["concept-prototype", "concorde-fit", "system-candidate"]);
const tokens = new Set([...tokenSource.matchAll(/(--vmc-[A-Za-z0-9_-]+)\s*:/g)].map((match) => match[1]));
const strict = contract.deliveryClass !== "concept-prototype";
const readinessTarget = requested === "readiness" ? process.argv[3] : undefined;
if (requested === "readiness" && !["concorde-fit", "system-candidate"].includes(readinessTarget)) {
  console.error("readiness mode needs a target class: concorde-fit or system-candidate");
  process.exit(2);
}
const implementationFiles = contract.implementation?.files || [];
const allowedCssCategories = new Set(["layout", "responsive", "asset-placement"]);
const localCandidates = contract.localCandidates || [];
const concordeOnly = contract.concordeOnly?.enforced === true;

if (!classes.has(contract.deliveryClass)) errors.push(`unsupported deliveryClass: ${contract.deliveryClass}`);
if (!phases.has(contract.phase)) errors.push(`unsupported phase: ${contract.phase}`);
if (current.active_cut !== contract.cutId) errors.push(`CURRENT active_cut (${current.active_cut}) does not match contract (${contract.cutId})`);
if (current.initiative_track && current.initiative_track !== contract.deliveryClass) errors.push("CURRENT initiative_track does not match contract deliveryClass");
const expectedRevision = materializedV2 ? source.snapshotId : source.revision;
const expectedTree = materializedV2 ? source.runtimeTreeSha256 : source.gitObjects?.concordeTree;
if (contract.concorde?.revision !== expectedRevision) errors.push("contract Concorde revision does not match its declared source");
if (contract.concorde?.tree !== expectedTree) errors.push("contract Concorde tree does not match its declared source");
if (!Array.isArray(contract.components) || contract.components.length === 0) errors.push("contract requires at least one component");
if (!Array.isArray(contract.foundations?.tokens) || contract.foundations.tokens.length === 0) errors.push("contract requires declared foundations.tokens");
if (!Array.isArray(contract.localCss?.files) || contract.localCss.files.length === 0) errors.push("contract requires localCss.files");

if (["audit", "readiness", "require", "cut-contract"].includes(requested)) validateCutContract();
if (["audit", "readiness", "require", "concorde-contract"].includes(requested)) validateConcordeContract();
if (["audit", "readiness", "require", "provenance"].includes(requested)) validateProvenance();
if (["audit", "readiness", "require", "styles"].includes(requested)) validateStyles();
if (requested === "concorde-only") {
  validateCutContract();
  validateConcordeContract();
  validateStyles();
  validateConcordeOnly();
}
if (requested === "require" && contract.deliveryClass !== expectedClass) {
  errors.push(`expected ${expectedClass}, but active contract is ${contract.deliveryClass}`);
}

if (errors.length) {
  console.error("Design-system verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
printWarnings(warnings);
const result = requested === "readiness" ? `READY FOR ${readinessTarget}` : strict ? "PASS" : "CONCEPT ONLY";
console.log(`Design-system ${requested} gate: ${result} (${contract.cutId})`);

function validateCutContract() {
  if (contract.schemaVersion !== 1) errors.push("unsupported or missing contract schemaVersion");
  for (const path of [
    contract.approval?.decisionPacket,
    current.active_component_map,
    current.active_decision_packet,
  ]) {
    if (!path) errors.push("contract/CURRENT is missing a required decision artifact path");
    else if (!existsSync(resolveInsideRoot(path))) errors.push(`required decision artifact does not exist: ${path}`);
  }
  if ((strict || requested === "readiness") && contract.foundations?.styleAuthority !== "concorde") {
    errors.push("concorde-fit/system-candidate requires foundations.styleAuthority=concorde");
  }
  if ((strict || requested === "readiness") && (contract.localCss.waivers?.length || 0) > 0) {
    errors.push("concorde-fit/system-candidate cannot carry broad localCss waivers");
  }
  if (localCandidates.length > 0 && contract.deliveryClass !== "system-candidate") {
    errors.push("localCandidates are permitted only for system-candidate deliveryClass");
  }
  for (const candidate of localCandidates) {
    if (!candidate.id || !candidate.authorizedBy || !candidate.authorizedAt || !Array.isArray(candidate.files) || !Array.isArray(candidate.visualDeclarations)) {
      errors.push("local candidate needs id, authorization, files and visualDeclarations");
      continue;
    }
    for (const file of candidate.files) {
      if (!contract.localCss.files.includes(file)) errors.push(`candidate CSS file is outside localCss.files: ${candidate.id}`);
    }
    for (const declaration of candidate.visualDeclarations) {
      if (!declaration.property || !declaration.value) errors.push(`candidate visual declaration needs property and value: ${candidate.id}`);
    }
  }
  for (const allowed of contract.localCss?.allowed || []) {
    if (!allowedCssCategories.has(allowed)) errors.push(`unsupported localCss.allowed category: ${allowed}`);
  }
  for (const waiver of contract.localCss?.waivers || []) {
    if (!waiver.id || !waiver.reason || !waiver.scope || !waiver.approvedBy || !waiver.expires) {
      errors.push("localCss waiver needs id, reason, scope, approvedBy and expires");
      continue;
    }
    if (waiver.expires < new Date().toISOString().slice(0, 10)) errors.push(`expired localCss waiver: ${waiver.id}`);
    if (!contract.localCss.files.some((file) => file.endsWith(waiver.scope))) errors.push(`waiver scope is outside localCss.files: ${waiver.id}`);
  }
  if (!Array.isArray(implementationFiles) || implementationFiles.length === 0) errors.push("contract requires implementation.files");
  for (const file of implementationFiles) {
    if (!existsSync(resolveInsideRoot(file))) errors.push(`implementation file missing: ${file}`);
  }
  if (!contract.implementation?.entrypoint || !existsSync(resolveInsideRoot(contract.implementation.entrypoint))) {
    errors.push("contract requires an existing implementation.entrypoint");
  } else {
    const discovered = discoverImplementationClosure(contract.implementation.entrypoint);
    const declared = new Set([...implementationFiles, ...(contract.localCss?.files || [])]);
    for (const file of discovered) if (!declared.has(file)) errors.push(`route closure file is absent from contract: ${file}`);
    for (const file of declared) if (!discovered.has(file)) errors.push(`contract file is not reachable from route entrypoint: ${file}`);
  }
  const packet = readFrontmatter(resolveInsideRoot(contract.approval?.decisionPacket || ""));
  if (packet.cut_id !== contract.cutId) errors.push("Decision Packet cut_id does not match contract");
  if (contract.approval?.decisionPacket !== current.active_decision_packet) errors.push("contract Decision Packet must equal CURRENT active_decision_packet");
  if (packet.component_map !== current.active_component_map) errors.push("Decision Packet component_map must equal CURRENT active_component_map");
  if (packet.concorde_source !== current.concorde_source || contract.concorde.source !== current.concorde_source) {
    errors.push("CURRENT, Decision Packet and contract must declare the same Concorde source");
  }
  const validStatus = {
    "concept-prototype": /^concept-prototype/,
    "concorde-fit": /^concorde-fit/,
    "system-candidate": /^system-candidate/,
  }[contract.deliveryClass];
  if (!validStatus?.test(current.status || "")) errors.push("CURRENT status does not match deliveryClass");
  if (!validStatus?.test(packet.status || "")) errors.push("Decision Packet status does not match deliveryClass");
  const expectedPhase = {
    "concept-prototype": "pre-v1-baseline",
    "concorde-fit": "v1-concorde-fit",
    "system-candidate": "v2-tailored-design",
  }[contract.deliveryClass];
  if (contract.phase !== expectedPhase) errors.push("deliveryClass does not match its required phase");
  if (!strict) warnings.push("concept-prototype is not eligible for Concorde Fit or formal systemic review");
}

function validateConcordeContract() {
  const importedComponents = new Set();
  for (const file of implementationFiles) {
    if (!existsSync(resolveInsideRoot(file))) continue;
    for (const match of readText(resolveInsideRoot(file)).matchAll(/import\s*\{([\s\S]*?)\}\s*from\s*["']@vmc\/concorde-adapter["']/g)) {
      for (const entry of match[1].split(",")) {
        if (/^type\s+/.test(entry.trim())) continue;
        const name = entry.trim().split(/\s+as\s+/)[0].trim();
        if (name) importedComponents.add(name);
      }
    }
  }
  for (const component of contract.components || []) {
    if (!component.name || !new RegExp(`(?:default as|\\{[^}]*\\b)${escapeRegex(component.name)}\\b`).test(adapter)) {
      errors.push(`component is not exported by @vmc/concorde-adapter: ${component.name || "<missing>"}`);
    }
    if ((strict || requested === "readiness") && (!Array.isArray(component.props) || component.props.length === 0)) {
      errors.push(`strict contract requires public props for ${component.name}`);
    }
    if (!component.sourcePath || !componentSourceExists(component.sourcePath)) {
      errors.push(`component sourcePath is missing or outside the declared Concorde source: ${component.name}`);
    }
    const adapterSource = adapterSourcePath(component.name);
    if (!adapterSource) errors.push(`cannot resolve adapter source for component: ${component.name}`);
    else if (component.sourcePath !== adapterSource) errors.push(`component sourcePath does not match adapter export for ${component.name}: ${component.sourcePath}`);
    if (!importedComponents.has(component.name)) errors.push(`contract component is not imported by this cut: ${component.name}`);
    validateDeclaredProps(component);
  }
  for (const name of importedComponents) {
    if (!(contract.components || []).some((component) => component.name === name)) {
      errors.push(`adapter component is used but absent from contract: ${name}`);
    }
  }
  for (const token of contract.foundations?.tokens || []) {
    if (!tokens.has(token)) errors.push(`foundation token missing from pinned Concorde source: ${token}`);
  }
}

function validateProvenance() {
  const usedAssets = discoverUsedAssets();
  for (const asset of contract.assets || []) {
    if (!asset.path || !existsSync(resolveInsideRoot(asset.path))) { errors.push(`asset missing: ${asset.path || "<missing>"}`); continue; }
    if (!asset.origin?.provider || !asset.origin?.createdAt || !asset.origin?.rights || !asset.scope || !asset.sha256) {
      errors.push(`asset lacks provider, date, rights, scope or sha256: ${asset.path}`);
    } else if (sha256(resolveInsideRoot(asset.path)) !== asset.sha256) errors.push(`asset sha256 does not match: ${asset.path}`);
    usedAssets.delete(asset.path);
  }
  for (const path of usedAssets) errors.push(`asset used by the cut but absent from contract: ${path}`);
  for (const reference of contract.references || []) {
    if (reference.voyager === "verified" && (!reference.url || !reference.node || !reference.reviewedAt)) {
      errors.push(`verified Voyager reference needs url, node and reviewedAt: ${reference.id}`);
    }
    if (strict && reference.voyager && reference.voyager !== "verified" && reference.status !== "hierarchy-only") {
      errors.push(`unverified Voyager reference cannot transfer visual style: ${reference.id}`);
    }
  }
}

function validateStyles() {
  for (const file of contract.localCss?.files || []) {
    const path = resolveInsideRoot(file);
    if (!existsSync(path)) { errors.push(`CSS file missing: ${file}`); continue; }
    const css = readText(path).replaceAll(/\/\*[\s\S]*?\*\//g, "");
    const findings = [];
    if (/:global\s*\(/.test(css)) findings.push("component-internal :global selector");
    if (/\.(?:pcard|pcatcard|badgestatus|sb[a-z-]*)\b/.test(css)) findings.push("selector targets private Concorde anatomy");
    const allowed = new Set(contract.localCss?.allowed || []);
    const waivers = (contract.localCss?.waivers || []).filter((waiver) => file.endsWith(waiver.scope));
    for (const declaration of parseCssDeclarations(css)) {
      const category = cssCategory(declaration.property, declaration.value);
      if (!category) {
        const finding = `${declaration.property}: unclassified CSS property`;
        if (strict || requested === "readiness") errors.push(`${file}: ${finding}; classify it explicitly before formal promotion`);
        else if (waivers.length) warnings.push(`${file}: ${finding} is covered only by concept waiver ${waivers.map((waiver) => waiver.id).join(", ")}`);
        else errors.push(`${file}: ${finding}; concept CSS needs a live waiver`);
        continue;
      }
      if (category === "custom") {
        if (concordeOnly) {
          errors.push(`${file}: local custom properties are forbidden by Concorde-only; use a verified foundation through its public component`);
          continue;
        }
        const finding = `${declaration.property}: local custom property`;
        if (strict || requested === "readiness") errors.push(`${file}: ${finding}; resolve to a verified --vmc-* token or an approved candidate`);
        else if (waivers.length) warnings.push(`${file}: ${finding} is covered only by concept waiver ${waivers.map((waiver) => waiver.id).join(", ")}`);
        else errors.push(`${file}: ${finding}; concept CSS needs a live waiver`);
        continue;
      }
      const isVisual = category === "visual";
      if (concordeOnly && isVisual && !isAuthorizedCandidateVisual(file, declaration)) {
        errors.push(`${file}: ${declaration.property} is a local visual declaration; Concorde-only permits layout, responsive and asset placement only`);
        continue;
      }
      const rawVisual = hasRawVisualPrimitive(declaration.value);
      if (isVisual && rawVisual) {
        const finding = `${declaration.property}: raw visual primitive (${declaration.value.slice(0, 80)})`;
        if (isAuthorizedCandidateVisual(file, declaration)) continue;
        if (strict || requested === "readiness" || waivers.length === 0) errors.push(`${file}: ${finding}; use a verified foundation or a specific authorized candidate declaration`);
        else warnings.push(`${file}: ${finding} is covered only by concept waiver ${waivers.map((waiver) => waiver.id).join(", ")}`);
      }
      if (category !== "visual" && !allowed.has(category)) {
        errors.push(`${file}: ${declaration.property} is ${category}, which is not declared in localCss.allowed`);
      }
    }
    for (const finding of findings) {
      if (finding.includes("private") || finding.includes(":global")) errors.push(`${file}: ${finding}`);
      else if (strict || requested === "readiness") errors.push(`${file}: ${finding}; use a verified foundation or escalate`);
      else warnings.push(`${file}: ${finding} is allowed only while classified concept-prototype`);
    }
  }
}

function validateConcordeOnly() {
  if (!concordeOnly) {
    errors.push("active Design Contract must declare concordeOnly.enforced=true");
    return;
  }
  if (localCandidates.length > 0 && !hasExplicitConcordeException()) {
    errors.push("Concorde-only forbids localCandidates without an explicit Julio exception record");
  }
  if ((contract.localCss?.waivers?.length || 0) > 0) {
    errors.push("Concorde-only forbids localCss waivers");
  }
}

function hasExplicitConcordeException() {
  const exception = contract.concordeOnly?.exception;
  if (!exception || exception.status !== "explicitly-approved") return false;
  return ["requestedBy", "requestedAt", "requestRecord", "scope", "files", "expires"].every((key) => Boolean(exception[key]))
    && Array.isArray(exception.files)
    && exception.files.length > 0
    && exception.expires >= new Date().toISOString().slice(0, 10);
}

function isAuthorizedCandidateVisual(file, declaration) {
  if (contract.deliveryClass !== "system-candidate") return false;
  return localCandidates.some((candidate) => candidate.files?.includes(file)
    && candidate.visualDeclarations?.some((allowed) => allowed.property === declaration.property
      && (allowed.value === declaration.value || (allowed.value === "verified-token" && !hasRawVisualPrimitive(declaration.value)))));
}

function validateDeclaredProps(component) {
  if (!Array.isArray(component.props) || component.props.length === 0) return;
  const tags = [];
  const pattern = new RegExp(`<${escapeRegex(component.name)}\\b[\\s\\S]*?(?:\\/>|<\\/${escapeRegex(component.name)}>)`, "g");
  for (const file of implementationFiles) {
    if (existsSync(resolveInsideRoot(file))) tags.push(...(readText(resolveInsideRoot(file)).match(pattern) || []));
  }
  for (const declaration of component.props) {
    const [name, expected] = declaration.split("=", 2);
    const expectedPattern = expected === undefined
      ? `\\b${escapeRegex(name)}(?:\\s*=|\\s|\\/?>)`
      : `\\b${escapeRegex(name)}\\s*=\\s*(?:["']${escapeRegex(expected)}["']|\\{${escapeRegex(expected)}\\})`;
    const seen = tags.some((tag) => new RegExp(expectedPattern).test(tag)
      || (name === "children" && expected === undefined && tag.includes(`</${component.name}>`)));
    if (!seen) errors.push(`declared prop is not used by ${component.name}: ${declaration}`);
  }
  const declaredNames = new Set(component.props.map((declaration) => declaration.split("=", 1)[0]));
  const actualNames = new Set(tags.flatMap((tag) => [...tag.matchAll(/(?:^|\s)([A-Za-z_$][\w$-]*)(?=\s*=|\s*(?:\/?>))/g)].map((match) => match[1])));
  for (const name of actualNames) if (name !== "key" && !declaredNames.has(name)) errors.push(`used prop is absent from contract for ${component.name}: ${name}`);
}

function discoverUsedAssets() {
  const used = new Set();
  const files = contract.implementation?.entrypoint ? discoverImplementationClosure(contract.implementation.entrypoint) : new Set([...implementationFiles, ...(contract.localCss?.files || [])]);
  for (const file of files) {
    if (!existsSync(resolveInsideRoot(file))) continue;
    for (const match of readText(resolveInsideRoot(file)).matchAll(/["'(]\/(?!\/)([^"')\s]+)/g)) {
      used.add(`apps/index-lab/public/${match[1]}`);
    }
  }
  return used;
}

function discoverImplementationClosure(entrypoint) {
  const discovered = new Set();
  const visit = (file) => {
    if (discovered.has(file)) return;
    const path = resolveInsideRoot(file);
    if (!existsSync(path)) { errors.push(`route closure import is missing: ${file}`); return; }
    discovered.add(file);
    if (!/\.(?:[cm]?[jt]sx?|css)$/.test(file)) return;
    const content = readText(path);
    for (const match of content.matchAll(/(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g)) {
      const target = match[1];
      if (!target.startsWith(".")) continue;
      const resolved = resolveLocalImport(file, target);
      if (!resolved) errors.push(`cannot resolve local import from route closure: ${file} -> ${target}`);
      else visit(resolved);
    }
  };
  visit(entrypoint);
  return discovered;
}

function resolveLocalImport(from, target) {
  const base = resolve(root, from, "..");
  const candidates = target.match(/\.[a-z]+$/i)
    ? [resolve(base, target)]
    : [".ts", ".tsx", ".js", ".jsx", ".css", "/index.ts", "/index.tsx"].map((extension) => resolve(base, `${target}${extension}`));
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const relativePath = relative(root, candidate).split(sep).join("/");
    try { return resolveInsideRoot(relativePath) && relativePath; } catch { return ""; }
  }
  return "";
}

function parseCssDeclarations(css) {
  const declarations = [];
  let depth = 0, buffer = "", quote = "", parentheses = 0;
  const flush = () => {
    const colon = buffer.indexOf(":");
    if (depth > 0 && colon > 0) declarations.push({ property: buffer.slice(0, colon).trim().toLowerCase(), value: buffer.slice(colon + 1).trim() });
    buffer = "";
  };
  for (const character of css) {
    if (quote) { buffer += character; if (character === quote) quote = ""; continue; }
    if (character === '"' || character === "'") { quote = character; buffer += character; continue; }
    if (character === "(") { parentheses += 1; buffer += character; continue; }
    if (character === ")") { parentheses = Math.max(0, parentheses - 1); buffer += character; continue; }
    if (character === "{") { buffer = ""; depth += 1; continue; }
    if (character === "}") { flush(); depth = Math.max(0, depth - 1); continue; }
    if (character === ";" && parentheses === 0) { flush(); continue; }
    buffer += character;
  }
  return declarations;
}

function cssCategory(property, value) {
  if (property.startsWith("--")) return "custom";
  if (/^(display|position|inset|top|right|bottom|left|margin|padding|width|height|min-|max-|grid|flex|gap|align-|justify-|place-|order|overflow|z-index|box-sizing|object-|aspect-ratio|white-space|list-style)/.test(property)) return "layout";
  if ((property === "background-image" || property === "mask-image") && /gradient\s*\(/.test(value)) return "visual";
  if (property === "background-image" || property === "mask-image") return "asset-placement";
  if (/(color|background|border|shadow|radius|font|letter-spacing|line-height|outline|opacity|filter|transform|text-decoration)/.test(property)) return "visual";
  return null;
}

function hasRawVisualPrimitive(value) {
  // A public Concorde token is a foundation, even if its semantic name happens
  // to contain a color word such as `orange` or `white`.
  const withoutVerifiedTokenReferences = value.replaceAll(/var\(--vmc-[A-Za-z0-9_-]+\)/g, "");
  return /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|linear-gradient|radial-gradient|conic-gradient)\s*\(|\b(?:white|black|transparent|red|blue|green|purple|orange)\b|\b\d+(?:\.\d+)?(?:px|rem|em|%)\b/.test(withoutVerifiedTokenReferences);
}

function sha256(path) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }

function adapterSourcePath(name) {
  const pattern = new RegExp(`export\\s*\\{\\s*default as ${escapeRegex(name)}(?:,|\\s|\\})[\\s\\S]*?from\\s+["']([^"']+)["']`);
  const match = adapter.match(pattern);
  if (!match) return "";
  const base = resolve(root, "packages", "concorde-adapter", "src");
  const candidates = [resolve(base, match[1]), `${resolve(base, match[1])}.tsx`, `${resolve(base, match[1])}.ts`];
  const actual = candidates.find((candidate) => existsSync(candidate));
  if (!actual) return "";
  if (materializedV2) {
    const runtimeRoot = resolve(root, source.runtimeRoot);
    const relativeSource = relative(runtimeRoot, actual).split(sep).join("/");
    return relativeSource.startsWith("..") ? "" : `${source.runtimeRoot}/${relativeSource}`;
  }
  const vendorRoot = resolve(root, ".vendor", "chatbot-final-vmc");
  const relativeSource = relative(vendorRoot, actual).split(sep).join("/");
  return relativeSource.startsWith("..") ? "" : relativeSource;
}

function componentSourceExists(path) {
  if (materializedV2) {
    try { return existsSync(resolveInsideRoot(path)); } catch { return false; }
  }
  return Boolean(resolveInsideVendor(path));
}

function printWarnings(items) {
  const groups = new Map();
  for (const item of items) {
    const kind = item.includes("raw visual primitive") ? "recetas visuales locales" : item.includes("local custom property") ? "tokens locales" : item.includes("unclassified CSS property") ? "propiedades CSS sin clasificar" : "estado o procedencia";
    const group = groups.get(kind) || [];
    group.push(item);
    groups.set(kind, group);
  }
  for (const [kind, group] of groups) {
    console.warn(`Design-system warning: ${kind}: ${group.length}`);
    for (const example of group.slice(0, 3)) console.warn(`  - ${example}`);
    if (group.length > 3) console.warn(`  - … ${group.length - 3} más; ejecuta el gate por categoría para el detalle.`);
  }
}

function required(object, key) {
  const value = object[key];
  if (!value) throw new Error(`CURRENT.md is missing ${key}`);
  return value;
}

function readFrontmatter(path) {
  const match = readText(path).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`frontmatter missing: ${path}`);
  return Object.fromEntries(match[1].split(/\r?\n/).flatMap((line) => {
    const separator = line.indexOf(":");
    return separator > 0 ? [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]] : [];
  }));
}

function readJson(path) { return JSON.parse(readText(path)); }
function readText(path) { return readFileSync(path, "utf8"); }
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function resolveInsideRoot(path) {
  if (typeof path !== "string" || !path) throw new Error("path must be a non-empty repository-relative string");
  if (isAbsolute(path) || path.split(/[\\/]+/).includes("..")) throw new Error(`unsafe repository path: ${path}`);
  const resolved = resolve(root, path);
  const canonicalRoot = realpathSync(root);
  if (relative(canonicalRoot, resolved).startsWith("..") || resolved === canonicalRoot) throw new Error(`unsafe repository path: ${path}`);
  assertNoLinks(canonicalRoot, resolved, path);
  return resolved;
}

function resolveInsideVendor(path) {
  if (typeof path !== "string" || !path || isAbsolute(path) || path.split(/[\\/]+/).includes("..")) return "";
  const vendorRoot = resolve(root, ".vendor", "chatbot-final-vmc");
  const resolved = resolve(vendorRoot, path);
  if (!existsSync(resolved)) return "";
  const canonicalRoot = realpathSync(vendorRoot);
  const canonical = realpathSync(resolved);
  if (relative(canonicalRoot, canonical).startsWith("..") || canonical === canonicalRoot) return "";
  assertNoLinks(canonicalRoot, resolved, path);
  return resolved;
}

function assertNoLinks(canonicalRoot, resolved, original) {
  const segments = relative(canonicalRoot, resolved).split(sep).filter(Boolean);
  let cursor = canonicalRoot;
  for (const segment of segments) {
    cursor = resolve(cursor, segment);
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) throw new Error(`link or junction is not allowed in contract path: ${original}`);
  }
}
