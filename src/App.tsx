import React, { useRef, useState } from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import PhysicsPanel from './components/PhysicsPanel';
import { useSimulation } from './hooks/useSimulation'; // Changed to named import
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import GameHud from './components/GameHud';
import MissionBoard from './components/MissionBoard';
import EventFeed from './components/EventFeed';
import { useGameState } from './hooks/useGameState';
import { EditablePlanetParams } from './types';

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
    collisionEvents,
    lastCollisionTime,
  } = useSimulation(canvasRef);

  // Set up canvas interaction for drag and drop
  const { dragState } = useCanvasInteraction(
    canvasRef,
    planets,
    viewParams,
    onUpdatePlanetPosition
  );

  // Game layer (missions, score, events)
  const {
    score,
    stabilitySeconds,
    cometUptimeSeconds,
    missions,
    events,
    registerPlanetAdded,
    registerPlanetRemoved,
    registerReset,
  } = useGameState({
    planets,
    timeControl,
    collisionEvents,
    lastCollisionTime,
    physicsQuantities,
  });

  // Wrap control handlers to also update game state
  const handleAddPlanet = (params: EditablePlanetParams) => {
    onAddPlanet(params);
    registerPlanetAdded(params.name);
  };

  const handleRemovePlanet = (planetId: string) => {
    const targetName = planets.find(p => p.id === planetId)?.name ?? '未知の惑星';
    onRemovePlanet(planetId);
    registerPlanetRemoved(targetName);
  };

  const handleReset = () => {
    reset();
    registerReset(false);
  };

  const handleFullReset = () => {
    fullReset();
    registerReset(true);
  };

  return (
    <div className="app-shell">
      <canvas
        className="simulation-canvas"
        ref={canvasRef}
        aria-label="太陽系物理シミュレーション - 惑星の動きとその軌道を表示します"
        role="img"
        tabIndex={0}
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
        onReset={handleReset}
        onFullReset={handleFullReset}
        onGravityChange={onGravityChange}
        onSunMassChange={onSunMassChange}
        onZoomChange={onZoomChange}
        onCameraTargetChange={onCameraTargetChange}
        onAddPlanet={handleAddPlanet}
        onRemovePlanet={handleRemovePlanet}
        onUpdatePlanetParams={onUpdatePlanetParams}
        selectPlanetForPrediction={selectPlanetForPrediction} // Pass the function down
      />

      <MissionBoard missions={missions} />
      <EventFeed events={events} />
      <GameHud
        score={score}
        stabilitySeconds={stabilitySeconds}
        cometSeconds={cometUptimeSeconds}
        timeScale={timeControl.timeScale}
        planetCount={planets.length}
      />
      
      {/* Physics Panel */}
      {physicsQuantities && (
        <PhysicsPanel
          physics={physicsQuantities}
          isVisible={showPhysicsPanel}
          onToggleVisibility={() => setShowPhysicsPanel(!showPhysicsPanel)}
        />
      )}
    </div>
  );
}

export default App;
