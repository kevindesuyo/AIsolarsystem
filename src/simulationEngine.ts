import { Planet, Sun, SimulationParameters, Vector2D } from './types';
import { generateUUID } from './utils/uuid';

export type CollisionInfo = {
  position: Vector2D;
  radius: number;
  color1: string;
  color2: string;
  bodies: Array<{
    id: string;
    name: string;
    mass: number;
  }>;
};

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
  // Use minimum planetary radius to determine threshold
  const minRadius = Math.min(body1.radius, body2.radius);
  const minDistance = minRadius * 0.1; // 10% of smaller body's radius
  if (distSq < minDistance * minDistance) {
    return { x: 0, y: 0 };
  }

  // Add softening parameter to prevent numerical instabilities in close encounters
  const softeningParameter = minRadius * 0.01; // 1% of smaller body's radius
  const softenedDistSq = distSq + softeningParameter * softeningParameter;
  const dist = Math.sqrt(distSq);
  const forceMagnitude = (G * body1.mass * body2.mass) / softenedDistSq;

  // Force vector components acting on body1
  const fx = forceMagnitude * (dx / dist);
  const fy = forceMagnitude * (dy / dist);

  return { x: fx, y: fy };
}


/**
 * Handles collisions between planets in the given list.
 * Assumes perfectly inelastic collisions (mergers).
 * @param planets List of planets after position/velocity update for the timestep.
 * @returns Object containing the new list of planets and collision information.
 */
function handleCollisions(planets: Planet[]): { planets: Planet[]; collisions: CollisionInfo[] } {
    const finalPlanets: Planet[] = [];
    const collisions: CollisionInfo[] = [];
    const collidedIds = new Set<string>(); // Keep track of planets already involved in a collision this step

    for (let i = 0; i < planets.length; i++) {
        if (collidedIds.has(planets[i].id)) continue; // Skip if already collided

        let currentPlanet = planets[i];
        let collisionOccurred = false;

        for (let j = i + 1; j < planets.length; j++) {
            if (collidedIds.has(planets[j].id)) continue; // Skip other already collided planet

            const otherPlanet = planets[j];
            const dx = otherPlanet.position.x - currentPlanet.position.x;
            const dy = otherPlanet.position.y - currentPlanet.position.y;
            const distSq = dx * dx + dy * dy;
            const radiusSum = currentPlanet.radius + otherPlanet.radius;

            // Collision detected
            if (distSq < radiusSum * radiusSum) {
                // Mark both as collided
                collidedIds.add(currentPlanet.id);
                collidedIds.add(otherPlanet.id);
                collisionOccurred = true; // Mark that the currentPlanet was involved

                // Record collision information for explosion effect
                collisions.push({
                    position: {
                        x: (currentPlanet.position.x + otherPlanet.position.x) / 2,
                        y: (currentPlanet.position.y + otherPlanet.position.y) / 2,
                    },
                    radius: Math.max(currentPlanet.radius, otherPlanet.radius),
                    color1: currentPlanet.color,
                    color2: otherPlanet.color,
                    bodies: [
                      { id: currentPlanet.id, name: currentPlanet.name, mass: currentPlanet.mass },
                      { id: otherPlanet.id, name: otherPlanet.name, mass: otherPlanet.mass },
                    ],
                });

                // Determine larger planet (by mass)
                const largerPlanet = currentPlanet.mass >= otherPlanet.mass ? currentPlanet : otherPlanet;
                const smallerPlanet = currentPlanet.mass < otherPlanet.mass ? currentPlanet : otherPlanet;

                // Calculate properties of the merged planet
                const combinedMass = currentPlanet.mass + otherPlanet.mass;
                // Conservation of momentum: m1*v1 + m2*v2 = (m1+m2)*v_new
                const newVelocity: Vector2D = {
                    x: (currentPlanet.mass * currentPlanet.velocity.x + otherPlanet.mass * otherPlanet.velocity.x) / combinedMass,
                    y: (currentPlanet.mass * currentPlanet.velocity.y + otherPlanet.mass * otherPlanet.velocity.y) / combinedMass,
                };
                // Position of the merged planet (use center of mass)
                const newPosition: Vector2D = {
                    x: (currentPlanet.mass * currentPlanet.position.x + otherPlanet.mass * otherPlanet.position.x) / combinedMass,
                    y: (currentPlanet.mass * currentPlanet.position.y + otherPlanet.mass * otherPlanet.position.y) / combinedMass,
                };

                // Create the new merged planet
                const mergedPlanet: Planet = {
                    id: generateUUID(),
                    name: `${largerPlanet.name} & ${smallerPlanet.name} Merger`,
                    type: largerPlanet.type, // Inherit from larger
                    radius: Math.pow(
                        Math.pow(currentPlanet.radius, 3) + Math.pow(otherPlanet.radius, 3),
                        1/3
                    ), // Conservation of volume: r_new = (r1³ + r2³)^(1/3)
                    color: largerPlanet.color, // Inherit color from larger
                    texturePath: largerPlanet.texturePath, // Inherit texture
                    mass: combinedMass,
                    position: newPosition,
                    velocity: newVelocity,
                    rotationSpeed: largerPlanet.rotationSpeed, // Inherit rotation speed
                    currentRotation: largerPlanet.currentRotation, // Inherit current rotation
                    acceleration: { x: 0, y: 0 }, // Reset acceleration (will be calculated next step)
                    // initialOrbitalRadius and initialVelocityMagnitude are not relevant for merged objects
                };

                // Replace currentPlanet with the merged result for potential further collisions in this step
                // This is a simplification; complex multi-body collisions are hard.
                // For now, we just add the merged planet at the end.
                finalPlanets.push(mergedPlanet); // Add the new merged planet

                // Break the inner loop as the currentPlanet (i) is now considered handled
                break;
            }
        }

        // If the current planet (i) was not involved in any collision, add it to the final list
        if (!collisionOccurred) {
            finalPlanets.push(currentPlanet);
        }
    }

    return { planets: finalPlanets, collisions };
}


