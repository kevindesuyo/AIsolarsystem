import { useState, useRef, useEffect } from 'react';
import { drawSolarSystem } from '../canvas/draw';

function useSimulation(canvasRef) {
  const [timeScale, setTimeScale] = useState(1);
  const [, setIsRunning] = useState(true);

  const [gravity, setGravity] = useState(0.1);
  const [sunMass, setSunMass] = useState(10000);
  const [planets, setPlanets] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [cameraTarget, setCameraTarget] = useState('sun');

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

    if (!sunRef.current) {
      sunRef.current = {
        x: width / 2,
        y: height / 2,
        radius: 30,
        mass: sunMass,
        color: 'yellow'
      };
    } else {
      sunRef.current.mass = sunMass;
    }
    const sun = sunRef.current;

    if (!planetsRef.current) {
      planetsRef.current = initializePlanets(sun);
      setPlanets(planetsRef.current.map(p => ({...p})));
    }
    const planetsLocal = planetsRef.current;

    function animate() {
      drawSolarSystem(ctx, width, height, sun, planetsLocal, gravity, timeScaleRef, isRunningRef, zoom, cameraTarget);
      requestAnimationFrame(animate);
    }

    animate();
  }, [canvasRef, gravity, sunMass, zoom, cameraTarget]);

  const initializePlanets = (sun) => {
    return [
      { name: 'Mercury', radius: 5, color: 'gray', mass: 1, x: sun.x + 60, y: sun.y, vx: 0, vy: 2.5, trail: [], velocity: 2.5 },
      { name: 'Venus', radius: 8, color: 'orange', mass: 1, x: sun.x + 100, y: sun.y, vx: 0, vy: 2.0, trail: [], velocity: 2.0 },
      { name: 'Earth', radius: 9, color: 'blue', mass: 1, x: sun.x + 140, y: sun.y, vx: 0, vy: 1.7, trail: [], velocity: 1.7 },
      { name: 'Mars', radius: 7, color: 'red', mass: 1, x: sun.x + 180, y: sun.y, vx: 0, vy: 1.5, trail: [], velocity: 1.5 },
    ];
  };

  const reset = () => {
    planetsRef.current = initializePlanets(sunRef.current);
    setPlanets(planetsRef.current.map(p => ({...p})));
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

  const onGravityChange = (value) => {
    setGravity(value);
  };

  const onSunMassChange = (value) => {
    setSunMass(value);
    if (sunRef.current) {
      sunRef.current.mass = value;
    }
  };

  const onAddPlanet = () => {
    const newPlanet = { name: 'NewPlanet', radius: 5, color: 'white', mass: 1, x: sunRef.current.x + 200, y: sunRef.current.y, vx: 0, vy: 1.0, trail: [], velocity: 1.0 };
    planetsRef.current.push(newPlanet);
    setPlanets(planetsRef.current.map(p => ({...p})));
  };

  const onRemovePlanet = (index) => {
    planetsRef.current.splice(index, 1);
    setPlanets(planetsRef.current.map(p => ({...p})));
  };

  const onUpdatePlanet = (index, updatedPlanet) => {
    planetsRef.current[index] = {
      ...planetsRef.current[index],
      ...updatedPlanet,
      vx: 0,
      vy: updatedPlanet.velocity,
    };
    setPlanets(planetsRef.current.map(p => ({...p})));
  };

  const onZoomChange = (value) => {
    setZoom(value);
  };

  const onCameraTargetChange = (value) => {
    setCameraTarget(value);
  };

  return {
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
  };
}

export default useSimulation;
