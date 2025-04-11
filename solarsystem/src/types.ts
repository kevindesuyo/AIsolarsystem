export type Vector2D = {
  x: number;
  y: number;
};

export type CelestialBody = {
  name: string;
  radius: number; // 惑星/太陽自体の半径
  color: string;
  mass: number;
  position: Vector2D;
  velocity: Vector2D;
  image?: HTMLImageElement | null;
};

export type Planet = CelestialBody & {
  initialOrbitalRadius?: number; // 初期軌道半径（オプション）
  initialVelocityMagnitude?: number; // 初速度の大きさ（オプション）
};

export type Sun = CelestialBody;

export type TrailPoint = Vector2D;
export type Trail = TrailPoint[];
export type TrailMap = Map<string, Trail>; // Key: Planet name

export type SimulationParameters = {
  gravity: number;
  sunMass: number;
};

export type TimeControlParameters = {
  timeScale: number;
  isRunning: boolean;
};

export type ViewParameters = {
  zoom: number;
  cameraTarget: string; // 'sun' or planet name
};

// ControlPanelで惑星の初期パラメータを編集するための型
export type EditablePlanetParams = {
  name: string;
  radius: number; // 惑星自体の半径
  color: string;
  mass: number;
  initialOrbitalRadius: number; // 太陽からの初期距離
  // initialVelocityMagnitude は G, M, r から計算するため編集不可とする
};
