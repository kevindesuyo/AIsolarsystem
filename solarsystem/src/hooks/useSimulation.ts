import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { drawSolarSystem } from '../canvas/draw';
import { updateSimulationState, calculateOrbitalVelocity } from '../simulationEngine';
import { usePlanetTrails } from './usePlanetTrails';
import {
  Planet, Sun, SimulationParameters, TimeControlParameters, ViewParameters,
  Vector2D, EditablePlanetParams
} from '../types';

// --- Constants ---
const DEFAULT_GRAVITY = 6.674e-3; // Adjusted G for simulation scale
const DEFAULT_SUN_MASS = 10000;
const DEFAULT_TIME_SCALE = 1;
const MIN_TIME_SCALE = 0.1;
const MAX_TIME_SCALE = 10;
const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const DEFAULT_CAMERA_TARGET = 'sun';

// --- Helper Functions ---
function createInitialSun(canvasWidth: number, canvasHeight: number, mass: number): Sun {
  const sun: Sun = {
    name: 'Sun',
    radius: 30, // Visual radius
    color: 'yellow',
    mass: mass,
    position: { x: canvasWidth / 2, y: canvasHeight / 2 },
    velocity: { x: 0, y: 0 }, // Sun is stationary
    image: null,
  };
  // Load image asynchronously
  const img = new Image();
  img.src = '/planets/sun.jpg';
  img.onload = () => {
    sun.image = img;
  };
  return sun;
}

function createPlanetFromEditable(
  params: EditablePlanetParams,
  sun: Sun,
  G: number
): Planet {
  const position: Vector2D = {
    x: sun.position.x + params.initialOrbitalRadius,
    y: sun.position.y,
  };
  const velocity = calculateOrbitalVelocity(sun.position, position, G, sun.mass);

  const planet: Planet = {
    name: params.name,
    radius: params.radius,
    color: params.color,
    mass: params.mass,
    position: position,
    velocity: velocity,
    initialOrbitalRadius: params.initialOrbitalRadius,
    image: null, // Image loading can be added similarly if needed
  };
  // Example image loading (adjust path/logic as needed)
  // const img = new Image();
  // img.src = `/planets/${params.name.toLowerCase()}.jpg`; // Assuming image names match planet names
  // img.onload = () => {
  //   planet.image = img;
  // };
  return planet;
}

const DEFAULT_PLANETS_PARAMS: EditablePlanetParams[] = [
  { name: 'Mercury', radius: 5, color: 'gray', mass: 1, initialOrbitalRadius: 60 },
  { name: 'Venus', radius: 8, color: 'orange', mass: 1.5, initialOrbitalRadius: 100 },
  { name: 'Earth', radius: 9, color: 'blue', mass: 2, initialOrbitalRadius: 140 },
  { name: 'Mars', radius: 7, color: 'red', mass: 1.2, initialOrbitalRadius: 180 },
];

