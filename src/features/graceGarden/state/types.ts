export const GARDEN_SCHEMA_VERSION = 1 as const;

export type GardenObjectKind =
  "plant" | "tree" | "bench" | "fountain" | "avatar" | "lamp" | "decoration";

export type GardenRotation = 0 | 1 | 2 | 3;

/**
 * Controls how an object may change direction on an isometric garden grid.
 *
 * - none: upright, rotationally-symmetric, or artwork only has one direction.
 * - two-way: two grid-axis directions (0/2 and 1/3 share the same artwork).
 * - four-way: reserved for future objects with four directional art variants.
 */
export type GardenRotationMode = "none" | "two-way" | "four-way";

export interface GridPoint {
  x: number;
  y: number;
}

export interface Footprint {
  width: number;
  height: number;
}

export interface PlantRuntime {
  plantedAt: number;
  lastWateredAt: number | null;
  wateredCount: number;
  harvestCount: number;
}

export interface GardenObject {
  id: string;
  catalogId: string;
  kind: GardenObjectKind;
  gridX: number;
  gridY: number;
  rotation: GardenRotation;
  createdAt: number;
  updatedAt: number;
  locked?: boolean;
  plant?: PlantRuntime;
}

export interface GrowthDefinition {
  /** Milliseconds elapsed (including water boosts) required for each stage. */
  stageThresholdsMs: readonly number[];
  waterBoostMs: number;
  harvestReward: number;
}

export interface GardenCatalogItem {
  id: string;
  name: string;
  kind: GardenObjectKind;
  footprint: Footprint;
  hitWidth: number;
  hitHeight: number;
  blocksPlacement: boolean;
  draggable: boolean;
  rotationMode: GardenRotationMode;
  renderVariant: string;
  /** Optional static PNG sprite registered in assets/assetRegistry.ts. */
  spriteId?: string;
  growth?: GrowthDefinition;
}

export interface GardenSaveV1 {
  schemaVersion: typeof GARDEN_SCHEMA_VERSION;
  /**
   * Internal, backwards-compatible layout polish revision. This deliberately
   * does not change the MMKV schema version or any object identity fields.
   */
  placementLayoutVersion?: number;
  gardenId: string;
  userId: string;
  revision: number;
  updatedAt: number;
  coins: number;
  objects: GardenObject[];
  inventory: Record<string, number>;
}

export type GardenSave = GardenSaveV1;

export interface PlacementCheck {
  ok: boolean;
  reason?: "out-of-bounds" | "occupied" | "unknown-catalog-item";
}
