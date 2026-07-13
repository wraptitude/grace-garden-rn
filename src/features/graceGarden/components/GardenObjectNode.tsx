import React, { type ReactNode, useEffect, useMemo } from "react";
import {
  Circle,
  Group,
  Line,
  Oval,
  Path,
  Rect,
  RoundedRect,
  vec,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { GardenSpriteId } from "../assets/assetRegistry";
import {
  getFootprintWorldPolygon,
  getObjectAnchorWorld,
} from "../engine/geometry";
import { getPlantGrowthStatus } from "../engine/growth";
import type { GardenCatalogItem, GardenObject } from "../state/types";
import { GardenSpriteNode } from "./GardenSpriteNode";

interface GardenObjectNodeProps {
  object: GardenObject;
  item: GardenCatalogItem;
  now: number;
  activeObjectId: SharedValue<string | null>;
  selectedObjectId: SharedValue<string | null>;
  dragWorldX: SharedValue<number>;
  dragWorldY: SharedValue<number>;
  activePlacementValid: SharedValue<boolean>;
}

function PlantGlyph({ stage }: { stage: number }) {
  return (
    <Group>
      <Oval x={-22} y={-10} width={44} height={20} color="#7f5a3b" />
      {stage >= 1 ? (
        <Line
          p1={vec(0, -6)}
          p2={vec(0, -34 - stage * 4)}
          color="#4e8f45"
          strokeWidth={5}
        />
      ) : null}
      {stage >= 1 ? (
        <Oval x={-20} y={-28} width={20} height={11} color="#5da853" />
      ) : null}
      {stage >= 2 ? (
        <Oval x={1} y={-40} width={21} height={12} color="#69b65c" />
      ) : null}
      {stage >= 3 ? (
        <Group transform={[{ translateY: -57 }]}>
          <Circle cx={-9} cy={0} r={10} color="#f4a8bd" />
          <Circle cx={9} cy={0} r={10} color="#f4a8bd" />
          <Circle cx={0} cy={-8} r={10} color="#f8bdd0" />
          <Circle cx={0} cy={8} r={10} color="#ed96b1" />
          <Circle cx={0} cy={0} r={7} color="#f3ca5d" />
        </Group>
      ) : null}
    </Group>
  );
}

function TreeGlyph() {
  return (
    <Group>
      <Oval
        x={-47}
        y={-18}
        width={94}
        height={29}
        color="#64835d"
        opacity={0.35}
      />
      <RoundedRect
        x={-11}
        y={-82}
        width={22}
        height={78}
        r={8}
        color="#8b623e"
      />
      <Circle cx={-27} cy={-92} r={38} color="#6f9f58" />
      <Circle cx={25} cy={-97} r={42} color="#78aa60" />
      <Circle cx={0} cy={-130} r={45} color="#82b96a" />
      <Circle cx={-3} cy={-101} r={38} color="#75aa5c" />
      <Circle cx={-18} cy={-127} r={5} color="#b9c66f" />
      <Circle cx={20} cy={-113} r={5} color="#c5cf73" />
    </Group>
  );
}

function BenchGlyph({ direction }: { direction: 0 | 1 }) {
  const slope = direction === 0 ? 0.5 : -0.5;
  const lineY = (x: number, centerY: number) => centerY + slope * x;
  const backLeft = vec(-47, lineY(-47, -47));
  const backRight = vec(47, lineY(47, -47));
  const seatLeft = vec(-47, lineY(-47, -22));
  const seatRight = vec(47, lineY(47, -22));
  const leftLegX = -34;
  const rightLegX = 34;
  const leftSeatY = lineY(leftLegX, -22);
  const rightSeatY = lineY(rightLegX, -22);
  const leftBackY = lineY(leftLegX, -47);
  const rightBackY = lineY(rightLegX, -47);

  return (
    <Group>
      <Oval
        x={-54}
        y={-7}
        width={108}
        height={26}
        color="#5e6f57"
        opacity={0.28}
      />
      <Line
        p1={vec(leftLegX, leftSeatY - 1)}
        p2={vec(leftLegX, leftSeatY + 29)}
        color="#69482f"
        strokeWidth={8}
      />
      <Line
        p1={vec(rightLegX, rightSeatY - 1)}
        p2={vec(rightLegX, rightSeatY + 29)}
        color="#69482f"
        strokeWidth={8}
      />
      <Line
        p1={vec(leftLegX, leftSeatY)}
        p2={vec(leftLegX, leftBackY)}
        color="#765034"
        strokeWidth={7}
      />
      <Line
        p1={vec(rightLegX, rightSeatY)}
        p2={vec(rightLegX, rightBackY)}
        color="#765034"
        strokeWidth={7}
      />
      <Line p1={backLeft} p2={backRight} color="#9f7047" strokeWidth={17} />
      <Line p1={seatLeft} p2={seatRight} color="#aa794d" strokeWidth={16} />
    </Group>
  );
}

function FountainGlyph() {
  return (
    <Group>
      <Oval
        x={-58}
        y={-23}
        width={116}
        height={45}
        color="#8e9a91"
        opacity={0.36}
      />
      <Oval x={-51} y={-42} width={102} height={57} color="#c8d0c8" />
      <Oval x={-43} y={-36} width={86} height={43} color="#79c6d9" />
      <RoundedRect
        x={-10}
        y={-75}
        width={20}
        height={50}
        r={7}
        color="#d7ddd5"
      />
      <Circle cx={0} cy={-82} r={18} color="#d9e0d8" />
      <Line
        p1={vec(0, -98)}
        p2={vec(0, -122)}
        color="#8ad5e5"
        strokeWidth={5}
      />
      <Circle cx={0} cy={-126} r={5} color="#a6e2ed" />
    </Group>
  );
}

function AvatarGlyph() {
  return (
    <Group>
      <Oval
        x={-22}
        y={-8}
        width={44}
        height={17}
        color="#5f6f59"
        opacity={0.3}
      />
      <RoundedRect
        x={-20}
        y={-62}
        width={40}
        height={56}
        r={16}
        color="#7fa7c6"
      />
      <Circle cx={0} cy={-79} r={20} color="#f1c6a6" />
      <Oval x={-21} y={-103} width={42} height={31} color="#5b463d" />
      <Circle cx={-7} cy={-80} r={2} color="#4b403d" />
      <Circle cx={7} cy={-80} r={2} color="#4b403d" />
    </Group>
  );
}

function LampGlyph() {
  return (
    <Group>
      <Oval
        x={-24}
        y={-10}
        width={48}
        height={18}
        color="#5b6755"
        opacity={0.3}
      />
      <Rect x={-4} y={-72} width={8} height={68} color="#5d5348" />
      <RoundedRect
        x={-16}
        y={-102}
        width={32}
        height={35}
        r={8}
        color="#f0cb69"
      />
      <RoundedRect
        x={-12}
        y={-98}
        width={24}
        height={27}
        r={6}
        color="#fff0a6"
      />
      <Circle cx={0} cy={-84} r={24} color="#ffe68c" opacity={0.16} />
    </Group>
  );
}

function DecorationGlyph() {
  return (
    <Group>
      <Oval
        x={-38}
        y={-10}
        width={76}
        height={22}
        color="#5e6f57"
        opacity={0.24}
      />
      <RoundedRect
        x={-32}
        y={-68}
        width={64}
        height={58}
        r={14}
        color="#e7c98f"
      />
      <Circle cx={0} cy={-50} r={11} color="#f3b5c4" />
    </Group>
  );
}

function getFallbackGlyph(
  object: GardenObject,
  growthStage: number,
): ReactNode {
  const benchDirection = (object.rotation % 2) as 0 | 1;

  switch (object.kind) {
    case "plant":
      return <PlantGlyph stage={growthStage} />;
    case "tree":
      return <TreeGlyph />;
    case "bench":
      return <BenchGlyph direction={benchDirection} />;
    case "fountain":
      return <FountainGlyph />;
    case "avatar":
      return <AvatarGlyph />;
    case "lamp":
      return <LampGlyph />;
    case "decoration":
      return <DecorationGlyph />;
  }
}

export function GardenObjectNode({
  object,
  item,
  now,
  activeObjectId,
  selectedObjectId,
  dragWorldX,
  dragWorldY,
  activePlacementValid,
}: GardenObjectNodeProps) {
  const anchor = getObjectAnchorWorld(object, item);
  const displayX = useSharedValue(anchor.x);
  const displayY = useSharedValue(anchor.y);

  useEffect(() => {
    displayX.value = withTiming(anchor.x, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    displayY.value = withTiming(anchor.y, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [anchor.x, anchor.y, displayX, displayY]);

  const translation = useDerivedValue(() => {
    const isActive = activeObjectId.value === object.id;
    return [
      { translateX: displayX.value + (isActive ? dragWorldX.value : 0) },
      { translateY: displayY.value + (isActive ? dragWorldY.value : 0) },
    ];
  });
  const selectionOpacity = useDerivedValue(() =>
    activeObjectId.value === object.id || selectedObjectId.value === object.id
      ? 1
      : 0,
  );
  const selectionFillColor = useDerivedValue(() =>
    activeObjectId.value === object.id && !activePlacementValid.value
      ? "#f0aaa0"
      : "#dff4b8",
  );
  const selectionFillOpacity = useDerivedValue(() =>
    activeObjectId.value === object.id ? 0.25 : 0.075,
  );
  const selectionStrokeColor = useDerivedValue(() =>
    activeObjectId.value === object.id && !activePlacementValid.value
      ? "#e57d72"
      : "#f2dc7c",
  );
  const selectionStrokeOpacity = useDerivedValue(() =>
    activeObjectId.value === object.id ? 0.92 : 0.58,
  );
  const objectOpacity = useDerivedValue(() =>
    activeObjectId.value === object.id ? 0.92 : 1,
  );

  const footprintPath = useMemo(() => {
    const points = getFootprintWorldPolygon(object, item);
    return [
      `M ${points[0].x - anchor.x} ${points[0].y - anchor.y}`,
      `L ${points[1].x - anchor.x} ${points[1].y - anchor.y}`,
      `L ${points[2].x - anchor.x} ${points[2].y - anchor.y}`,
      `L ${points[3].x - anchor.x} ${points[3].y - anchor.y}`,
      "Z",
    ].join(" ");
  }, [anchor.x, anchor.y, item, object]);

  const growth = getPlantGrowthStatus(object, item, now);
  const fallback = getFallbackGlyph(object, growth?.stage ?? 0);

  return (
    <Group transform={translation}>
      <Group opacity={selectionOpacity}>
        <Path
          path={footprintPath}
          color={selectionFillColor}
          opacity={selectionFillOpacity}
          style="fill"
        />
        <Path
          path={footprintPath}
          color={selectionStrokeColor}
          opacity={selectionStrokeOpacity}
          style="stroke"
          strokeWidth={3}
        />
      </Group>
      <Group opacity={objectOpacity}>
        {item.spriteId ? (
          <GardenSpriteNode
            spriteId={item.spriteId as GardenSpriteId}
            rotation={object.rotation}
            fallback={fallback}
          />
        ) : (
          fallback
        )}
      </Group>
    </Group>
  );
}
