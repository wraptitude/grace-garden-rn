# 安裝及接入步驟

## 1. 先確認現有 App 版本

```bash
npx react-native info
npm ls react-native react
npm ls react-native-gesture-handler react-native-reanimated react-native-worklets
npm ls @shopify/react-native-skia react-native-mmkv react-native-nitro-modules zustand
```

Starter Kit 嘅現代 API 分支針對 React Native New Architecture。先閱讀 `docs/COMPATIBILITY.md`，唔好喺未知版本情況下直接安裝 latest。

## 2. RN 0.86 已驗證安裝組合

以下係本 Starter Kit 在 2026-07-11 做 TypeScript strict check 時使用嘅版本：

```bash
npm install \
  @shopify/react-native-skia@2.6.9 \
  react-native-gesture-handler@3.0.2 \
  react-native-reanimated@4.5.1 \
  react-native-worklets@0.10.2 \
  zustand@5.0.14 \
  react-native-mmkv@4.3.2 \
  react-native-nitro-modules@0.36.1
```

現有 App 唔係 RN 0.86 時，應保留 source code，但按該 RN minor 選擇相容套件版本。

## 3. Babel（React Native Community CLI）

`react-native-worklets/plugin` 必須放喺 `plugins` 最後：

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 其他 plugins
    'react-native-worklets/plugin',
  ],
};
```

參考 `babel.config.example.js`。

## 4. Root wrapper

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <YourApp />
    </GestureHandlerRootView>
  );
}
```

## 5. 複製功能模組

```text
src/features/graceGarden
```

保持相對路徑不變，然後將 `GraceGardenScreen` 加入現有 navigation。

## 6. iOS Pods

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## 7. Android

React Native Skia 需要 Android NDK。Android Studio 內確認 SDK Tools 已安裝 NDK 及 CMake。

如 release build 開啟 Proguard，加入：

```proguard
-keep class com.shopify.reactnative.skia.** { *; }
```

## 8. 清 cache 及重新 native build

```bash
npm start -- --reset-cache
npm run android
# 或
npm run ios
```

安裝或升級 Reanimated、Worklets、Skia、MMKV 後，唔可以只 reload JavaScript，必須重新 native build。

## 9. 接入真正登入用戶

```tsx
<GraceGardenScreen userId={authUser.id} />
```

唔好喺正式版使用固定 `demo-user`，否則所有人會共用同一個本機存檔 key。
