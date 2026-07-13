# 後端同步 Contract 建議

## GET `/v1/users/:userId/garden`

Response：

```json
{
  "serverRevision": 12,
  "serverUpdatedAt": 1783776000000,
  "garden": {
    "schemaVersion": 1,
    "gardenId": "garden-user-123",
    "userId": "user-123",
    "revision": 18,
    "updatedAt": 1783775990000,
    "coins": 72,
    "objects": [],
    "inventory": {}
  }
}
```

## PUT `/v1/users/:userId/garden`

Request：

```json
{
  "baseServerRevision": 12,
  "garden": {}
}
```

建議：

- Server 驗證 JWT 內 userId，唔信 URL/body 自報 userId。
- Server 以 transaction 更新。
- `baseServerRevision` 不一致時回傳 HTTP 409。
- 金幣、購買、獎勵、付費物件唔應只信 client snapshot。
- Server 應重新驗證 inventory 數量及收成獎勵。
- 花園擺位可以 client authoritative；經濟資料應 server authoritative。

## 初期同步策略

1. App 啟動先即時讀 MMKV。
2. 畫面可立即打開。
3. 背景呼叫 GET。
4. Server 新版本較新就套用。
5. 本機較新就 PUT。
6. 409 時顯示重試或做 field-level merge。
