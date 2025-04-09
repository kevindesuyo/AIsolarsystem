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
      />
    </>
  );
}

export default App;
