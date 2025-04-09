import React, { useRef } from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import useSimulation from './hooks/useSimulation';

function App() {
  const canvasRef = useRef(null);

  const {
    timeScale,
    slowDown,
    speedUp,
    pause,
    resume,
    reset,
    gravity,
    onGravityChange,
    sunMass,
    onSunMassChange,
    planets,
    onAddPlanet,
    onRemovePlanet,
    onUpdatePlanet,
    zoom,
    onZoomChange,
    cameraTarget,
    onCameraTargetChange,
  } = useSimulation(canvasRef);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <ControlPanel
        timeScale={timeScale}
        onSlowDown={slowDown}
        onSpeedUp={speedUp}
        onPause={pause}
        onResume={resume}
        onReset={reset}
        gravity={gravity}
        onGravityChange={onGravityChange}
        sunMass={sunMass}
        onSunMassChange={onSunMassChange}
        planets={planets}
        onAddPlanet={onAddPlanet}
        onRemovePlanet={onRemovePlanet}
        onUpdatePlanet={onUpdatePlanet}
        zoom={zoom}
        onZoomChange={onZoomChange}
        cameraTarget={cameraTarget}
        onCameraTargetChange={onCameraTargetChange}
      />
    </>
  );
}

export default App;
