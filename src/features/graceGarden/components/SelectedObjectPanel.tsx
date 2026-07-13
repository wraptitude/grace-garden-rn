import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatRemainingGrowth, getPlantGrowthStatus } from "../engine/growth";
import { getCatalogItem } from "../state/catalog";
import type { GardenObject } from "../state/types";

interface SelectedObjectPanelProps {
  object: GardenObject;
  now: number;
  bottom: number;
  onWater: () => void;
  onHarvest: () => void;
  onRotate: () => void;
  onStore: () => void;
  onDone: () => void;
}

function ActionButton({
  label,
  onPress,
  emphasized = false,
}: {
  label: string;
  onPress: () => void;
  emphasized?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        emphasized && styles.buttonEmphasized,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          emphasized && styles.buttonTextEmphasized,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SelectedObjectPanel({
  object,
  now,
  bottom,
  onWater,
  onHarvest,
  onRotate,
  onStore,
  onDone,
}: SelectedObjectPanelProps) {
  const item = getCatalogItem(object.catalogId);
  if (!item) return null;
  const growth = getPlantGrowthStatus(object, item, now);
  const isFixed = Boolean(object.locked || !item.draggable);

  return (
    <View style={[styles.panel, { bottom }]}>
      <View style={styles.textBlock}>
        <Text numberOfLines={1} style={styles.title}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {growth
            ? `成長 ${growth.stage + 1}/${growth.stageCount} · ${formatRemainingGrowth(
                growth.nextStageInMs,
              )}`
            : isFixed
              ? "花園固定地標"
              : "拖動物件可重新擺位"}
        </Text>
      </View>
      <View style={styles.actions}>
        {growth && !growth.isMature ? (
          <ActionButton label="澆水" onPress={onWater} />
        ) : null}
        {growth?.isMature ? (
          <ActionButton label="收成" onPress={onHarvest} emphasized />
        ) : null}
        {item.rotationMode !== "none" ? (
          <ActionButton label="轉向" onPress={onRotate} />
        ) : null}
        {!isFixed && object.kind !== "avatar" ? (
          <ActionButton label="收起" onPress={onStore} />
        ) : null}
        <ActionButton label="完成" onPress={onDone} emphasized />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    left: 16,
    right: 16,
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 253, 246, 0.94)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.92)",
    shadowColor: "#23352d",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },
  textBlock: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: "900", color: "#31472f" },
  subtitle: { marginTop: 2, fontSize: 10.5, color: "#71806d" },
  actions: { flexDirection: "row", alignItems: "center", gap: 6 },
  button: {
    minWidth: 48,
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: "rgba(225, 237, 215, 0.92)",
  },
  buttonEmphasized: { backgroundColor: "#466b49" },
  buttonText: { color: "#3b5a3d", fontSize: 11, fontWeight: "800" },
  buttonTextEmphasized: { color: "#fffef7" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
});
