import { useImage } from "@shopify/react-native-skia";
import {
  GARDEN_SCENE_ASSETS,
  GARDEN_SPRITE_ASSETS,
} from "../assets/assetRegistry";

/**
 * Warms Skia's image cache before the garden is revealed. Local `require()`
 * assets usually resolve quickly, but gating the first frame prevents the
 * temporary vector fallbacks / empty island flash seen in prototype builds.
 */
export function useGardenAssetsReady(): {
  ready: boolean;
  loaded: number;
  total: number;
} {
  const sky = useImage(GARDEN_SCENE_ASSETS.skyDay.source);
  const cloudBack = useImage(GARDEN_SCENE_ASSETS.cloudBackLarge.source);
  const cloudMid = useImage(GARDEN_SCENE_ASSETS.cloudMidMedium.source);
  const cloudFront = useImage(GARDEN_SCENE_ASSETS.cloudFrontWide.source);
  const island = useImage(GARDEN_SCENE_ASSETS.floatingIsland.source);
  const islandShadow = useImage(
    GARDEN_SCENE_ASSETS.floatingIslandShadow.source,
  );
  const islandFront = useImage(GARDEN_SCENE_ASSETS.floatingIslandFront.source);

  const bench = useImage(GARDEN_SPRITE_ASSETS.garden_bench.source);
  const lamp = useImage(GARDEN_SPRITE_ASSETS.garden_lamp.source);
  const well = useImage(GARDEN_SPRITE_ASSETS.garden_well.source);
  const arch = useImage(GARDEN_SPRITE_ASSETS.garden_arch.source);
  const hammock = useImage(GARDEN_SPRITE_ASSETS.garden_hammock.source);
  const fence = useImage(GARDEN_SPRITE_ASSETS.garden_fence.source);
  const patio = useImage(GARDEN_SPRITE_ASSETS.garden_patio_set.source);
  const fountain = useImage(GARDEN_SPRITE_ASSETS.grace_fountain.source);

  const images = [
    sky,
    cloudBack,
    cloudMid,
    cloudFront,
    island,
    islandShadow,
    islandFront,
    bench,
    lamp,
    well,
    arch,
    hammock,
    fence,
    patio,
    fountain,
  ];
  const loaded = images.reduce((count, image) => count + (image ? 1 : 0), 0);
  return { ready: loaded === images.length, loaded, total: images.length };
}
