import React, { useState } from 'react';
import { Planet, EditablePlanetParams } from '../types';
import PlanetEditor, { planetTypes } from './PlanetEditor';

type PlanetListPanelProps = {
  planets: Planet[];
  onUpdatePlanetParams: (targetId: string, updatedParams: Partial<EditablePlanetParams>) => void;
  onRemovePlanet: (planetId: string) => void;
  onAddPlanet: (params: EditablePlanetParams) => void;
  onPredict: (id: string) => void;
};

const PlanetListPanel = React.memo<PlanetListPanelProps>(({
  planets,
  onUpdatePlanetParams,
  onRemovePlanet,
  onAddPlanet,
  onPredict,
}) => {
  const [newPlanetParams, setNewPlanetParams] = useState<EditablePlanetParams>({
    name: '',
    type: 'rocky',
    radius: 5,
    color: 'white',
    texturePath: '',
    mass: 1,
    initialOrbitalRadius: 200,
    rotationSpeed: 0.01,
  });

  const handleAddPlanet = () => {
    const autoName = newPlanetParams.name.trim() || `Planet_${planets.length + 1}`;
    const paramsToAdd: EditablePlanetParams = {
      ...newPlanetParams,
      name: autoName,
      texturePath: newPlanetParams.texturePath || undefined,
    };
    onAddPlanet(paramsToAdd);
    setNewPlanetParams(prev => ({
      ...prev,
      name: '',
      texturePath: '',
    }));
  };

  const handleQuickAdd = () => {
    const quickParams: EditablePlanetParams = {
      name: `Planet_${planets.length + 1}`,
      type: planetTypes[Math.floor(Math.random() * planetTypes.length)],
      radius: 5,
      color: 'white',
      texturePath: undefined,
      mass: 1,
      initialOrbitalRadius: Math.max(10, 120 + planets.length * 20),
      rotationSpeed: 0.01,
    };
    onAddPlanet(quickParams);
  };

  return (
    <div>
      <h4>惑星編集</h4>
      {planets.length === 0 && <div>惑星がありません。下から追加してください。</div>}
      {planets.map((planet) => (
        <PlanetEditor
          key={planet.id}
          planet={planet}
          onUpdate={onUpdatePlanetParams}
          onRemove={onRemovePlanet}
          onPredict={onPredict}
        />
      ))}

      <hr />

      <div style={{ border: '1px dashed gray', margin: '5px', padding: '5px' }}>
        <h5>新しい惑星を追加</h5>
        <div style={{ marginBottom: '6px' }}>
          <button onClick={handleQuickAdd}>おまかせ追加</button>
          <span style={{ marginLeft: '8px', fontSize: '0.9em' }}>基本設定で自動命名します</span>
        </div>
        <div>名前(空欄なら自動付与): <input placeholder="自動で名前がつきます" value={newPlanetParams.name} onChange={e => setNewPlanetParams({ ...newPlanetParams, name: e.target.value })} /></div>
        <div>種類:
          <select value={newPlanetParams.type} onChange={e => setNewPlanetParams({ ...newPlanetParams, type: e.target.value as Planet['type'] })}>
            {planetTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>半径(表示用): <input type="number" min="1" value={newPlanetParams.radius} onChange={e => {
          const value = parseFloat(e.target.value);
          setNewPlanetParams({ ...newPlanetParams, radius: isNaN(value) ? 1 : Math.max(1, value) });
        }} /></div>
        <div>色(ﾌｫｰﾙﾊﾞｯｸ): <input value={newPlanetParams.color} onChange={e => setNewPlanetParams({ ...newPlanetParams, color: e.target.value })} /></div>
        <div>ﾃｸｽﾁｬﾊﾟｽ(任意): <input placeholder="例: planets/earth.jpg" value={newPlanetParams.texturePath} onChange={e => setNewPlanetParams({ ...newPlanetParams, texturePath: e.target.value })} /></div>
        <div>質量: <input type="number" min="0.1" step="0.1" value={newPlanetParams.mass} onChange={e => {
          const value = parseFloat(e.target.value);
          setNewPlanetParams({ ...newPlanetParams, mass: isNaN(value) ? 0.1 : Math.max(0.1, value) });
        }} /></div>
        <div>初期軌道半径: <input type="number" min="10" value={newPlanetParams.initialOrbitalRadius} onChange={e => {
          const value = parseFloat(e.target.value);
          setNewPlanetParams({ ...newPlanetParams, initialOrbitalRadius: isNaN(value) ? 10 : Math.max(10, value) });
        }} /></div>
        <div>自転速度(rad/ｽﾃｯﾌﾟ): <input type="number" step="0.001" value={newPlanetParams.rotationSpeed} onChange={e => {
          const value = parseFloat(e.target.value);
          setNewPlanetParams({ ...newPlanetParams, rotationSpeed: isNaN(value) ? 0 : value });
        }} /></div>
        <button onClick={handleAddPlanet}>追加</button>
      </div>
    </div>
  );
});

export default PlanetListPanel;
