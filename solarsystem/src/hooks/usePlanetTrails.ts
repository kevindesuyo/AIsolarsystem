import { useState, useCallback } from 'react';
import { Planet, TrailMap, Vector2D } from '../types';

const MAX_TRAIL_LENGTH = 100;

export function usePlanetTrails(initialPlanets: Planet[] = []) {
  const [planetTrails, setPlanetTrails] = useState<TrailMap>(() => {
    const initialMap: TrailMap = new Map();
    initialPlanets.forEach(p => {
      initialMap.set(p.name, []);
    });
    return initialMap;
  });

  const addTrailPoint = useCallback((planetName: string, point: Vector2D) => {
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      const trail = newMap.get(planetName) || [];
      const newTrail = [...trail, point];
      if (newTrail.length > MAX_TRAIL_LENGTH) {
        newTrail.shift(); // Remove the oldest point
      }
      newMap.set(planetName, newTrail);
      return newMap;
    });
  }, []);

  const resetAllTrails = useCallback((planets: Planet[]) => {
    const newMap: TrailMap = new Map();
    planets.forEach(p => {
      newMap.set(p.name, []);
    });
    setPlanetTrails(newMap);
  }, []);

  const renameTrail = useCallback((oldName: string, newName: string) => {
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      if (newMap.has(oldName)) {
        const trail = newMap.get(oldName)!;
        newMap.delete(oldName);
        newMap.set(newName, trail);
      }
      return newMap;
    });
  }, []);

  const removeTrail = useCallback((planetName: string) => {
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      newMap.delete(planetName);
      return newMap;
    });
  }, []);

  const ensureTrailExists = useCallback((planetName: string) => {
    setPlanetTrails(prev => {
      if (!prev.has(planetName)) {
        const newMap = new Map(prev);
        newMap.set(planetName, []);
        return newMap;
      }
      return prev; // No change needed
    });
  }, []);


  return {
    planetTrails,
    addTrailPoint,
    resetAllTrails,
    renameTrail,
    removeTrail,
    ensureTrailExists,
  };
}
