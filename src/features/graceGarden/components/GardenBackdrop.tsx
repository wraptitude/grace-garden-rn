import React, { useEffect } from "react";
import {
  Circle,
  Group,
  Image as SkiaImage,
  Oval,
  Rect,
  useImage,
} from "@shopify/react-native-skia";
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  FLOATING_ISLAND_WORLD_RECT,
  GARDEN_SCENE_ASSETS,
} from "../assets/assetRegistry";

interface GardenScreenBackdropProps {
  width: number;
  height: number;
}

interface MovingCloudLayerProps {
  source: (typeof GARDEN_SCENE_ASSETS)[keyof typeof GARDEN_SCENE_ASSETS]["source"];
  viewportWidth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  durationMs: number;
  verticalFloat: number;
  direction?: 1 | -1;
}

function MovingCloudLayer({
  source,
  viewportWidth,
  x,
  y,
  width,
  height,
  opacity,
  durationMs,
  verticalFloat,
  direction = -1,
}: MovingCloudLayerProps) {
  const image = useImage(source);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: durationMs, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [durationMs, progress]);

  const cycle = Math.max(viewportWidth * 1.18, width * 0.92);
  const transform = useDerivedValue(() => {
    const travel = cycle * progress.value * direction;
    const bob = Math.sin(progress.value * Math.PI * 2) * verticalFloat;
    return [{ translateX: travel }, { translateY: bob }];
  });

  if (!image) return null;

  const secondX = direction < 0 ? x + cycle : x - cycle;
  return (
    <Group opacity={opacity} transform={transform}>
      <SkiaImage image={image} x={x} y={y} width={width} height={height} fit="contain" />
      <SkiaImage
        image={image}
        x={secondX}
        y={y}
        width={width}
        height={height}
        fit="contain"
      />
    </Group>
  );
}


function FloatingMotes({ width, height }: { width: number; height: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 12_000, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [progress]);
  const transform = useDerivedValue(() => [
    { translateY: -height * 0.035 * progress.value },
  ]);
  const opacity = useDerivedValue(() =>
    0.2 + Math.sin(progress.value * Math.PI * 2) * 0.08,
  );
  const points = [
    [0.16, 0.28, 2.2],
    [0.28, 0.18, 1.5],
    [0.43, 0.33, 1.8],
    [0.61, 0.19, 2.1],
    [0.78, 0.29, 1.4],
    [0.86, 0.45, 1.9],
    [0.35, 0.52, 1.4],
    [0.68, 0.57, 1.6],
  ] as const;
  return (
    <Group transform={transform} opacity={opacity}>
      {points.map(([px, py, radius], index) => (
        <Circle
          key={`mote-${index}`}
          cx={width * px}
          cy={height * py}
          r={radius}
          color="#fff7c7"
        />
      ))}
    </Group>
  );
}

export function GardenScreenBackdrop({
  width,
  height,
}: GardenScreenBackdropProps) {
  const sky = useImage(GARDEN_SCENE_ASSETS.skyDay.source);

  if (width <= 0 || height <= 0) {
    return <Rect x={0} y={0} width={1} height={1} color="#bfe8fb" />;
  }

  return (
    <Group>
      <Rect x={0} y={0} width={width} height={height} color="#b9e3f5" />
      {sky ? (
        <SkiaImage image={sky} x={0} y={0} width={width} height={height} fit="cover" />
      ) : null}

      {/* Warm atmospheric light rather than a flat blue app background. */}
      <Circle
        cx={width * 0.84}
        cy={height * 0.08}
        r={Math.max(width, height) * 0.28}
        color="#fff4d5"
        opacity={0.1}
      />
      <MovingCloudLayer
        source={GARDEN_SCENE_ASSETS.cloudBackLarge.source}
        viewportWidth={width}
        x={-width * 0.25}
        y={height * 0.04}
        width={width * 1.12}
        height={height * 0.34}
        opacity={0.3}
        durationMs={100_000}
        verticalFloat={3}
      />
      <MovingCloudLayer
        source={GARDEN_SCENE_ASSETS.cloudMidMedium.source}
        viewportWidth={width}
        x={width * 0.16}
        y={height * 0.2}
        width={width * 0.9}
        height={height * 0.25}
        opacity={0.23}
        durationMs={70_000}
        verticalFloat={5}
        direction={1}
      />
      <MovingCloudLayer
        source={GARDEN_SCENE_ASSETS.cloudFrontWide.source}
        viewportWidth={width}
        x={-width * 0.28}
        y={height * 0.72}
        width={width * 1.34}
        height={height * 0.25}
        opacity={0.24}
        durationMs={45_000}
        verticalFloat={7}
      />
      <FloatingMotes width={width} height={height} />
      <Rect
        x={0}
        y={height * 0.82}
        width={width}
        height={height * 0.18}
        color="#effaff"
        opacity={0.13}
      />
    </Group>
  );
}

export function FloatingIslandBaseLayer() {
  const island = useImage(GARDEN_SCENE_ASSETS.floatingIsland.source);
  const shadow = useImage(GARDEN_SCENE_ASSETS.floatingIslandShadow.source);

  return (
    <Group>
      {shadow ? (
        <SkiaImage
          image={shadow}
          x={FLOATING_ISLAND_WORLD_RECT.x}
          y={FLOATING_ISLAND_WORLD_RECT.y + 34}
          width={FLOATING_ISLAND_WORLD_RECT.width}
          height={FLOATING_ISLAND_WORLD_RECT.height}
          fit="contain"
          opacity={0.52}
        />
      ) : null}
      {island ? (
        <SkiaImage
          image={island}
          x={FLOATING_ISLAND_WORLD_RECT.x}
          y={FLOATING_ISLAND_WORLD_RECT.y}
          width={FLOATING_ISLAND_WORLD_RECT.width}
          height={FLOATING_ISLAND_WORLD_RECT.height}
          fit="contain"
        />
      ) : null}
      {/* Very light surface bloom gives the grass a premium focal area. */}
      <Oval
        x={-690}
        y={-35}
        width={1380}
        height={760}
        color="#fff8cf"
        opacity={0.035}
      />
    </Group>
  );
}

/** Rendered after garden objects to tuck front-row feet into the island lip. */
export function FloatingIslandForegroundLayer() {
  const front = useImage(GARDEN_SCENE_ASSETS.floatingIslandFront.source);
  if (!front) return null;
  return (
    <SkiaImage
      image={front}
      x={FLOATING_ISLAND_WORLD_RECT.x}
      y={FLOATING_ISLAND_WORLD_RECT.y}
      width={FLOATING_ISLAND_WORLD_RECT.width}
      height={FLOATING_ISLAND_WORLD_RECT.height}
      fit="contain"
    />
  );
}

/** Backward-compatible alias for host apps that imported the v1 component. */
export const FloatingIslandLayer = FloatingIslandBaseLayer;