// --- Hook ---
// Accept RefObject<HTMLCanvasElement | null> to match useRef<HTMLCanvasElement>(null)
export function useSimulation(canvasRef: RefObject<HTMLCanvasElement | null>) {
  // --- State ---
  const [simulationParams, setSimulationParams] = useState<SimulationParameters>({
    gravity: DEFAULT_GRAVITY,
    sunMass: DEFAULT_SUN_MASS,
  });
  const [timeControl, setTimeControl] = useState<TimeControlParameters>({
    timeScale: DEFAULT_TIME_SCALE,
    isRunning: true,
  });
  const [viewParams, setViewParams] = useState<ViewParameters>({
    zoom: DEFAULT_ZOOM,
    cameraTarget: DEFAULT_CAMERA_TARGET,
  });

  const [sun, setSun] = useState<Sun | null>(null);
  const [planets, setPlanets] = useState<Planet[]>([]);

  // Use the custom hook for trails
  const {
    planetTrails,
    addTrailPoint,
    resetAllTrails,
    renameTrail,
    removeTrail,
    ensureTrailExists,
  } = usePlanetTrails(planets);

  // Ref for animation loop to access latest state without triggering effect re-runs
  const animationFrameId = useRef<number | null>(null);
  const latestState = useRef({ sun, planets, simulationParams, timeControl, viewParams, planetTrails });

  // Update latestState ref whenever state changes
  useEffect(() => {
    latestState.current = { sun, planets, simulationParams, timeControl, viewParams, planetTrails };
  }, [sun, planets, simulationParams, timeControl, viewParams, planetTrails]);

  // --- Initialization ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const initialSun = createInitialSun(width, height, simulationParams.sunMass);
    setSun(initialSun);

    const initialPlanets = DEFAULT_PLANETS_PARAMS.map(params =>
      createPlanetFromEditable(params, initialSun, simulationParams.gravity)
    );
    setPlanets(initialPlanets);
    resetAllTrails(initialPlanets); // Initialize trails

    // Cleanup function to cancel animation frame on unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]); // Only run once on mount

  // --- Animation Loop ---
  useEffect(() => {
    if (!canvasRef.current || !sun) return; // Ensure canvas and sun are initialized

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const {
        sun: currentSun,
        planets: currentPlanets,
        simulationParams: currentSimParams,
        timeControl: currentTimeControl,
        viewParams: currentViewParams,
        planetTrails: currentTrails
      } = latestState.current; // Use latest state from ref

      if (!currentSun) { // Should not happen if initialized correctly, but safe check
          animationFrameId.current = requestAnimationFrame(animate);
          return;
      }

      let updatedPlanets = currentPlanets;
      if (currentTimeControl.isRunning && currentPlanets.length > 0) {
        // Update simulation state using the engine
        updatedPlanets = updateSimulationState(
          currentSun,
          currentPlanets,
          currentSimParams,
          currentTimeControl.timeScale
        );

        // Update trails after position update
        updatedPlanets.forEach(p => {
          addTrailPoint(p.name, p.position);
        });

        // Update the actual state (triggers re-render if needed, but animation loop continues regardless)
        // Debounce or throttle this if performance becomes an issue
         setPlanets(updatedPlanets);
      }

      // Draw the system
      drawSolarSystem(
        ctx,
        canvas.width,
        canvas.height,
        currentSun,
        updatedPlanets, // Draw the newly calculated positions
        currentViewParams,
        currentTrails
      );

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup function to cancel animation frame
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [canvasRef, sun, addTrailPoint]); // Re-run effect if canvas or sun changes (initialization)

  // --- Control Functions ---
  const slowDown = useCallback(() => {
    setTimeControl(prev => ({
      ...prev,
      timeScale: Math.max(MIN_TIME_SCALE, prev.timeScale * 0.5),
    }));
  }, []);

  const speedUp = useCallback(() => {
    setTimeControl(prev => ({
      ...prev,
      timeScale: Math.min(MAX_TIME_SCALE, prev.timeScale * 2),
    }));
  }, []);

  const pause = useCallback(() => {
    setTimeControl(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resume = useCallback(() => {
    setTimeControl(prev => ({ ...prev, isRunning: true }));
  }, []);

  const reset = useCallback(() => {
    if (!sun) return;
    const initialPlanets = DEFAULT_PLANETS_PARAMS.map(params =>
      createPlanetFromEditable(params, sun, simulationParams.gravity)
    );
    setPlanets(initialPlanets);
    resetAllTrails(initialPlanets);
    setTimeControl({ timeScale: DEFAULT_TIME_SCALE, isRunning: true });
  }, [sun, simulationParams.gravity, resetAllTrails]);

  const fullReset = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const newSimParams = { gravity: DEFAULT_GRAVITY, sunMass: DEFAULT_SUN_MASS };
    const newTimeControl = { timeScale: DEFAULT_TIME_SCALE, isRunning: true }; // Start running after full reset
    const newViewParams = { zoom: DEFAULT_ZOOM, cameraTarget: DEFAULT_CAMERA_TARGET };

    const newSun = createInitialSun(width, height, newSimParams.sunMass);
    const newPlanets = DEFAULT_PLANETS_PARAMS.map(params =>
      createPlanetFromEditable(params, newSun, newSimParams.gravity)
    );

    setSimulationParams(newSimParams);
    setTimeControl(newTimeControl);
    setViewParams(newViewParams);
    setSun(newSun);
    setPlanets(newPlanets);
    resetAllTrails(newPlanets);
  }, [canvasRef, resetAllTrails]);

  const onGravityChange = useCallback((value: number) => {
    setSimulationParams(prev => ({ ...prev, gravity: value }));
  }, []);

  const onSunMassChange = useCallback((value: number) => {
    setSimulationParams(prev => ({ ...prev, sunMass: value }));
    // Update sun object's mass directly as well
    setSun(prevSun => prevSun ? { ...prevSun, mass: value } : null);
  }, []);

  const onZoomChange = useCallback((value: number) => {
    setViewParams(prev => ({ ...prev, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value)) }));
  }, []);

  const onCameraTargetChange = useCallback((value: string) => {
    setViewParams(prev => ({ ...prev, cameraTarget: value }));
  }, []);

  const onAddPlanet = useCallback((params: EditablePlanetParams) => {
    if (!sun) return;
    // Ensure name is unique
    let newName = params.name;
    let counter = 1;
    while (planets.some(p => p.name === newName)) {
        newName = `${params.name}_${counter++}`;
    }
    const uniqueParams = {...params, name: newName};

    const newPlanet = createPlanetFromEditable(uniqueParams, sun, simulationParams.gravity);
    setPlanets(prev => [...prev, newPlanet]);
    ensureTrailExists(newPlanet.name); // Ensure trail map has entry
  }, [sun, planets, simulationParams.gravity, ensureTrailExists]);

  const onRemovePlanet = useCallback((planetName: string) => {
    setPlanets(prev => prev.filter(p => p.name !== planetName));
    removeTrail(planetName); // Remove trail data
  }, [removeTrail]);

  // Update only initial editable parameters. Recalculates position/velocity on next reset/add.
  const onUpdatePlanetParams = useCallback((targetName: string, updatedParams: Partial<EditablePlanetParams>) => {
      setPlanets(prevPlanets => {
          const targetIndex = prevPlanets.findIndex(p => p.name === targetName);
          if (targetIndex === -1) return prevPlanets; // Planet not found

          const oldPlanet = prevPlanets[targetIndex];
          const newParams: EditablePlanetParams = {
              // Get existing editable params
              name: oldPlanet.name,
              radius: oldPlanet.radius,
              color: oldPlanet.color,
              mass: oldPlanet.mass,
              initialOrbitalRadius: oldPlanet.initialOrbitalRadius ?? 0, // Provide default if undefined
              // Apply updates
              ...updatedParams,
          };

          // Ensure name uniqueness if changed
          let finalName = newParams.name;
          if (updatedParams.name && updatedParams.name !== oldPlanet.name) {
              let counter = 1;
              while (prevPlanets.some((p, i) => i !== targetIndex && p.name === finalName)) {
                  finalName = `${updatedParams.name}_${counter++}`;
              }
          }

          const updatedPlanet = {
              ...oldPlanet,
              name: finalName,
              radius: newParams.radius,
              color: newParams.color,
              mass: newParams.mass,
              initialOrbitalRadius: newParams.initialOrbitalRadius,
              // Keep current position and velocity - they are simulation state, not editable params
          };

          const newPlanets = [...prevPlanets];
          newPlanets[targetIndex] = updatedPlanet;

          // Rename trail if name changed
          if (finalName !== oldPlanet.name) {
              renameTrail(oldPlanet.name, finalName);
          }

          return newPlanets;
      });
  }, [renameTrail]);


  // --- Return Values ---
  return {
    // Simulation State (Read-only for components)
    sun, // Pass sun state if needed by components
    planets, // Pass planets state
    planetTrails, // Pass trails state

    // Parameters & Controls
    simulationParams,
    timeControl,
    viewParams,

    // Control Panel Actions
    slowDown,
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
    onUpdatePlanetParams, // Use this for updating editable params
  };
}
