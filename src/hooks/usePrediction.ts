import { useState, useEffect, useCallback } from 'react';
import { Planet, Sun, SimulationParameters, Vector2D, TimeControlParameters } from '../types';
import { updateSimulationState } from '../simulationEngine';
import { PREDICTION_STEPS } from '../constants';

/**
 * Custom hook to manage and calculate the predicted path for a selected planet.
 */
export function usePrediction(
  planets: Planet[],
  sun: Sun | null,
  simulationParams: SimulationParameters,
  timeControl: TimeControlParameters
) {
  const [predictedPlanetId, setPredictedPlanetId] = useState<string | null>(null);
  const [predictedPath, setPredictedPath] = useState<Vector2D[]>([]);

  // Function to calculate predicted path
  const calculatePredictedPath = useCallback((
    targetId: string,
    currentPlanets: Planet[],
    currentSun: Sun,
    currentSimParams: SimulationParameters,
    currentTimeScale: number,
    steps: number
  ): Vector2D[] => {
    const targetPlanetIndex = currentPlanets.findIndex(p => p.id === targetId);
    if (targetPlanetIndex === -1 || !currentSun) return []; // Ensure sun exists

    // Create deep copies for simulation to avoid modifying original state
    let tempPlanets = currentPlanets.map(p => ({
        ...p,
        position: { ...p.position },
        velocity: { ...p.velocity },
        acceleration: { ...p.acceleration }
    }));
    const tempSun = { ...currentSun, position: { ...currentSun.position } }; // Copy sun too

    const path: Vector2D[] = [tempPlanets[targetPlanetIndex].position]; // Start with current position

    for (let i = 0; i < steps; i++) {
      // Simulate one step ahead using the simulation engine on the temporary state
      const simulationResult = updateSimulationState(tempSun, tempPlanets, currentSimParams, currentTimeScale);
      tempPlanets = simulationResult.planets;

      // Find the target planet again in case of mergers/removals
      const currentTargetIndex = tempPlanets.findIndex(p => p.id === targetId);
      if (currentTargetIndex === -1) break; // Target planet disappeared

      path.push(tempPlanets[currentTargetIndex].position);
    }

    return path;
  }, []); // Dependencies are managed by the calling useEffect

  // Effect to recalculate prediction when relevant state changes
  useEffect(() => {
    if (predictedPlanetId && sun && planets.length > 0) {
      const path = calculatePredictedPath(
        predictedPlanetId,
        planets, // Use the planets passed into the hook
        sun,     // Use the sun passed into the hook
        simulationParams, // Use params passed into the hook
        timeControl.timeScale, // Use timeScale passed into the hook
        PREDICTION_STEPS
      );
      setPredictedPath(path);
    } else {
      setPredictedPath([]); // Clear path if no planet selected or simulation not ready
    }
    // Depend on the state passed into the hook
  }, [predictedPlanetId, planets, sun, simulationParams, timeControl.timeScale, calculatePredictedPath]);

  return {
    predictedPlanetId,
    predictedPath,
    selectPlanetForPrediction: setPredictedPlanetId, // Function to set the ID
  };
}
