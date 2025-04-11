import React, { useState } from 'react';
import { Planet, SimulationParameters, TimeControlParameters, ViewParameters, EditablePlanetParams } from '../types';

// Define props type for ControlPanel
type ControlPanelProps = {
  timeControl: TimeControlParameters;
  simulationParams: SimulationParameters;
  viewParams: ViewParameters;
  planets: Planet[];
  onSlowDown: () => void;
  onSpeedUp: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFullReset: () => void;
  onGravityChange: (value: number) => void;
  onSunMassChange: (value: number) => void;
  onZoomChange: (value: number) => void;
  onCameraTargetChange: (value: string) => void;
  onAddPlanet: (params: EditablePlanetParams) => void;
  onRemovePlanet: (planetName: string) => void;
  onUpdatePlanetParams: (targetName: string, updatedParams: Partial<EditablePlanetParams>) => void;
};

// Separate component for editing a single planet's initial parameters
type PlanetEditorProps = {
  planet: Planet; // Use Planet type which includes initialOrbitalRadius
  onUpdate: (updatedParams: Partial<EditablePlanetParams>) => void;
  onRemove: () => void;
};

function PlanetEditor({ planet, onUpdate, onRemove }: PlanetEditorProps) {
  // Extract editable parameters from the planet state
  const editableParams: EditablePlanetParams = {
    name: planet.name,
    radius: planet.radius,
    color: planet.color,
    mass: planet.mass,
    initialOrbitalRadius: planet.initialOrbitalRadius ?? 0, // Use initialOrbitalRadius
  };

  const handleParamChange = (param: keyof EditablePlanetParams, value: string | number) => {
    onUpdate({ [param]: value });
  };

  return (
    <div style={{ border: '1px solid white', margin: '5px', padding: '5px' }}>
      <div>
        名前: <input value={editableParams.name} onChange={e => handleParamChange('name', e.target.value)} />
      </div>
      <div>
        半径(表示用): <input type="number" min="1" value={editableParams.radius} onChange={e => handleParamChange('radius', parseFloat(e.target.value) || 1)} />
      </div>
       <div>
        色: <input value={editableParams.color} onChange={e => handleParamChange('color', e.target.value)} />
      </div>
      <div>
        質量: <input type="number" min="0.1" step="0.1" value={editableParams.mass} onChange={e => handleParamChange('mass', parseFloat(e.target.value) || 0.1)} />
      </div>
      <div>
        初期軌道半径: <input type="number" min="10" value={editableParams.initialOrbitalRadius} onChange={e => handleParamChange('initialOrbitalRadius', parseFloat(e.target.value) || 10)} />
      </div>
      {/* Velocity is calculated, not edited directly */}
      <button onClick={onRemove}>削除</button>
    </div>
  );
}

// Main Control Panel Component
function ControlPanel({
  timeControl, simulationParams, viewParams, planets,
  onSlowDown, onSpeedUp, onPause, onResume, onReset, onFullReset,
  onGravityChange, onSunMassChange, onZoomChange, onCameraTargetChange,
  onAddPlanet, onRemovePlanet, onUpdatePlanetParams
}: ControlPanelProps) {

  // State for the new planet form
  const [newPlanetParams, setNewPlanetParams] = useState<EditablePlanetParams>({
    name: 'NewPlanet',
    radius: 5,
    color: 'white',
    mass: 1,
    initialOrbitalRadius: 200,
  });

  const handleAddPlanet = () => {
    onAddPlanet(newPlanetParams);
    // Optionally reset form or update default name for next add
    setNewPlanetParams(prev => ({ ...prev, name: `NewPlanet_${planets.length + 1}` }));
  };

  return (
    <div style={{ position: 'fixed', top: 10, left: 10, color: 'white', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
      {/* Time Controls */}
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

      <hr />

      {/* Simulation Parameters */}
      <div>
        <h4>シミュレーション設定</h4>
        <div>
          <label>重力定数G: {simulationParams.gravity.toExponential(2)}</label>
          <input type="range" min="1e-4" max="1e-1" step="1e-4" value={simulationParams.gravity} onChange={e => onGravityChange(parseFloat(e.target.value))} style={{width: '100px'}}/>
        </div>
        <div>
          <label>太陽の質量: {simulationParams.sunMass.toFixed(0)}</label>
          <input type="range" min="1000" max="50000" step="100" value={simulationParams.sunMass} onChange={e => onSunMassChange(parseFloat(e.target.value))} style={{width: '100px'}}/>
        </div>
      </div>

      <hr />

       {/* View Controls */}
      <div>
          <h4>表示設定</h4>
          <div>
            <label>ズーム: {viewParams.zoom.toFixed(2)}x</label>
            <input type="range" min="0.1" max="5" step="0.1" value={viewParams.zoom} onChange={e => onZoomChange(parseFloat(e.target.value))} style={{width: '100px'}}/>
          </div>
          <div>
            <label>視点対象:</label>
            <select value={viewParams.cameraTarget} onChange={e => onCameraTargetChange(e.target.value)}>
              <option value="sun">太陽</option>
              {planets.map((planet) => (
                <option key={planet.name} value={planet.name}>{planet.name}</option>
              ))}
            </select>
          </div>
      </div>

      <hr />

      {/* Planet Management */}
      <div>
        <h4>惑星管理</h4>
        {planets.map((planet) => (
          <PlanetEditor
            key={planet.name} // Use name as key, assuming names are unique
            planet={planet}
            onUpdate={(updatedParams) => onUpdatePlanetParams(planet.name, updatedParams)}
            onRemove={() => onRemovePlanet(planet.name)}
          />
        ))}
         {/* Form for adding a new planet */}
         <div style={{ border: '1px dashed gray', margin: '5px', padding: '5px' }}>
            <h5>新しい惑星を追加</h5>
             <div>名前: <input value={newPlanetParams.name} onChange={e => setNewPlanetParams({...newPlanetParams, name: e.target.value})} /></div>
             <div>半径(表示用): <input type="number" min="1" value={newPlanetParams.radius} onChange={e => setNewPlanetParams({...newPlanetParams, radius: parseFloat(e.target.value) || 1})} /></div>
             <div>色: <input value={newPlanetParams.color} onChange={e => setNewPlanetParams({...newPlanetParams, color: e.target.value})} /></div>
             <div>質量: <input type="number" min="0.1" step="0.1" value={newPlanetParams.mass} onChange={e => setNewPlanetParams({...newPlanetParams, mass: parseFloat(e.target.value) || 0.1})} /></div>
             <div>初期軌道半径: <input type="number" min="10" value={newPlanetParams.initialOrbitalRadius} onChange={e => setNewPlanetParams({...newPlanetParams, initialOrbitalRadius: parseFloat(e.target.value) || 10})} /></div>
            <button onClick={handleAddPlanet}>追加</button>
        </div>
      </div>

    </div>
  );
}

export default ControlPanel;
