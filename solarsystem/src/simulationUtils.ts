import { Planet, Sun, EditablePlanetParams, Vector2D } from './types';
import { calculateOrbitalVelocity } from './simulationEngine';
import {
  SUN_RADIUS,
  SUN_COLOR,
  SUN_TEXTURE_PATH,
  SUN_ROTATION_SPEED
} from './constants';

/**
 * Creates the initial Sun object centered in the canvas.
 */
export function createInitialSun(canvasWidth: number, canvasHeight: number, mass: number): Sun {
  const sun: Sun = {
    id: crypto.randomUUID(), // Use crypto.randomUUID for modern standards
    name: 'Sun',
    type: 'star',
    radius: SUN_RADIUS,
    color: SUN_COLOR,
    texturePath: SUN_TEXTURE_PATH,
    mass: mass,
    position: { x: canvasWidth / 2, y: canvasHeight / 2 },
    velocity: { x: 0, y: 0 }, // Sun is stationary
    rotationSpeed: SUN_ROTATION_SPEED,
    currentRotation: 0,
    // acceleration is not typically relevant for a stationary sun in this model
  };
  return sun;
}

/**
 * Creates a Planet object from editable parameters, calculating initial position and velocity.
 */
export function createPlanetFromEditable(
  params: EditablePlanetParams,
  sun: Sun,
  G: number
): Planet {
  // Position relative to the sun
  const position: Vector2D = {
    x: sun.position.x + params.initialOrbitalRadius,
    y: sun.position.y, // Start aligned horizontally with the sun
  };

  // Calculate stable orbital velocity based on position, G, and sun's mass
  const velocity = calculateOrbitalVelocity(sun.position, position, G, sun.mass);

  const planet: Planet = {
    id: crypto.randomUUID(), // Use crypto.randomUUID
    name: params.name,
    type: params.type,
    radius: params.radius,
    color: params.color,
    // Default texture path based on name if not provided
    texturePath: params.texturePath || `planets/${params.name.toLowerCase()}.jpg`,
    mass: params.mass,
    position: position,
    velocity: velocity,
    rotationSpeed: params.rotationSpeed,
    currentRotation: Math.random() * 2 * Math.PI, // Random initial rotation
    initialOrbitalRadius: params.initialOrbitalRadius, // Store for potential reference
    acceleration: { x: 0, y: 0 }, // Initialize acceleration
  };
  return planet;
}
