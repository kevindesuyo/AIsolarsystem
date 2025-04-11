import { useState, useRef, useEffect } from 'react';
import { drawSolarSystem } from '../canvas/draw';

type PlanetType = {
  name: string;
  radius: number;
  color: string;
  mass: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  velocity: number;
  image?: HTMLImageElement;
};

type TrailType = { x: number; y: number }[];
type TrailMap = Map<string, TrailType>;

function useSimulation(canvasRef: any) {
  const [timeScale, setTimeScale] = useState(1);
  const [isRunning, setIsRunning] = useState(true);

  const [gravity, setGravity] = useState(0.1);
  const [sunMass, setSunMass] = useState(10000);
  const [planets, setPlanets] = useState<PlanetType[]>([]);
  const [zoom, setZoom] = useState(1);
  const [cameraTarget, setCameraTarget] = useState('sun');

  // Refはアニメーションループ用のみに限定
  const timeScaleRef = useRef(1);
  const isRunningRef = useRef(true);

  const sunRef = useRef<any | null>(null);
  const planetsRef = useRef<any | null>(null);

  // 軌跡管理
  const [planetTrails, setPlanetTrails] = useState<TrailMap>(new Map());

  // 軌跡の追加
  const addTrailPoint = (planetName: string, x: number, y: number) => {
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      const trail = newMap.get(planetName) || [];
      trail.push({ x, y });
      if (trail.length > 100) trail.shift();
      newMap.set(planetName, trail);
      return newMap;
    });
  };

  // 軌跡のリセット
  const resetAllTrails = (planetList: PlanetType[]) => {
    const newMap: TrailMap = new Map();
    planetList.forEach(p => {
      newMap.set(p.name, []);
    });
    setPlanetTrails(newMap);
  };

  // 惑星名変更時の軌跡同期
  const renameTrail = (oldName: string, newName: string) => {
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      if (newMap.has(oldName)) {
        const trail = newMap.get(oldName)!;
        newMap.delete(oldName);
        newMap.set(newName, trail);
      }
      return newMap;
    });
  };

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
        color: 'yellow',
        image: null,
      };
      // 太陽画像のロード
      const sunImg = new Image();
      sunImg.src = '/planets/sun.jpg';
      sunImg.onload = () => {
        sunRef.current.image = sunImg;
      };
    } else {
      sunRef.current.mass = sunMass;
    }
    const sun = sunRef.current;

    if (!planetsRef.current) {
      planetsRef.current = initializePlanets(sun);
      setPlanets(planetsRef.current.map(p => ({ ...p })));
      resetAllTrails(planetsRef.current);
    }
    // 惑星配列が変わったら軌跡も同期
    if (planets.length > 0) {
      planets.forEach(p => {
        if (!planetTrails.has(p.name)) {
          setPlanetTrails(prev => {
            const newMap = new Map(prev);
            newMap.set(p.name, []);
            return newMap;
          });
        }
      });
    }

    // Refの値を最新のuseState値で同期
    timeScaleRef.current = timeScale;
    isRunningRef.current = isRunning;

    function animate() {
      // 軌跡の更新
      if (isRunningRef.current && planets.length > 0) {
        planets.forEach(p => {
          addTrailPoint(p.name, p.x, p.y);
        });
      }
      drawSolarSystem(ctx, width, height, sun, planets, gravity, timeScaleRef, isRunningRef, zoom, cameraTarget, planetTrails);
      requestAnimationFrame(animate);
    }

    animate();
    // eslint-disable-next-line
  }, [canvasRef, gravity, sunMass, zoom, cameraTarget, planets, planetTrails, timeScale, isRunning]);

  const initializePlanets = (sun: any): PlanetType[] => {
    return [
      { name: 'Mercury', radius: 5, color: 'gray', mass: 1, x: sun.x + 60, y: sun.y, vx: 0, vy: 2.5, velocity: 2.5 },
      { name: 'Venus', radius: 8, color: 'orange', mass: 1, x: sun.x + 100, y: sun.y, vx: 0, vy: 2.0, velocity: 2.0 },
      { name: 'Earth', radius: 9, color: 'blue', mass: 1, x: sun.x + 140, y: sun.y, vx: 0, vy: 1.7, velocity: 1.7 },
      { name: 'Mars', radius: 7, color: 'red', mass: 1, x: sun.x + 180, y: sun.y, vx: 0, vy: 1.5, velocity: 1.5 },
    ];
  };

  const reset = () => {
    planetsRef.current = initializePlanets(sunRef.current);
    setPlanets(planetsRef.current.map(p => ({ ...p })));
    resetAllTrails(planetsRef.current);
    setIsRunning(true);
    setTimeScale(1);
    timeScaleRef.current = 1;
    isRunningRef.current = true;
  };

  const fullReset = () => {
    if (canvasRef.current) {
      const width = canvasRef.current.width = window.innerWidth;
      const height = canvasRef.current.height = window.innerHeight;

      sunRef.current = {
        x: width / 2,
        y: height / 2,
        radius: 30,
        mass: 10000,
        color: 'yellow',
        image: null,
      };
      const sunImg = new Image();
      sunImg.src = '/planets/sun.jpg';
      sunImg.onload = () => {
        sunRef.current.image = sunImg;
        const newPlanets = initializePlanets(sunRef.current);
        planetsRef.current = newPlanets;
        setPlanets([...newPlanets]);
        resetAllTrails(newPlanets);
      };
    }

    setGravity(0.1);
    setSunMass(10000);
    setZoom(1);
    setCameraTarget('sun');

    setIsRunning(false);
    isRunningRef.current = false;

    setTimeScale(1);
    timeScaleRef.current = 1;
  };

  const slowDown = () => {
    if (!isRunning) return;
    setTimeScale(prev => {
      const newScale = Math.max(0.1, Math.min(10, prev * 0.5));
      return newScale;
    });
  };

  const speedUp = () => {
    if (!isRunning) return;
    setTimeScale(prev => {
      const newScale = Math.max(0.1, Math.min(10, prev * 2));
      return newScale;
    });
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    setIsRunning(true);
  };

  const onGravityChange = (value: number) => {
    setGravity(value);
  };

  const onSunMassChange = (value: number) => {
    setSunMass(value);
    if (sunRef.current) {
      sunRef.current.mass = value;
    }
  };

  const onAddPlanet = () => {
    const newPlanet: PlanetType = { name: 'NewPlanet', radius: 5, color: 'white', mass: 1, x: sunRef.current.x + 200, y: sunRef.current.y, vx: 0, vy: 1.0, velocity: 1.0 };
    planetsRef.current.push(newPlanet);
    setPlanets(planetsRef.current.map((p: PlanetType) => ({ ...p })));
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      newMap.set(newPlanet.name, []);
      return newMap;
    });
  };

  const onRemovePlanet = (index: number) => {
    const removed = planetsRef.current[index].name;
    planetsRef.current.splice(index, 1);
    setPlanets(planetsRef.current.map((p: PlanetType) => ({ ...p })));
    setPlanetTrails(prev => {
      const newMap = new Map(prev);
      newMap.delete(removed);
      return newMap;
    });
  };

  const onUpdatePlanet = (index: number, updatedPlanet: Partial<PlanetType>) => {
    const oldName = planetsRef.current[index].name;
    const newName = updatedPlanet.name ?? oldName;
    planetsRef.current[index] = {
      ...planetsRef.current[index],
      ...updatedPlanet,
      // vx, vyはリセットしない
    };
    setPlanets(planetsRef.current.map((p: PlanetType) => ({ ...p })));
    if (oldName !== newName) {
      renameTrail(oldName, newName);
    }
  };

  const onZoomChange = (value: number) => {
    setZoom(value);
  };

  const onCameraTargetChange = (value: string) => {
    setCameraTarget(value);
  };

  return {
    timeScale,
    isRunning,
    slowDown,
    speedUp,
    pause,
    resume,
    reset,
    fullReset,
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
    planetTrails,
  };
}

export default useSimulation;
