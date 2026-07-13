import type { GardenObject, GardenSaveV1 } from "./types";
import { GARDEN_SCHEMA_VERSION } from "./types";

/**
 * v2.0 starts with a composed benchmark scene instead of dropping every new
 * object in a pile at the centre. Placeholder plant/avatar art is deliberately
 * excluded until matching 3D assets exist.
 */
export const DEFAULT_STARTER_INVENTORY: Record<string, number> = {
  flower_pink: 0,
  olive_tree: 0,
  wooden_bench: 0,
  flower_bench: 3,
  grace_lamp: 4,
  grace_fountain: 1,
  flower_arch: 2,
  flower_well: 2,
  flower_hammock: 2,
  flower_hammock_grounded: 0,
  white_flower_fence: 6,
  garden_cafe_set: 2,
};

function object(
  value: Omit<GardenObject, "createdAt" | "updatedAt">,
  now: number,
): GardenObject {
  return { ...value, createdAt: now, updatedAt: now };
}

export function createSeedGarden(
  userId: string,
  now = Date.now(),
): GardenSaveV1 {
  return {
    schemaVersion: GARDEN_SCHEMA_VERSION,
    gardenId: `garden-${userId}`,
    userId,
    revision: 1,
    updatedAt: now,
    coins: 50,
    inventory: { ...DEFAULT_STARTER_INVENTORY },
    objects: [
      object(
        {
          id: "quality-fountain",
          catalogId: "grace_fountain",
          kind: "fountain",
          gridX: 6,
          gridY: 6,
          rotation: 0,
          locked: true,
        },
        now,
      ),
      object(
        {
          id: "quality-arch",
          catalogId: "flower_arch",
          kind: "decoration",
          gridX: 2,
          gridY: 3,
          rotation: 0,
        },
        now,
      ),
      object(
        {
          id: "quality-well",
          catalogId: "flower_well",
          kind: "decoration",
          gridX: 11,
          gridY: 3,
          rotation: 0,
        },
        now,
      ),
      object(
        {
          id: "quality-bench",
          catalogId: "flower_bench",
          kind: "decoration",
          gridX: 3,
          gridY: 10,
          rotation: 0,
        },
        now,
      ),
      object(
        {
          id: "quality-lamp-left",
          catalogId: "grace_lamp",
          kind: "lamp",
          gridX: 2,
          gridY: 8,
          rotation: 0,
        },
        now,
      ),
      object(
        {
          id: "quality-lamp-right",
          catalogId: "grace_lamp",
          kind: "lamp",
          gridX: 12,
          gridY: 9,
          rotation: 0,
        },
        now,
      ),
    ],
  };
}
