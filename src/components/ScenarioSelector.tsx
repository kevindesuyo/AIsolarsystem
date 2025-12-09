import React from 'react';
import { SCENARIO_PRESETS, ScenarioPreset } from '../data/scenarios';

type ScenarioSelectorProps = {
  onSelectScenario: (scenario: ScenarioPreset) => void;
  currentScenarioId?: string;
};

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  onSelectScenario,
  currentScenarioId,
}) => {
  return (
    <div className="scenario-selector">
      <h4>シナリオ選択</h4>
      <div className="scenario-grid">
        {SCENARIO_PRESETS.map((scenario) => (
          <button
            key={scenario.id}
            className={`scenario-card ${currentScenarioId === scenario.id ? 'active' : ''}`}
            onClick={() => onSelectScenario(scenario)}
            title={scenario.description}
          >
            <span className="scenario-icon">{scenario.icon}</span>
            <span className="scenario-name">{scenario.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelector;
