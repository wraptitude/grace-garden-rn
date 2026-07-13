# Grace Garden Layout & Scale Patch v1.3

適用於已經裝好 v1.2 PNG 素材版嘅專案。

今次 Patch 唔重複包含大部分 PNG；主要更新花園容量、島嶼顯示範圍、相機 fit 同物件相對比例。

核心改動：

```text
10 × 10 → 14 × 14
100 cells → 196 cells
Island world rect → 1800 × 1248
Object sizes → 按 96 × 48 tile 校準
```

請用 `CODEX_APPLY_PROMPT.md` 逐檔合併，唔好直接覆蓋你現有已調校嘅 Canvas。
