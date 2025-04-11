import React from 'react';

function ControlPanel({
  timeScale, isRunning, onSlowDown, onSpeedUp, onPause, onResume, onReset, onFullReset,
  gravity, onGravityChange,
  sunMass, onSunMassChange,
  planets, onAddPlanet, onRemovePlanet, onUpdatePlanet,
  zoom, onZoomChange,
  cameraTarget, onCameraTargetChange
}) {
  return (
    <div style={{ position: 'fixed', top: 10, left: 10, color: 'white', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px' }}>
      <div>
        <button onClick={onSlowDown}>遅く</button>
        <button onClick={onSpeedUp}>速く</button>
        {isRunning ? (
          <button onClick={onPause}>停止</button>
        ) : (
          <button onClick={onResume}>再開</button>
        )}
        <button onClick={onReset}>リセット</button>
        <button onClick={onFullReset}>完全リセット</button>
        <div>時間倍率: {timeScale.toFixed(2)}</div>
        <div>状態: {isRunning ? "再生中" : "停止中"}</div>
      </div>

      <hr />

      <div>
        <label>重力定数G: {gravity.toFixed(2)}</label>
        <input type="range" min="0.1" max="10" step="0.1" value={gravity} onChange={e => onGravityChange(parseFloat(e.target.value))} />
      </div>

      <div>
        <label>太陽の質量: {sunMass.toFixed(2)}</label>
        <input type="range" min="0.1" max="100" step="0.1" value={sunMass} onChange={e => onSunMassChange(parseFloat(e.target.value))} />
      </div>

      <hr />

      <div>
        <h4>惑星一覧</h4>
        {planets.map((planet, index) => (
          <div key={index} style={{ border: '1px solid white', margin: '5px', padding: '5px' }}>
            <div>名前: <input value={planet.name} onChange={e => onUpdatePlanet(index, { ...planet, name: e.target.value })} /></div>
            <div>質量: <input type="number" value={planet.mass} onChange={e => onUpdatePlanet(index, { ...planet, mass: parseFloat(e.target.value) })} /></div>
            <div>軌道半径: <input type="number" value={planet.radius} onChange={e => onUpdatePlanet(index, { ...planet, radius: parseFloat(e.target.value) })} /></div>
            <div>初速度: <input type="number" value={planet.velocity} onChange={e => onUpdatePlanet(index, { ...planet, velocity: parseFloat(e.target.value) })} /></div>
            <button onClick={() => onRemovePlanet(index)}>削除</button>
          </div>
        ))}
        <button onClick={onAddPlanet}>惑星を追加</button>
      </div>

      <hr />

      <div>
        <label>ズーム: {zoom.toFixed(2)}</label>
        <input type="range" min="0.1" max="5" step="0.1" value={zoom} onChange={e => onZoomChange(parseFloat(e.target.value))} />
      </div>

      <div>
        <label>視点対象:</label>
        <select value={cameraTarget} onChange={e => onCameraTargetChange(e.target.value)}>
          <option value="sun">太陽</option>
          {planets.map((planet, index) => (
            <option key={index} value={planet.name}>{planet.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ControlPanel;
