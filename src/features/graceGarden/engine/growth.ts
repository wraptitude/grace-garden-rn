import type { GardenCatalogItem, GardenObject } from "../state/types";

export interface PlantGrowthStatus {
  stage: number;
  stageCount: number;
  effectiveElapsedMs: number;
  isMature: boolean;
  nextStageInMs: number | null;
}

export function getPlantGrowthStatus(
  object: GardenObject,
  item: GardenCatalogItem,
  now: number,
): PlantGrowthStatus | null {
  if (!object.plant || !item.growth) {
    return null;
  }

  const elapsed = Math.max(0, now - object.plant.plantedAt);
  const effectiveElapsedMs =
    elapsed + object.plant.wateredCount * item.growth.waterBoostMs;
  const thresholds = item.growth.stageThresholdsMs;

  let stage = 0;
  for (let index = 0; index < thresholds.length; index += 1) {
    if (effectiveElapsedMs >= thresholds[index]) {
      stage = index;
    }
  }

  const isMature = stage === thresholds.length - 1;
  const nextThreshold = isMature ? null : thresholds[stage + 1];

  return {
    stage,
    stageCount: thresholds.length,
    effectiveElapsedMs,
    isMature,
    nextStageInMs:
      nextThreshold === null
        ? null
        : Math.max(0, nextThreshold - effectiveElapsedMs),
  };
}

export function formatRemainingGrowth(milliseconds: number | null): string {
  if (milliseconds === null) {
    return "可以收成";
  }
  const totalSeconds = Math.ceil(milliseconds / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds} 秒`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} 分 ${seconds} 秒`;
}
