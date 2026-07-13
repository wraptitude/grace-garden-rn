export interface SpritePolishMetadata {
  displayScale: number;
  anchorX: number;
  anchorY: number;
  groundOffsetY: number;
  shadowOffsetY: number;
}

export interface SpriteLayoutInput extends SpritePolishMetadata {
  worldWidth: number;
  worldHeight: number;
  anchorX: number;
  anchorY: number;
  shadowWidth: number;
  shadowHeight: number;
}

export interface SpriteDisplayLayout {
  width: number;
  height: number;
  imageX: number;
  imageY: number;
  shadowX: number;
  shadowY: number;
}

export const GARDEN_SPRITE_POLISH = {
  garden_bench: { displayScale: 1.22, anchorX: 0.5, anchorY: 1, groundOffsetY: -6, shadowOffsetY: 1 },
  garden_lamp: { displayScale: 1.18, anchorX: 0.5, anchorY: 1, groundOffsetY: -4, shadowOffsetY: 1 },
  garden_arch: { displayScale: 1.2, anchorX: 0.5, anchorY: 1, groundOffsetY: -8, shadowOffsetY: 2 },
  garden_fence: { displayScale: 1.15, anchorX: 0.5, anchorY: 1, groundOffsetY: -3, shadowOffsetY: 1 },
  garden_hammock: { displayScale: 1.18, anchorX: 0.5, anchorY: 1, groundOffsetY: -7, shadowOffsetY: 2 },
  garden_well: { displayScale: 1.25, anchorX: 0.5, anchorY: 1, groundOffsetY: -10, shadowOffsetY: 2 },
  grace_fountain: { displayScale: 1.28, anchorX: 0.5, anchorY: 1, groundOffsetY: -12, shadowOffsetY: 3 },
  garden_patio_set: { displayScale: 1.18, anchorX: 0.5, anchorY: 1, groundOffsetY: -6, shadowOffsetY: 2 },
} as const satisfies Record<string, SpritePolishMetadata>;

/**
 * Negative ground offsets compensate for transparent PNG foot padding. The
 * renderer subtracts the offset, moving visible pixels down to the grid
 * anchor while keeping the saved grid coordinates untouched.
 */
export function getSpriteDisplayLayout(
  asset: SpriteLayoutInput,
): SpriteDisplayLayout {
  const width = asset.worldWidth * asset.displayScale;
  const height = asset.worldHeight * asset.displayScale;
  return {
    width,
    height,
    imageX: -width * asset.anchorX,
    imageY: -height * asset.anchorY - asset.groundOffsetY,
    shadowX: -asset.shadowWidth * asset.displayScale * 0.5,
    shadowY:
      asset.shadowOffsetY - asset.shadowHeight * asset.displayScale * 0.5,
  };
}
