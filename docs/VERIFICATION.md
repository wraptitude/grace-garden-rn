# 驗證紀錄

驗證日期：2026-07-11
版本：v1.1（Isometric 轉向修正）

## 1. 純邏輯測試

```bash
npx tsx tests/run.ts
```

結果：

```text
✓ isometric conversion round-trips
✓ collision rejects occupied cell
✓ collision rejects garden boundary overflow
✓ watering advances effective plant growth
✓ upright symmetric objects do not expose rotation
✓ bench uses two isometric directions instead of four screen rotations
✓ bench rotation chooses a nearby reversible grid origin
✓ invalid save safely migrates to seed data
✓ migration sanitizes malformed fields without trusting stored userId

All Grace Garden engine tests passed.
```

## 2. Source bundle syntax check

已由 `src/features/graceGarden/index.ts` 開始，將全部本地 import bundle，並將 React Native 第三方套件標記為 external；結果通過。

```bash
npx esbuild src/features/graceGarden/index.ts \
  --bundle \
  --platform=node \
  --packages=external \
  --outfile=/tmp/grace-garden-v1.1.bundle.js
```

## 3. v1.1 修正範圍

- 不再將完整直立 glyph 旋轉 90°。
- 長椅以兩條 Isometric 地面軸繪製。
- 非方向性物件不顯示轉向按鈕。
- 2x1／1x2 footprint 轉向採用鄰近合法格仔，減少跳位。
- 舊 v1 MMKV 存檔毋須清除。

## 尚未聲稱完成嘅測試

由於 Starter Kit 未合併入實際 Walk With Christ repository，以下仍要喺正式 App 做：

- iOS CocoaPods build
- Android Gradle／NDK build
- 真機／Simulator 轉向手感及動畫測試
- 現有 navigation、登入 store、theme、API endpoint 整合
- App Store／Play Store release build
