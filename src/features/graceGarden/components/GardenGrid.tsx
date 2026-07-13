import React, { useMemo } from "react";
import { Group, Path } from "@shopify/react-native-skia";
import {
  GARDEN_COLUMNS,
  GARDEN_ROWS,
  TILE_HEIGHT,
  TILE_WIDTH,
  isoToWorld,
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
    for (let y = 0; y < GARDEN_ROWS; y += 1) {
      for (let x = 0; x < GARDEN_COLUMNS; x += 1) {
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
