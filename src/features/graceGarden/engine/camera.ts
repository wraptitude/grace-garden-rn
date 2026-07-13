import type { WorldPoint, WorldRect } from "./geometry";
import { clamp } from "./geometry";

export interface CameraInsets {
  top: number;
  bottom: number;
  horizontal: number;
}

export interface CameraFrame {
  x: number;
  y: number;
  scale: number;
}

export interface CameraViewport {
  width: number;
  height: number;
  insets: CameraInsets;
}

export const DEFAULT_CAMERA_INSETS: CameraInsets = {
  top: 76,
  bottom: 92,
  horizontal: 16,
};

function safeSize(viewport: CameraViewport) {
  "worklet";
  return {
    width: Math.max(1, viewport.width - viewport.insets.horizontal * 2),
    height: Math.max(
      1,
      viewport.height - viewport.insets.top - viewport.insets.bottom,
    ),
  };
}

export function getCenteredCamera(
  viewport: CameraViewport,
  worldRect: WorldRect,
  scale: number,
): CameraFrame {
  "worklet";
  const safe = safeSize(viewport);
  const targetX = viewport.insets.horizontal + safe.width / 2;
  const targetY = viewport.insets.top + safe.height * 0.49;
  const worldCenterX = worldRect.x + worldRect.width / 2;
  const worldCenterY = worldRect.y + worldRect.height / 2;
  return {
    x: targetX - worldCenterX * scale,
    y: targetY - worldCenterY * scale,
    scale,
  };
}

export function computeOverviewCamera(
  viewport: CameraViewport,
  worldRect: WorldRect,
): CameraFrame {
  "worklet";
  const safe = safeSize(viewport);
  const fitScale = Math.min(
    safe.width / worldRect.width,
    safe.height / worldRect.height,
  );
  return getCenteredCamera(viewport, worldRect, fitScale * 0.975);
}

export function getMaximumCameraScale(overviewScale: number): number {
  "worklet";
  return Math.min(1.2, Math.max(overviewScale * 3.15, overviewScale));
}

/**
 * Keeps the island visually anchored. At overview scale it is forced back to
 * the exact centred frame; zoomed views may pan only inside a bounded window.
 */
export function clampCameraFrame(
  candidate: CameraFrame,
  viewport: CameraViewport,
  worldRect: WorldRect,
  overviewScale: number,
): CameraFrame {
  "worklet";
  const scale = clamp(
    candidate.scale,
    overviewScale,
    getMaximumCameraScale(overviewScale),
  );
  const centered = getCenteredCamera(viewport, worldRect, scale);
  if (scale <= overviewScale * 1.025) {
    return centered;
  }

  const safe = safeSize(viewport);
  const scaledWidth = worldRect.width * scale;
  const scaledHeight = worldRect.height * scale;
  const zoomProgress = clamp(
    (scale / overviewScale - 1) / 1.35,
    0,
    1,
  );
  // Keep a generous section of the island visible even at maximum zoom. This
  // prevents the free-floating world feeling seen in v1.4.
  const maxPanX =
    Math.max(0, (scaledWidth - safe.width) / 2) * 0.76 * zoomProgress;
  const maxPanY =
    Math.max(0, (scaledHeight - safe.height) / 2) * 0.68 * zoomProgress;

  return {
    x: clamp(candidate.x, centered.x - maxPanX, centered.x + maxPanX),
    y: clamp(candidate.y, centered.y - maxPanY, centered.y + maxPanY),
    scale,
  };
}

export function computeFocusCamera(
  viewport: CameraViewport,
  worldRect: WorldRect,
  target: WorldPoint,
  overviewScale: number,
  zoomMultiplier: number,
  focusLift: number,
): CameraFrame {
  "worklet";
  const safe = safeSize(viewport);
  const scale = clamp(
    overviewScale * zoomMultiplier,
    overviewScale * 1.55,
    getMaximumCameraScale(overviewScale),
  );
  const screenX = viewport.insets.horizontal + safe.width / 2;
  const screenY = viewport.insets.top + safe.height * 0.55;
  return clampCameraFrame(
    {
      x: screenX - target.x * scale,
      y: screenY - (target.y - focusLift) * scale,
      scale,
    },
    viewport,
    worldRect,
    overviewScale,
  );
}
