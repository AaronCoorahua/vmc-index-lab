// Comprueba la regla de valorizaciones simuladas de «VMC ahora». Uso: node scripts/check-valorizaciones.mjs
import assert from "node:assert/strict";
import { buildInventory, counts, DAY_MIN, DAY_START, describe, planDay, VAL_CATALOG, VAL_GAPS, VAL_SLOTS, valLot, valorizaciones } from "../apps/index-lab/app/qa/home-index-rebase/feedPlan.ts";

const isPrime = (n) => { for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return n > 1; };
assert.ok(VAL_GAPS.every(isPrime), "todos los intervalos son primos");

assert.deepEqual(valorizaciones(0, 0), [], "sin ofertas no hay avisos");
assert.equal(planDay(0, 0).filter((e) => e.kind === "valorizacion").length, 0);

const seen = new Map();
for (const [V, N] of [[1, 0], [0, 1], [3, 2], [0, 5], [8, 2], [0, 10], [10, 0], [6, 6], [15, 15], [40, 20]]) {
  for (let day = 0; day < 365; day++) {
    const list = valorizaciones(V, N, day);
    seen.set(list.length, (seen.get(list.length) ?? 0) + 1);
    assert.ok(list.length >= 3 && list.length <= 6, `entre 3 y 6 al día (salieron ${list.length})`);
    assert.deepEqual(valorizaciones(V, N, day), list, "misma entrada, mismo plan");
    assert.ok(list.length <= VAL_SLOTS, "cabe en los puestos del día");
    const parts = list.map((v) => { const w = v.lot.split(" "); return { brand: w[0], model: w.slice(0, -1).join(" "), year: w.at(-1) }; });
    for (const k of ["brand", "model", "year"]) assert.equal(new Set(parts.map((p) => p[k])).size, list.length, `sin repetir ${k} en el día`);
    list.forEach((v, i) => {
      assert.ok(VAL_GAPS.includes(v.min - (i ? list[i - 1].min : DAY_START)), "cada espera es uno de los primos");
      assert.ok(v.min < DAY_START + DAY_MIN, "dentro del día");
    });
    const plan = planDay(V, N, day);
    assert.deepEqual(plan.filter((e) => e.kind === "valorizacion").map((e) => e.min), list.map((v) => v.min), "el plan respeta los minutos primos");
    assert.equal(plan.length, counts(V, N, day).total, "el total cuadra con el plan");
  }
}
assert.notDeepEqual(valorizaciones(8, 2, 0), valorizaciones(8, 2, 1), "cambia de un día a otro");

// Peor caso del catálogo, sin depender de cuántos avisos salgan: 6 puestos seguidos, 4 días y 28 días.
const model = (i) => valLot(i).split(" ").slice(0, -1).join(" ");
for (let i = 0; i < 2000; i++) {
  const six = Array.from({ length: VAL_SLOTS }, (_, k) => valLot(i + k).split(" "));
  assert.equal(new Set(six.map((w) => w[0])).size, VAL_SLOTS, "6 puestos: marcas distintas");
  assert.equal(new Set(six.map((w) => w.at(-1))).size, VAL_SLOTS, "6 puestos: años distintos");
  assert.equal(new Set(Array.from({ length: 24 }, (_, k) => model(i + k))).size, 24, "24 puestos (4 días): modelos distintos");
  assert.equal(new Set(Array.from({ length: 168 }, (_, k) => valLot(i + k))).size, 168, "168 puestos (28 días): combinaciones distintas");
}
const onSale = buildInventory(30, 30).map((o) => o.lot.split(" ").slice(0, -1).join(" "));
for (const [brand, models] of VAL_CATALOG) for (const m of models) assert.ok(!onSale.includes(`${brand} ${m}`), `${brand} ${m} no está en el inventario de ejemplo`);

const [e] = planDay(8, 2).filter((x) => x.kind === "valorizacion");
const t = describe(e, []);
assert.equal(t.cta, "Valorizar", "lleva botón");
assert.ok(!/\$|S\/|\d{4,}/.test(t.title.replace(/20\d\d/, "")), "sin monto");

console.log("OK · avisos al día → veces:", Object.fromEntries([...seen].sort((a, b) => a[0] - b[0])));
console.log("8 + 2:", valorizaciones(8, 2).map((v) => `${Math.floor(v.min / 60)}:${String(v.min % 60).padStart(2, "0")} ${v.lot}`).join(" · "));
