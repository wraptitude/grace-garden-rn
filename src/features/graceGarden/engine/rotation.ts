import type {
  GardenCatalogItem,
  GardenObject,
  GardenRotation,
  GridPoint,
} from "../state/types";
import {
  getObjectAnchorGrid,
  getRotatedFootprint,
  isoToWorld,
} from "./geometry";
import { canPlaceObject, findFirstAvailablePlacement } from "./collision";

export function canRotateItem(item: GardenCatalogItem): boolean {
  return item.rotationMode !== "none";
}

export function normalizeRotationForItem(
  item: GardenCatalogItem,
  rotation: GardenRotation,
): GardenRotation {
  if (item.rotationMode === "none") {
    return 0;
  }
  if (item.rotationMode === "two-way") {
    return (rotation % 2) as GardenRotation;
  }
  return rotation;
}

export function getNextRotation(
  item: GardenCatalogItem,
  rotation: GardenRotation,
): GardenRotation {
  const normalized = normalizeRotationForItem(item, rotation);
  if (item.rotationMode === "none") {
    return 0;
  }
  if (item.rotationMode === "two-way") {
    return ((normalized + 1) % 2) as GardenRotation;
  }
  return ((normalized + 1) % 4) as GardenRotation;
}

/** A horizontal mirror represents the second isometric facing of one PNG. */
export function getSpriteMirrorScaleX(rotation: GardenRotation): 1 | -1 {
  return rotation % 2 === 0 ? 1 : -1;
}

/**
 * Finds nearby integer grid origins for the rotated footprint, ordered by how
 * little the object's visual centre would move on screen.
 *
 * Even-by-odd footprints (for example a 2x1 bench) cannot keep their exact
 * centre on an integer tile grid after a 90° turn. The nearest alternatives
 * move by half a tile vertically instead of jumping a full tile sideways.
 */
export function getRotationPlacementCandidates(
  object: Pick<GardenObject, "gridX" | "gridY" | "rotation">,
  item: GardenCatalogItem,
  nextRotation: GardenRotation,
): GridPoint[] {
  const oldAnchor = getObjectAnchorGrid(object, item);
  const nextFootprint = getRotatedFootprint(item.footprint, nextRotation);
  const desiredGridX = oldAnchor.x - (nextFootprint.width - 1) / 2;
  const desiredGridY = oldAnchor.y - (nextFootprint.height - 1) / 2;

  const xValues = Array.from(
    new Set([Math.floor(desiredGridX), Math.ceil(desiredGridX)]),
  );
  const yValues = Array.from(
    new Set([Math.floor(desiredGridY), Math.ceil(desiredGridY)]),
  );
  const oldWorld = isoToWorld(oldAnchor.x, oldAnchor.y);

  return xValues
    .flatMap((gridX) => yValues.map((gridY) => ({ x: gridX, y: gridY })))
    .sort((a, b) => {
      const aAnchor = {
        x: a.x + (nextFootprint.width - 1) / 2,
        y: a.y + (nextFootprint.height - 1) / 2,
      };
      const bAnchor = {
        x: b.x + (nextFootprint.width - 1) / 2,
        y: b.y + (nextFootprint.height - 1) / 2,
      };
      const aWorld = isoToWorld(aAnchor.x, aAnchor.y);
      const bWorld = isoToWorld(bAnchor.x, bAnchor.y);
      const aDistance =
        (aWorld.x - oldWorld.x) ** 2 + (aWorld.y - oldWorld.y) ** 2;
      const bDistance =
        (bWorld.x - oldWorld.x) ** 2 + (bWorld.y - oldWorld.y) ** 2;
      if (aDistance !== bDistance) {
        return aDistance - bDistance;
      }

      // Prefer preserving the same row, which makes a 2x1 <-> 1x2 turn
      // reversible and visually behaves like rotating around a shared tile.
      const aDeltaY = Math.abs(a.y - object.gridY);
      const bDeltaY = Math.abs(b.y - object.gridY);
      if (aDeltaY !== bDeltaY) {
        return aDeltaY - bDeltaY;
      }
      const aDeltaX = Math.abs(a.x - object.gridX);
      const bDeltaX = Math.abs(b.x - object.gridX);
      if (aDeltaX !== bDeltaX) {
        return aDeltaX - bDeltaX;
      }
      return a.y - b.y || a.x - b.x;
    });
}

/**
 * Keeps the visual centre when possible, then falls back to the nearest legal
 * origin. This prevents a rotatable object near an edge or a busy area from
 * getting stuck merely because the four centre-preserving cells are blocked.
 */
export function findRotationPlacement(
  objects: readonly GardenObject[],
  object: GardenObject,
  item: GardenCatalogItem,
  nextRotation: GardenRotation,
): GridPoint | null {
  const otherObjects = objects.filter((value) => value.id !== object.id);
  const centred = getRotationPlacementCandidates(
    object,
    item,
    nextRotation,
  ).find((point) =>
    canPlaceObject(otherObjects, {
      catalogId: object.catalogId,
      gridX: point.x,
      gridY: point.y,
      rotation: nextRotation,
    }).ok,
  );
  return (
    centred ??
    findFirstAvailablePlacement(
      otherObjects,
      object.catalogId,
      nextRotation,
      { x: object.gridX, y: object.gridY },
    )
  );
}
