import { EditablePlanetParams, Vector2D } from './types';

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
  { name: 'Mercury', type: 'rocky', radius: 5, color: 'gray', texturePath: 'planets/mercury.jpg', mass: 1, initialOrbitalRadius: 60, rotationSpeed: 0.01 },
  { name: 'Venus', type: 'rocky', radius: 8, color: 'orange', texturePath: 'planets/venus.jpg', mass: 1.5, initialOrbitalRadius: 100, rotationSpeed: 0.005 },
  { name: 'Earth', type: 'rocky', radius: 9, color: 'blue', texturePath: 'planets/earth.jpg', mass: 2, initialOrbitalRadius: 140, rotationSpeed: 0.02 },
  { name: 'Mars', type: 'rocky', radius: 7, color: 'red', texturePath: 'planets/mars.jpg', mass: 1.2, initialOrbitalRadius: 180, rotationSpeed: 0.018 },
];

// --- Sun Constants ---
export const SUN_RADIUS = 30; // Visual radius
export const SUN_COLOR = 'yellow';
export const SUN_TEXTURE_PATH = 'planets/sun.jpg';
export const SUN_ROTATION_SPEED = 0.001;
