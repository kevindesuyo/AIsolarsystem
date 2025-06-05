import React, { useRef } from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import { useSimulation } from './hooks/useSimulation'; // Changed to named import

function App() {
  // Correctly type the canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Remove the duplicated old destructuring
  const {
    simulationParams, // Contains gravity, sunMass
    timeControl, // Contains timeScale, isRunning
    viewParams, // Contains zoom, cameraTarget
    planets,
    // planetTrails, // Not directly needed by App or ControlPanel display
    slowDown, // Control function
    speedUp,
    pause,
    resume,
    reset,
    fullReset,
    onGravityChange,
    onSunMassChange,
    onZoomChange,
    onCameraTargetChange,
    onAddPlanet,
    onRemovePlanet,
    onUpdatePlanetParams, // Use the new update function
    selectPlanetForPrediction, // Get the prediction selection function
  } = useSimulation(canvasRef);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      {/* Pass the structured parameters and updated functions to ControlPanel */}
      <ControlPanel
        timeControl={timeControl}
        simulationParams={simulationParams}
        viewParams={viewParams}
        planets={planets} // Pass the current planet state for display/selection
        onSlowDown={slowDown}
        onSpeedUp={speedUp}
        onPause={pause}
        onResume={resume}
        onReset={reset}
        onFullReset={fullReset}
        onGravityChange={onGravityChange}
        onSunMassChange={onSunMassChange}
        onZoomChange={onZoomChange}
        onCameraTargetChange={onCameraTargetChange}
        onAddPlanet={onAddPlanet}
        onRemovePlanet={onRemovePlanet}
        onUpdatePlanetParams={onUpdatePlanetParams}
        selectPlanetForPrediction={selectPlanetForPrediction} // Pass the function down
      />
    </>
  );
}

export default App;
