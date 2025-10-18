# フレームメトリクスログ仕様

- 記録形式: NDJSON (`timestamp`, `deltaMs`, `skippedFrames`, `workerLagMs`)
- サンプリング頻度: 1 秒
- 保存先: `tmp/metrics/frame-metrics.ndjson`
- アラート閾値:
  - `skippedFrames` > 3
  - `workerLagMs` > 30
