# v1.1 Isometric 轉向修正

## 第一版問題

第一版使用以下概念將整個 Skia object group 旋轉：

```ts
rotation * (Math.PI / 2);
```

呢種係「畫面平面旋轉」。對 Isometric 場景入面嘅直立物件並唔正確，因此會出現：

- 長椅轉成直立長條。
- 燈柱連埋燈頭向橫瞓低。
- 樹幹、角色及噴泉都有機會上下倒轉。
- 2x1 footprint 變成 1x2 時，視覺中心會突然橫向跳一格。

## v1.1 行為

- `rotationMode: "none"`：花、樹、噴泉、燈及 Avatar 保持直立，不顯示轉向按鈕。
- `rotationMode: "two-way"`：長椅只喺兩條 Isometric 地面軸之間轉向。
- `rotationMode: "four-way"`：預留俾日後有四套方向素材嘅小屋、門、招牌等物件。
- 轉向會依照新 footprint 尋找鄰近合法位置，優先減少畫面跳動。

## 套用到已接入嘅 App

最少覆蓋以下檔案：

```text
src/features/graceGarden/components/GardenObjectNode.tsx
src/features/graceGarden/components/SelectedObjectPanel.tsx
src/features/graceGarden/engine/rotation.ts
src/features/graceGarden/state/catalog.ts
src/features/graceGarden/state/types.ts
src/features/graceGarden/state/useGardenStore.ts
```

舊 MMKV 存檔可以繼續使用。第一版曾經儲存過嘅燈／樹 rotation 值會被 renderer 忽略，所以物件會重新保持直立；唔需要清除存檔。
