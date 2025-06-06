import { useState, useCallback } from 'react';
import { Planet, TrailMap, Vector2D } from '../types';

const MAX_TRAIL_LENGTH = 150; // Increased for better fade effect visibility

export function usePlanetTrails(initialPlanets: Planet[] = []) {
  const [planetTrails, setPlanetTrails] = useState<TrailMap>(() => {
    const initialMap: TrailMap = new Map();
    // Initialize with planet IDs as keys
    initialPlanets.forEach(p => {
      initialMap.set(p.id, []);
    });
    return initialMap;
  });

  // Use planet ID as the key
  const addTrailPoint = useCallback((planetId: string, point: Vector2D) => {
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      const trail = newMap.get(planetId) || [];
      const newTrail = [...trail, point];
      if (newTrail.length > MAX_TRAIL_LENGTH) {
        newTrail.shift(); // Remove the oldest point
      }
      newMap.set(planetId, newTrail); // Use ID as key
      return newMap;
    });
  }, []);

  // Reset using planet IDs
  const resetAllTrails = useCallback((planets: Planet[]) => {
    const newMap: TrailMap = new Map();
    planets.forEach(p => {
      newMap.set(p.id, []); // Use ID as key
    });
    setPlanetTrails(newMap);
  }, []);

  // renameTrail is no longer needed as we use ID

  // Remove trail using planet ID
  const removeTrail = useCallback((planetId: string) => {
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      newMap.delete(planetId); // Use ID as key
      return newMap;
    });
  }, []);

  // Ensure trail exists using planet ID
  const ensureTrailExists = useCallback((planetId: string) => {
    setPlanetTrails(prev => {
      if (!prev.has(planetId)) { // Use ID as key
        const newMap = new Map(prev);
        newMap.set(planetId, []); // Use ID as key
        return newMap;
      }
      return prev; // No change needed
    });
  }, []);


  return {
    planetTrails,
    addTrailPoint,
    resetAllTrails,
    // renameTrail removed
    removeTrail,
    ensureTrailExists,
  };
}
