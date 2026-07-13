import { create } from "zustand";
import {
  canPlaceObject,
  findFirstAvailablePlacement,
} from "../engine/collision";
import { getPlantGrowthStatus } from "../engine/growth";
import { createGardenObjectId } from "../engine/ids";
import {
  canRotateItem,
  getNextRotation,
  getRotationPlacementCandidates,
} from "../engine/rotation";
import { mmkvGardenStorage } from "../storage/mmkvGardenStorage";
import type { GardenStorage } from "../storage/types";
import { getCatalogItem } from "./catalog";
import { migrateGardenSave } from "./migrations";
import { createSeedGarden } from "./seed";
import type { GardenObject, GardenSaveV1 } from "./types";

let activeStorage: GardenStorage = mmkvGardenStorage;

export function configureGardenStorage(storage: GardenStorage): void {
  activeStorage = storage;
}

interface GardenState {
  userId: string;
  garden: GardenSaveV1;
  hydrated: boolean;
  selectedObjectId: string | null;
  lastError: string | null;
  initialize: (userId: string) => void;
  selectObject: (objectId: string | null) => void;
  moveObject: (objectId: string, gridX: number, gridY: number) => boolean;
  addObject: (catalogId: string) => boolean;
  rotateSelected: () => boolean;
  storeSelected: () => boolean;
  waterSelected: () => boolean;
  harvestSelected: () => boolean;
  resetDemo: () => void;
  applyRemoteGarden: (garden: GardenSaveV1) => void;
  clearError: () => void;
}

function nextGarden(
  garden: GardenSaveV1,
  patch: Partial<Omit<GardenSaveV1, "schemaVersion" | "userId" | "gardenId">>,
  now = Date.now(),
): GardenSaveV1 {
  return {
    ...garden,
    ...patch,
    revision: garden.revision + 1,
    updatedAt: now,
  };
}

function persistGarden(userId: string, garden: GardenSaveV1): string | null {
  try {
    activeStorage.save(userId, garden);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "花園存檔失敗";
  }
}

function updateAndPersist(
  set: (partial: Partial<GardenState>) => void,
  userId: string,
  garden: GardenSaveV1,
): void {
  const storageError = persistGarden(userId, garden);
  set({ garden, lastError: storageError });
}

