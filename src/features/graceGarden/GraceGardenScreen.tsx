import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GardenToolbar } from "./components/GardenToolbar";
import { GraceGardenCanvas } from "./components/GraceGardenCanvas";
import { SelectedObjectPanel } from "./components/SelectedObjectPanel";
import { useGardenAssetsReady } from "./components/useGardenAssetsReady";
import { useGardenStore } from "./state/useGardenStore";

export interface GraceGardenScreenProps {
  userId: string;
  onClose?: () => void;
  /** Optional host-provided insets; avoids coupling this module to one nav lib. */
  safeAreaInsets?: { top: number; bottom: number; left?: number; right?: number };
}

const DEFAULT_TOP_INSET =
  Platform.OS === "ios" ? 50 : Math.max(StatusBar.currentHeight ?? 24, 24);
const DEFAULT_BOTTOM_INSET = Platform.OS === "ios" ? 20 : 8;

export function GraceGardenScreen({
  userId,
  onClose,
  safeAreaInsets,
}: GraceGardenScreenProps) {
  const initialize = useGardenStore((state) => state.initialize);
  const hydrated = useGardenStore((state) => state.hydrated);
  const garden = useGardenStore((state) => state.garden);
  const selectedObjectId = useGardenStore((state) => state.selectedObjectId);
  const lastError = useGardenStore((state) => state.lastError);
  const addObject = useGardenStore((state) => state.addObject);
  const selectObject = useGardenStore((state) => state.selectObject);
  const waterSelected = useGardenStore((state) => state.waterSelected);
  const harvestSelected = useGardenStore((state) => state.harvestSelected);
  const rotateSelected = useGardenStore((state) => state.rotateSelected);
  const storeSelected = useGardenStore((state) => state.storeSelected);
  const resetDemo = useGardenStore((state) => state.resetDemo);
  const clearError = useGardenStore((state) => state.clearError);

  const [now, setNow] = useState(Date.now());
  const [cameraResetSignal, setCameraResetSignal] = useState(0);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const assetReadiness = useGardenAssetsReady();

  const topInset = safeAreaInsets?.top ?? DEFAULT_TOP_INSET;
  const bottomInset = safeAreaInsets?.bottom ?? DEFAULT_BOTTOM_INSET;

  useEffect(() => initialize(userId), [initialize, userId]);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, []);

  const selectedObject = useMemo(
    () => garden.objects.find((object) => object.id === selectedObjectId) ?? null,
    [garden.objects, selectedObjectId],
  );

  const handleAdd = useCallback(
    (catalogId: string) => {
      const added = addObject(catalogId);
      if (added) setToolbarOpen(false);
      return added;
    },
    [addObject],
  );

  const resetCamera = useCallback(() => {
    selectObject(null);
    setCameraResetSignal((value) => value + 1);
  }, [selectObject]);

  if (!hydrated || garden.userId !== userId || !assetReadiness.ready) {
    const progress = Math.round(
      (assetReadiness.loaded / Math.max(1, assetReadiness.total)) * 100,
    );
    return (
      <View style={styles.loading}>
        <View style={styles.loadingMark}>
          <Text style={styles.loadingMarkText}>✦</Text>
        </View>
        <Text style={styles.loadingTitle}>恩霖花園</Text>
        <Text style={styles.loadingText}>正在整理雲層與花園…</Text>
        <View style={styles.loadingTrack}>
          <View style={[styles.loadingBar, { width: `${progress}%` }]} />
        </View>
        <ActivityIndicator
          size="small"
          color="#58785a"
          style={styles.loadingSpinner}
        />
      </View>
    );
  }

  const toolbarHeight = toolbarOpen ? 174 + bottomInset : 66 + bottomInset;
  const selectionBottom = toolbarOpen
    ? 180 + bottomInset
    : 70 + bottomInset;

  return (
    <View style={styles.screen}>
      <GraceGardenCanvas
        now={now}
        cameraResetSignal={cameraResetSignal}
        editing={toolbarOpen || Boolean(selectedObject)}
        topViewportInset={topInset + 62}
        bottomViewportInset={toolbarHeight}
      />

      <View style={[styles.hud, { top: topInset + 7 }]} pointerEvents="box-none">
        {onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回"
            onPress={onClose}
            style={({ pressed }) => [styles.hudCircle, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.hudCirclePlaceholder} />
        )}

        <Pressable
          onLongPress={__DEV__ ? resetDemo : undefined}
          delayLongPress={900}
          style={styles.titlePill}
        >
          <Text style={styles.title}>恩霖花園</Text>
          <Text style={styles.subtitle}>在恩典裡慢慢成長</Text>
        </Pressable>

        <View style={styles.coinPill}>
          <Text style={styles.coinStar}>✦</Text>
          <Text style={styles.coinText}>{garden.coins}</Text>
        </View>
      </View>

      {selectedObject ? (
        <SelectedObjectPanel
          object={selectedObject}
          now={now}
          bottom={selectionBottom}
          onWater={waterSelected}
          onHarvest={harvestSelected}
          onRotate={rotateSelected}
          onStore={storeSelected}
          onDone={() => selectObject(null)}
        />
      ) : null}

      {lastError ? (
        <Pressable
          onPress={clearError}
          style={[styles.errorBanner, { top: topInset + 70 }]}
        >
          <Text style={styles.errorText}>{lastError}</Text>
          <Text style={styles.dismissText}>點按關閉</Text>
        </Pressable>
      ) : null}

      <GardenToolbar
        inventory={garden.inventory}
        open={toolbarOpen}
        bottomInset={bottomInset}
        onToggle={() => setToolbarOpen((value) => !value)}
        onAdd={handleAdd}
        onResetCamera={resetCamera}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#b9e3f5" },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eaf6f4",
  },
  loadingMark: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    backgroundColor: "rgba(255, 253, 244, 0.92)",
    shadowColor: "#2a4535",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  loadingMarkText: { color: "#b79248", fontSize: 25 },
  loadingTitle: {
    marginTop: 14,
    color: "#31472f",
    fontSize: 19,
    fontWeight: "900",
  },
  loadingText: { marginTop: 5, color: "#6f806c", fontWeight: "700" },
  loadingTrack: {
    width: 176,
    height: 6,
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "rgba(74, 105, 76, 0.13)",
  },
  loadingBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#739873",
  },
  loadingSpinner: { marginTop: 13 },
  hud: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hudCircle: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255,253,247,0.9)",
    shadowColor: "#26382f",
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  hudCirclePlaceholder: { width: 44, height: 44 },
  backText: { marginTop: -3, fontSize: 34, color: "#38583c", fontWeight: "500" },
  titlePill: {
    minWidth: 168,
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
    backgroundColor: "rgba(255,253,247,0.88)",
    shadowColor: "#26382f",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: { fontSize: 16, fontWeight: "900", color: "#31472f" },
  subtitle: { marginTop: 1, fontSize: 9.5, color: "#788774" },
  coinPill: {
    minWidth: 62,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 11,
    backgroundColor: "rgba(255,253,247,0.9)",
    shadowColor: "#26382f",
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  coinStar: { color: "#b48c38", fontSize: 15 },
  coinText: { color: "#775d2c", fontWeight: "900", fontSize: 14 },
  errorBanner: {
    position: "absolute",
    left: 18,
    right: 18,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(92, 63, 53, 0.94)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  errorText: { color: "#fff", fontWeight: "800" },
  dismissText: { marginTop: 2, color: "#eadfd9", fontSize: 10 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.97 }] },
});
