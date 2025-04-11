import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { drawSolarSystem } from '../canvas/draw';
import { updateSimulationState, calculateOrbitalVelocity } from '../simulationEngine';
import { usePlanetTrails } from './usePlanetTrails';
import {
  Planet, Sun, SimulationParameters, TimeControlParameters, ViewParameters,
  Vector2D, EditablePlanetParams, CelestialBody
} from '../types';

// --- Constants ---
const DEFAULT_GRAVITY = 6.674e-3; // Adjusted G for simulation scale
const PREDICTION_STEPS = 500; // Number of steps to predict ahead
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
    id: crypto.randomUUID(),
    name: 'Sun',
    type: 'star',
    radius: 30, // Visual radius
    color: 'yellow',
    texturePath: 'planets/sun.jpg', // Add texture path
    mass: mass,
    position: { x: canvasWidth / 2, y: canvasHeight / 2 },
    velocity: { x: 0, y: 0 }, // Sun is stationary
    rotationSpeed: 0.001, // Example rotation speed
    currentRotation: 0,
    // acceleration is not typically relevant for a stationary sun in this model
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
    id: crypto.randomUUID(),
    name: params.name,
    type: params.type,
    radius: params.radius,
    color: params.color,
    texturePath: params.texturePath || `planets/${params.name.toLowerCase()}.jpg`, // Default path or from params
    mass: params.mass,
    position: position,
    velocity: velocity,
    rotationSpeed: params.rotationSpeed,
    currentRotation: Math.random() * 2 * Math.PI, // Random initial rotation
    initialOrbitalRadius: params.initialOrbitalRadius,
    acceleration: { x: 0, y: 0 }, // Initialize acceleration
  };
  return planet;
}

