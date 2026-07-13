# Grace Garden v2.0 Verification

## 已執行

### 邏輯測試

```bash
npx tsx tests/run.ts
```

結果：18 個測試通過，包括：

- Isometric 正反座標
- 16×16／256 格佈局
- 浮島世界映射
- Overview camera 鎖定
- Focus camera 邊界
- 碰撞與越界
- 固定噴泉不可佔用／轉向
- 新物件 staging placement
- 拖動期間碰撞 preview
- 植物成長
- 舊長椅 rotation 兼容
- 舊存檔 migration
- 逐件 anchor／grounding metadata

### Asset validation

```bash
node scripts/validate-assets.mjs
```

結果：23 個場景素材／縮圖通過 PNG、尺寸及 alpha 檢查。

### Layout validation

```bash
node scripts/validate-layout.mjs
```

結果：16×16、256 cells、8 個正式 placeable asset metrics 通過。

### TypeScript

以已驗證依賴組合執行 strict source-level type check，通過。

### Bundle syntax

```bash
npx esbuild src/features/graceGarden/index.ts \
  --bundle --platform=node --packages=external \
  --loader:.png=dataurl \
  --outfile=/tmp/grace-garden-v2.bundle.js
```

通過。

## 未聲稱完成

- 未在使用者目前完整 WalkWithChrist repository 跑 Xcode／Gradle build。
- 未取得實際 Metro warning 原文，因此無法聲稱已修正宿主 App 原有 warning。
- 預覽圖係 source/assets composition，唔係真機截圖。
- 未進行長時間記憶體／低階 Android 效能測試。
