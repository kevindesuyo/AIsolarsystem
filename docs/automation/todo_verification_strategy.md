# todo.md 機械検証戦略

LLM が人間の補助なしで `todo.md` の各項目を進行・検証できるように、以下の観点で基準を定義する。

- **アーティファクト基準:** ドキュメント/設定/コードの存在や特定の記述内容を検証する。
- **テスト基準:** Vitest/Jest/Playwright などの自動テストで振る舞いを保証する。
- **レポート基準:** 計測結果や意思決定のログを JSON/Markdown で構造化し、整合性を静的に検査する。

## フェーズ別チェック指針

### フェーズ0 準備期間
- プロジェクトキックオフ資料 → `docs/phase0/kickoff.md` の存在とテンプレート準拠を検証。
- 技術負債棚卸し → `docs/phase0/tech_debt.yml` の構造とカテゴリ整合性を検証。
- 依存技術リスク分析 → `docs/phase0/dependency_risk.md` にテーブルがあるかを検証。
- ステークホルダー合意 → `docs/phase0/stakeholder_alignment.json` の署名（仮）とタイムスタンプを検証。

### フェーズ1 ツールチェーン整備
- TypeScript/ESLint/Prettier 設定 → `tsconfig.json`/`.eslintrc.cjs`/`package.json` の特定キーをスキーマ検証。
- Git Hook/CI → `package.json` scripts と `.husky` or `.github/workflows/ci.yml` の存在と内容を検証。
- ドキュメント整備 → `README.md`/`.env.example`/`PROJECT_MAINTENANCE_REPORT.md` の必須セクションを検証。

### フェーズ2 物理シミュレーション刷新
- Worker 分離/プロトコル → `src/simulation` 配下のファイル構造と Type 定義を検証。
- 物理エンジン → `src/physics` のモジュール構成とユニットテスト結果を検証。
- レンダリング → `src/canvas` 配下の責務分離と WebGL PoC の存在を検証。
- 保存量検証 → `tests/regression/conservation.test.ts` の結果を検証。

### フェーズ3 UX & 機能拡張
- デザインシステム → `src/design-system/tokens.ts`/`components/` の存在と Storybook/MDX ドキュメントを検証。
- 学習支援機能 → HUD/シナリオ/状態保存に関する JSON テンプレートとテストを検証。
- アクセシビリティ → Lighthouse/axe レポート JSON を検証。

### フェーズ4 品質保証とリリース
- テスト体系 → 単体/統合/E2E テストのカバレッジレポートを検証。
- パイプライン → GitHub Actions ワークフローと PWA manifest の構造を検証。
- 運用監視 → メトリクスダッシュボード設定 JSON/Sentry DSN の存在を検証。

### クロスフェーズ活動
- 週次レポート → `reports/week/YYYY-WW.md` のテンプレート準拠を検証。
- レトロスペクティブ → `reports/retro/YYYY-WW.md` の項目を検証。
- バックログ管理 → `.github/ISSUE_TEMPLATE/` や `CODEOWNERS` の存在を検証。
- パフォーマンス/SLO → `docs/metrics/slo.json` のスキーマ検証。

## 今後の実装方針
1. 上記基準を JSON/YAML で宣言し、自動検証スクリプトにより評価する。
2. スクリプト実行は `npm run verify:todo` で統一し、CI で常時確認する。
3. 不足するアーティファクトはテンプレート生成コマンドを用意し、LLM が対話的に補完できるようにする。

