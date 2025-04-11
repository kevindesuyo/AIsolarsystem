import { Planet, Sun, ViewParameters, TrailMap } from '../types';

const STAR_COUNT = 50; // Number of background stars

/**
 * Draws the background stars.
 */
function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
  for (let i = 0; i < STAR_COUNT; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws a celestial body (Sun or Planet).
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  body: Sun | Planet,
  viewParams: ViewParameters,
  centerPos: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number
) {
  const { zoom } = viewParams;
  const screenX = (body.position.x - centerPos.x) * zoom + canvasWidth / 2;
  const screenY = (body.position.y - centerPos.y) * zoom + canvasHeight / 2;
  const screenRadius = body.radius * zoom;

  ctx.save();

  // Add shadow for the sun
  if (body.name === 'Sun') {
    ctx.shadowBlur = 50 * zoom;
    ctx.shadowColor = 'yellow';
  }

  if (body.image && body.image.complete) {
    ctx.drawImage(
      body.image,
      screenX - screenRadius,
      screenY - screenRadius,
      screenRadius * 2,
      screenRadius * 2
    );
  } else {
    // Fallback to drawing a circle if image not loaded/available
    ctx.beginPath();
    ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
    ctx.fillStyle = body.color;
    ctx.fill();
  }

  ctx.restore();

  // Draw labels (name and speed) for planets only
  if (body.name !== 'Sun') {
    ctx.fillStyle = 'white';
    ctx.font = `${Math.max(8, 12 * zoom)}px sans-serif`; // Ensure minimum font size
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `${body.name}`,
      screenX + screenRadius + 4,
      screenY - screenRadius - 4
    );

    // Calculate and display speed
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2).toFixed(2);
    ctx.textBaseline = 'top';
    ctx.fillText(
      `v=${speed}`,
      screenX + screenRadius + 4,
      screenY + screenRadius + 4 // Position below the planet
    );
  }
}

/**
 * Draws the orbital trail for a planet.
 */
function drawTrail(
    ctx: CanvasRenderingContext2D,
    planet: Planet,
    trail: TrailMap,
    viewParams: ViewParameters,
    centerPos: { x: number; y: number },
    canvasWidth: number,
    canvasHeight: number
) {
    const { zoom } = viewParams;
    const path = trail.get(planet.name) || [];
    if (path.length < 2) return; // Need at least two points to draw a line

    ctx.save();
    ctx.strokeStyle = planet.color;
    ctx.lineWidth = Math.max(0.5, 1 * zoom); // Ensure minimum line width
    ctx.globalAlpha = 0.6; // Make trails slightly transparent
    ctx.beginPath();

    // Move to the first point
    ctx.moveTo(
        (path[0].x - centerPos.x) * zoom + canvasWidth / 2,
        (path[0].y - centerPos.y) * zoom + canvasHeight / 2
    );

    // Draw lines to subsequent points
    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(
            (path[i].x - centerPos.x) * zoom + canvasWidth / 2,
            (path[i].y - centerPos.y) * zoom + canvasHeight / 2
        );
    }
    ctx.stroke();
    ctx.restore();
}


/**
 * Main drawing function for the solar system simulation.
 * This function is responsible only for rendering the current state.
 */
export function drawSolarSystem(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sun: Sun,
  planets: Planet[],
  viewParams: ViewParameters,
  planetTrails: TrailMap
) {
  // Clear canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  // Draw background stars
  drawStars(ctx, width, height);

  // Determine camera center based on target
  let centerPos = { x: sun.position.x, y: sun.position.y };
  if (viewParams.cameraTarget !== 'sun') {
    const targetPlanet = planets.find(p => p.name === viewParams.cameraTarget);
    if (targetPlanet) {
      centerPos = { x: targetPlanet.position.x, y: targetPlanet.position.y };
    }
    // If target planet not found (e.g., just removed), default back to sun? Or keep last known?
    // For now, defaults to sun if target not found.
  }

  // Draw Sun
  drawBody(ctx, sun, viewParams, centerPos, width, height);

  // Draw Planets and Trails
  planets.forEach(planet => {
    drawTrail(ctx, planet, planetTrails, viewParams, centerPos, width, height);
    drawBody(ctx, planet, viewParams, centerPos, width, height);
  });
}
