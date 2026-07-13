# Codex merge instruction — Grace Garden v1.4

Merge this v1.4 package into the currently working React Native repository.

Rules:
1. Treat the live repository as source of truth for app navigation, authentication, native settings and user-specific edits.
2. Replace the old Grace Garden placeable PNG folders with the new files in `src/features/graceGarden/assets`. Do not keep duplicate old art.
3. Merge `assetRegistry.ts`, `catalog.ts`, `GardenToolbar.tsx`, `seed.ts`, `geometry.ts`, validators and tests.
4. Preserve `GARDEN_SCHEMA_VERSION = 1`; do not clear MMKV.
5. Existing `flower_hammock_grounded` saves must render the new `garden_hammock` sprite.
6. Existing `olive_tree` saves must not crash; they may use the Skia fallback until new tree art exists.
7. Run asset validation, layout validation, TypeScript checks and tests.
8. Report any live-repository conflict instead of silently discarding local changes.