/**
 * Updates the state of the planets for one time step, including collision handling.
 * @param sun The sun object.
 * @param planets The current array of planets.
 * @param params Simulation parameters (gravity G).
 * @param timeStep The time elapsed in this step (timeScale).
 * @returns Object containing the updated planets and collision information.
 */
export function updateSimulationState(
  sun: Sun,
  planets: Planet[],
  params: SimulationParameters,
  timeStep: number
): { planets: Planet[]; collisions: CollisionInfo[] } {
  if (timeStep <= 0 || planets.length === 0) {
    return { planets, collisions: [] }; // No update if time is paused, reversed, or no planets
  }

  const G = params.gravity;

  // 1. Calculate forces and update position/velocity/rotation for all planets
  const updatedPlanets = planets.map((planet) => {
    let totalForce: Vector2D = { x: 0, y: 0 };

    // Force from the sun
    const sunForce = calculateGravitationalForce(planet, sun, G);
    totalForce.x += sunForce.x;
    totalForce.y += sunForce.y;

    // Forces from other planets (n-body interaction)
    planets.forEach((otherPlanet) => {
      if (otherPlanet.id === planet.id) return; // Skip self interaction (use ID)
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

    // Update rotation angle
    const newRotation = (planet.currentRotation + planet.rotationSpeed * timeStep) % (2 * Math.PI);

    return {
      ...planet,
      position: newPosition,
      velocity: newVelocity,
      acceleration: acceleration, // Store the calculated acceleration
      currentRotation: newRotation, // Store the updated rotation
    };
  });

  // 2. Handle collisions among the updated planets
  const collisionResult = handleCollisions(updatedPlanets);

  return collisionResult;
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

  if (r < 1e-10) {
    return { x: 0, y: 0 }; // Avoid division by zero if at the center
  }

  const velocityMagnitude = Math.sqrt((G * centralMass) / r);

  // Velocity vector perpendicular to the radius vector (counter-clockwise orbit)
  const vx = -velocityMagnitude * (dy / r);
  const vy = velocityMagnitude * (dx / r);

  return { x: vx, y: vy };
}
