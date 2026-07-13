# 相容性說明

## 已驗證組合（2026-07-11）

本套 source 已用以下公開套件型別做完整 TypeScript strict check：

| 套件 | 已驗證版本 |
|---|---:|
| React Native | 0.86.0 |
| React | 19.2.7 |
| React Native Skia | 2.6.9 |
| Gesture Handler | 3.0.2 |
| Reanimated | 4.5.1 |
| Worklets | 0.10.2 |
| Zustand | 5.0.14 |
| react-native-mmkv | 4.3.2 |
| react-native-nitro-modules | 0.36.1 |

程式使用：

- Gesture Handler 3 hook API：`usePanGesture`、`usePinchGesture`、`useSimultaneousGestures`
- Reanimated 4 shared values
- React Native Worklets：`scheduleOnRN`
- MMKV 4：`createMMKV` + Nitro Modules

## React Native 版本判斷

目前這個「最新 API」分支最穩妥係 **React Native 0.83–0.86 + New Architecture**。原因係 Gesture Handler 3 雖然亦支援 RN 0.82，但 Reanimated 4.5／Worklets 0.10 嘅相容範圍由 RN 0.83 開始。

如果現有 App 係 RN 0.82，唔好直接裝最新版本；應按官方 compatibility table 選擇相容嘅 Reanimated／Worklets minor，再做一次 native build 驗證。

## 先核對現有 App

```bash
npx react-native info
npm ls react-native react
npm ls react-native-gesture-handler react-native-reanimated react-native-worklets
npm ls @shopify/react-native-skia react-native-mmkv react-native-nitro-modules
```

## 現有 App 較舊時

唔好為咗花園一次過盲目升級整個 App。核心 engine、資料結構、collision、growth、Zustand actions 同同步 contract 可以保留；主要替換以下 adapter：

- Gesture Handler 2：改用 `Gesture.Pan()`／`Gesture.Pinch()` builder API。
- Reanimated 3：改用舊 thread bridge 做法，並按該版本配置 Babel。
- MMKV 3：按 V3 API 初始化 storage。
- RN 0.78 或以下／React 18：使用與該版本相容嘅舊 Skia，或者先升級主 App。

## 最重要原則

原生依賴版本必須跟 **現有 App 嘅 React Native minor** 配套；唔應只因 npm 顯示最新版本就全部升級。
