import React from 'react';

function ControlPanel({ timeScale, onSlowDown, onSpeedUp, onPause, onResume, onReset }) {
  return (
    <div style={{ position: 'fixed', top: 10, left: 10, color: 'white' }}>
      <button onClick={onSlowDown}>遅く</button>
      <button onClick={onSpeedUp}>速く</button>
      <button onClick={onPause}>停止</button>
      <button onClick={onResume}>再開</button>
      <button onClick={onReset}>リセット</button>
      <div>時間倍率: {timeScale.toFixed(2)}</div>
    </div>
  );
}

export default ControlPanel;
