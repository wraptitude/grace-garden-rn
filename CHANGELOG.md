# Changelog

## v2.0 — Placement Game Quality Reset

- Rebuilt the garden as a fullscreen scene with floating HUD, collapsible placement drawer, and compact selection controls.
- Added centered overview, smooth per-object focus, pinch zoom, bounded inspection pan, and deterministic camera reset.
- Split the island into soft shadow, base, surface accents, and foreground occlusion layers.
- Added per-asset size, ground anchor, contact-shadow, focus, and depth-order metrics for all eight production PNG objects.
- Added soft edit-only grid, green/red footprint collision preview, invalid-drop rollback, and animated grid snapping.
- Added curated fountain/arch/well/bench/lamp seed composition and staging-area placement without placeholder art.
- Preserved MMKV schema v1 and existing object, catalog, coordinate, rotation, inventory, and coin data.
- Fixed `isoToWorld` for UI-runtime use after simulator validation exposed a Worklets remote-function error.
- Added v2 asset/layout/camera/placement/grounding tests plus iPhone screenshots and cloud-motion capture.

## v1.5 — Camera, Scale, Grounding & Cloud Motion Polish

- Replaced free camera drift with a centered 1.0× fit view and clamped 2.2× zoom.
- Enabled limited panning only above 1.15× while keeping the island on-screen.
- Hid the garden grid in normal mode and retained a soft outline grid for editing.
- Applied the requested +15% to +28% display scale increases to all eight 3D PNG placeables.
- Standardized bottom-center anchors, per-asset ground offsets, and soft contact shadows.
- Added seamless 100s/70s/45s back, mid, and front cloud parallax loops.
- Added subtle sky vignette, atmospheric haze, island depth, and fountain glow.
- Preserved MMKV schema v1 and all saved object/catalog/grid/rotation fields.
- Added camera clamp, scale mapping, and grounded-positioning tests.

## v1.4 — 3D Pastel Asset Refresh

- Replaced the previous placeable PNG artwork with one consistent 3D pastel set.
- Replaced the floating island with the latest larger grass island.
- Converted all nine supplied images to true RGBA PNGs; fake checkerboard backgrounds and detached shadows were removed.
- Added the flower arch and the finished three-tier fountain.
- Expanded the buildable board from 14 × 14 to 16 × 16 (256 cells).
- Preserved save schema v1. Existing grid coordinates remain valid.
- Old grounded-hammock saves reuse the new hammock image.
- The old tree PNG was removed; old tree objects use the safe Skia fallback until new tree art is supplied.
