import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getGardenSpriteAsset } from "../assets/assetRegistry";
import { GARDEN_CATALOG, type GardenCatalogId } from "../state/catalog";

interface GardenToolbarProps {
  inventory: Record<string, number>;
  open: boolean;
  bottomInset: number;
  onToggle: () => void;
  onAdd: (catalogId: string) => boolean;
  onResetCamera: () => void;
}

const TOOL_ITEMS: ReadonlyArray<{
  catalogId: GardenCatalogId;
  fallbackIcon: string;
}> = [
  { catalogId: "flower_bench", fallbackIcon: "🪑" },
  { catalogId: "grace_lamp", fallbackIcon: "🏮" },
  { catalogId: "flower_well", fallbackIcon: "🪣" },
  { catalogId: "flower_arch", fallbackIcon: "🌹" },
  { catalogId: "flower_hammock", fallbackIcon: "🛏️" },
  { catalogId: "white_flower_fence", fallbackIcon: "🌼" },
  { catalogId: "garden_cafe_set", fallbackIcon: "☕" },
  { catalogId: "grace_fountain", fallbackIcon: "⛲" },
];

export function GardenToolbar({
  inventory,
  open,
  bottomInset,
  onToggle,
  onAdd,
  onResetCamera,
}: GardenToolbarProps) {
  if (!open) {
    return (
      <View style={[styles.collapsed, { bottom: bottomInset + 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="返回全景"
          onPress={onResetCamera}
          style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}
        >
          <Text style={styles.roundIcon}>◎</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="打開佈置物品"
          onPress={onToggle}
          style={({ pressed }) => [styles.decorateButton, pressed && styles.pressed]}
        >
          <Text style={styles.decorateIcon}>＋</Text>
          <Text style={styles.decorateText}>佈置</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.drawer, { paddingBottom: Math.max(10, bottomInset) }]}>
      <View style={styles.drawerHeader}>
        <View>
          <Text style={styles.drawerTitle}>花園佈置</Text>
          <Text style={styles.drawerSubtitle}>揀選後會自動拉近，拖動即可擺位</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={onResetCamera} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>全景</Text>
          </Pressable>
          <Pressable onPress={onToggle} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>收起</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={styles.content}
        showsHorizontalScrollIndicator={false}
      >
        {TOOL_ITEMS.map(({ catalogId, fallbackIcon }) => {
          const item = GARDEN_CATALOG[catalogId];
          const sprite = getGardenSpriteAsset(
            "spriteId" in item ? item.spriteId : undefined,
          );
          const count = inventory[catalogId] ?? 0;
          return (
            <Pressable
              key={catalogId}
              accessibilityRole="button"
              disabled={count <= 0}
              onPress={() => onAdd(catalogId)}
              style={({ pressed }) => [
                styles.item,
                count <= 0 && styles.disabled,
                pressed && count > 0 && styles.itemPressed,
              ]}
            >
              {sprite ? (
                <Image
                  source={sprite.thumbnailSource}
                  style={styles.thumbnail}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.icon}>{fallbackIcon}</Text>
              )}
              <Text numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.count}>×{count}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsed: {
    position: "absolute",
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roundButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255,253,247,0.92)",
    shadowColor: "#24352e",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  roundIcon: { fontSize: 20, color: "#47654a", fontWeight: "800" },
  decorateButton: {
    height: 46,
    minWidth: 94,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 23,
    paddingHorizontal: 16,
    backgroundColor: "#456a49",
    shadowColor: "#203126",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  decorateIcon: { color: "#fffdf4", fontSize: 20, fontWeight: "700" },
  decorateText: { color: "#fffdf4", fontWeight: "900", fontSize: 14 },
  drawer: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 0,
    minHeight: 158,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 10,
    backgroundColor: "rgba(255, 253, 247, 0.965)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#203027",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
  },
  drawerHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  drawerTitle: { fontSize: 15, fontWeight: "900", color: "#31472f" },
  drawerSubtitle: { marginTop: 1, fontSize: 10, color: "#7b8877" },
  headerActions: { flexDirection: "row", gap: 6 },
  smallButton: {
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "#e5eedc",
  },
  smallButtonText: { color: "#426044", fontWeight: "800", fontSize: 11 },
  content: { gap: 9, paddingHorizontal: 12, paddingVertical: 8 },
  item: {
    width: 84,
    minHeight: 92,
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 5,
    backgroundColor: "rgba(239, 244, 230, 0.9)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(210, 222, 201, 0.9)",
  },
  thumbnail: { width: 54, height: 50 },
  icon: { fontSize: 27, height: 50, textAlignVertical: "center" },
  name: {
    alignSelf: "stretch",
    marginTop: 1,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#3d513b",
    textAlign: "center",
  },
  countBadge: {
    marginTop: 3,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: "rgba(69,106,73,0.1)",
  },
  count: { fontSize: 9.5, color: "#667663", fontWeight: "700" },
  disabled: { opacity: 0.34 },
  itemPressed: { transform: [{ scale: 0.97 }] },
  pressed: { opacity: 0.76, transform: [{ scale: 0.97 }] },
});
