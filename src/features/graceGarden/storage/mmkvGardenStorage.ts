import { createMMKV } from "react-native-mmkv";
import type { GardenStorage } from "./types";

const mmkv = createMMKV({ id: "walk-with-christ.grace-garden" });

function keyForUser(userId: string): string {
  return `garden:${encodeURIComponent(userId)}`;
}

export const mmkvGardenStorage: GardenStorage = {
  load(userId) {
    const json = mmkv.getString(keyForUser(userId));
    if (!json) {
      return null;
    }
    try {
      return JSON.parse(json) as unknown;
    } catch {
      return null;
    }
  },
  save(userId, garden) {
    mmkv.set(keyForUser(userId), JSON.stringify(garden));
  },
  clear(userId) {
    mmkv.remove(keyForUser(userId));
  },
};
