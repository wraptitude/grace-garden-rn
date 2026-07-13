import {
  GARDEN_SPRITE_METRICS,
  type GardenSpriteId,
  type GardenSpriteMetrics,
} from "./assetMetrics";

export interface GardenSpriteAsset extends GardenSpriteMetrics {
  id: GardenSpriteId;
  source: number;
  thumbnailSource: number;
}

export interface GardenSceneImageAsset {
  source: number;
}

export const GARDEN_SCENE_ASSETS = {
  skyDay: { source: require("./backgrounds/sky/sky_day_gradient.png") },
  cloudBackLarge: { source: require("./effects/clouds/cloud_back_large.png") },
  cloudMidMedium: { source: require("./effects/clouds/cloud_mid_medium.png") },
  cloudFrontWide: { source: require("./effects/clouds/cloud_front_wide.png") },
  floatingIsland: {
    source: require("./terrain/islands/floating_island_base.png"),
  },
  floatingIslandFront: {
    source: require("./terrain/islands/floating_island_front.png"),
  },
  floatingIslandShadow: {
    source: require("./terrain/islands/floating_island_shadow.png"),
  },
} as const satisfies Record<string, GardenSceneImageAsset>;

export { FLOATING_ISLAND_WORLD_RECT } from "./sceneMetrics";

const SOURCES: Record<
  GardenSpriteId,
  Pick<GardenSpriteAsset, "source" | "thumbnailSource">
> = {
  garden_bench: {
    source: require("./decorations/seating/garden_bench.png"),
    thumbnailSource: require("./thumbnails/garden_bench.png"),
  },
  garden_lamp: {
    source: require("./decorations/lighting/garden_lamp.png"),
    thumbnailSource: require("./thumbnails/garden_lamp.png"),
  },
  garden_well: {
    source: require("./decorations/water/garden_well.png"),
    thumbnailSource: require("./thumbnails/garden_well.png"),
  },
  garden_arch: {
    source: require("./decorations/structures/garden_arch.png"),
    thumbnailSource: require("./thumbnails/garden_arch.png"),
  },
  garden_hammock: {
    source: require("./decorations/seating/garden_hammock.png"),
    thumbnailSource: require("./thumbnails/garden_hammock.png"),
  },
  garden_fence: {
    source: require("./decorations/boundaries/garden_fence.png"),
    thumbnailSource: require("./thumbnails/garden_fence.png"),
  },
  garden_patio_set: {
    source: require("./decorations/dining/garden_patio_set.png"),
    thumbnailSource: require("./thumbnails/garden_patio_set.png"),
  },
  grace_fountain: {
    source: require("./decorations/water/grace_fountain.png"),
    thumbnailSource: require("./thumbnails/grace_fountain.png"),
  },
};

export const GARDEN_SPRITE_ASSETS = Object.fromEntries(
  (Object.keys(GARDEN_SPRITE_METRICS) as GardenSpriteId[]).map((id) => [
    id,
    {
      id,
      ...GARDEN_SPRITE_METRICS[id],
      ...SOURCES[id],
    },
  ]),
) as Record<GardenSpriteId, GardenSpriteAsset>;

export { type GardenSpriteId } from "./assetMetrics";

export function getGardenSpriteAsset(
  spriteId: string | undefined,
): GardenSpriteAsset | null {
  if (!spriteId) return null;
  return (
    (GARDEN_SPRITE_ASSETS as Record<string, GardenSpriteAsset>)[spriteId] ??
    null
  );
}
