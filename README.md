# 恩霖花園 React Native Starter Kit

## 本地運行

呢個資料夾已加入 React Native 0.86 原生 host，可以直接運行：

```bash
npm install
npm start
```

另開一個 terminal，再啟動平台：

```bash
npm run ios
# 或
npm run android
```

Metro 使用 `8082`，避免同工作區內已佔用 `8081` 嘅其他 React Native 專案衝突。完整驗證可執行 `npm run verify`。

**版本：v2.0（Placement Game Quality Reset）**

v2.0 將花園重整成全屏 placement game：完整島嶼 overview 固定置中，選取物件會平滑 focus，pinch 後只容許 bounded pan；島嶼加入 shadow／base／front-occlusion 三層，八件正式 PNG 使用獨立比例、ground anchor、focus 與陰影 metrics，另有 placement footprint、可收合素材列，以及 100／70／45 秒三層雲 parallax motion。MMKV schema 仍然保持 v1，既有 object id、catalogId、gridX/gridY、rotation、inventory 同 coins 不變。

呢套 Starter Kit 係為 **Walk With Christ／恩霖花園** 準備嘅 React Native 原生方案：

- 不使用 H5
- 不使用 WebView
- 花園主場景由 React Native Skia 繪製
- 手勢由 React Native Gesture Handler + Reanimated／Worklets 處理
- 狀態由 Zustand 管理
- 本機存檔由 MMKV 管理
- 預留後端同步接口

目前已接入童話風天空、動態雲、透明浮空島、中央噴泉同多件花園 PNG。未有正式素材嘅植物成長同 Avatar 仍保留 Skia fallback 供舊存檔兼容，但唔會出現喺 v2.0 新 seed 或素材列。

## 已完成嘅功能

- 島形 Isometric 花園地圖（668 個可建造格），格線延伸至左右草地並貼合完整島面
- 預設完整島嶼置中，overview 正常模式不可自由拖走
- 雙指縮放、選取物件自動 focus，以及 zoom 後有限度 bounded pan
- Reset Camera 返回完整島嶼 overview
- 島嶼 shadow／base／foreground lip 分層，前緣可正確遮擋物件腳位
- 正常模式隱藏 grid，選取／佈置時顯示柔和 grid
- 三層無縫雲朵 parallax motion
- 點擊選取物件
- 拖放物件顯示綠／紅 footprint preview，合法位置自動吸附格子
- 碰撞及花園邊界檢查
- 植物四階段成長
- 澆水加速及成熟收成
- 放置花、樹、長椅、吊床、水井、圍欄、咖啡桌椅同燈
- 可定向物件按 Isometric 格線轉向、收回背包
- 金幣、背包及示範存檔
- MMKV 按 `userId` 分開保存
- Schema migration 基礎
- 後端同步 contract 及 conflict policy 範本
- PNG 圖片 renderer、每件 asset 獨立 ground anchor／scale／shadow／focus metrics

## 已驗證運行組合

2026-07-11 已用以下版本完成 TypeScript strict check：

- React Native 0.86.0
- React 19.2.7
- React Native Gesture Handler 3.0.2
- React Native Reanimated 4.5.1
- React Native Worklets 0.10.2
- React Native Skia 2.6.9
- Zustand 5.0.14
- react-native-mmkv 4.3.2
- react-native-nitro-modules 0.36.1

**唔好未睇現有 App 版本就直接升級套件。** 詳細相容性見 `docs/COMPATIBILITY.md`。

## 放入現有 App

1. 先跟 `INSTALL.md` 核對 React Native 及依賴版本。
2. 複製 `src/features/graceGarden` 到現有專案嘅 `src/features/`。
3. App 最外層包住 `GestureHandlerRootView`，參考 `App.example.tsx`。
4. 將 `GraceGardenScreen` 加入 navigation。
5. 傳入登入用戶嘅真正 `userId`。

```tsx
import { GraceGardenScreen } from "./src/features/graceGarden";

export function GardenRoute() {
  return <GraceGardenScreen userId="current-user-id" />;
}
```

## 資料流

```text
GraceGardenScreen
  ├─ GraceGardenCanvas（Skia）
  │   ├─ Isometric Grid
  │   ├─ Object Renderer
  │   └─ UI-thread gestures
  ├─ GardenToolbar（React Native UI）
  └─ SelectedObjectPanel（React Native UI）

Zustand Store
  ├─ GardenSaveV1
  ├─ Placement / Collision
  ├─ Growth / Harvest
  ├─ Inventory
  └─ MMKV persistence

Garden Sync Port
  └─ 可接現有後端 API
```

## 主要檔案

```text
src/features/graceGarden/
├── GraceGardenScreen.tsx
├── components/
│   ├── GraceGardenCanvas.tsx
│   ├── GardenGrid.tsx
│   ├── GardenObjectNode.tsx
│   ├── GardenSurfaceAccents.tsx
│   ├── GardenToolbar.tsx
│   ├── PlacementFootprintOverlay.tsx
│   └── SelectedObjectPanel.tsx
├── engine/
│   ├── geometry.ts
│   ├── collision.ts
│   ├── hitTest.ts
│   ├── sorting.ts
│   ├── rotation.ts
│   └── growth.ts
├── state/
│   ├── types.ts
│   ├── catalog.ts
│   ├── seed.ts
│   ├── migrations.ts
│   └── useGardenStore.ts
├── storage/
│   ├── mmkvGardenStorage.ts
│   └── memoryGardenStorage.ts
└── sync/
    ├── types.ts
    └── gardenSync.ts
```

## 測試純遊戲邏輯

```bash
npx tsx tests/run.ts
```

驗證詳情見 `docs/VERIFICATION.md` 同 `docs/v2.0/IMPLEMENTATION_REPORT.md`。

## 正式美術素材

目前已接入部分透明 PNG，仍可逐步擴充：

- 透明 PNG
- Sprite sheet
- Skia Image Atlas
- 角色分層換裝圖
- 粒子、光影及水面效果

規格見 `docs/ASSET_GUIDE.md`。

## 重要界線

呢個係可接入嘅 **MVP 核心框架**，未包含：

- 完整植物四階段、中央噴泉同 Avatar 正式素材
- 真正角色尋路及行走動畫
- 商店付款
- 即時多人
- 你現有後端嘅實際 endpoint／token
- 與現有 navigation、登入 store、設計系統嘅直接接線

以上部分已預留資料結構或接口，但要根據正式 Walk With Christ repository 完成整合。

---

## v1.4 大型島嶼與相對比例整合

本資料夾已包括童話風天空、雲、浮空島及多件透明 PNG 花園物件，並已接入 Skia renderer。請先閱讀：

- `INTEGRATION_V1_3.md`
- `CODEX_APPLY_PROMPT.md`
- `docs/SCALE_AND_CAPACITY_V1_3.md`
- `docs/LAYOUT_SCALE_PREVIEW_V1_3.png`

驗證素材：

```bash
node scripts/validate-assets.mjs
node scripts/validate-layout.mjs
```
