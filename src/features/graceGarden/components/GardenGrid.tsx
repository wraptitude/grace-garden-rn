import React, { useMemo } from "react";
import { Group, Path } from "@shopify/react-native-skia";
import {
  GARDEN_MAX_GRID_X,
  GARDEN_MAX_GRID_Y,
  GARDEN_MIN_GRID_X,
  GARDEN_MIN_GRID_Y,
  TILE_HEIGHT,
  TILE_WIDTH,
  isoToWorld,
  isBuildableGardenCell,
} from "../engine/geometry";

interface TileShape {
  key: string;
  path: string;
}

interface GardenGridProps {
  opacity?: number;
}

/**
 * v2.0 uses a line-only edit grid. The filled checkerboard from earlier
 * versions made the garden look like an engineering tool instead of a game.
 */
export function GardenGrid({ opacity = 0 }: GardenGridProps) {
  const tiles = useMemo<TileShape[]>(() => {
    const result: TileShape[] = [];
    for (let y = GARDEN_MIN_GRID_Y; y < GARDEN_MAX_GRID_Y; y += 1) {
      for (let x = GARDEN_MIN_GRID_X; x < GARDEN_MAX_GRID_X; x += 1) {
        if (!isBuildableGardenCell(x, y)) continue;
        const center = isoToWorld(x, y);
        const halfWidth = TILE_WIDTH / 2;
        const halfHeight = TILE_HEIGHT / 2;
        result.push({
          key: `${x}:${y}`,
          path: [
            `M ${center.x} ${center.y - halfHeight}`,
            `L ${center.x + halfWidth} ${center.y}`,
            `L ${center.x} ${center.y + halfHeight}`,
            `L ${center.x - halfWidth} ${center.y}`,
            "Z",
          ].join(" "),
        });
      }
    }
    return result;
  }, []);

  if (opacity <= 0) return null;

  return (
    <Group opacity={opacity}>
      {tiles.map((tile) => (
        <Path
          key={tile.key}
          path={tile.path}
          color="#f2f7dc"
          style="stroke"
          strokeWidth={1.25}
        />
      ))}
    </Group>
  );
}
