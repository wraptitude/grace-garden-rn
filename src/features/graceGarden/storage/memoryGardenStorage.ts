import type { GardenStorage } from "./types";

const values = new Map<string, unknown>();

export const memoryGardenStorage: GardenStorage = {
  load(userId) {
    return values.get(userId) ?? null;
  },
  save(userId, garden) {
    values.set(userId, JSON.parse(JSON.stringify(garden)) as unknown);
  },
  clear(userId) {
    values.delete(userId);
  },
};
