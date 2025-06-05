import React, { useMemo, useCallback } from 'react';
import { Planet, EditablePlanetParams } from '../types';

/** 利用可能な惑星タイプ一覧（ControlPanel等でも利用） */
export const planetTypes: Planet['type'][] = ['rocky', 'gas', 'dwarf', 'asteroid', 'comet'];

type PlanetEditorProps = {
  planet: Planet;
  onUpdate: (id: string, updatedParams: Partial<EditablePlanetParams>) => void;
  onRemove: (id: string) => void;
  onPredict: (id: string) => void;
};

const PlanetEditor = React.memo<PlanetEditorProps>(({ planet, onUpdate, onRemove, onPredict }) => {
  const editableParams = useMemo((): EditablePlanetParams => ({
    name: planet.name,
    type: planet.type,
    radius: planet.radius,
    color: planet.color,
    texturePath: planet.texturePath || '',
    mass: planet.mass,
    initialOrbitalRadius: planet.initialOrbitalRadius ?? 100, // Use reasonable default
    rotationSpeed: planet.rotationSpeed,
  }), [planet]);

  const handleParamChange = useCallback((param: keyof EditablePlanetParams, value: string | number | undefined) => {
    const updateValue = param === 'texturePath' && value === '' ? undefined : value;
    onUpdate(planet.id, { [param]: updateValue });
  }, [planet.id, onUpdate]);

  return (
    <div style={{ border: '1px solid white', margin: '5px', padding: '5px' }}>
      <div>
        名前: <input value={editableParams.name} onChange={e => handleParamChange('name', e.target.value)} />
      </div>
      <div>
        半径(表示用): <input type="number" min="1" value={editableParams.radius} onChange={e => {
          const value = parseFloat(e.target.value);
          handleParamChange('radius', isNaN(value) ? 1 : Math.max(1, value));
        }} />
      </div>
      <div>
        種類:
        <select value={editableParams.type} onChange={e => handleParamChange('type', e.target.value as Planet['type'])}>
          {planetTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>
      <div>
        色(ﾌｫｰﾙﾊﾞｯｸ): <input value={editableParams.color} onChange={e => handleParamChange('color', e.target.value)} />
      </div>
      <div>
        ﾃｸｽﾁｬﾊﾟｽ(任意): <input placeholder="例: planets/earth.jpg" value={editableParams.texturePath} onChange={e => handleParamChange('texturePath', e.target.value)} />
      </div>
      <div>
        質量: <input type="number" min="0.1" step="0.1" value={editableParams.mass} onChange={e => {
          const value = parseFloat(e.target.value);
          handleParamChange('mass', isNaN(value) ? 0.1 : Math.max(0.1, value));
        }} />
      </div>
      <div>
        初期軌道半径: <input type="number" min="10" value={editableParams.initialOrbitalRadius} onChange={e => {
          const value = parseFloat(e.target.value);
          handleParamChange('initialOrbitalRadius', isNaN(value) ? 10 : Math.max(10, value));
        }} />
      </div>
      <div>
        自転速度(rad/ｽﾃｯﾌﾟ): <input type="number" step="0.001" value={editableParams.rotationSpeed} onChange={e => {
          const value = parseFloat(e.target.value);
          handleParamChange('rotationSpeed', isNaN(value) ? 0 : value);
        }} />
      </div>
      <button onClick={() => onRemove(planet.id)}>削除</button>
      <button onClick={() => onPredict(planet.id)} style={{marginLeft: '5px'}}>軌道予測</button>
    </div>
  );
});

export default PlanetEditor;
