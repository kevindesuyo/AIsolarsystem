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
  <div>
    <h4>シミュレーション設定</h4>
    <div>
      <label>重力定数G: {simulationParams.gravity.toExponential(2)}</label>
      <input
        type="range"
        min="1e-4"
        max="1e-1"
        step="1e-4"
        value={simulationParams.gravity}
        onChange={e => onGravityChange(parseFloat(e.target.value))}
        style={{ width: '100px' }}
      />
    </div>
    <div>
      <label>太陽の質量: {simulationParams.sunMass.toFixed(0)}</label>
      <input
        type="range"
        min="1000"
        max="50000"
        step="100"
        value={simulationParams.sunMass}
        onChange={e => onSunMassChange(parseFloat(e.target.value))}
        style={{ width: '100px' }}
      />
    </div>
  </div>
);

export default SimulationParamsPanel;
