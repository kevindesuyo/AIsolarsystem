import { useState } from 'react';
import { Planet, SimulationParameters, TimeControlParameters, ViewParameters, EditablePlanetParams } from '../types';
import TimeControlPanel from './TimeControlPanel';
import ViewControlPanel from './ViewControlPanel';
import SimulationParamsPanel from './SimulationParamsPanel';
import PlanetListPanel from './PlanetListPanel';
import ScenarioSelector from './ScenarioSelector';
import { ScenarioPreset } from '../data/scenarios';

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
  onLoadScenario: (scenario: ScenarioPreset) => void;
};

// Main Control Panel Component
function ControlPanel({
  timeControl, simulationParams, viewParams, planets,
  onSlowDown, onSpeedUp, onPause, onResume, onReset, onFullReset,
  onGravityChange, onSunMassChange, onZoomChange, onCameraTargetChange,
  onAddPlanet, onRemovePlanet, onUpdatePlanetParams, selectPlanetForPrediction,
  onLoadScenario
}: ControlPanelProps) {

  // State to track which planet ID is selected for prediction
  const [predictingPlanetId, setPredictingPlanetId] = useState<string | null>(null);
  const [currentScenarioId, setCurrentScenarioId] = useState<string>('default');

  // Wrapper function to update local state and call the prop function
  const handleSelectPrediction = (id: string | null) => {
    setPredictingPlanetId(id);
    selectPlanetForPrediction(id);
  };

  const handleScenarioSelect = (scenario: ScenarioPreset) => {
    setCurrentScenarioId(scenario.id);
    onLoadScenario(scenario);
  };

  return (
    <div className="control-panel glass-panel">
      {/* Scenario Selection */}
      <ScenarioSelector
        onSelectScenario={handleScenarioSelect}
        currentScenarioId={currentScenarioId}
      />

      <hr />

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
      <SimulationParamsPanel
        simulationParams={simulationParams}
        onGravityChange={onGravityChange}
        onSunMassChange={onSunMassChange}
      />

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

      {/* Planet Management */}
      <PlanetListPanel
        planets={planets}
        onUpdatePlanetParams={onUpdatePlanetParams}
        onRemovePlanet={onRemovePlanet}
        onAddPlanet={onAddPlanet}
        onPredict={handleSelectPrediction}
      />

    </div>
  );
}

export default ControlPanel;
