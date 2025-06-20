import React from 'react';
import { TimeControlParameters } from '../types';

type TimeControlPanelProps = {
  timeControl: TimeControlParameters;
  onSlowDown: () => void;
  onSpeedUp: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFullReset: () => void;
};

const TimeControlPanel = React.memo<TimeControlPanelProps>(({
  timeControl,
  onSlowDown,
  onSpeedUp,
  onPause,
  onResume,
  onReset,
  onFullReset,
}) => (
  <div role="region" aria-labelledby="time-control-heading">
    <h4 id="time-control-heading">時間制御</h4>
    <button 
      onClick={onSlowDown} 
      disabled={!timeControl.isRunning}
      aria-label="シミュレーション速度を遅くする"
      title="シミュレーション速度を遅くする"
    >
      ◀◀ 遅く
    </button>
    <button 
      onClick={onSpeedUp} 
      disabled={!timeControl.isRunning}
      aria-label="シミュレーション速度を速くする"
      title="シミュレーション速度を速くする"
    >
      ▶▶ 速く
    </button>
    {timeControl.isRunning ? (
      <button 
        onClick={onPause}
        aria-label="シミュレーションを一時停止する"
        title="シミュレーションを一時停止する"
      >
        ❚❚ 停止
      </button>
    ) : (
      <button 
        onClick={onResume}
        aria-label="シミュレーションを再開する"
        title="シミュレーションを再開する"
      >
        ▶ 再開
      </button>
    )}
    <button 
      onClick={onReset}
      aria-label="惑星の位置をリセットする"
      title="惑星の位置をリセットする"
    >
      リセット
    </button>
    <button 
      onClick={onFullReset}
      aria-label="全ての設定をリセットする"
      title="全ての設定をリセットする"
    >
      完全リセット
    </button>
    <div aria-live="polite">時間倍率: {timeControl.timeScale.toFixed(2)}x</div>
    <div aria-live="polite">状態: {timeControl.isRunning ? "再生中" : "停止中"}</div>
  </div>
));

export default TimeControlPanel;
