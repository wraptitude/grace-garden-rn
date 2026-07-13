# 交俾 Codex 嘅 v1.3 合併指令

```text
請將「Grace Garden v1.3 Large Island & Relative Scale」合併入目前 WalkWithChrist React Native repository。

背景：
- 現有 App 已成功運行 Grace Garden v1.2。
- PNG 素材已經放入 repository。
- 使用者曾自行調整 island、camera 或 canvas，所以現有 repository 係 source of truth。

目標：
1. 花園由 10×10 擴大到 14×14，共 196 個可建造格。
2. 島嶼使用 1800×1248 world rect，保持原圖比例，不可 stretch。
3. Reset Camera 必須完整顯示島嶼。
4. 合併 assetRegistry.ts 入面已校準嘅各物件 worldWidth/worldHeight、anchor 同 shadow。
5. 合併 catalog.ts 入面相應 hitWidth/hitHeight。
6. 不可改動現有素材檔案內容或製造假透明背景。
7. 不可將單方向 PNG 旋轉 90 度。
8. 保留 MMKV schema version 1、object id、catalogId、gridX、gridY、rotation。
9. 舊 10×10 存檔必須直接喺 14×14 花園繼續使用，不可清除資料。
10. 保留現有 gesture、拖放、縮放、碰撞同舊 wooden_bench 轉向功能。
11. 若現有 GraceGardenCanvas 已有更好嘅 camera clamp，保留現有 clamp，只合併新 fit scale 與 island rect。
12. Grid 普通模式保持非常淡；選中物件時先較清楚顯示。

必須執行：
- node scripts/validate-assets.mjs
- node scripts/validate-layout.mjs
- 現有 TypeScript check
- npx tsx tests/run.ts（或 repository 既有 test command）
- iOS simulator 或 Android emulator build

完成後提供：
- 實際修改檔案清單
- 14×14 grid 與 196 cells 驗證結果
- 各物件最終顯示尺寸
- iPhone screenshot
- 所有 warning / error 及其修正

唔可以只覆蓋整個 graceGarden 資料夾；必須逐檔 merge，避免破壞使用者已調整嘅 island 對位。
```
