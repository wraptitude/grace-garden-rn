/**
 * Pure visual metadata for Grace Garden PNG sprites.
 *
 * This file intentionally contains no React Native `require()` calls so the
 * values can be unit-tested in Node. All dimensions are garden world units.
 */
export interface GardenSpriteMetrics {
  worldWidth: number;
  worldHeight: number;
  /** Point inside the PNG that must sit on the garden ground anchor. */
  anchorX: number;
  anchorY: number;
  shadowWidth: number;
  shadowHeight: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
  /** Extra vertical lift used when the camera focuses this object. */
  focusLift: number;
  /** Desired focus zoom relative to the overview scale. */
  focusZoom: number;
  /** Fine depth-order adjustment in grid-depth units. */
  depthBias: number;
  effect?: "lamp-glow" | "water-glow";
}

/**
 * v2.0 proportions are calibrated against a 104 × 52 isometric tile.
 * They deliberately read larger than v1.4 in overview mode and become clearly
 * legible when the camera auto-focuses a selected object.
 */
export const GARDEN_SPRITE_METRICS = {
  garden_bench: {
    worldWidth: 270,
    worldHeight: 276,
    anchorX: 0.5,
    anchorY: 0.945,
    shadowWidth: 205,
    shadowHeight: 34,
    shadowOffsetX: 4,
    shadowOffsetY: 5,
    shadowOpacity: 0.17,
    focusLift: 78,
    focusZoom: 2.15,
    depthBias: 0.02,
  },
  garden_lamp: {
    worldWidth: 104,
    worldHeight: 364,
    anchorX: 0.5,
    anchorY: 0.968,
    shadowWidth: 58,
    shadowHeight: 19,
    shadowOffsetX: 1,
    shadowOffsetY: 3,
    shadowOpacity: 0.16,
    focusLift: 150,
    focusZoom: 2.25,
    depthBias: 0.01,
    effect: "lamp-glow",
  },
  garden_well: {
    worldWidth: 292,
    worldHeight: 395,
    anchorX: 0.5,
    anchorY: 0.958,
    shadowWidth: 228,
    shadowHeight: 46,
    shadowOffsetX: 0,
    shadowOffsetY: 7,
    shadowOpacity: 0.18,
    focusLift: 128,
    focusZoom: 2.05,
    depthBias: 0.02,
  },
  garden_arch: {
    worldWidth: 300,
    worldHeight: 396,
    anchorX: 0.5,
    anchorY: 0.972,
    shadowWidth: 230,
    shadowHeight: 36,
    shadowOffsetX: 0,
    shadowOffsetY: 5,
    shadowOpacity: 0.16,
    focusLift: 150,
    focusZoom: 2.05,
    depthBias: 0.03,
  },
  garden_hammock: {
    worldWidth: 410,
    worldHeight: 339,
    anchorX: 0.5,
    anchorY: 0.942,
    shadowWidth: 330,
    shadowHeight: 48,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    shadowOpacity: 0.16,
    focusLift: 105,
    focusZoom: 1.95,
    depthBias: 0.025,
  },
  garden_fence: {
    worldWidth: 330,
    worldHeight: 265,
    anchorX: 0.5,
    anchorY: 0.918,
    shadowWidth: 282,
    shadowHeight: 31,
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    shadowOpacity: 0.14,
    focusLift: 80,
    focusZoom: 2.0,
    depthBias: -0.01,
  },
  garden_patio_set: {
    worldWidth: 325,
    worldHeight: 391,
    anchorX: 0.5,
    anchorY: 0.925,
    shadowWidth: 255,
    shadowHeight: 50,
    shadowOffsetX: 0,
    shadowOffsetY: 7,
    shadowOpacity: 0.17,
    focusLift: 128,
    focusZoom: 2.0,
    depthBias: 0.02,
  },
  grace_fountain: {
    worldWidth: 420,
    worldHeight: 427,
    anchorX: 0.5,
    anchorY: 0.95,
    shadowWidth: 342,
    shadowHeight: 64,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    shadowOpacity: 0.18,
    focusLift: 135,
    focusZoom: 1.9,
    depthBias: 0.035,
    effect: "water-glow",
  },
} as const satisfies Record<string, GardenSpriteMetrics>;

export type GardenSpriteId = keyof typeof GARDEN_SPRITE_METRICS;
