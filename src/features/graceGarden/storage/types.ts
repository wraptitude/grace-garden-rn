import type { GardenSaveV1 } from "../state/types";

export interface GardenStorage {
  load(userId: string): unknown | null;
  save(userId: string, garden: GardenSaveV1): void;
  clear(userId: string): void;
}
