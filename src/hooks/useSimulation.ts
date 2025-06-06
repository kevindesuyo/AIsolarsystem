import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { drawSolarSystem } from '../canvas/draw';
import { updateSimulationState } from '../simulationEngine';
import { usePlanetTrails } from './usePlanetTrails';
import { usePrediction } from './usePrediction'; // Import the new hook
import { ParticleManager } from '../canvas/particles';
import {
  Planet, Sun, SimulationParameters, TimeControlParameters, ViewParameters,
  EditablePlanetParams, Vector2D
} from '../types';
import {
  DEFAULT_GRAVITY, DEFAULT_SUN_MASS,
  DEFAULT_TIME_SCALE, MIN_TIME_SCALE, MAX_TIME_SCALE,
  DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, DEFAULT_CAMERA_TARGET,
  DEFAULT_PLANETS_PARAMS
} from '../constants';
import { createInitialSun, createPlanetFromEditable } from '../simulationUtils';

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

  // Particle system management
  const particleManagerRef = useRef<ParticleManager>(new ParticleManager());

  // Use the custom hook for trails (renameTrail is removed)
  const {
    planetTrails,
    addTrailPoint,
    resetAllTrails,
    // renameTrail, // Removed
    removeTrail,
    ensureTrailExists,
  } = usePlanetTrails(planets);

  // Use the prediction hook
  const {
    predictedPath,
    selectPlanetForPrediction,
  } = usePrediction(planets, sun, simulationParams, timeControl);

  // Ref for animation loop to access latest state without triggering effect re-runs
  const animationFrameId = useRef<number | null>(null);
  const trailUpdateCounter = useRef<number>(0); // Counter for trail update throttling
  // Remove prediction state from latestState ref
  const latestState = useRef({ sun, planets, simulationParams, timeControl, viewParams, planetTrails, predictedPath });

  // Update latestState ref whenever state changes
  useEffect(() => {
    // Update ref with current state including predictedPath from usePrediction
    latestState.current = { sun, planets, simulationParams, timeControl, viewParams, planetTrails, predictedPath };
  }, [sun, planets, simulationParams, timeControl, viewParams, planetTrails, predictedPath]); // Add predictedPath dependency


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

    // Initialize particle effects
    const particleManager = particleManagerRef.current;
    particleManager.clear();
    particleManager.toggleEffect(initialSun.id, 'star', true); // Enable solar corona
    
    // Enable comet tails for comet-type planets
    initialPlanets.forEach(planet => {
      if (planet.type === 'comet') {
        particleManager.toggleEffect(planet.id, 'comet', true);
      }
    });

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
        predictedPath: currentPredictedPath // Get predicted path from ref (now updated by usePrediction via useEffect)
      } = latestState.current; // Use latest state from ref

      if (!currentSun) { // Should not happen if initialized correctly, but safe check
          animationFrameId.current = requestAnimationFrame(animate);
          return;
      }

      let updatedPlanets = currentPlanets;
      if (currentTimeControl.isRunning && currentPlanets.length > 0) {
        // Update simulation state using the engine
        const simulationResult = updateSimulationState(
          currentSun,
          currentPlanets,
          currentSimParams,
          currentTimeControl.timeScale
        );
        updatedPlanets = simulationResult.planets;

        // Handle collision explosions
        if (simulationResult.collisions.length > 0) {
          simulationResult.collisions.forEach(collision => {
            particleManagerRef.current.createExplosion(
              collision.position,
              collision.radius,
              collision.color1,
              collision.color2
            );
          });
        }

        // Update trails after position update using planet ID (throttled for better performance)
        trailUpdateCounter.current++;
        if (trailUpdateCounter.current % 2 === 0) { // Update trails every 2 frames for smoother fade
          updatedPlanets.forEach(p => {
            addTrailPoint(p.id, p.position); // Use ID
          });
        }

        // Update the actual state (triggers re-render if needed, but animation loop continues regardless)
        // Debounce or throttle this if performance becomes an issue
         setPlanets(updatedPlanets);

        // Update particle systems
        const celestialBodies = new Map();
        celestialBodies.set(currentSun.id, currentSun);
        updatedPlanets.forEach(planet => {
          celestialBodies.set(planet.id, planet);
        });
        particleManagerRef.current.update(celestialBodies, currentTimeControl.timeScale);
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
        currentPredictedPath, // Pass predicted path to draw function
        particleManagerRef.current // Pass particle manager to draw function
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

    // Reset particle effects
    const particleManager = particleManagerRef.current;
    particleManager.clear();
    particleManager.toggleEffect(sun.id, 'star', true);
    initialPlanets.forEach(planet => {
      if (planet.type === 'comet') {
        particleManager.toggleEffect(planet.id, 'comet', true);
      }
    });
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

    // Reset particle effects
    const particleManager = particleManagerRef.current;
    particleManager.clear();
    particleManager.toggleEffect(newSun.id, 'star', true);
    newPlanets.forEach(planet => {
      if (planet.type === 'comet') {
        particleManager.toggleEffect(planet.id, 'comet', true);
      }
    });
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
    const getUniqueName = (baseName: string): string => {
      const existingNames = planets.map(p => p.name);
      if (!existingNames.includes(baseName)) {
        return baseName;
      }
      
      for (let counter = 1; counter < 1000; counter++) {
        const candidateName = `${baseName}_${counter}`;
        if (!existingNames.includes(candidateName)) {
          return candidateName;
        }
      }
      return `${baseName}_${Date.now()}`; // Fallback if somehow we can't find a unique name
    };
    
    const uniqueName = getUniqueName(params.name);
    const uniqueParams = {...params, name: uniqueName};

    const newPlanet = createPlanetFromEditable(uniqueParams, sun, simulationParams.gravity);
    setPlanets(prev => [...prev, newPlanet]);
    ensureTrailExists(newPlanet.id); // Ensure trail map has entry using ID
    
    // Add particle effect if it's a comet
    if (newPlanet.type === 'comet') {
      particleManagerRef.current.toggleEffect(newPlanet.id, 'comet', true);
    }
  }, [sun, planets, simulationParams.gravity, ensureTrailExists]);

  // Remove planet using ID (Need to find ID first, or change ControlPanel to pass ID)
  // For now, let's assume ControlPanel passes ID. If not, we need to adjust ControlPanel or find ID here.
  // Let's modify this to expect an ID.
  const onRemovePlanet = useCallback((planetId: string) => {
    const planet = planets.find(p => p.id === planetId);
    setPlanets(prev => prev.filter(p => p.id !== planetId));
    removeTrail(planetId); // Remove trail data using ID
    
    // Remove particle effect if it was a comet
    if (planet?.type === 'comet') {
      particleManagerRef.current.toggleEffect(planetId, 'comet', false);
    }
  }, [removeTrail, planets]);

  // Update only initial editable parameters.
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
          const getUniqueNameForUpdate = (baseName: string, currentId: string): string => {
            const existingNames = prevPlanets
              .filter(p => p.id !== currentId)
              .map(p => p.name);
            
            if (!existingNames.includes(baseName)) {
              return baseName;
            }
            
            for (let counter = 1; counter < 1000; counter++) {
              const candidateName = `${baseName}_${counter}`;
              if (!existingNames.includes(candidateName)) {
                return candidateName;
              }
            }
            return `${baseName}_${Date.now()}`; // Fallback
          };

          const finalName = updatedParams.name && updatedParams.name !== oldPlanet.name
            ? getUniqueNameForUpdate(updatedParams.name, targetId)
            : mergedParams.name;

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

          // Handle particle effect changes if type changed
          if (updatedParams.type && updatedParams.type !== oldPlanet.type) {
            const particleManager = particleManagerRef.current;
            
            // Remove old effect
            if (oldPlanet.type === 'comet') {
              particleManager.toggleEffect(targetId, 'comet', false);
            }
            
            // Add new effect
            if (updatedParams.type === 'comet') {
              particleManager.toggleEffect(targetId, 'comet', true);
            }
          }

          // No need to rename trail as we use ID now

          return newPlanets;
      });
  }, []); // Removed renameTrail dependency

  // Update planet position for drag and drop
  const onUpdatePlanetPosition = useCallback((planetId: string, newPosition: Vector2D) => {
    setPlanets(prevPlanets => {
      const targetIndex = prevPlanets.findIndex(p => p.id === planetId);
      if (targetIndex === -1) return prevPlanets;

      const updatedPlanet = {
        ...prevPlanets[targetIndex],
        position: newPosition,
        // Reset velocity when manually positioning to avoid sudden jumps
        velocity: { x: 0, y: 0 },
      };

      const newPlanets = [...prevPlanets];
      newPlanets[targetIndex] = updatedPlanet;
      return newPlanets;
    });
  }, []);

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
    onUpdatePlanetPosition, // Expose drag and drop function
    selectPlanetForPrediction, // Expose function from usePrediction
  };
}
