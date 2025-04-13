import React from 'react';
import { ViewParameters, Planet } from '../types';

type ViewControlPanelProps = {
  viewParams: ViewParameters;
  planets: Planet[];
  onZoomChange: (value: number) => void;
  onCameraTargetChange: (value: string) => void;
};

const ViewControlPanel: React.FC<ViewControlPanelProps> = ({
  viewParams,
  planets,
  onZoomChange,
  onCameraTargetChange,
}) => (
  <div>
    <h4>表示設定</h4>
    <div>
      <label>ズーム: {viewParams.zoom.toFixed(2)}x</label>
      <input
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        value={viewParams.zoom}
        onChange={e => onZoomChange(parseFloat(e.target.value))}
        style={{ width: '100px' }}
      />
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
);

export default ViewControlPanel;
