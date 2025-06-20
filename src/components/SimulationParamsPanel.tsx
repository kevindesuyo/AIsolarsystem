import React from 'react';
import { SimulationParameters } from '../types';

type SimulationParamsPanelProps = {
  simulationParams: SimulationParameters;
  onGravityChange: (value: number) => void;
  onSunMassChange: (value: number) => void;
};

const SimulationParamsPanel: React.FC<SimulationParamsPanelProps> = ({
  simulationParams,
  onGravityChange,
  onSunMassChange,
}) => (
  <div role="region" aria-labelledby="simulation-params-heading">
    <h4 id="simulation-params-heading">シミュレーション設定</h4>
    <div>
      <label htmlFor="gravity-slider">
        重力定数G: {simulationParams.gravity.toExponential(2)}
      </label>
      <input
        id="gravity-slider"
        type="range"
        min="1e-4"
        max="1e-1"
        step="1e-4"
        value={simulationParams.gravity}
        onChange={e => onGravityChange(parseFloat(e.target.value))}
        style={{ width: '100px' }}
        aria-label="重力定数を調整"
        aria-valuemin={1e-4}
        aria-valuemax={1e-1}
        aria-valuenow={simulationParams.gravity}
        aria-valuetext={`重力定数: ${simulationParams.gravity.toExponential(2)}`}
      />
    </div>
    <div>
      <label htmlFor="sun-mass-slider">
        太陽の質量: {simulationParams.sunMass.toFixed(0)}
      </label>
      <input
        id="sun-mass-slider"
        type="range"
        min="1000"
        max="50000"
        step="100"
        value={simulationParams.sunMass}
        onChange={e => onSunMassChange(parseFloat(e.target.value))}
        style={{ width: '100px' }}
        aria-label="太陽の質量を調整"
        aria-valuemin={1000}
        aria-valuemax={50000}
        aria-valuenow={simulationParams.sunMass}
        aria-valuetext={`太陽の質量: ${simulationParams.sunMass.toFixed(0)}`}
      />
    </div>
  </div>
);

export default SimulationParamsPanel;
