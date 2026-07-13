import { getCatalogItem } from "../state/catalog";
import type { GardenObject } from "../state/types";
import { getObjectAnchorWorld, getRotatedFootprint } from "./geometry";
import { sortGardenObjects } from "./sorting";

export interface HitTarget {
  id: string;
  gridX: number;
  gridY: number;
  anchorX: number;
  anchorY: number;
  hitWidth: number;
  hitHeight: number;
  draggable: boolean;
  footprintWidth: number;
  footprintHeight: number;
  blocksPlacement: boolean;
}

export function buildHitTargets(objects: readonly GardenObject[]): HitTarget[] {
  return sortGardenObjects(objects).flatMap((object) => {
    const item = getCatalogItem(object.catalogId);
    if (!item) {
      return [];
    }
    const anchor = getObjectAnchorWorld(object, item);
    const footprint = getRotatedFootprint(item.footprint, object.rotation);
    return [
      {
        id: object.id,
        gridX: object.gridX,
        gridY: object.gridY,
        anchorX: anchor.x,
        anchorY: anchor.y,
        hitWidth: item.hitWidth,
        hitHeight: item.hitHeight,
        draggable: item.draggable && !object.locked,
        footprintWidth: footprint.width,
        footprintHeight: footprint.height,
        blocksPlacement: item.blocksPlacement,
      },
    ];
  });
}

export function hitTestTargets(
  targets: readonly HitTarget[],
  worldX: number,
  worldY: number,
): HitTarget | null {
  "worklet";
  for (let index = targets.length - 1; index >= 0; index -= 1) {
    const target = targets[index];
    const left = target.anchorX - target.hitWidth / 2;
    const right = target.anchorX + target.hitWidth / 2;
    const top = target.anchorY - target.hitHeight;
    const bottom = target.anchorY + 18;
    if (
      worldX >= left &&
      worldX <= right &&
      worldY >= top &&
      worldY <= bottom
    ) {
      return target;
    }
  }
  return null;
}
