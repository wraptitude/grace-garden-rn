import React, { type ReactNode, useEffect } from "react";
import {
  Circle,
  Group,
  Image as SkiaImage,
  Oval,
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
  GARDEN_SPRITE_ASSETS,
  type GardenSpriteId,
} from "../assets/assetRegistry";

interface GardenSpriteNodeProps {
  spriteId: GardenSpriteId;
  fallback: ReactNode;
}

function SoftContactShadow({
  width,
  height,
  x,
  y,
  opacity,
}: {
  width: number;
  height: number;
  x: number;
  y: number;
  opacity: number;
}) {
  return (
    <Group>
      <Oval
        x={x - width * 0.58}
        y={y - height * 0.62}
        width={width * 1.16}
        height={height * 1.24}
        color="#31473f"
        opacity={opacity * 0.25}
      />
      <Oval
        x={x - width * 0.53}
        y={y - height * 0.54}
        width={width * 1.06}
        height={height * 1.08}
        color="#354b42"
        opacity={opacity * 0.38}
      />
      <Oval
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        color="#3a4f45"
        opacity={opacity * 0.52}
      />
    </Group>
  );
}

export function GardenSpriteNode({
  spriteId,
  fallback,
}: GardenSpriteNodeProps) {
  const asset = GARDEN_SPRITE_ASSETS[spriteId];
  const image = useImage(asset.source);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!asset.effect) return undefined;
    pulse.value = withRepeat(
      withTiming(1, { duration: 2_400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [asset.effect, pulse]);

  const glowOpacity = useDerivedValue(() => 0.09 + pulse.value * 0.08);

  if (!image) {
    return <>{fallback}</>;
  }

  const imageX = -asset.worldWidth * asset.anchorX;
  const imageY = -asset.worldHeight * asset.anchorY;

  return (
    <Group>
      <SoftContactShadow
        width={asset.shadowWidth}
        height={asset.shadowHeight}
        x={asset.shadowOffsetX}
        y={asset.shadowOffsetY}
        opacity={asset.shadowOpacity}
      />

      {asset.effect === "lamp-glow" ? (
        <Group opacity={glowOpacity}>
          <Circle
            cx={0}
            cy={imageY + asset.worldHeight * 0.19}
            r={asset.worldWidth * 0.72}
            color="#ffe59a"
          />
        </Group>
      ) : null}

      {asset.effect === "water-glow" ? (
        <Group opacity={glowOpacity}>
          <Oval
            x={-asset.worldWidth * 0.37}
            y={-asset.worldHeight * 0.16}
            width={asset.worldWidth * 0.74}
            height={asset.worldHeight * 0.14}
            color="#a9eff4"
          />
        </Group>
      ) : null}

      <SkiaImage
        image={image}
        x={imageX}
        y={imageY}
        width={asset.worldWidth}
        height={asset.worldHeight}
        fit="contain"
      />
    </Group>
  );
}
