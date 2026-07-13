import type {
  Footprint,
  GardenCatalogItem,
  GardenObject,
  GardenRotation,
  GridPoint,
} from "../state/types";

export const TILE_WIDTH = 94;
export const TILE_HEIGHT = 47;

/**
 * The island top is an ellipse, not an isometric diamond. A larger backing
 * range plus a surface mask adds real buildable cells to the left/right wings
 * without moving any coordinates from existing saves.
 */
export const GARDEN_MIN_GRID_X = -8;
export const GARDEN_MIN_GRID_Y = -8;
export const GARDEN_COLUMNS = 31;
export const GARDEN_ROWS = 31;
export const GARDEN_MAX_GRID_X = GARDEN_MIN_GRID_X + GARDEN_COLUMNS;
export const GARDEN_MAX_GRID_Y = GARDEN_MIN_GRID_Y + GARDEN_ROWS;

export const GARDEN_SURFACE_CENTER_WORLD_X = 0;
export const GARDEN_SURFACE_CENTER_WORLD_Y = 350;
export const GARDEN_SURFACE_RADIUS_WORLD_X = 900;
export const GARDEN_SURFACE_RADIUS_WORLD_Y = 520;

/**
 * The larger island needs a lower fit scale on narrow phones so the complete
 * silhouette can still be shown by Reset Camera.
 */
export const MIN_CAMERA_SCALE = 0.12;
export const MAX_CAMERA_SCALE = 1.2;

export interface WorldPoint {
  x: number;
  y: number;
}

export interface WorldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clamp(value: number, min: number, max: number): number {
  "worklet";
  return Math.min(max, Math.max(min, value));
}

export function isoToWorld(gridX: number, gridY: number): WorldPoint {
  "worklet";
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}

/** True when a grid cell belongs to the usable grass surface. */
export function isBuildableGardenCell(gridX: number, gridY: number): boolean {
  "worklet";
  if (
    gridX < GARDEN_MIN_GRID_X ||
    gridY < GARDEN_MIN_GRID_Y ||
    gridX >= GARDEN_MAX_GRID_X ||
    gridY >= GARDEN_MAX_GRID_Y
  ) {
    return false;
  }

  const world = isoToWorld(gridX, gridY);
  const normalizedX =
    (world.x - GARDEN_SURFACE_CENTER_WORLD_X) /
    GARDEN_SURFACE_RADIUS_WORLD_X;
  const normalizedY =
    (world.y - GARDEN_SURFACE_CENTER_WORLD_Y) /
    GARDEN_SURFACE_RADIUS_WORLD_Y;
  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

/** Worklet-safe index into the rectangular backing array. */
export function getGardenCellIndex(gridX: number, gridY: number): number {
  "worklet";
  return (
    (gridY - GARDEN_MIN_GRID_Y) * GARDEN_COLUMNS +
    gridX -
    GARDEN_MIN_GRID_X
  );
}

export const GARDEN_CELL_CAPACITY = (() => {
  let capacity = 0;
  for (let y = GARDEN_MIN_GRID_Y; y < GARDEN_MAX_GRID_Y; y += 1) {
    for (let x = GARDEN_MIN_GRID_X; x < GARDEN_MAX_GRID_X; x += 1) {
      if (isBuildableGardenCell(x, y)) capacity += 1;
    }
  }
  return capacity;
})();

export function worldToIso(worldX: number, worldY: number): GridPoint {
  "worklet";
  return {
    x: worldX / TILE_WIDTH + worldY / TILE_HEIGHT,
    y: worldY / TILE_HEIGHT - worldX / TILE_WIDTH,
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  cameraX: number,
  cameraY: number,
  cameraScale: number,
): WorldPoint {
  "worklet";
  return {
    x: (screenX - cameraX) / cameraScale,
    y: (screenY - cameraY) / cameraScale,
  };
}

export function worldDeltaToGridDelta(
  worldX: number,
  worldY: number,
): GridPoint {
  "worklet";
  return worldToIso(worldX, worldY);
}

export function snapGrid(value: number): number {
  "worklet";
  return Math.round(value);
}

/** Returns the bounds of the island-shaped buildable cell mask. */
export function getGardenBoardWorldBounds(): WorldRect {
  const centers: WorldPoint[] = [];
  for (let y = GARDEN_MIN_GRID_Y; y < GARDEN_MAX_GRID_Y; y += 1) {
    for (let x = GARDEN_MIN_GRID_X; x < GARDEN_MAX_GRID_X; x += 1) {
      if (isBuildableGardenCell(x, y)) centers.push(isoToWorld(x, y));
    }
  }
  const minCenterX = Math.min(...centers.map((point) => point.x));
  const maxCenterX = Math.max(...centers.map((point) => point.x));
  const minCenterY = Math.min(...centers.map((point) => point.y));
  const maxCenterY = Math.max(...centers.map((point) => point.y));

  return {
    x: minCenterX - TILE_WIDTH / 2,
    y: minCenterY - TILE_HEIGHT / 2,
    width: maxCenterX - minCenterX + TILE_WIDTH,
    height: maxCenterY - minCenterY + TILE_HEIGHT,
  };
}

export function getRotatedFootprint(
  footprint: Footprint,
  rotation: GardenRotation,
): Footprint {
  return rotation % 2 === 0
    ? footprint
    : { width: footprint.height, height: footprint.width };
}

export function getObjectAnchorGrid(
  object: Pick<GardenObject, "gridX" | "gridY" | "rotation">,
  item: GardenCatalogItem,
): GridPoint {
  const footprint = getRotatedFootprint(item.footprint, object.rotation);
  return {
    x: object.gridX + (footprint.width - 1) / 2,
    y: object.gridY + (footprint.height - 1) / 2,
  };
}

export function getObjectAnchorWorld(
  object: Pick<GardenObject, "gridX" | "gridY" | "rotation">,
  item: GardenCatalogItem,
): WorldPoint {
  const anchor = getObjectAnchorGrid(object, item);
  return isoToWorld(anchor.x, anchor.y);
}


/** Returns the four world-space corners of an occupied footprint rectangle. */
export function getFootprintWorldPolygon(
  object: Pick<GardenObject, "gridX" | "gridY" | "rotation">,
  item: GardenCatalogItem,
): readonly [WorldPoint, WorldPoint, WorldPoint, WorldPoint] {
  const footprint = getRotatedFootprint(item.footprint, object.rotation);
  const left = object.gridX - 0.5;
  const top = object.gridY - 0.5;
  const right = object.gridX + footprint.width - 0.5;
  const bottom = object.gridY + footprint.height - 0.5;
  return [
    isoToWorld(left, top),
    isoToWorld(right, top),
    isoToWorld(right, bottom),
    isoToWorld(left, bottom),
  ];
}
