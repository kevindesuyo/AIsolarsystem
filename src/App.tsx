import React, { useRef, useState, useCallback } from 'react';
import './App.css';
import ControlPanel from './components/ControlPanel';
import PhysicsPanel from './components/PhysicsPanel';
import { useSimulation } from './hooks/useSimulation'; // Changed to named import
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import GameHud from './components/GameHud';
import MissionBoard from './components/MissionBoard';
import EventFeed from './components/EventFeed';
import { useGameState } from './hooks/useGameState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import TutorialModal from './components/TutorialModal';
import { EditablePlanetParams } from './types';

// Check if tutorial has been shown before
const TUTORIAL_SHOWN_KEY = 'solarops_tutorial_shown';

function App() {
  // Correctly type the canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Physics panel visibility state
  const [showPhysicsPanel, setShowPhysicsPanel] = useState(false);
  
  // Tutorial modal state
  const [showTutorial, setShowTutorial] = useState(() => {
    // Show tutorial on first visit
    return !localStorage.getItem(TUTORIAL_SHOWN_KEY);
  });

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
    loadScenario, // Get the scenario loading function
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
    zoom: viewParams.zoom,
  });

  // Handle tutorial close
  const handleTutorialClose = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_SHOWN_KEY, 'true');
  }, []);

  // Toggle help/tutorial
  const toggleHelp = useCallback(() => {
    setShowTutorial(prev => !prev);
  }, []);

  // Zoom handlers for keyboard shortcuts
  const handleZoomIn = useCallback(() => {
    onZoomChange(viewParams.zoom * 1.2);
  }, [viewParams.zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange(viewParams.zoom * 0.8);
  }, [viewParams.zoom, onZoomChange]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onPause: pause,
    onResume: resume,
    onSpeedUp: speedUp,
    onSlowDown: slowDown,
    onReset: reset,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onToggleHelp: toggleHelp,
    isRunning: timeControl.isRunning,
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
        selectPlanetForPrediction={selectPlanetForPrediction}
        onLoadScenario={loadScenario}
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

      {/* Help Button */}
      <button 
        className="help-btn" 
        onClick={toggleHelp}
        aria-label="ヘルプを表示"
        title="ヘルプ (H)"
      >
        ?
      </button>

      {/* Keyboard shortcuts hint */}
      <div className="keyboard-hint glass-panel">
        <kbd>Space</kbd> 一時停止 | <kbd>+/-</kbd> 速度 | <kbd>Z/X</kbd> ズーム | <kbd>H</kbd> ヘルプ
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal onClose={handleTutorialClose} />
      )}
    </div>
  );
}

export default App;
