import { getCatalogItem } from "../state/catalog";
import type {
  GardenCatalogItem,
  GardenObject,
  GardenRotation,
  GridPoint,
  PlacementCheck,
} from "../state/types";
import {
  GARDEN_COLUMNS,
  GARDEN_MAX_GRID_X,
  GARDEN_MAX_GRID_Y,
  GARDEN_MIN_GRID_X,
  GARDEN_MIN_GRID_Y,
  GARDEN_ROWS,
  getGardenCellIndex,
  getRotatedFootprint,
  isBuildableGardenCell,
} from "./geometry";

interface PlacementCandidate {
  catalogId: string;
  gridX: number;
  gridY: number;
  rotation: GardenRotation;
}

function occupiedCellKeys(
  candidate: PlacementCandidate,
  item: GardenCatalogItem,
): string[] {
  const footprint = getRotatedFootprint(item.footprint, candidate.rotation);
  const keys: string[] = [];
  for (let x = 0; x < footprint.width; x += 1) {
    for (let y = 0; y < footprint.height; y += 1) {
      keys.push(`${candidate.gridX + x}:${candidate.gridY + y}`);
    }
  }
  return keys;
}

export function canPlaceObject(
  objects: readonly GardenObject[],
  candidate: PlacementCandidate,
  exceptObjectId?: string,
): PlacementCheck {
  const item = getCatalogItem(candidate.catalogId);
  if (!item) {
    return { ok: false, reason: "unknown-catalog-item" };
  }

  const footprint = getRotatedFootprint(item.footprint, candidate.rotation);
  for (let x = 0; x < footprint.width; x += 1) {
    for (let y = 0; y < footprint.height; y += 1) {
      if (!isBuildableGardenCell(candidate.gridX + x, candidate.gridY + y)) {
        return { ok: false, reason: "out-of-bounds" };
      }
    }
  }

  if (!item.blocksPlacement) {
    return { ok: true };
  }

  const candidateCells = new Set(occupiedCellKeys(candidate, item));
  for (const object of objects) {
    if (object.id === exceptObjectId) {
      continue;
    }
    const otherItem = getCatalogItem(object.catalogId);
    if (!otherItem?.blocksPlacement) {
      continue;
    }
    const otherCells = occupiedCellKeys(object, otherItem);
    if (otherCells.some((key) => candidateCells.has(key))) {
      return { ok: false, reason: "occupied" };
    }
  }

  return { ok: true };
}

export function findFirstAvailablePlacement(
  objects: readonly GardenObject[],
  catalogId: string,
  rotation: GardenRotation = 0,
  preferred: GridPoint = { x: 11, y: 11 },
): GridPoint | null {
  const candidates: GridPoint[] = [];
  const centerX = preferred.x;
  const centerY = preferred.y;

  for (let y = GARDEN_MIN_GRID_Y; y < GARDEN_MAX_GRID_Y; y += 1) {
    for (let x = GARDEN_MIN_GRID_X; x < GARDEN_MAX_GRID_X; x += 1) {
      if (!isBuildableGardenCell(x, y)) continue;
      candidates.push({ x, y });
    }
  }

  candidates.sort((a, b) => {
    const distanceA = Math.abs(a.x - centerX) + Math.abs(a.y - centerY);
    const distanceB = Math.abs(b.x - centerX) + Math.abs(b.y - centerY);
    return distanceA - distanceB;
  });

  return (
    candidates.find(
      (point) =>
        canPlaceObject(objects, {
          catalogId,
          gridX: point.x,
          gridY: point.y,
          rotation,
        }).ok,
    ) ?? null
  );
}


/** Returns one blocking object id per buildable cell for UI-thread previews. */
export function buildCellOccupantIndex(
  objects: readonly GardenObject[],
): string[] {
  const result = Array.from({ length: GARDEN_COLUMNS * GARDEN_ROWS }, () => "");
  for (const object of objects) {
    const item = getCatalogItem(object.catalogId);
    if (!item?.blocksPlacement) continue;
    const footprint = getRotatedFootprint(item.footprint, object.rotation);
    for (let x = 0; x < footprint.width; x += 1) {
      for (let y = 0; y < footprint.height; y += 1) {
        const cellX = object.gridX + x;
        const cellY = object.gridY + y;
        if (isBuildableGardenCell(cellX, cellY)) {
          result[getGardenCellIndex(cellX, cellY)] = object.id;
        }
      }
    }
  }
  return result;
}

/** Worklet-safe placement validation used while an object is being dragged. */
export function isPlacementValidFromCellIndex(
  gridX: number,
  gridY: number,
  footprintWidth: number,
  footprintHeight: number,
  activeObjectId: string,
  occupants: readonly string[],
): boolean {
  "worklet";
  for (let x = 0; x < footprintWidth; x += 1) {
    for (let y = 0; y < footprintHeight; y += 1) {
      const cellX = gridX + x;
      const cellY = gridY + y;
      if (!isBuildableGardenCell(cellX, cellY)) return false;
      const occupant = occupants[getGardenCellIndex(cellX, cellY)];
      if (occupant && occupant !== activeObjectId) return false;
    }
  }
  return true;
}
