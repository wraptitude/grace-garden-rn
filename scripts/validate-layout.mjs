#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(
  here,
  "../src/features/graceGarden/assets/asset-manifest.json",
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

assert.equal(manifest.layout.columns, 16, "Expected 16 garden columns");
assert.equal(manifest.layout.rows, 16, "Expected 16 garden rows");
assert.equal(
  manifest.layout.cellCapacity,
  manifest.layout.columns * manifest.layout.rows,
  "cellCapacity must match columns × rows",
);
assert.deepEqual(
  manifest.layout.tileWorldSize,
  [104, 52],
  "Isometric tile must remain 104 × 52",
);

for (const item of manifest.placeables) {
  assert.ok(Array.isArray(item.footprint) && item.footprint.length === 2);
  assert.ok(
    item.footprint.every((value) => Number.isInteger(value) && value > 0),
  );
  assert.ok(Array.isArray(item.worldSize) && item.worldSize.length === 2);
  assert.ok(
    item.worldSize.every((value) => Number.isFinite(value) && value > 0),
  );
  assert.ok(Array.isArray(item.hitbox) && item.hitbox.length === 2);
  assert.ok(item.hitbox.every((value) => Number.isFinite(value) && value > 0));
  assert.ok(
    item.hitbox[0] <= item.worldSize[0] * 1.05,
    `${item.catalogId}: hitbox width is unexpectedly larger than artwork`,
  );
  assert.ok(
    item.hitbox[1] <= item.worldSize[1] * 1.05,
    `${item.catalogId}: hitbox height is unexpectedly larger than artwork`,
  );
}

assert.deepEqual(
  manifest.layout.islandWorldRect,
  [-950, -193, 1900, 1571],
  "Expected v2 island mapping",
);
for (const item of manifest.placeables) {
  assert.ok(Array.isArray(item.groundAnchor) && item.groundAnchor.length === 2);
  assert.ok(item.groundAnchor[0] >= 0 && item.groundAnchor[0] <= 1);
  assert.ok(item.groundAnchor[1] >= 0.85 && item.groundAnchor[1] <= 1);
}

console.log("✓ 16 × 16 garden layout validated");
console.log("✓ 256 buildable cells available");
console.log(
  `✓ ${manifest.placeables.length} placeable PNG scale records validated`,
);
