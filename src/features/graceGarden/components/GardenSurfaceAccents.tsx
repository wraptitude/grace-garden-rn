import React, { useMemo } from "react";
import { Group, Oval } from "@shopify/react-native-skia";
import { isoToWorld } from "../engine/geometry";

interface Stone {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

/**
 * A quiet built-in path gives the empty island composition and scale before a
 * player owns many decorations. It stays below all placeable objects.
 */
export function GardenSurfaceAccents() {
  const stones = useMemo<Stone[]>(() => {
    const points = [
      [8.0, 14.4],
      [7.8, 13.4],
      [7.7, 12.4],
      [7.5, 11.35],
      [7.4, 10.3],
      [7.5, 9.25],
      [7.45, 8.1],
      [7.3, 6.7],
      [7.1, 5.5],
      [6.9, 4.3],
      [6.7, 3.1],
      [6.5, 2.0],
    ];
    return points.map(([gridX, gridY], index) => {
      const world = isoToWorld(gridX, gridY);
      return {
        x: world.x,
        y: world.y,
        width: 34 + (index % 3) * 5,
        height: 15 + (index % 2) * 3,
        opacity: 0.2 + (index % 4) * 0.018,
      };
    });
  }, []);

  const center = isoToWorld(7.5, 7.5);

  return (
    <Group>
      <Oval
        x={center.x - 245}
        y={center.y - 84}
        width={490}
        height={168}
        color="#fff8d9"
        opacity={0.055}
      />
      {stones.map((stone, index) => (
        <Oval
          key={`${stone.x}-${stone.y}-${index}`}
          x={stone.x - stone.width / 2}
          y={stone.y - stone.height / 2}
          width={stone.width}
          height={stone.height}
          color={index % 2 === 0 ? "#e8d9b7" : "#dccba6"}
          opacity={stone.opacity}
        />
      ))}
    </Group>
  );
}
