import { EditablePlanetParams } from './types';

// --- Simulation Constants ---
export const DEFAULT_GRAVITY = 6.674e-3; // Adjusted G for simulation scale
export const PREDICTION_STEPS = 500; // Number of steps to predict ahead
export const DEFAULT_SUN_MASS = 10000;

// --- Time Control Constants ---
export const DEFAULT_TIME_SCALE = 1;
export const MIN_TIME_SCALE = 0.1;
export const MAX_TIME_SCALE = 10;

// --- View Constants ---
export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const DEFAULT_CAMERA_TARGET = 'sun'; // Use string ID 'sun'

// --- Initial Planet Data ---
// Add type and rotationSpeed to default params
export const DEFAULT_PLANETS_PARAMS: EditablePlanetParams[] = [
  // 太陽系主要8惑星（スケール調整済み、色・テクスチャは既存画像に合わせる）
  {
    name: 'Mercury',
    type: 'rocky',
    radius: 3.8, // 実際の半径: 2,440km → 地球半径(6,371km)を9とした縮尺
    color: 'gray',
    texturePath: 'planets/mercury.jpg',
    mass: 0.055, // 地球質量=1
    initialOrbitalRadius: 58, // 0.39AU→地球=150
    rotationSpeed: 0.017
  },
  {
    name: 'Venus',
    type: 'rocky',
    radius: 9.2, // 6,052km
    color: 'orange',
    texturePath: 'planets/venus.jpg',
    mass: 0.815,
    initialOrbitalRadius: 108, // 0.72AU
    rotationSpeed: -0.004 // 金星は逆自転
  },
  {
    name: 'Earth',
    type: 'rocky',
    radius: 9, // 6,371km
    color: 'blue',
    texturePath: 'planets/earth.jpg',
    mass: 1,
    initialOrbitalRadius: 150, // 1AU
    rotationSpeed: 0.02
  },
  {
    name: 'Mars',
    type: 'rocky',
    radius: 4.8, // 3,390km
    color: 'red',
    texturePath: 'planets/mars.jpg',
    mass: 0.107,
    initialOrbitalRadius: 228, // 1.52AU
    rotationSpeed: 0.018
  },
  {
    name: 'Jupiter',
    type: 'gas',
    radius: 100, // 69,911km → 地球の約11倍
    color: '#e0c080',
    texturePath: '', // テクスチャ未用意
    mass: 317.8,
    initialOrbitalRadius: 778, // 5.20AU
    rotationSpeed: 0.04
  },
  {
    name: 'Saturn',
    type: 'gas',
    radius: 83.7, // 58,232km
    color: '#ffe5a2',
    texturePath: '', // テクスチャ未用意
    mass: 95.2,
    initialOrbitalRadius: 1430, // 9.58AU
    rotationSpeed: 0.036
  },
  {
    name: 'Uranus',
    type: 'gas',
    radius: 36.4, // 25,362km
    color: '#b0e0e6',
    texturePath: '', // テクスチャ未用意
    mass: 14.5,
    initialOrbitalRadius: 2870, // 19.18AU
    rotationSpeed: -0.03 // 天王星は逆自転
  },
  {
    name: 'Neptune',
    type: 'gas',
    radius: 35.2, // 24,622km
    color: '#4166f5',
    texturePath: '', // テクスチャ未用意
    mass: 17.1,
    initialOrbitalRadius: 4500, // 30.07AU
    rotationSpeed: 0.032
  },
  {
    name: 'Halley',
    type: 'comet',
    radius: 2, // 小さな彗星
    color: '#87CEEB',
    texturePath: '', // テクスチャ未用意
    mass: 0.001,
    initialOrbitalRadius: 300, // 楕円軌道の近日点
    rotationSpeed: 0.05
  }
];

// --- Sun Constants ---
export const SUN_RADIUS = 30; // Visual radius
export const SUN_COLOR = 'yellow';
export const SUN_TEXTURE_PATH = 'planets/sun.jpg';
export const SUN_ROTATION_SPEED = 0.001;