// Add type and rotationSpeed to default params
const DEFAULT_PLANETS_PARAMS: EditablePlanetParams[] = [
  { name: 'Mercury', type: 'rocky', radius: 5, color: 'gray', texturePath: 'planets/mercury.jpg', mass: 1, initialOrbitalRadius: 60, rotationSpeed: 0.01 },
  { name: 'Venus', type: 'rocky', radius: 8, color: 'orange', texturePath: 'planets/venus.jpg', mass: 1.5, initialOrbitalRadius: 100, rotationSpeed: 0.005 },
  { name: 'Earth', type: 'rocky', radius: 9, color: 'blue', texturePath: 'planets/earth.jpg', mass: 2, initialOrbitalRadius: 140, rotationSpeed: 0.02 },
  { name: 'Mars', type: 'rocky', radius: 7, color: 'red', texturePath: 'planets/mars.jpg', mass: 1.2, initialOrbitalRadius: 180, rotationSpeed: 0.018 },
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
  const [predictedPlanetId, setPredictedPlanetId] = useState<string | null>(null);
  const [predictedPath, setPredictedPath] = useState<Vector2D[]>([]);


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
  // Include prediction state in latestState ref if needed by animation loop directly,
  // but prediction calculation happens in its own effect.
  const latestState = useRef({ sun, planets, simulationParams, timeControl, viewParams, planetTrails, predictedPath });

  // Update latestState ref whenever state changes
  useEffect(() => {
    latestState.current = { sun, planets, simulationParams, timeControl, viewParams, planetTrails, predictedPath };
  }, [sun, planets, simulationParams, timeControl, viewParams, planetTrails, predictedPath]);


  // --- Prediction Calculation ---
  // Function to calculate predicted path (can be moved outside if preferred)
  const calculatePredictedPath = useCallback((
    targetId: string,
    currentPlanets: Planet[],
    currentSun: Sun,
    currentSimParams: SimulationParameters,
    currentTimeScale: number,
    steps: number
  ): Vector2D[] => {
    const targetPlanetIndex = currentPlanets.findIndex(p => p.id === targetId);
    if (targetPlanetIndex === -1) return [];

    let tempPlanets = currentPlanets.map(p => ({ ...p })); // Deep copy needed? For now, shallow copy position/velocity
    const path: Vector2D[] = [tempPlanets[targetPlanetIndex].position]; // Start with current position

    for (let i = 0; i < steps; i++) {
      // Simulate one step ahead using the simulation engine on the temporary state
      // NOTE: This uses the *exported* updateSimulationState which includes collision handling.
      // For pure prediction, a version without collision might be better, but this works for now.
      tempPlanets = updateSimulationState(currentSun, tempPlanets, currentSimParams, currentTimeScale);

      // Find the target planet again in case of mergers/removals (though mergers change ID)
      const currentTargetIndex = tempPlanets.findIndex(p => p.id === targetId);
      if (currentTargetIndex === -1) break; // Target planet disappeared (e.g., collision)

      path.push(tempPlanets[currentTargetIndex].position);
    }

    return path;
  }, []); // Dependencies will be handled by the useEffect below

  // Effect to recalculate prediction when relevant state changes
  useEffect(() => {
    if (predictedPlanetId && sun && planets.length > 0) {
      const path = calculatePredictedPath(
        predictedPlanetId,
        planets,
        sun,
        simulationParams,
        timeControl.timeScale, // Use current timeScale for prediction step size
        PREDICTION_STEPS
      );
      setPredictedPath(path);
    } else {
      setPredictedPath([]); // Clear path if no planet selected or simulation not ready
    }
  }, [predictedPlanetId, planets, sun, simulationParams, timeControl.timeScale, calculatePredictedPath]);


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
        planetTrails: currentTrails,
        predictedPath: currentPredictedPath // Get predicted path from ref
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
        currentTrails,
        currentPredictedPath // Pass predicted path to draw function
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
  const onUpdatePlanetParams = useCallback((targetId: string, updatedParams: Partial<EditablePlanetParams>) => {
      setPlanets(prevPlanets => {
          const targetIndex = prevPlanets.findIndex(p => p.id === targetId); // Use ID for lookup
          if (targetIndex === -1) return prevPlanets; // Planet not found

          const oldPlanet = prevPlanets[targetIndex];

          // Create the full EditablePlanetParams object, merging old and new
          // Ensure all required fields have values
          const mergedParams: EditablePlanetParams = {
              name: updatedParams.name ?? oldPlanet.name,
              type: updatedParams.type ?? oldPlanet.type,
              radius: updatedParams.radius ?? oldPlanet.radius,
              color: updatedParams.color ?? oldPlanet.color,
              texturePath: updatedParams.texturePath === undefined ? oldPlanet.texturePath : updatedParams.texturePath, // Handle undefined vs missing
              mass: updatedParams.mass ?? oldPlanet.mass,
              initialOrbitalRadius: updatedParams.initialOrbitalRadius ?? oldPlanet.initialOrbitalRadius ?? 0,
              rotationSpeed: updatedParams.rotationSpeed ?? oldPlanet.rotationSpeed,
          };

          // Ensure name uniqueness if changed
          let finalName = mergedParams.name;
          if (updatedParams.name && updatedParams.name !== oldPlanet.name) {
              let counter = 1;
              // Check against other planets using ID comparison
              while (prevPlanets.some(p => p.id !== targetId && p.name === finalName)) {
                  finalName = `${updatedParams.name}_${counter++}`;
              }
          }

          // Create the updated Planet object, keeping non-editable fields
          const updatedPlanet: Planet = {
              ...oldPlanet, // Keep id, position, velocity, currentRotation, acceleration
              name: finalName,
              type: mergedParams.type,
              radius: mergedParams.radius,
              color: mergedParams.color,
              texturePath: mergedParams.texturePath,
              mass: mergedParams.mass,
              initialOrbitalRadius: mergedParams.initialOrbitalRadius,
              rotationSpeed: mergedParams.rotationSpeed,
              // Note: position, velocity, acceleration, currentRotation are managed by the simulation loop
          };

          const newPlanets = [...prevPlanets];
          newPlanets[targetIndex] = updatedPlanet;

          // Rename trail if name changed (still use name for trails for now)
          if (finalName !== oldPlanet.name) {
              renameTrail(oldPlanet.name, finalName);
          }

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
    sun,
    planets,
    planetTrails,
    predictedPath, // Pass prediction path

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
    onUpdatePlanetParams,
    selectPlanetForPrediction: setPredictedPlanetId, // Expose function to select planet for prediction
  };
}