export const useGardenStore = create<GardenState>((set, get) => ({
  userId: "guest",
  garden: createSeedGarden("guest", 0),
  hydrated: false,
  selectedObjectId: null,
  lastError: null,

  initialize(userId) {
    try {
      const raw = activeStorage.load(userId);
      const garden = migrateGardenSave(raw, userId);
      if (raw === null) {
        activeStorage.save(userId, garden);
      }
      set({
        userId,
        garden,
        hydrated: true,
        selectedObjectId: null,
        lastError: null,
      });
    } catch (error) {
      const garden = createSeedGarden(userId);
      set({
        userId,
        garden,
        hydrated: true,
        selectedObjectId: null,
        lastError: error instanceof Error ? error.message : "無法讀取花園存檔",
      });
    }
  },

  selectObject(objectId) {
    set({ selectedObjectId: objectId });
  },

  moveObject(objectId, gridX, gridY) {
    const state = get();
    const object = state.garden.objects.find((value) => value.id === objectId);
    if (!object) {
      set({ lastError: "搵唔到呢件花園物件" });
      return false;
    }

    const item = getCatalogItem(object.catalogId);
    if (!item?.draggable || object.locked) {
      set({ lastError: "呢件係花園固定地標" });
      return false;
    }

    const candidate = {
      catalogId: object.catalogId,
      gridX,
      gridY,
      rotation: object.rotation,
    };
    const placement = canPlaceObject(state.garden.objects, candidate, objectId);
    if (!placement.ok) {
      set({
        lastError:
          placement.reason === "out-of-bounds"
            ? "呢個位置超出花園範圍"
            : "呢個位置已經有其他物件",
      });
      return false;
    }

    const now = Date.now();
    const objects = state.garden.objects.map((value) =>
      value.id === objectId
        ? { ...value, gridX, gridY, updatedAt: now }
        : value,
    );
    const garden = nextGarden(state.garden, { objects }, now);
    updateAndPersist(set, state.userId, garden);
    return true;
  },

  addObject(catalogId) {
    const state = get();
    const item = getCatalogItem(catalogId);
    if (!item) {
      set({ lastError: "未知嘅花園物件" });
      return false;
    }
    const count = state.garden.inventory[catalogId] ?? 0;
    if (count <= 0) {
      set({ lastError: `${item.name} 背包數量不足` });
      return false;
    }
    const point = findFirstAvailablePlacement(
      state.garden.objects,
      catalogId,
      0,
      { x: 11, y: 11 },
    );
    if (!point) {
      set({ lastError: "花園暫時冇足夠空位" });
      return false;
    }

    const now = Date.now();
    const object: GardenObject = {
      id: createGardenObjectId(catalogId, now),
      catalogId,
      kind: item.kind,
      gridX: point.x,
      gridY: point.y,
      rotation: 0,
      createdAt: now,
      updatedAt: now,
      ...(item.kind === "plant"
        ? {
            plant: {
              plantedAt: now,
              lastWateredAt: null,
              wateredCount: 0,
              harvestCount: 0,
            },
          }
        : {}),
    };
    const inventory = {
      ...state.garden.inventory,
      [catalogId]: count - 1,
    };
    const garden = nextGarden(
      state.garden,
      { objects: [...state.garden.objects, object], inventory },
      now,
    );
    updateAndPersist(set, state.userId, garden);
    set({ selectedObjectId: object.id });
    return true;
  },

  rotateSelected() {
    const state = get();
    const selectedId = state.selectedObjectId;
    const object = state.garden.objects.find(
      (value) => value.id === selectedId,
    );
    if (!object) {
      return false;
    }
    const item = getCatalogItem(object.catalogId);
    if (!item || !canRotateItem(item)) {
      set({ lastError: "呢件物件唔需要轉向" });
      return false;
    }

    const rotation = getNextRotation(item, object.rotation);
    const origin = getRotationPlacementCandidates(object, item, rotation).find(
      (point) =>
        canPlaceObject(
          state.garden.objects,
          {
            catalogId: object.catalogId,
            gridX: point.x,
            gridY: point.y,
            rotation,
          },
          object.id,
        ).ok,
    );
    if (!origin) {
      set({ lastError: "轉向後會撞到其他物件或超出花園" });
      return false;
    }

    const now = Date.now();
    const objects = state.garden.objects.map((value) =>
      value.id === object.id
        ? {
            ...value,
            gridX: origin.x,
            gridY: origin.y,
            rotation,
            updatedAt: now,
          }
        : value,
    );
    updateAndPersist(
      set,
      state.userId,
      nextGarden(state.garden, { objects }, now),
    );
    return true;
  },

  storeSelected() {
    const state = get();
    const selectedId = state.selectedObjectId;
    const object = state.garden.objects.find(
      (value) => value.id === selectedId,
    );
    const item = object ? getCatalogItem(object.catalogId) : null;
    if (
      !object ||
      object.locked ||
      object.kind === "avatar" ||
      !item?.draggable
    ) {
      set({ lastError: "呢件物件唔可以收起" });
      return false;
    }

    const inventory = {
      ...state.garden.inventory,
      [object.catalogId]: (state.garden.inventory[object.catalogId] ?? 0) + 1,
    };
    const objects = state.garden.objects.filter(
      (value) => value.id !== object.id,
    );
    const garden = nextGarden(state.garden, { objects, inventory });
    updateAndPersist(set, state.userId, garden);
    set({ selectedObjectId: null });
    return true;
  },

  waterSelected() {
    const state = get();
    const selectedId = state.selectedObjectId;
    const object = state.garden.objects.find(
      (value) => value.id === selectedId,
    );
    if (!object?.plant) {
      set({ lastError: "請先選擇一棵植物" });
      return false;
    }

    const now = Date.now();
    const objects = state.garden.objects.map((value) =>
      value.id === object.id && value.plant
        ? {
            ...value,
            plant: {
              ...value.plant,
              lastWateredAt: now,
              wateredCount: value.plant.wateredCount + 1,
            },
            updatedAt: now,
          }
        : value,
    );
    updateAndPersist(
      set,
      state.userId,
      nextGarden(state.garden, { objects }, now),
    );
    return true;
  },

  harvestSelected() {
    const state = get();
    const selectedId = state.selectedObjectId;
    const object = state.garden.objects.find(
      (value) => value.id === selectedId,
    );
    if (!object?.plant) {
      return false;
    }
    const item = getCatalogItem(object.catalogId);
    if (!item?.growth) {
      return false;
    }
    const now = Date.now();
    const growth = getPlantGrowthStatus(object, item, now);
    if (!growth?.isMature) {
      set({ lastError: "植物仲未成熟" });
      return false;
    }

    const objects = state.garden.objects.map((value) =>
      value.id === object.id && value.plant
        ? {
            ...value,
            plant: {
              plantedAt: now,
              lastWateredAt: null,
              wateredCount: 0,
              harvestCount: value.plant.harvestCount + 1,
            },
            updatedAt: now,
          }
        : value,
    );
    const garden = nextGarden(
      state.garden,
      { objects, coins: state.garden.coins + item.growth.harvestReward },
      now,
    );
    updateAndPersist(set, state.userId, garden);
    return true;
  },

  resetDemo() {
    const state = get();
    const garden = createSeedGarden(state.userId);
    updateAndPersist(set, state.userId, garden);
    set({ selectedObjectId: null });
  },

  applyRemoteGarden(garden) {
    const state = get();
    const normalized = migrateGardenSave(garden, state.userId);
    updateAndPersist(set, state.userId, normalized);
    set({ selectedObjectId: null });
  },

  clearError() {
    set({ lastError: null });
  },
}));
