import { createSeedGarden, DEFAULT_STARTER_INVENTORY } from "./seed";
import {
  GARDEN_SCHEMA_VERSION,
  type GardenObject,
  type GardenObjectKind,
  type GardenRotation,
  type GardenSaveV1,
  type PlantRuntime,
} from "./types";

const GARDEN_OBJECT_KINDS = new Set<GardenObjectKind>([
  "plant",
  "tree",
  "bench",
  "fountain",
  "avatar",
  "lamp",
  "decoration",
]);

const GARDEN_ROTATIONS = new Set<GardenRotation>([0, 1, 2, 3]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function asNonNegativeInteger(value: unknown, fallback: number): number {
  return isFiniteNumber(value) ? Math.max(0, Math.floor(value)) : fallback;
}

function normalizePlantRuntime(
  value: unknown,
  fallbackPlantedAt: number,
): PlantRuntime {
  const raw = isRecord(value) ? value : {};
  return {
    plantedAt: isFiniteNumber(raw.plantedAt)
      ? raw.plantedAt
      : fallbackPlantedAt,
    lastWateredAt: isFiniteNumber(raw.lastWateredAt) ? raw.lastWateredAt : null,
    wateredCount: asNonNegativeInteger(raw.wateredCount, 0),
    harvestCount: asNonNegativeInteger(raw.harvestCount, 0),
  };
}

function normalizeGardenObject(
  value: unknown,
  now: number,
): GardenObject | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    typeof value.catalogId !== "string" ||
    value.catalogId.length === 0 ||
    typeof value.kind !== "string" ||
    !GARDEN_OBJECT_KINDS.has(value.kind as GardenObjectKind) ||
    !Number.isInteger(value.gridX) ||
    !Number.isInteger(value.gridY) ||
    !Number.isInteger(value.rotation) ||
    !GARDEN_ROTATIONS.has(value.rotation as GardenRotation)
  ) {
    return null;
  }

  const kind = value.kind as GardenObjectKind;
  const createdAt = isFiniteNumber(value.createdAt) ? value.createdAt : now;
  const updatedAt = isFiniteNumber(value.updatedAt)
    ? value.updatedAt
    : createdAt;

  return {
    id: value.id,
    catalogId: value.catalogId,
    kind,
    gridX: value.gridX as number,
    gridY: value.gridY as number,
    rotation: value.rotation as GardenRotation,
    createdAt,
    updatedAt,
    ...(typeof value.locked === "boolean" ? { locked: value.locked } : {}),
    ...(kind === "plant"
      ? { plant: normalizePlantRuntime(value.plant, createdAt) }
      : {}),
  };
}

function normalizeInventory(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([catalogId, count]) => {
      if (!isFiniteNumber(count)) {
        return [];
      }
      return [[catalogId, Math.max(0, Math.floor(count))] as const];
    }),
  );
}

export function migrateGardenSave(
  raw: unknown,
  userId: string,
  now = Date.now(),
): GardenSaveV1 {
  if (!isRecord(raw)) {
    return createSeedGarden(userId, now);
  }

  if (raw.schemaVersion !== GARDEN_SCHEMA_VERSION) {
    // Add v0 -> v1, v1 -> v2 migrations here when schema changes.
    return createSeedGarden(userId, now);
  }

  if (!Array.isArray(raw.objects)) {
    return createSeedGarden(userId, now);
  }

  const objects = raw.objects.flatMap((value) => {
    const object = normalizeGardenObject(value, now);
    return object ? [object] : [];
  });

  return {
    schemaVersion: GARDEN_SCHEMA_VERSION,
    placementLayoutVersion: asNonNegativeInteger(
      raw.placementLayoutVersion,
      0,
    ),
    gardenId:
      typeof raw.gardenId === "string" && raw.gardenId.length > 0
        ? raw.gardenId
        : `garden-${userId}`,
    // Never trust a persisted userId when loading a user-scoped storage key.
    userId,
    revision: Math.max(1, asNonNegativeInteger(raw.revision, 1)),
    updatedAt: isFiniteNumber(raw.updatedAt) ? raw.updatedAt : now,
    coins: asNonNegativeInteger(raw.coins, 0),
    objects,
    inventory: {
      ...DEFAULT_STARTER_INVENTORY,
      ...normalizeInventory(raw.inventory),
    },
  };
}
