# 恩霖花園美術素材規格

## Isometric 物件

每件物件建議：

- 透明 PNG
- 2x 或 3x 輸出
- 底部 anchor 對準物件接觸地面嘅中心
- 所有方向使用一致光源
- 預留陰影，但大型動態陰影可由 Skia 另畫
- 檔名使用穩定 catalogId，例如 `wooden_bench_r0.png`

## Isometric 轉向

真正 Isometric 圖唔建議直接將同一張 PNG 旋轉 90°，因為視角會錯。

兩方向物件（例如左右對稱長椅）可準備：

```text
wooden_bench_r0.png  沿 grid X 軸
wooden_bench_r1.png  沿 grid Y 軸
```

四方向物件（例如正面／背面細節唔同嘅小屋或招牌）應準備：

```text
prayer_cottage_r0.png
prayer_cottage_r1.png
prayer_cottage_r2.png
prayer_cottage_r3.png
```

直立或旋轉對稱物件（花、樹、圓形噴泉、燈柱、Avatar）使用 `rotationMode: "none"`，唔需要方向素材。資料仍然保存 `rotation: 0 | 1 | 2 | 3`，renderer 會按 catalog 嘅 `rotationMode` 選取正確變體。

## 植物成長

```text
flower_pink_stage_0.png  泥土／種子
flower_pink_stage_1.png  幼苗
flower_pink_stage_2.png  花蕾
flower_pink_stage_3.png  盛放
```

## Avatar 換裝

每層保持相同 canvas 尺寸、相同 anchor：

```text
hair_back
body
shoes
clothes
face
hair_front
accessory
```

第一版可用 PNG 分層；大量角色及動畫後再考慮 atlas／sprite sheet。

## 效能

- 相同植物大量出現時，轉用 Skia Atlas。
- 圖片載入後 cache SkImage。
- 避免每個 frame 建立新 JS object array。
- 遠離視窗嘅物件可以做 viewport culling。
