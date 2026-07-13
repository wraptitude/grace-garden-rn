import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import {
  GestureDetector,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from "react-native-gesture-handler";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  FLOATING_ISLAND_WORLD_RECT,
  getGardenSpriteAsset,
} from "../assets/assetRegistry";
import {
  clampCameraFrame,
  computeFocusCamera,
  computeOverviewCamera,
  type CameraViewport,
} from "../engine/camera";
import {
  buildCellOccupantIndex,
  isPlacementValidFromCellIndex,
} from "../engine/collision";
import {
  screenToWorld,
  snapGrid,
  worldDeltaToGridDelta,
} from "../engine/geometry";
import { buildHitTargets, hitTestTargets } from "../engine/hitTest";
import { sortGardenObjects } from "../engine/sorting";
import { getCatalogItem } from "../state/catalog";
import { useGardenStore } from "../state/useGardenStore";
import {
  FloatingIslandBaseLayer,
  FloatingIslandForegroundLayer,
  GardenScreenBackdrop,
} from "./GardenBackdrop";
import { GardenGrid } from "./GardenGrid";
import { GardenSurfaceAccents } from "./GardenSurfaceAccents";
import { GardenObjectNode } from "./GardenObjectNode";
import { PlacementFootprintOverlay } from "./PlacementFootprintOverlay";

interface GraceGardenCanvasProps {
  now: number;
  cameraResetSignal: number;
  editing?: boolean;
  topViewportInset?: number;
  bottomViewportInset?: number;
}

function makeViewport(
  width: number,
  height: number,
  top: number,
  bottom: number,
): CameraViewport {
  "worklet";
  return {
    width,
    height,
    insets: { top, bottom, horizontal: 14 },
  };
}

