import { useState, useRef, useEffect } from 'react';
import { drawSolarSystem } from '../canvas/draw';

function useSimulation(canvasRef) {
  const [timeScale, setTimeScale] = useState(1);
  const [, setIsRunning] = useState(true);

  const timeScaleRef = useRef(1);
  const isRunningRef = useRef(true);

  const sunRef = useRef(null);
  const planetsRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const G = 0.1;

    if (!sunRef.current) {
      sunRef.current = { 
        x: width / 2, 
        y: height / 2, 
        radius: 30, 
        mass: 10000, 
        color: 'yellow' 
      };
    }
    const sun = sunRef.current;

    if (!planetsRef.current) {
      planetsRef.current = initializePlanets(sun);
    }
    const planets = planetsRef.current;

    function animate() {
      drawSolarSystem(ctx, width, height, sun, planets, G, timeScaleRef, isRunningRef);
      requestAnimationFrame(animate);
    }

    animate();
  }, [canvasRef]);

  const initializePlanets = (sun) => {
    return [
      { radius: 5, color: 'gray', mass: 1, x: sun.x + 60, y: sun.y, vx: 0, vy: 2.5, trail: [] },
      { radius: 8, color: 'orange', mass: 1, x: sun.x + 100, y: sun.y, vx: 0, vy: 2.0, trail: [] },
      { radius: 9, color: 'blue', mass: 1, x: sun.x + 140, y: sun.y, vx: 0, vy: 1.7, trail: [] },
      { radius: 7, color: 'red', mass: 1, x: sun.x + 180, y: sun.y, vx: 0, vy: 1.5, trail: [] },
      { radius: 15, color: 'brown', mass: 1, x: sun.x + 240, y: sun.y, vx: 0, vy: 1.2, trail: [] },
      { radius: 12, color: 'beige', mass: 1, x: sun.x + 300, y: sun.y, vx: 0, vy: 1.0, trail: [] },
      { radius: 10, color: 'lightblue', mass: 1, x: sun.x + 350, y: sun.y, vx: 0, vy: 0.9, trail: [] },
      { radius: 10, color: 'darkblue', mass: 1, x: sun.x + 400, y: sun.y, vx: 0, vy: 0.8, trail: [] },
    ];
  };

  const reset = () => {
    planetsRef.current = initializePlanets(sunRef.current);
    setIsRunning(true);
    setTimeScale(1);
    timeScaleRef.current = 1;
    isRunningRef.current = true;
  };

  const slowDown = () => {
    if (!isRunningRef.current) return;
    setTimeScale(prev => {
      const newScale = Math.max(0.1, Math.min(10, prev * 0.5));
      timeScaleRef.current = newScale;
      return newScale;
    });
  };

  const speedUp = () => {
    if (!isRunningRef.current) return;
    setTimeScale(prev => {
      const newScale = Math.max(0.1, Math.min(10, prev * 2));
      timeScaleRef.current = newScale;
      return newScale;
    });
  };

  const pause = () => {
    setIsRunning(false);
    isRunningRef.current = false;
  };

  const resume = () => {
    setIsRunning(true);
    isRunningRef.current = true;
  };

  return {
    timeScale,
    slowDown,
    speedUp,
    pause,
    resume,
    reset,
  };
}

export default useSimulation;
