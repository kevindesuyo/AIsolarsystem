export type Vector2D = {
  x: number;
  y: number;
};

// 天体の種類を定義
export type PlanetType = 'star' | 'rocky' | 'gas' | 'dwarf' | 'asteroid' | 'comet';

export type CelestialBody = {
  id: string; // 一意なIDを追加（衝突などで名前が変わる可能性があるため）
  name: string;
  type: PlanetType;
  radius: number; // 天体自体の半径 (描画や衝突判定に使用)
  color: string; // テクスチャがない場合のフォールバック色
  texturePath?: string; // テクスチャ画像のパス (例: 'planets/earth.jpg')
  mass: number;
  position: Vector2D;
  velocity: Vector2D;
  rotationSpeed: number; // 自転速度 (rad/タイムステップ)
  currentRotation: number; // 現在の自転角度 (rad)
  // image?: HTMLImageElement | null; // 描画時に動的にロードするため削除
};

export type Planet = CelestialBody & {
  initialOrbitalRadius?: number; // 初期軌道半径（オプション）
  initialVelocityMagnitude?: number; // 初速度の大きさ（オプション）
  acceleration: Vector2D; // 現在の加速度ベクトル (情報表示用)
};

// SunもCelestialBodyを継承するが、特定のプロパティを持つ可能性がある
export type Sun = CelestialBody & {
  // Sun特有のプロパティがあればここに追加
};

export type TrailPoint = Vector2D;
export type Trail = TrailPoint[];
export type TrailMap = Map<string, Trail>; // Key: Planet ID

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
  type: PlanetType;
  radius: number; // 惑星自体の半径
  color: string; // テクスチャがない場合のフォールバック色
  texturePath?: string;
  mass: number;
  initialOrbitalRadius: number; // 太陽からの初期距離
  rotationSpeed: number; // 自転速度 (rad/タイムステップ)
  // initialVelocityMagnitude は G, M, r から計算するため編集不可とする
  // id, position, velocity, acceleration, currentRotation はシミュレーションで決まるため編集不可
};
