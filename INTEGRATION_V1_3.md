# 恩霖花園大型島嶼與合理比例整合 v1.3

呢個版本係建基於 v1.2 PNG 素材整合版，重點係：

- 花園由 10 × 10 擴大到 14 × 14。
- 可建造格由 100 增加至 196。
- 島嶼按原比例放大，唔會變形。
- 所有正式 PNG 重新按佔地格調校相對大小。
- Reset Camera 會完整顯示大型島嶼。
- 舊 MMKV 存檔、物件 ID、座標、轉向保持兼容。

## 建議接入方式

你現有 App 已經調整過島嶼位置，唔建議整個資料夾盲目覆蓋。將 v1.3 Patch 交俾 Codex，逐檔合併以下內容：

```text
src/features/graceGarden/assets/assetRegistry.ts
src/features/graceGarden/assets/asset-manifest.json
src/features/graceGarden/components/GraceGardenCanvas.tsx
src/features/graceGarden/engine/geometry.ts
src/features/graceGarden/state/catalog.ts
src/features/graceGarden/state/seed.ts
scripts/validate-layout.mjs
tests/run.ts
```

## 合併後執行

```bash
node scripts/validate-assets.mjs
node scripts/validate-layout.mjs
npx tsx tests/run.ts
npx react-native start --reset-cache
```

## 手機測試清單

1. Reset Camera 可以見到完整島嶼，左右冇被裁走。
2. 花園有 14 × 14 格，新增物件可以放到原本 10 × 10 以外位置。
3. 樹、水井、吊床、長椅、燈、圍欄、咖啡桌比例自然。
4. 物件唔會因素材原圖尺寸唔同而忽大忽細。
5. 點擊範圍跟物件一致，細燈仍然容易選中。
6. 拖動、碰撞、存檔、重新開 App 後位置正常。
7. 舊長椅兩方向轉向功能仍然正常。
8. 單方向 PNG 仍然唔顯示假旋轉。

## 重要

v1.3 只改 JS／TS、JSON 同 layout；冇增加 native dependency，通常唔需要重新 pod install。
