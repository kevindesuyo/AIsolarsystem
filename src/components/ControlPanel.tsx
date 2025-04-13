import React, { useState } from 'react';
import { Planet, SimulationParameters, TimeControlParameters, ViewParameters, EditablePlanetParams } from '../types';


import PlanetEditor, { planetTypes } from './PlanetEditor';
import TimeControlPanel from './TimeControlPanel';
import ViewControlPanel from './ViewControlPanel';

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
  onRemovePlanet: (planetId: string) => void; // Use ID
  onUpdatePlanetParams: (targetId: string, updatedParams: Partial<EditablePlanetParams>) => void; // Use ID
  selectPlanetForPrediction: (id: string | null) => void; // Add prediction selection function
};

// Main Control Panel Component
function ControlPanel({
  timeControl, simulationParams, viewParams, planets,
  onSlowDown, onSpeedUp, onPause, onResume, onReset, onFullReset,
  onGravityChange, onSunMassChange, onZoomChange, onCameraTargetChange,
  onAddPlanet, onRemovePlanet, onUpdatePlanetParams, selectPlanetForPrediction // Add selectPlanetForPrediction here
}: ControlPanelProps) {

  // State to track which planet ID is selected for prediction
  const [predictingPlanetId, setPredictingPlanetId] = useState<string | null>(null);

  // Wrapper function to update local state and call the prop function
  const handleSelectPrediction = (id: string | null) => {
    setPredictingPlanetId(id);
    selectPlanetForPrediction(id);
  };

  // State for the new planet form - include new fields
  const [newPlanetParams, setNewPlanetParams] = useState<EditablePlanetParams>({
    name: 'NewPlanet',
    type: 'rocky', // Default type
    radius: 5,
    color: 'white',
    texturePath: '', // Default empty
    mass: 1,
    initialOrbitalRadius: 200,
    rotationSpeed: 0.01, // Default rotation
  });

  const handleAddPlanet = () => {
    // Ensure required fields have valid values before adding
    const paramsToAdd: EditablePlanetParams = {
        ...newPlanetParams,
        texturePath: newPlanetParams.texturePath || undefined, // Convert empty string back to undefined if desired by type
    };
    onAddPlanet(paramsToAdd);
    // Optionally reset form or update default name for next add
    setNewPlanetParams(prev => ({
        ...prev,
        name: `NewPlanet_${planets.length + 1}`,
        // Reset other fields if needed, or keep them for quick multi-add
        texturePath: '', // Reset texture path for next add
    }));
  };

  return (
    <div style={{ position: 'fixed', top: 10, left: 10, color: 'white', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
      {/* Time Controls */}
      <TimeControlPanel
        timeControl={timeControl}
        onSlowDown={onSlowDown}
        onSpeedUp={onSpeedUp}
        onPause={onPause}
        onResume={onResume}
        onReset={onReset}
        onFullReset={onFullReset}
      />

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
      <ViewControlPanel
        viewParams={viewParams}
        planets={planets}
        onZoomChange={onZoomChange}
        onCameraTargetChange={onCameraTargetChange}
      />

      <hr />

      {/* Orbit Prediction Control */}
      <div>
          <h4>軌道予測</h4>
          <div>予測対象: {predictingPlanetId ? planets.find(p => p.id === predictingPlanetId)?.name ?? 'なし' : 'なし'}</div>
          <button onClick={() => handleSelectPrediction(null)} disabled={!predictingPlanetId}>予測解除</button>
      </div>

      <hr />

      {/* Planet Management - Edit Existing */}
      <div>
        <h4>惑星編集</h4>
        {planets.length === 0 && <div>惑星がありません。下から追加してください。</div>}
        {planets.map((planet) => (
          <PlanetEditor
            key={planet.id} // Use unique ID as key
            planet={planet}
            onUpdate={onUpdatePlanetParams} // Pass the function directly
            onRemove={onRemovePlanet}       // Pass the function directly
            onPredict={handleSelectPrediction} // Pass the wrapper function
          />
        ))}
      </div>

      <hr />

      {/* Planet Management - Add New */}
      <div>
         {/* Form for adding a new planet */}
         <div style={{ border: '1px dashed gray', margin: '5px', padding: '5px' }}>
            <h5>新しい惑星を追加</h5>
             <div>名前: <input value={newPlanetParams.name} onChange={e => setNewPlanetParams({...newPlanetParams, name: e.target.value})} /></div>
             <div>種類:
                <select value={newPlanetParams.type} onChange={e => setNewPlanetParams({...newPlanetParams, type: e.target.value as Planet['type']})}>
                  {planetTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
             </div>
             <div>半径(表示用): <input type="number" min="1" value={newPlanetParams.radius} onChange={e => setNewPlanetParams({...newPlanetParams, radius: parseFloat(e.target.value) || 1})} /></div>
             <div>色(ﾌｫｰﾙﾊﾞｯｸ): <input value={newPlanetParams.color} onChange={e => setNewPlanetParams({...newPlanetParams, color: e.target.value})} /></div>
             <div>ﾃｸｽﾁｬﾊﾟｽ(任意): <input placeholder="例: planets/earth.jpg" value={newPlanetParams.texturePath} onChange={e => setNewPlanetParams({...newPlanetParams, texturePath: e.target.value})} /></div>
             <div>質量: <input type="number" min="0.1" step="0.1" value={newPlanetParams.mass} onChange={e => setNewPlanetParams({...newPlanetParams, mass: parseFloat(e.target.value) || 0.1})} /></div>
             <div>初期軌道半径: <input type="number" min="10" value={newPlanetParams.initialOrbitalRadius} onChange={e => setNewPlanetParams({...newPlanetParams, initialOrbitalRadius: parseFloat(e.target.value) || 10})} /></div>
             <div>自転速度(rad/ｽﾃｯﾌﾟ): <input type="number" step="0.001" value={newPlanetParams.rotationSpeed} onChange={e => setNewPlanetParams({...newPlanetParams, rotationSpeed: parseFloat(e.target.value) || 0})} /></div>
            <button onClick={handleAddPlanet}>追加</button>
        </div>
      </div>

      {/* Placeholder for Detailed Info Display */}
      {/* <hr />
      <div>
          <h4>選択中の天体情報</h4>
          {selectedPlanet ? (
              <div>... display details ...</div>
          ) : (
              <div>惑星をクリックまたは選択してください</div>
          )}
      </div> */}

    </div>
  );
}

export default ControlPanel;
