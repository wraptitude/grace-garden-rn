# 恩霖花園 PNG 素材整合 v1.2

呢個版本將已提供嘅童話風 PNG 素材接入 React Native + Skia 花園模組，唔使用 H5 或 WebView。

## 已完成

- 日間藍天背景
- 三層透明雲素材
- 透明浮空島底座
- 花樹、童話長椅、兩款花藤吊床
- 花園水井、花藤圍欄、花園桌椅、盼望燈
- 靜態 `require(...)` 素材 Registry，兼容 Metro bundler
- Skia 圖片渲染、bottom-center anchor、柔和地面陰影
- Toolbar 圖片縮圖
- 舊素材缺失時保留 Skia placeholder，唔會令畫面 crash
- 單方向 PNG 自動停用「轉向」，避免再次出現整張圖打橫問題
- 舊 MMKV schema 保持 version 1，舊位置與存檔毋須清除
- 舊存檔首次載入時會補上新素材 inventory key，但唔會改動已擺放物件

## 接入現有 App

### 方法 A：你現有專案仍接近 Grace Garden v1.1

1. 先備份以下目錄：

```text
src/features/graceGarden/
```

2. 將本包嘅同一路徑覆蓋／合併到現有專案：

```text
src/features/graceGarden/
```

3. 確認新增檔案存在：

```text
src/features/graceGarden/assets/assetRegistry.ts
src/features/graceGarden/components/GardenBackdrop.tsx
src/features/graceGarden/components/GardenSpriteNode.tsx
```

4. 驗證素材：

```bash
node scripts/validate-assets.mjs
```

5. 重新啟動 Metro：

```bash
npx react-native start --reset-cache
```

6. 重新打開 iOS／Android App。今次只改 JS／TS 同 bundled PNG，一般毋須重新 pod install；但如果 Metro 未更新 asset，可重建一次 App。

### 方法 B：你已經自行改過 island 或 canvas

唔好盲目覆蓋 `GraceGardenCanvas.tsx`。保留你現有手勢及 island 對位，逐項 merge：

1. 完整加入 `assets/`。
2. 加入 `assets/assetRegistry.ts`。
3. 加入 `GardenSpriteNode.tsx`。
4. 將 `GardenObjectNode.tsx` 嘅 sprite renderer 合併入現有版本。
5. 將新 catalog item 同 `decoration` kind 合併。
6. 最後先合併 `GardenBackdrop.tsx` 同 camera reset。

## 已接入嘅 Catalog ID

```text
olive_tree                 → 花樹 PNG
flower_bench               → 童話花園長椅 PNG
grace_lamp                 → 盼望燈 PNG
flower_well                → 恩霖水井 PNG
flower_hammock             → 花藤吊床 PNG
flower_hammock_grounded    → 草地花藤吊床 PNG
white_flower_fence         → 白色花藤圍欄 PNG
garden_cafe_set            → 花園咖啡桌椅 PNG
```

## 暫時仍係 placeholder

以下未收到對應正式 PNG，所以保留原有 Skia 圖形：

- 恩典花四個成長階段
- 活水泉／中央噴泉
- Avatar 待機及行走動畫
- 舊版 `wooden_bench` 兩方向示範

## 轉向規則

目前新素材每件只得一個視角，所以全部設為：

```text
rotationMode: "none"
```

呢個係刻意設定，唔係 bug。要開啟轉向，必須另外提供真正畫好嘅方向圖，例如：

```text
flower_bench_ne.png
flower_bench_nw.png
```

唔可以直接將同一張 PNG 旋轉 90°。

## 舊存檔

- `schemaVersion` 仍然係 1。
- 已擺物件嘅 `id`、`catalogId`、`gridX`、`gridY`、`rotation` 不變。
- 新 inventory key 會喺載入舊存檔時加入。
- 想睇全新示範佈局，可以喺開發模式長按「重設示範花園」；此動作會清除目前示範佈局，正式資料唔好隨便使用。

## 完成後應測試

1. 天空、雲、浮空島冇白底或白邊。
2. 花樹、燈、長椅等點擊範圍合理。
3. 拖動後 anchor 仍然貼住格仔底部。
4. 單方向素材冇「轉向」按鈕。
5. 舊版 `wooden_bench` 仍然可以兩方向轉向。
6. 關閉 App 再開，位置仍然保存。
7. iPhone 細屏及較大 Android 屏幕都冇嚴重裁切。