export function GraceGardenCanvas({
  now,
  cameraResetSignal,
  editing = false,
  topViewportInset = 76,
  bottomViewportInset = 92,
}: GraceGardenCanvasProps) {
  const objects = useGardenStore((state) => state.garden.objects);
  const selectedObjectId = useGardenStore((state) => state.selectedObjectId);
  const selectObject = useGardenStore((state) => state.selectObject);
  const moveObject = useGardenStore((state) => state.moveObject);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const didInitializeCamera = useRef(false);

  const cameraX = useSharedValue(0);
  const cameraY = useSharedValue(0);
  const cameraScale = useSharedValue(0.2);
  const overviewX = useSharedValue(0);
  const overviewY = useSharedValue(0);
  const overviewScale = useSharedValue(0.2);
  const isPinching = useSharedValue(false);
  const lastPinchFocalX = useSharedValue(0);
  const lastPinchFocalY = useSharedValue(0);
  const isCameraPanning = useSharedValue(false);

  const activeObjectId = useSharedValue<string | null>(null);
  const activeStartGridX = useSharedValue(0);
  const activeStartGridY = useSharedValue(0);
  const activeGridX = useSharedValue(0);
  const activeGridY = useSharedValue(0);
  const activeFootprintWidth = useSharedValue(1);
  const activeFootprintHeight = useSharedValue(1);
  const activeBlocksPlacement = useSharedValue(true);
  const activePlacementValid = useSharedValue(true);
  const dragWorldX = useSharedValue(0);
  const dragWorldY = useSharedValue(0);
  const selectedObjectIdShared = useSharedValue<string | null>(null);

  const sortedObjects = useMemo(() => sortGardenObjects(objects), [objects]);
  const hitTargets = useMemo(() => buildHitTargets(objects), [objects]);
  const cellOccupants = useMemo(() => buildCellOccupantIndex(objects), [objects]);
  const viewport = useMemo(
    () =>
      makeViewport(
        canvasSize.width,
        canvasSize.height,
        topViewportInset,
        bottomViewportInset,
      ),
    [
      bottomViewportInset,
      canvasSize.height,
      canvasSize.width,
      topViewportInset,
    ],
  );

  useEffect(() => {
    selectedObjectIdShared.value = selectedObjectId;
  }, [selectedObjectId, selectedObjectIdShared]);

  const applyFrame = useCallback(
    (frame: { x: number; y: number; scale: number }, animated: boolean) => {
      if (animated) {
        const config = { duration: 360, easing: Easing.out(Easing.cubic) };
        cameraX.value = withTiming(frame.x, config);
        cameraY.value = withTiming(frame.y, config);
        cameraScale.value = withTiming(frame.scale, config);
      } else {
        cameraX.value = frame.x;
        cameraY.value = frame.y;
        cameraScale.value = frame.scale;
      }
    },
    [cameraScale, cameraX, cameraY],
  );

  const resetCamera = useCallback(
    (animated = true) => {
      if (canvasSize.width <= 0 || canvasSize.height <= 0) return;
      const frame = computeOverviewCamera(viewport, FLOATING_ISLAND_WORLD_RECT);
      overviewX.value = frame.x;
      overviewY.value = frame.y;
      overviewScale.value = frame.scale;
      applyFrame(frame, animated);
    }, [
      applyFrame,
      canvasSize.height,
      canvasSize.width,
      overviewScale,
      overviewX,
      overviewY,
      viewport,
    ],
  );

  useEffect(() => {
    if (!didInitializeCamera.current && canvasSize.width > 0) {
      didInitializeCamera.current = true;
      resetCamera(false);
    } else if (didInitializeCamera.current && canvasSize.width > 0) {
      // Keep the island centred when the toolbar opens/closes or orientation
      // changes. Selection focus is restored by the effect below.
      resetCamera(false);
    }
  }, [canvasSize.width, canvasSize.height, viewport, resetCamera]);

  useEffect(() => {
    if (didInitializeCamera.current) resetCamera(true);
  }, [cameraResetSignal, resetCamera]);

  useEffect(() => {
    if (!didInitializeCamera.current || canvasSize.width <= 0) return;
    if (!selectedObjectId) {
      resetCamera(true);
      return;
    }
    const object = objects.find((value) => value.id === selectedObjectId);
    if (!object) return;
    const item = getCatalogItem(object.catalogId);
    if (!item) return;
    const anchor = hitTargets.find((target) => target.id === object.id);
    if (!anchor) return;
    const sprite = getGardenSpriteAsset(item.spriteId);
    const frame = computeFocusCamera(
      viewport,
      FLOATING_ISLAND_WORLD_RECT,
      { x: anchor.anchorX, y: anchor.anchorY },
      overviewScale.value,
      sprite?.focusZoom ?? 1.85,
      sprite?.focusLift ?? Math.min(item.hitHeight * 0.42, 110),
    );
    applyFrame(frame, true);
  }, [
    applyFrame,
    canvasSize.width,
    hitTargets,
    objects,
    overviewScale,
    resetCamera,
    selectedObjectId,
    viewport,
  ]);

  const selectOnRN = useCallback(
    (objectId: string | null) => selectObject(objectId),
    [selectObject],
  );

  const commitMoveOnRN = useCallback(
    (objectId: string, gridX: number, gridY: number) => {
      moveObject(objectId, gridX, gridY);
    },
    [moveObject],
  );

  const tapGesture = useTapGesture({
    maxDuration: 260,
    onDeactivate: (event) => {
      if (event.canceled || isPinching.value) return;
      const world = screenToWorld(
        event.x,
        event.y,
        cameraX.value,
        cameraY.value,
        cameraScale.value,
      );
      const target = hitTestTargets(hitTargets, world.x, world.y);
      scheduleOnRN(selectOnRN, target?.id ?? null);
    },
  });

  const panGesture = usePanGesture({
    minDistance: 4,
    maxPointers: 1,
    averageTouches: true,
    onBegin: (event) => {
      const world = screenToWorld(
        event.x,
        event.y,
        cameraX.value,
        cameraY.value,
        cameraScale.value,
      );
      const target = hitTestTargets(hitTargets, world.x, world.y);

      // A high-quality placement flow uses two steps: first select/focus, then
      // drag. This prevents tiny overview objects from moving accidentally.
      if (target) {
        isCameraPanning.value = false;
        if (target.draggable && selectedObjectIdShared.value === target.id) {
          activeObjectId.value = target.id;
          activeStartGridX.value = target.gridX;
          activeStartGridY.value = target.gridY;
          activeGridX.value = target.gridX;
          activeGridY.value = target.gridY;
          activeFootprintWidth.value = target.footprintWidth;
          activeFootprintHeight.value = target.footprintHeight;
          activeBlocksPlacement.value = target.blocksPlacement;
          activePlacementValid.value = true;
          dragWorldX.value = 0;
          dragWorldY.value = 0;
        } else {
          activeObjectId.value = null;
          scheduleOnRN(selectOnRN, target.id);
        }
        return;
      }

      activeObjectId.value = null;
      // Overview remains locked. Once zoomed in, empty-space dragging pans only
      // inside the clamped island frame so the world can never be lost.
      isCameraPanning.value =
        cameraScale.value > overviewScale.value * 1.025;
    },
    onUpdate: (event) => {
      if (isPinching.value) return;

      if (activeObjectId.value) {
        dragWorldX.value += event.changeX / cameraScale.value;
        dragWorldY.value += event.changeY / cameraScale.value;
        const gridDelta = worldDeltaToGridDelta(
          dragWorldX.value,
          dragWorldY.value,
        );
        const gridX = snapGrid(activeStartGridX.value + gridDelta.x);
        const gridY = snapGrid(activeStartGridY.value + gridDelta.y);
        activeGridX.value = gridX;
        activeGridY.value = gridY;
        activePlacementValid.value =
          !activeBlocksPlacement.value ||
          isPlacementValidFromCellIndex(
            gridX,
            gridY,
            activeFootprintWidth.value,
            activeFootprintHeight.value,
            activeObjectId.value ?? "",
            cellOccupants,
          );
        return;
      }

      if (isCameraPanning.value) {
        const candidate = clampCameraFrame(
          {
            x: cameraX.value + event.changeX,
            y: cameraY.value + event.changeY,
            scale: cameraScale.value,
          },
          makeViewport(
            canvasSize.width,
            canvasSize.height,
            topViewportInset,
            bottomViewportInset,
          ),
          FLOATING_ISLAND_WORLD_RECT,
          overviewScale.value,
        );
        cameraX.value = candidate.x;
        cameraY.value = candidate.y;
      }
    },
    onDeactivate: (event) => {
      const objectId = activeObjectId.value;
      if (!event.canceled && objectId && activePlacementValid.value) {
        scheduleOnRN(
          commitMoveOnRN,
          objectId,
          activeGridX.value,
          activeGridY.value,
        );
      }
      activeObjectId.value = null;
      activePlacementValid.value = true;
      dragWorldX.value = 0;
      dragWorldY.value = 0;
      isCameraPanning.value = false;
    },
    onFinalize: () => {
      activeObjectId.value = null;
      activePlacementValid.value = true;
      dragWorldX.value = 0;
      dragWorldY.value = 0;
      isCameraPanning.value = false;
    },
  });

  const pinchGesture = usePinchGesture({
    onActivate: (event) => {
      isPinching.value = true;
      isCameraPanning.value = false;
      activeObjectId.value = null;
      dragWorldX.value = 0;
      dragWorldY.value = 0;
      lastPinchFocalX.value = event.focalX;
      lastPinchFocalY.value = event.focalY;
    },
    onUpdate: (event) => {
      const oldScale = cameraScale.value;
      const movedX = event.focalX - lastPinchFocalX.value;
      const movedY = event.focalY - lastPinchFocalY.value;
      const translatedX = cameraX.value + movedX;
      const translatedY = cameraY.value + movedY;
      const newScale = oldScale * event.scaleChange;
      const focalWorldX = (event.focalX - translatedX) / oldScale;
      const focalWorldY = (event.focalY - translatedY) / oldScale;
      const candidate = clampCameraFrame(
        {
          x: event.focalX - focalWorldX * newScale,
          y: event.focalY - focalWorldY * newScale,
          scale: newScale,
        },
        makeViewport(
          canvasSize.width,
          canvasSize.height,
          topViewportInset,
          bottomViewportInset,
        ),
        FLOATING_ISLAND_WORLD_RECT,
        overviewScale.value,
      );
      cameraX.value = candidate.x;
      cameraY.value = candidate.y;
      cameraScale.value = candidate.scale;
      lastPinchFocalX.value = event.focalX;
      lastPinchFocalY.value = event.focalY;
    },
    onDeactivate: () => {
      isPinching.value = false;
    },
    onFinalize: () => {
      isPinching.value = false;
    },
  });

  const gesture = useSimultaneousGestures(panGesture, pinchGesture, tapGesture);
  const translateTransform = useDerivedValue(() => [
    { translateX: cameraX.value },
    { translateY: cameraY.value },
  ]);
  const scaleTransform = useDerivedValue(() => [{ scale: cameraScale.value }]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.container} onLayout={handleLayout}>
        <Canvas style={StyleSheet.absoluteFill}>
          <GardenScreenBackdrop width={canvasSize.width} height={canvasSize.height} />
          <Group transform={translateTransform}>
            <Group transform={scaleTransform}>
              <FloatingIslandBaseLayer />
              <GardenSurfaceAccents />
              <GardenGrid opacity={editing || selectedObjectId ? 0.14 : 0} />
              <PlacementFootprintOverlay
                activeObjectId={activeObjectId}
                gridX={activeGridX}
                gridY={activeGridY}
                footprintWidth={activeFootprintWidth}
                footprintHeight={activeFootprintHeight}
                valid={activePlacementValid}
              />
              {sortedObjects.map((object) => {
                const item = getCatalogItem(object.catalogId);
                return item ? (
                  <GardenObjectNode
                    key={object.id}
                    object={object}
                    item={item}
                    now={now}
                    activeObjectId={activeObjectId}
                    selectedObjectId={selectedObjectIdShared}
                    dragWorldX={dragWorldX}
                    dragWorldY={dragWorldY}
                    activePlacementValid={activePlacementValid}
                  />
                ) : null;
              })}
              <FloatingIslandForegroundLayer />
            </Group>
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#bfe8fb",
  },
});
