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

assert.equal(manifest.layout.columns, 31, "Expected 31 backing columns");
assert.equal(manifest.layout.rows, 31, "Expected 31 backing rows");
assert.deepEqual(manifest.layout.minGridCoordinate, [-8, -8]);
assert.equal(manifest.layout.buildableShape, "island-ellipse");
assert.deepEqual(manifest.layout.surfaceEllipseWorld, [0, 350, 900, 520]);
assert.deepEqual(
  manifest.layout.tileWorldSize,
  [94, 47],
  "Isometric tile must remain 94 × 47",
);

const [minGridX, minGridY] = manifest.layout.minGridCoordinate;
const [surfaceX, surfaceY, radiusX, radiusY] =
  manifest.layout.surfaceEllipseWorld;
const [tileWidth, tileHeight] = manifest.layout.tileWorldSize;
let buildableCells = 0;
for (let y = minGridY; y < minGridY + manifest.layout.rows; y += 1) {
  for (let x = minGridX; x < minGridX + manifest.layout.columns; x += 1) {
    const worldX = (x - y) * (tileWidth / 2);
    const worldY = (x + y) * (tileHeight / 2);
    const normalizedX = (worldX - surfaceX) / radiusX;
    const normalizedY = (worldY - surfaceY) / radiusY;
    if (normalizedX ** 2 + normalizedY ** 2 <= 1) buildableCells += 1;
  }
}
assert.equal(
  manifest.layout.cellCapacity,
  buildableCells,
  "cellCapacity must match the island surface mask",
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

console.log("✓ island-shaped garden layout validated");
console.log(`✓ ${buildableCells} buildable cells available`);
console.log(
  `✓ ${manifest.placeables.length} placeable PNG scale records validated`,
);
