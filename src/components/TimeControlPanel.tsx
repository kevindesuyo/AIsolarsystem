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
  <div>
    <h4>時間制御</h4>
    <button onClick={onSlowDown} disabled={!timeControl.isRunning}>◀◀ 遅く</button>
    <button onClick={onSpeedUp} disabled={!timeControl.isRunning}>▶▶ 速く</button>
    {timeControl.isRunning ? (
      <button onClick={onPause}>❚❚ 停止</button>
    ) : (
      <button onClick={onResume}>▶ 再開</button>
    )}
    <button onClick={onReset}>リセット</button>
    <button onClick={onFullReset}>完全リセット</button>
    <div>時間倍率: {timeControl.timeScale.toFixed(2)}x</div>
    <div>状態: {timeControl.isRunning ? "再生中" : "停止中"}</div>
  </div>
));

export default TimeControlPanel;
