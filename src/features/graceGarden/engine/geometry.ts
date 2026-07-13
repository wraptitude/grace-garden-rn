import type {
  Footprint,
  GardenCatalogItem,
  GardenObject,
  GardenRotation,
  GridPoint,
} from "../state/types";

export const TILE_WIDTH = 104;
export const TILE_HEIGHT = 52;

/**
 * v2.0 keeps a 16 × 16 buildable garden while rebuilding the visual camera and scene composition.
 * Existing saves keep the same gridX/gridY coordinates and remain valid.
 */
export const GARDEN_COLUMNS = 16;
export const GARDEN_ROWS = 16;
export const GARDEN_CELL_CAPACITY = GARDEN_COLUMNS * GARDEN_ROWS;

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

/** Returns the full diamond bounds of the current buildable board. */
export function getGardenBoardWorldBounds(): WorldRect {
  const centers = [
    isoToWorld(0, 0),
    isoToWorld(GARDEN_COLUMNS - 1, 0),
    isoToWorld(0, GARDEN_ROWS - 1),
    isoToWorld(GARDEN_COLUMNS - 1, GARDEN_ROWS - 1),
  ];
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
