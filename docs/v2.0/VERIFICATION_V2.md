# Grace Garden v2.0 Verification

驗證日期：2026-07-12

## 素材

```text
✓ 23 個場景／物件／縮圖 PNG 通過格式驗證
✓ 浮島 Base／Front／Shadow 有獨立 Alpha
✓ 8 件正式可擺放 PNG 有 Ground Anchor metadata
✓ 16 × 16／256 cells Manifest 一致
```

## 純邏輯測試

```text
✓ Isometric 正反轉換
✓ 固定噴泉碰撞
✓ 16 × 16 邊界
✓ 島嶼與 Board mapping
✓ Overview camera 固定置中
✓ Focus camera bounded zoom
✓ 最後合法 2×2 位置
✓ 超界拒絕
✓ 新物件 staging placement
✓ Drag preview 與正式 collision 一致
✓ 植物澆水時間
✓ Fixed landmark 不可轉向
✓ 舊長椅兩方向兼容
✓ 長椅可逆轉向位置
✓ 壞存檔安全 migration
✓ Malformed fields 清理
✓ 正式 PNG Ground Anchor 範圍
✓ 單方向 PNG 禁止假旋轉
```

合共 18 個核心測試通過。

## TypeScript／Syntax

- 純邏輯以 strict TypeScript 編譯。
- 全部 TS／TSX 使用依賴型別 stub 完成 `tsc --noEmit` 結構檢查，確認 local props、imports、JSX 及語法一致。
- 最終仍要喺實際 Walk With Christ repository 使用其真實 node_modules 執行正式 typecheck 及 native build。

## 命令

```bash
node scripts/validate-assets.mjs
node scripts/validate-layout.mjs
rm -rf .test-build
tsc -p tsconfig.tests.json
node .test-build/tests/run.js
```
