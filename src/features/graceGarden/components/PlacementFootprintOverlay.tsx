import React, { useMemo } from "react";
import { Group, Path } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";
import { TILE_HEIGHT, TILE_WIDTH, isoToWorld } from "../engine/geometry";

interface PlacementFootprintOverlayProps {
  activeObjectId: SharedValue<string | null>;
  gridX: SharedValue<number>;
  gridY: SharedValue<number>;
  footprintWidth: SharedValue<number>;
  footprintHeight: SharedValue<number>;
  valid: SharedValue<boolean>;
}

interface PreviewTileProps extends PlacementFootprintOverlayProps {
  localX: number;
  localY: number;
}

function PreviewTile({
  activeObjectId,
  footprintWidth,
  footprintHeight,
  valid,
  localX,
  localY,
}: PreviewTileProps) {
  const center = isoToWorld(localX, localY);
  const halfWidth = TILE_WIDTH / 2;
  const halfHeight = TILE_HEIGHT / 2;
  const path = [
    `M ${center.x} ${center.y - halfHeight}`,
    `L ${center.x + halfWidth} ${center.y}`,
    `L ${center.x} ${center.y + halfHeight}`,
    `L ${center.x - halfWidth} ${center.y}`,
    "Z",
  ].join(" ");
  const opacity = useDerivedValue(() =>
    activeObjectId.value &&
    localX < footprintWidth.value &&
    localY < footprintHeight.value
      ? 0.32
      : 0,
  );
  const color = useDerivedValue(() =>
    valid.value ? "#8fd28b" : "#e69a91",
  );

  return (
    <Path
      path={path}
      color={color}
      opacity={opacity}
      style="fill"
      strokeWidth={1}
    />
  );
}

export function PlacementFootprintOverlay(
  props: PlacementFootprintOverlayProps,
) {
  const originTransform = useDerivedValue(() => {
    const origin = isoToWorld(props.gridX.value, props.gridY.value);
    return [{ translateX: origin.x }, { translateY: origin.y }];
  });
  const tiles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        x: index % 4,
        y: Math.floor(index / 4),
      })),
    [],
  );

  return (
    <Group transform={originTransform}>
      {tiles.map((tile) => (
        <PreviewTile
          key={`${tile.x}:${tile.y}`}
          {...props}
          localX={tile.x}
          localY={tile.y}
        />
      ))}
    </Group>
  );
}
