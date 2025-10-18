# Agent ガイド

この文書は太陽系シミュレーターの開発を引き継ぐエージェント向けのスタート地点です。日常的に参照すべきフォルダと主要ファイルを整理し、再現性のある作業フローを共有します。

## フォルダクイックリファレンス
| Path | 目的 | 代表ファイル/サブフォルダ | 参照タイミング |
| --- | --- | --- | --- |
| `.claude/` | ナレッジベースと作業ルール | `context.md`, `project-knowledge.md`, `common-patterns.md`, `debug/` | 作業着手前の背景確認、トラブル対応 |
| `src/` | アプリ本体 (React + Canvas) | `App.tsx`, `simulationEngine.ts`, `hooks/`, `canvas/` | 実装・リファクタリング時 |
| `automation/` | TODO 自動検証の定義 | `todo-checks.json` | タスク完了判定、検証条件の追加時 |
| `scripts/` | 自動化スクリプト | `verifyTodo.js` | `npm run verify:todo` 実行、検証ロジック編集時 |
| `docs/phase0/` | 計画・リスク・合意事項 | `kickoff.md`, `tech_debt.yml`, `dependency_risk.md`, `stakeholder_alignment.json` | 企画更新、ステークホルダー調整時 |
| `docs/metrics/` | 指標・SLO・計測仕様 | `performance_budget.md`, `frame_metrics.md`, `slo.json` | 性能改善、モニタリング実装時 |
| `docs/automation/` | 自動検証設計方針 | `todo_verification_strategy.md` | 新しいチェック項目の設計時 |
| `reports/` | 週次・レトロ・品質レポート | `week/`, `retro/`, `accessibility/axe.json` | 状況共有、振り返り、A11y確認 |
| `.github/` | プロセス・テンプレート | `ISSUE_TEMPLATE/` (feature, bug) | Issue 作成、コラボレーション調整 |
| `public/` | 静的アセットと配布設定 | `manifest.json`, `locales/`, 画像/シナリオ | UI 表示資産や i18n の編集時 |

## ナレッジベース活用 (`.claude/`)
- **`context.md`**: プロジェクトの目的・制約・スタック。方針確認の最初の読み物。
- **`project-knowledge.md`**: 物理演算や描画最適化の指針。実装前に該当セクションを必ず確認。
- **`common-patterns.md`**: Git/デバッグ/タスク運用の定型コマンド集。実働時の参照に便利。
- **`debug-log.md` & `debug/`**: 障害対応テンプレートとアーカイブ。新規トラブル対応時はここに記録。
- **`settings.local.json`**: エージェントに許可された操作一覧。自動化・スクリプト実行前に権限を確認。

## 計画・レポート関連
- **`docs/phase0/`**  
  - `kickoff.md`: プロジェクト概要と成功指標。計画変更時はここを更新。  
  - `tech_debt.yml`: カテゴリ別の技術負債棚卸し。改善タスク化の根拠に使用。  
  - `dependency_risk.md`: 依存技術アップデートのリスク表。移行判断の直前に参照。  
  - `stakeholder_alignment.json`: 合意済みの優先度・リスク・署名情報。意思決定に悩んだら確認。
- **`docs/metrics/`**  
  性能・体験の定量指標がまとまっている。ベンチマークや監視実装の仕様源。
- **`docs/automation/todo_verification_strategy.md`**  
  TODO 自動チェックの設計思想とタスク紐づけ。`todo-checks.json` を編集する際のルールブック。
- **`reports/week/*`, `reports/retro/*`**  
  スプリントの進捗・リスク・振り返り。新しい週を追加する際は `template.md` を複製。
- **`reports/accessibility/axe.json`**  
  最新のアクセシビリティ検証結果。UI 改修後はここを更新し、検証自動化の基準に反映。

## 自動検証とスクリプト
- `automation/todo-checks.json` を基に `npm run verify:todo` が進捗を判定。CI 連携や項目追加入りの際は `scripts/verifyTodo.js` を更新する。
- 各チェックはファイル存在や内容一致で判定するため、必要アーティファクトを整備すると LLM だけで TODO を消化できる。
- 新しいフェーズ成果物やテストを追加した場合は `docs/automation/todo_verification_strategy.md` に背景を追記すると他エージェントが判断しやすい。

## コードベース (`src/`)
- `simulationEngine.ts`: 物理演算の入口。刷新時は保存量チェックやテスト追加を忘れずに。
- `hooks/`, `canvas/`, `components/`: 責務ごとに整理されているかを常に確認し、新規機能時は既存パターンとの整合性を取る。
- 物理ロジックや Worker 化などフェーズ 2 以降の成果物は `src/simulation/` や `src/physics/` などに整理して配置すること。

## オペレーション関連
- `.github/ISSUE_TEMPLATE/`: Feature/Bug のテンプレート。Issue 起票時に活用し、追加入力が必要ならここを編集。
- `CODEOWNERS`: レビュー責任の割り当て。主要ファイルを追加したら必要に応じて更新。
- `todo.md`: フェーズ別タスク一覧。進捗更新時は `npm run verify:todo` の結果と合わせて反映する。
- `PROJECT_MAINTENANCE_REPORT.md`: 長期計画とリスク管理。フェーズ変更や大きな意思決定の後に更新。
- `README.md`: セットアップと自動検証コマンドの案内。新しいスクリプトや依存が増えたら反映させる。

## Git 運用メモ
- リポジトリルートは `solarsystem/`。`git status` が想定外のときは `pwd` と `git rev-parse --show-toplevel` を確認。
- 作業前後に `npm run verify:todo` / `npm test` を実行し、差分が妥当かをチェック。コミットメッセージは日本語で記述。
- 変更が `.claude/` やドキュメントに跨る場合は PR 説明で目的を明確にし、必要に応じてテンプレート (`reports/` や `docs/`) を更新。

## 初動チェックリスト
1. `npm install` → `npm start` / `npm test` の動作確認。
2. `.claude/context.md` と `project-knowledge.md` を読み、制約と実装パターンを把握。
3. 着手するフェーズのドキュメント（例: `docs/phase0/…` や `docs/metrics/…`）を確認して前提条件を揃える。
4. 作業中は `todo.md` と `automation/todo-checks.json` を更新し、完了後に `npm run verify:todo` でセルフレビュー。
5. レトロや週次報告が必要な場合は `reports/` のテンプレートを利用し、記録を残す。

このガイドを起点に、プロジェクトの知識資産と自動化フローを活用しながら開発を進めてください。必要に応じて新しいフォルダやテンプレートを追加し、必ず本書にも追記することを推奨します。
