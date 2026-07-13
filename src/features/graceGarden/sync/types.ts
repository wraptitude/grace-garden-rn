import type { GardenSaveV1 } from "../state/types";

export interface GardenServerEnvelope {
  garden: GardenSaveV1;
  serverRevision: number;
  serverUpdatedAt: number;
}

export interface PushGardenResult extends GardenServerEnvelope {}

export interface GardenApiClient {
  fetchGarden(userId: string): Promise<GardenServerEnvelope | null>;
  pushGarden(
    userId: string,
    garden: GardenSaveV1,
    baseServerRevision: number | null,
  ): Promise<PushGardenResult>;
}

export type GardenSyncResult =
  | { action: "pulled"; garden: GardenSaveV1 }
  | { action: "pushed"; garden: GardenSaveV1 }
  | { action: "unchanged"; garden: GardenSaveV1 };
