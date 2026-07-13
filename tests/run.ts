const assert = {
  ok(value: unknown, message = "assertion failed"): void {
    if (!value) throw new Error(message);
  },
  equal(actual: unknown, expected: unknown, message = "values differ") {
    if (actual !== expected) {
      throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
    }
  },
  deepEqual(actual: unknown, expected: unknown, message = "values differ") {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);
    if (a !== b) throw new Error(`${message}: expected ${b}, got ${a}`);
  },
};
import { GARDEN_SPRITE_METRICS } from "../src/features/graceGarden/assets/assetMetrics";
import { FLOATING_ISLAND_WORLD_RECT } from "../src/features/graceGarden/assets/sceneMetrics";
import {
  clampCameraFrame,
  computeFocusCamera,
  computeOverviewCamera,
  getCenteredCamera,
} from "../src/features/graceGarden/engine/camera";
import {
  buildCellOccupantIndex,
  canPlaceObject,
  findFirstAvailablePlacement,
  isPlacementValidFromCellIndex,
} from "../src/features/graceGarden/engine/collision";
import {
  GARDEN_CELL_CAPACITY,
  GARDEN_COLUMNS,
  GARDEN_ROWS,
  getGardenBoardWorldBounds,
  isoToWorld,
  worldToIso,
} from "../src/features/graceGarden/engine/geometry";
import { getPlantGrowthStatus } from "../src/features/graceGarden/engine/growth";
import { repairOverlappingPlacements } from "../src/features/graceGarden/engine/placementRepair";
import {
  canRotateItem,
  findRotationPlacement,
  getNextRotation,
  getRotationPlacementCandidates,
  getSpriteMirrorScaleX,
} from "../src/features/graceGarden/engine/rotation";
import { GARDEN_CATALOG } from "../src/features/graceGarden/state/catalog";
import { migrateGardenSave } from "../src/features/graceGarden/state/migrations";
import { createSeedGarden } from "../src/features/graceGarden/state/seed";

function test(name: string, run: () => void): void {
  run();
  console.log(`✓ ${name}`);
}

test("isometric conversion round-trips", () => {
  const world = isoToWorld(3.25, 7.5);
  const grid = worldToIso(world.x, world.y);
  assert.ok(Math.abs(grid.x - 3.25) < 1e-9);
  assert.ok(Math.abs(grid.y - 7.5) < 1e-9);
});

