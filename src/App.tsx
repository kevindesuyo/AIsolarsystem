import React, { useRef, useState } from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import PhysicsPanel from './components/PhysicsPanel';
import { useSimulation } from './hooks/useSimulation'; // Changed to named import
import { useCanvasInteraction } from './hooks/useCanvasInteraction';

function App() {
  // Correctly type the canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Physics panel visibility state
  const [showPhysicsPanel, setShowPhysicsPanel] = useState(false);

  // Remove the duplicated old destructuring
  const {
    simulationParams, // Contains gravity, sunMass
    timeControl, // Contains timeScale, isRunning
    viewParams, // Contains zoom, cameraTarget
    planets,
    physicsQuantities, // Physics calculations for display
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
    onUpdatePlanetPosition, // Get the drag and drop function
    selectPlanetForPrediction, // Get the prediction selection function
  } = useSimulation(canvasRef);

  // Set up canvas interaction for drag and drop
  const { dragState } = useCanvasInteraction(
    canvasRef,
    planets,
    viewParams,
    onUpdatePlanetPosition
  );

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          cursor: dragState.isDragging ? 'grabbing' : 'grab'
        }} 
      />
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
      
      {/* Physics Panel */}
      {physicsQuantities && (
        <PhysicsPanel
          physics={physicsQuantities}
          isVisible={showPhysicsPanel}
          onToggleVisibility={() => setShowPhysicsPanel(!showPhysicsPanel)}
        />
      )}
    </>
  );
}

export default App;
