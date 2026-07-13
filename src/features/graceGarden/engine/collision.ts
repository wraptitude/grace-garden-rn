import { getCatalogItem } from "../state/catalog";
import type {
  GardenCatalogItem,
  GardenObject,
  GardenRotation,
  GridPoint,
  PlacementCheck,
} from "../state/types";
import { GARDEN_COLUMNS, GARDEN_ROWS, getRotatedFootprint } from "./geometry";

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
  if (
    candidate.gridX < 0 ||
    candidate.gridY < 0 ||
    candidate.gridX + footprint.width > GARDEN_COLUMNS ||
    candidate.gridY + footprint.height > GARDEN_ROWS
  ) {
    return { ok: false, reason: "out-of-bounds" };
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

  for (let y = 0; y < GARDEN_ROWS; y += 1) {
    for (let x = 0; x < GARDEN_COLUMNS; x += 1) {
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
        if (
          cellX >= 0 &&
          cellY >= 0 &&
          cellX < GARDEN_COLUMNS &&
          cellY < GARDEN_ROWS
        ) {
          result[cellY * GARDEN_COLUMNS + cellX] = object.id;
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
  if (
    gridX < 0 ||
    gridY < 0 ||
    gridX + footprintWidth > GARDEN_COLUMNS ||
    gridY + footprintHeight > GARDEN_ROWS
  ) {
    return false;
  }
  for (let x = 0; x < footprintWidth; x += 1) {
    for (let y = 0; y < footprintHeight; y += 1) {
      const occupant = occupants[(gridY + y) * GARDEN_COLUMNS + gridX + x];
      if (occupant && occupant !== activeObjectId) return false;
    }
  }
  return true;
}