test("collision rejects a cell occupied by the fixed fountain", () => {
  const garden = createSeedGarden("test", 1000);
  const result = canPlaceObject(garden.objects, {
    catalogId: "grace_lamp",
    gridX: 6,
    gridY: 6,
    rotation: 0,
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "occupied");
});

test("large garden layout exposes 16 × 16 buildable cells", () => {
  assert.equal(GARDEN_COLUMNS, 16);
  assert.equal(GARDEN_ROWS, 16);
  assert.equal(GARDEN_CELL_CAPACITY, 256);
  assert.deepEqual(getGardenBoardWorldBounds(), {
    x: -832,
    y: -26,
    width: 1664,
    height: 832,
  });
});

test("new island world mapping fits the 16 × 16 board", () => {
  const board = getGardenBoardWorldBounds();
  assert.ok(board.x >= FLOATING_ISLAND_WORLD_RECT.x);
  assert.ok(board.x + board.width <= FLOATING_ISLAND_WORLD_RECT.x + FLOATING_ISLAND_WORLD_RECT.width);
  assert.ok(board.y >= FLOATING_ISLAND_WORLD_RECT.y);
  assert.ok(board.y + board.height <= FLOATING_ISLAND_WORLD_RECT.y + FLOATING_ISLAND_WORLD_RECT.height);
});

test("overview camera fixes the island to the safe viewport", () => {
  const viewport = {
    width: 430,
    height: 820,
    insets: { top: 112, bottom: 96, horizontal: 14 },
  };
  const overview = computeOverviewCamera(viewport, FLOATING_ISLAND_WORLD_RECT);
  const moved = clampCameraFrame(
    { x: overview.x + 500, y: overview.y - 300, scale: overview.scale },
    viewport,
    FLOATING_ISLAND_WORLD_RECT,
    overview.scale,
  );
  assert.ok(Math.abs(moved.x - overview.x) < 1e-9);
  assert.ok(Math.abs(moved.y - overview.y) < 1e-9);
});

test("focus camera zooms while remaining bounded", () => {
  const viewport = {
    width: 430,
    height: 820,
    insets: { top: 112, bottom: 96, horizontal: 14 },
  };
  const overview = computeOverviewCamera(viewport, FLOATING_ISLAND_WORLD_RECT);
  const focus = computeFocusCamera(
    viewport,
    FLOATING_ISLAND_WORLD_RECT,
    isoToWorld(12, 11),
    overview.scale,
    2.2,
    100,
  );
  assert.ok(focus.scale > overview.scale * 1.5);
  assert.ok(focus.scale <= overview.scale * 3.15 + 1e-9);
});

test("zoomed camera allows bounded inspection pan", () => {
  const viewport = {
    width: 430,
    height: 820,
    insets: { top: 112, bottom: 96, horizontal: 14 },
  };
  const overview = computeOverviewCamera(viewport, FLOATING_ISLAND_WORLD_RECT);
  const scale = overview.scale * 2;
  const centered = getCenteredCamera(viewport, FLOATING_ISLAND_WORLD_RECT, scale);
  const panned = clampCameraFrame(
    { x: centered.x + 10_000, y: centered.y - 10_000, scale },
    viewport,
    FLOATING_ISLAND_WORLD_RECT,
    overview.scale,
  );
  assert.ok(panned.x > centered.x);
  assert.ok(panned.x < centered.x + 10_000);
  assert.ok(panned.y < centered.y);
  assert.ok(panned.y > centered.y - 10_000);
});

test("collision accepts final valid 2 × 2 origin", () => {
  const result = canPlaceObject([], {
    catalogId: "olive_tree",
    gridX: 14,
    gridY: 14,
    rotation: 0,
  });
  assert.equal(result.ok, true);
});

test("collision rejects expanded garden boundary overflow", () => {
  const result = canPlaceObject([], {
    catalogId: "olive_tree",
    gridX: 15,
    gridY: 15,
    rotation: 0,
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "out-of-bounds");
});

test("new items prefer a staging area instead of piling at centre", () => {
  const placement = findFirstAvailablePlacement([], "grace_lamp", 0, {
    x: 11,
    y: 11,
  });
  assert.deepEqual(placement, { x: 11, y: 11 });
});

test("drag preview uses the same collision rules as committed placement", () => {
  const garden = createSeedGarden("preview", 1000);
  const occupants = buildCellOccupantIndex(garden.objects);
  assert.equal(
    isPlacementValidFromCellIndex(6, 6, 1, 1, "new-lamp", occupants),
    false,
  );
  assert.equal(
    isPlacementValidFromCellIndex(6, 6, 4, 4, "quality-fountain", occupants),
    true,
  );
});

test("old saves repair real overlaps while preserving fixed landmarks", () => {
  const overlapping = [
    {
      id: "movable-bench",
      catalogId: "flower_bench",
      kind: "decoration" as const,
      gridX: 6,
      gridY: 6,
      rotation: 1 as const,
      createdAt: 1,
      updatedAt: 1,
    },
    {
      id: "fixed-fountain",
      catalogId: "grace_fountain",
      kind: "fountain" as const,
      gridX: 6,
      gridY: 6,
      rotation: 0 as const,
      locked: true,
      createdAt: 2,
      updatedAt: 2,
    },
    {
      id: "valid-lamp",
      catalogId: "grace_lamp",
      kind: "lamp" as const,
      gridX: 1,
      gridY: 1,
      rotation: 0 as const,
      createdAt: 3,
      updatedAt: 3,
    },
    {
      id: "overflow-well",
      catalogId: "flower_well",
      kind: "decoration" as const,
      gridX: 15,
      gridY: 15,
      rotation: 0 as const,
      createdAt: 4,
      updatedAt: 4,
    },
  ];
  const repaired = repairOverlappingPlacements(overlapping, 999);
  const fountain = repaired.objects.find((object) => object.id === "fixed-fountain");
  const bench = repaired.objects.find((object) => object.id === "movable-bench");
  const lamp = repaired.objects.find((object) => object.id === "valid-lamp");

  assert.deepEqual(repaired.objects.map((object) => object.id), overlapping.map((object) => object.id));
  assert.deepEqual([fountain?.gridX, fountain?.gridY], [6, 6]);
  assert.deepEqual([lamp?.gridX, lamp?.gridY], [1, 1]);
  assert.ok(repaired.movedObjectIds.includes("movable-bench"));
  assert.ok(repaired.movedObjectIds.includes("overflow-well"));
  assert.equal(bench?.rotation, 1);

  for (const object of repaired.objects) {
    const placement = canPlaceObject(
      repaired.objects,
      {
        catalogId: object.catalogId,
        gridX: object.gridX,
        gridY: object.gridY,
        rotation: object.rotation,
      },
      object.id,
    );
    assert.equal(placement.ok, true, `${object.id} still overlaps`);
  }
});

test("watering advances effective plant growth", () => {
  const item = GARDEN_CATALOG.flower_pink;
  const object = {
    id: "plant",
    catalogId: item.id,
    kind: "plant" as const,
    gridX: 0,
    gridY: 0,
    rotation: 0 as const,
    createdAt: 0,
    updatedAt: 0,
    plant: {
      plantedAt: 0,
      lastWateredAt: 10_000,
      wateredCount: 2,
      harvestCount: 0,
    },
  };
  const status = getPlantGrowthStatus(object, item, 35_000);
  assert.equal(status?.effectiveElapsedMs, 65_000);
  assert.equal(status?.stage, 2);
});

test("fixed landmark and upright assets do not expose rotation", () => {
  assert.equal(GARDEN_CATALOG.grace_fountain.draggable, false);
  assert.equal(canRotateItem(GARDEN_CATALOG.grace_lamp), false);
  assert.equal(canRotateItem(GARDEN_CATALOG.grace_fountain), false);
});

test("legacy bench uses two isometric directions", () => {
  const item = GARDEN_CATALOG.wooden_bench;
  assert.equal(canRotateItem(item), true);
  assert.equal(getNextRotation(item, 0), 1);
  assert.equal(getNextRotation(item, 1), 0);
});

test("bench rotation chooses a nearby reversible grid origin", () => {
  const item = GARDEN_CATALOG.wooden_bench;
  const forward = getRotationPlacementCandidates(
    { gridX: 4, gridY: 6, rotation: 0 },
    item,
    1,
  );
  assert.deepEqual(forward[0], { x: 5, y: 6 });
});

test("edge objects rotate into the nearest legal fallback position", () => {
  const fence = {
    id: "edge-fence",
    catalogId: "white_flower_fence",
    kind: "decoration" as const,
    gridX: 12,
    gridY: 15,
    rotation: 0 as const,
    createdAt: 1,
    updatedAt: 1,
  };
  const point = findRotationPlacement(
    [fence],
    fence,
    GARDEN_CATALOG.white_flower_fence,
    1,
  );
  assert.ok(point !== null);
  assert.equal(
    canPlaceObject([], {
      catalogId: fence.catalogId,
      gridX: point?.x ?? -1,
      gridY: point?.y ?? -1,
      rotation: 1,
    }).ok,
    true,
  );
});

test("invalid save safely migrates to seed data", () => {
  const garden = migrateGardenSave({ schemaVersion: 999 }, "safe-user", 1234);
  assert.equal(garden.userId, "safe-user");
  assert.equal(garden.updatedAt, 1234);
  assert.ok(garden.objects.some((object) => object.id === "quality-fountain"));
  assert.ok(!garden.objects.some((object) => object.kind === "avatar"));
});

test("migration sanitizes malformed fields without trusting stored userId", () => {
  const garden = migrateGardenSave(
    {
      schemaVersion: 1,
      gardenId: "",
      userId: "wrong-user",
      revision: -4,
      updatedAt: Number.NaN,
      coins: -99,
      inventory: { flower_pink: 2.9, bad: -5, text: "nope" },
      objects: [],
    },
    "correct-user",
    1234,
  );
  assert.equal(garden.userId, "correct-user");
  assert.equal(garden.gardenId, "garden-correct-user");
  assert.equal(garden.revision, 1);
  assert.equal(garden.updatedAt, 1234);
  assert.equal(garden.coins, 0);
  assert.equal(garden.inventory.flower_pink, 2);
  assert.equal(garden.inventory.bad, 0);
  assert.equal(garden.inventory.flower_bench, 3);
});

test("all commercial sprites use calibrated ground anchors", () => {
  for (const metrics of Object.values(GARDEN_SPRITE_METRICS)) {
    assert.ok(metrics.worldWidth >= 100);
    assert.ok(metrics.worldHeight >= 240);
    assert.ok(metrics.anchorX >= 0 && metrics.anchorX <= 1);
    assert.ok(metrics.anchorY >= 0.9 && metrics.anchorY <= 0.98);
    assert.ok(metrics.shadowWidth > 0 && metrics.shadowHeight > 0);
  }
  assert.equal(GARDEN_SPRITE_METRICS.grace_fountain.worldWidth, 420);
  assert.equal(GARDEN_SPRITE_METRICS.garden_bench.anchorY, 0.945);
});

test("directional PNG assets expose two mirrored isometric facings", () => {
  for (const item of [
    GARDEN_CATALOG.flower_bench,
    GARDEN_CATALOG.flower_well,
    GARDEN_CATALOG.flower_arch,
    GARDEN_CATALOG.flower_hammock,
    GARDEN_CATALOG.white_flower_fence,
    GARDEN_CATALOG.garden_cafe_set,
  ]) {
    assert.equal(canRotateItem(item), true);
    assert.equal(getNextRotation(item, 0), 1);
    assert.equal(getNextRotation(item, 1), 0);
  }
  assert.equal(getSpriteMirrorScaleX(0), 1);
  assert.equal(getSpriteMirrorScaleX(1), -1);
  assert.equal(getSpriteMirrorScaleX(2), 1);
  assert.equal(getSpriteMirrorScaleX(3), -1);
});

console.log("\nAll Grace Garden v2.0 quality-reset tests passed.");
