import { GARDEN_SPRITE_METRICS } from "../assets/assetMetrics";
import { getCatalogItem } from "../state/catalog";
import type { GardenObject } from "../state/types";
import { getObjectAnchorGrid } from "./geometry";

export function getObjectDepth(object: GardenObject): number {
  const item = getCatalogItem(object.catalogId);
  if (!item) return object.gridX + object.gridY;
  const anchor = getObjectAnchorGrid(object, item);
  const kindOffset = object.kind === "avatar" ? 0.15 : 0;
  const spriteBias = item.spriteId
    ? ((GARDEN_SPRITE_METRICS as Record<string, { depthBias: number }>)[
        item.spriteId
      ]?.depthBias ?? 0)
    : 0;
  return anchor.x + anchor.y + kindOffset + spriteBias;
}

export function sortGardenObjects(
  objects: readonly GardenObject[],
): GardenObject[] {
  return [...objects].sort((a, b) => {
    const depthDifference = getObjectDepth(a) - getObjectDepth(b);
    return depthDifference !== 0 ? depthDifference : a.id.localeCompare(b.id);
  });
}
