import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = [
  read("apps/index-lab/app/qa/home-index-rebase/HomeIndexRebase.tsx"),
  read("apps/index-lab/app/qa/home-index-rebase/components/HomeOpportunityHero.tsx"),
  read("apps/index-lab/app/qa/home-index-rebase/components/ActivityFeedPanel.tsx"),
].join("\n");
const styles = [
  read("apps/index-lab/app/qa/home-index-rebase/HomeIndexRebase.module.css"),
].join("\n");
const errors = [];

for (const required of [
  'data-testid="home-first-fold"',
  "<Header",
  "<Sidebar",
  "<HomeOpportunityHero",
  "<ActivityFeedPanel",
  "<OfferCard",
  "<CardTitle",
  "<ProfileButton",
  "<CategoryCard",
  "<HomeCampaignBanner",
]) {
  if (!source.includes(required)) errors.push(`first-fold structure is missing: ${required}`);
}

for (const forbidden of ["revisión visual", "Contenido estático", "snapshot de revisión", "Iconos oficiales en V1", "PlatformActivity"]) {
  if (source.includes(forbidden)) errors.push(`laboratory language leaked into the product canvas: ${forbidden}`);
}

for (const required of [".firstFold", ".sidebarRail", ".page", "@media"]) {
  if (!styles.includes(required)) errors.push(`first-fold layout is missing: ${required}`);
}

if (errors.length) {
  console.error("Home first-fold visual gate failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Home reference-composition gate: PASS");

function read(path) {
  return readFileSync(resolve(root, path), "utf8");
}
