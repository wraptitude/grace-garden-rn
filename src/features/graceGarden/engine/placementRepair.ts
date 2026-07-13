import { getCatalogItem } from "../state/catalog";
import type { GardenObject } from "../state/types";
import {
  canPlaceObject,
  findFirstAvailablePlacement,
} from "./collision";
import {
  GARDEN_COLUMNS,
  GARDEN_ROWS,
  getRotatedFootprint,
} from "./geometry";

export const CURRENT_PLACEMENT_LAYOUT_VERSION = 1;

const AIRY_CATALOG_IDS = new Set([
  "flower_bench",
  "grace_fountain",
  "flower_well",
  "flower_arch",
  "flower_hammock",
  "flower_hammock_grounded",
  "garden_cafe_set",
]);

export interface PlacementRepairResult {
  objects: GardenObject[];
  movedObjectIds: string[];
}

function visualClearanceCells(catalogId: string): number {
  // Fences and lamps are intentionally excluded: fences should join into a
  // continuous run and a lamp only occupies a narrow contact point.
  return AIRY_CATALOG_IDS.has(catalogId) ? 1 : 0;
}

function hasVisualClearance(
  placed: readonly GardenObject[],
  candidate: Pick<GardenObject, "catalogId" | "gridX" | "gridY" | "rotation">,
): boolean {
  const item = getCatalogItem(candidate.catalogId);
  if (!item?.blocksPlacement) return true;

  const footprint = getRotatedFootprint(item.footprint, candidate.rotation);
  const left = candidate.gridX;
  const top = candidate.gridY;
  const right = left + footprint.width;
  const bottom = top + footprint.height;

  return placed.every((other) => {
    const otherItem = getCatalogItem(other.catalogId);
    if (!otherItem?.blocksPlacement) return true;

    const gap = Math.max(
      visualClearanceCells(candidate.catalogId),
      visualClearanceCells(other.catalogId),
    );
    if (gap === 0) return true;

    const otherFootprint = getRotatedFootprint(
      otherItem.footprint,
      other.rotation,
    );
    const otherRight = other.gridX + otherFootprint.width;
    const otherBottom = other.gridY + otherFootprint.height;
    return (
      right + gap <= other.gridX ||
      otherRight + gap <= left ||
      bottom + gap <= other.gridY ||
      otherBottom + gap <= top
    );
  });
}

function findAiryPlacement(
  placed: readonly GardenObject[],
  object: GardenObject,
): { x: number; y: number } | null {
  const candidates: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < GARDEN_ROWS; y += 1) {
    for (let x = 0; x < GARDEN_COLUMNS; x += 1) {
      candidates.push({ x, y });
    }
  }
  candidates.sort((a, b) => {
    const distanceA =
      Math.abs(a.x - object.gridX) + Math.abs(a.y - object.gridY);
    const distanceB =
      Math.abs(b.x - object.gridX) + Math.abs(b.y - object.gridY);
    return distanceA - distanceB || a.y - b.y || a.x - b.x;
  });

  return (
    candidates.find((point) => {
      const candidate = {
        catalogId: object.catalogId,
        gridX: point.x,
        gridY: point.y,
        rotation: object.rotation,
      };
      return (
        canPlaceObject(placed, candidate).ok &&
        hasVisualClearance(placed, candidate)
      );
    }) ?? null
  );
}

/**
 * Repairs footprint collisions, out-of-bounds positions, and dense legacy
 * arrangements that make large PNGs visually overlap. Fixed landmarks are
 * reserved first; ids, catalog ids, rotation and runtime data are preserved.
 */
export function repairOverlappingPlacements(
  objects: readonly GardenObject[],
  now = Date.now(),
): PlacementRepairResult {
  const prioritized = objects
    .map((object, index) => ({ object, index }))
    .sort((a, b) => {
      const aItem = getCatalogItem(a.object.catalogId);
      const bItem = getCatalogItem(b.object.catalogId);
      const aFixed = Boolean(a.object.locked || (aItem && !aItem.draggable));
      const bFixed = Boolean(b.object.locked || (bItem && !bItem.draggable));
      return Number(bFixed) - Number(aFixed) || a.index - b.index;
    });

  const placed: GardenObject[] = [];
  const resolvedById = new Map<string, GardenObject>();
  const movedObjectIds: string[] = [];

  for (const { object } of prioritized) {
    const item = getCatalogItem(object.catalogId);
    if (!item) {
      placed.push(object);
      resolvedById.set(object.id, object);
      continue;
    }

    const currentPlacement = canPlaceObject(placed, {
      catalogId: object.catalogId,
      gridX: object.gridX,
      gridY: object.gridY,
      rotation: object.rotation,
    });

    if (currentPlacement.ok && hasVisualClearance(placed, object)) {
      placed.push(object);
      resolvedById.set(object.id, object);
      continue;
    }

    const replacement =
      findAiryPlacement(placed, object) ??
      findFirstAvailablePlacement(
        placed,
        object.catalogId,
        object.rotation,
        { x: object.gridX, y: object.gridY },
      );
    const repaired = replacement
      ? {
          ...object,
          gridX: replacement.x,
          gridY: replacement.y,
          updatedAt: now,
        }
      : object;

    if (
      repaired.gridX !== object.gridX ||
      repaired.gridY !== object.gridY
    ) {
      movedObjectIds.push(object.id);
    }
    placed.push(repaired);
    resolvedById.set(object.id, repaired);
  }

  return {
    objects: objects.map((object) => resolvedById.get(object.id) ?? object),
    movedObjectIds,
  };
}
