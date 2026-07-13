# Grace Garden v2.0 — Quality Reset 設計審查與解法

## 問題 → 實作解法

| 原本問題 | v2.0 解法 |
|---|---|
| 全島顯示令物件細到睇唔清 | 全景＋物件自動聚焦兩級相機 |
| 成個島可以四圍拖走 | 全景鎖定；Zoom 後只容許 bounded pan |
| PNG 好似浮喺草地 | 個別 ground anchor、接觸陰影、底部校準 |
| 島同物件似貼紙疊圖 | 島拆 Base／Shadow／Front occlusion 三層 |
| 物件全部堆中央 | 初始品質構圖＋偏離中央 staging placement |
| 永久顯示格仔 | 平時隱藏，只在佈置／拖動時顯示 |
| 放置冇高質回饋 | 綠／紅 footprint、碰撞預覽、平滑吸附 |
| 畫面似普通 RN App | 全屏 Canvas、浮動 HUD、收合式物件抽屜 |
| 雲層冇生命感 | 三層不同速度、方向、透明度及上下浮動 |
| Placeholder 拉低品質 | 品質基準場景暫時隱藏未匹配素材 |

## 相機規則

- Overview：完整浮島固定置中。
- Focus：選中物件後約 1.9–2.25 倍 overview scale。
- Pinch：可放大至 overview 約 3.15 倍，上限 1.2 world scale。
- Pan：只隨 pinch 焦點有限度移動。
- Reset：清除選取並返回 Overview。

## 場景渲染順序

```text
Sky gradient
→ Back / Mid / Front animated clouds
→ Ambient light motes
→ Floating island shadow
→ Floating island base
→ Fixed surface accents
→ Edit grid / placement footprint
→ Depth-sorted garden objects
→ Floating island foreground lip
→ React Native HUD / drawers
```

## 品質基準初始構圖

- 4×4 固定中央噴泉
- 左後花拱門
- 右後水井
- 左前長椅
- 兩側盼望燈
- 其餘草地留俾玩家自由佈置

## 資產限制

程式已經解決比例、貼地、陰影、遮擋、相機及 UI 問題；但從不同圖片獨立生成嘅 PNG，仍然無法百分百共享同一鏡頭、材質及光源。後續正式資產應由同一 Blender Pipeline 輸出，v2.0 嘅 `assetMetrics.ts` 已預留每件資產校準欄位。
