# 依存技術アップデート リスク分析

## 対象一覧
| 項目 | 現状 | 目標 | 目的 |
| --- | --- | --- | --- |
| ビルド/開発サーバー | Create React App (`react-scripts@5.0.1`) | Vite + `@vitejs/plugin-react-swc` | ビルド時間短縮・設定柔軟性向上 |
| テストランナー | Jest (CRA同梱) | Vitest + Testing Library | 起動高速化、Viteと設定統一 |
| 型チェッカー | TypeScript 5.8.x | 最新安定版維持 (5.8.x想定) | Pilot機能活用、互換性担保 |
| Lint/整形 | CRA既定 (ESLint最小構成) | ESLint + `@typescript-eslint`, Prettier | 品質ルール統一、自動整形 |
| UIフレームワーク | React 19 | React 19 + Suspense/Server Actions未使用 | 最新機能検討、互換性維持 |

## リスク評価
| リスク | 深刻度 | 発生確率 | 対象 | 内容 |
| --- | --- | --- | --- | --- |
| Vite移行時の環境依存バグ | 高 | 中 | Vite | CRA固有のグローバル定義やプロキシ設定が失われる可能性 |
| Vitest/jest-dom互換性 | 中 | 中 | Vitest | Jest固有のAPI (`jest.mock`, `setupTests.ts`) を書き換える必要 |
| Canvas/WebGLテスト環境 | 高 | 低 | Vitest | `jsdom`でCanvas APIが未実装のため、ポリフィルやモック追加が必要 |
| TypeScript `allowJs`無効化 | 中 | 高 | TypeScript | 既存の`.js`ファイルがある場合ビルド失敗。現状ソースはTS中心だが確認が必要 |
| ESLintルール強化 | 中 | 高 | ESLint | 既存コードで大量のLintエラーが発生し導入が停滞するリスク |
| Prettier導入 | 低 | 中 | Prettier | 既存コード差分が大きく発生しレビュー負荷増大 |

## 軽減策とアクション
- **Vite移行**: `npm run start:legacy`等の暫定CRAコマンドを残しながら段階移行。Vite専用の`vite.config.ts`と環境変数命名(`VITE_`)へ移行ガイドを作成。
- **Vitest対応**: `setupTests.ts`をVitest向けに再構成し、`happy-dom`や`@testing-library/jest-dom/vitest`を利用。Canvas描画は`jest-canvas-mock`相当のVitestプラグインで補完。
- **TypeScript設定**: `allowJs`無効化前に`.js`混入を`tsc --noEmit`で検査。`noImplicitAny`有効化は自動修正可能箇所から段階導入。
- **ESLint/Prettier**: Airbnbベース等ではなく段階的にルール追加。`--fix`が有効なルールから適用し、残差はリファクタスプリントで処理。
- **CI強化**: GitHub Actionsの`matrix`で`node@18/20`の検証を実施し、移行後の互換性を早期検出。

## ロールバック戦略
- Vite移行時は`main`ブランチにCRA構成を保持し、Viteブランチで十分なE2Eテスト後に切替。必要に応じCRAブランチへ戻せるよう`feature/vite-migration`を常に最新化。
- ツールチェーン導入はフェーズ単位でマージし、失敗時には直前タグへ`git revert`可能な粒度でコミット。
- 新Lint/TypeScript設定はCIに警告モードを設け、一時的に`warn`運用しながら段階的に`error`へ移行。

## 未決事項
- Viteとともに採用するテスティングライブラリ/モック (e.g., `vitest-canvas-mock`, `@testing-library/react-hooks`) の選定
- Git Hooks実装手段（`husky` vs `lefthook`）と運用ルール
- エラートラッキング（Sentry等）の導入タイミングと予算
