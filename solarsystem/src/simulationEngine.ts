import { Planet, Sun, SimulationParameters, Vector2D } from './types';

/**
 * Calculates the gravitational force vector exerted by body2 on body1.
 * F = G * m1 * m2 / r^2
 * Returns the force vector { fx, fy }.
 */
function calculateGravitationalForce(
  body1: Planet | Sun,
  body2: Planet | Sun,
  G: number
): Vector2D {
  const dx = body2.position.x - body1.position.x;
  const dy = body2.position.y - body1.position.y;
  const distSq = dx * dx + dy * dy;

  // Avoid division by zero or extremely large forces at very small distances
  if (distSq < 1e-6) {
    return { x: 0, y: 0 };
  }

  const dist = Math.sqrt(distSq);
  const forceMagnitude = (G * body1.mass * body2.mass) / distSq;

  // Force vector components acting on body1
  const fx = forceMagnitude * (dx / dist);
  const fy = forceMagnitude * (dy / dist);

  return { x: fx, y: fy };
}

/**
 * Updates the state of the planets for one time step.
 * @param sun The sun object.
 * @param planets The current array of planets.
 * @param params Simulation parameters (gravity G).
 * @param timeStep The time elapsed in this step (timeScale).
 * @returns The updated array of planets.
 */
export function updateSimulationState(
  sun: Sun,
  planets: Planet[],
  params: SimulationParameters,
  timeStep: number
): Planet[] {
  if (timeStep <= 0) {
    return planets; // No update if time is paused or reversed
  }

  const G = params.gravity;

  return planets.map((planet) => {
    let totalForce: Vector2D = { x: 0, y: 0 };

    // Force from the sun
    const sunForce = calculateGravitationalForce(planet, sun, G);
    totalForce.x += sunForce.x;
    totalForce.y += sunForce.y;

    // Forces from other planets (n-body interaction)
    planets.forEach((otherPlanet) => {
      if (otherPlanet === planet) return; // Skip self interaction
      const planetForce = calculateGravitationalForce(planet, otherPlanet, G);
      totalForce.x += planetForce.x;
      totalForce.y += planetForce.y;
    });

    // Calculate acceleration (a = F / m)
    const acceleration: Vector2D = {
      x: totalForce.x / planet.mass,
      y: totalForce.y / planet.mass,
    };

    // Update velocity (v = v0 + a * dt)
    const newVelocity: Vector2D = {
      x: planet.velocity.x + acceleration.x * timeStep,
      y: planet.velocity.y + acceleration.y * timeStep,
    };

    // Update position (p = p0 + v * dt) - Using new velocity for semi-implicit Euler
    const newPosition: Vector2D = {
      x: planet.position.x + newVelocity.x * timeStep,
      y: planet.position.y + newVelocity.y * timeStep,
    };

    return {
      ...planet,
      position: newPosition,
      velocity: newVelocity,
    };
  });
}

/**
 * Calculates the initial velocity for a stable circular orbit.
 * v = sqrt(G * M / r)
 * Assumes the planet starts perpendicular to the radius vector from the sun.
 * @param sunPosition Position of the central body (sun).
 * @param planetPosition Initial position of the orbiting body (planet).
 * @param G Gravitational constant.
 * @param centralMass Mass of the central body (sun).
 * @returns The initial velocity vector { x, y }.
 */
export function calculateOrbitalVelocity(
  sunPosition: Vector2D,
  planetPosition: Vector2D,
  G: number,
  centralMass: number
): Vector2D {
  const dx = planetPosition.x - sunPosition.x;
  const dy = planetPosition.y - sunPosition.y;
  const r = Math.sqrt(dx * dx + dy * dy);

  if (r === 0) {
    return { x: 0, y: 0 }; // Avoid division by zero if at the center
  }

  const velocityMagnitude = Math.sqrt((G * centralMass) / r);

  // Velocity vector perpendicular to the radius vector (counter-clockwise orbit)
  const vx = -velocityMagnitude * (dy / r);
  const vy = velocityMagnitude * (dx / r);

  return { x: vx, y: vy };
}
