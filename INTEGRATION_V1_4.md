# Grace Garden v1.4 integration

Use this package as a merge source for the current React Native repository. Do not blindly overwrite app-level navigation or authentication code.

## New asset folders

```text
src/features/graceGarden/assets/
├── terrain/islands/floating_island_base.png
├── decorations/seating/garden_bench.png
├── decorations/seating/garden_hammock.png
├── decorations/lighting/garden_lamp.png
├── decorations/water/garden_well.png
├── decorations/water/grace_fountain.png
├── decorations/structures/garden_arch.png
├── decorations/boundaries/garden_fence.png
├── decorations/dining/garden_patio_set.png
└── thumbnails/
```

All placeable art and the island are real RGBA PNGs. The previous placeable PNG files are intentionally absent.

## After merging

```bash
node scripts/validate-assets.mjs
node scripts/validate-layout.mjs
npx react-native start --reset-cache
```

Existing MMKV saves do not need to be cleared.
