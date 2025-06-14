import { Planet, Sun, ViewParameters, TrailMap, CelestialBody, Vector2D } from '../types';
import { loadImage, getCachedImage } from './textureLoader'; // Import from new module
import { ParticleManager } from './particles';

const STAR_COUNT = 100; // Number of background stars

// Offscreen canvas for pre-rendered stars
let starCanvas: HTMLCanvasElement | null = null;
let starCtx: CanvasRenderingContext2D | null = null;

/**
 * Pre-renders stars onto an offscreen canvas if not already done.
 */
function ensureStarsDrawn(width: number, height: number) {
  // Create canvas only once or if size changes significantly (optional enhancement)
  if (!starCanvas || starCanvas.width !== width || starCanvas.height !== height) {
    starCanvas = document.createElement('canvas');
    starCanvas.width = width;
    starCanvas.height = height;
    starCtx = starCanvas.getContext('2d');

    if (!starCtx) {
      console.error("Failed to get 2D context for star canvas");
      starCanvas = null; // Reset if context fails
      return;
    }

    // Draw stars onto the offscreen canvas
    starCtx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    for (let i = 0; i < STAR_COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 1.2;
      starCtx.beginPath();
      starCtx.arc(x, y, radius, 0, Math.PI * 2);
      starCtx.fill();
    }
  }
}

/**
 * Draws the pre-rendered stars from the offscreen canvas.
 */
function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ensureStarsDrawn(width, height); // Ensure stars are drawn on the offscreen canvas
  if (starCanvas) {
    ctx.drawImage(starCanvas, 0, 0); // Draw the pre-rendered canvas
  }
}

/**
 * Draws a celestial body (Sun or Planet) with texture and rotation.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  body: CelestialBody, // Use base type
  viewParams: ViewParameters,
  centerPos: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number
) {
  const { zoom } = viewParams;
  const screenX = (body.position.x - centerPos.x) * zoom + canvasWidth / 2;
  const screenY = (body.position.y - centerPos.y) * zoom + canvasHeight / 2;
  const screenRadius = Math.max(1, body.radius * zoom); // Ensure minimum radius of 1px

  ctx.save();

  // --- Try drawing with texture ---
  let textureDrawn = false;
  if (body.texturePath) {
    // Check cache first using the imported function
    const cachedImage = getCachedImage(body.texturePath);
    if (cachedImage) {
      // Apply rotation
      ctx.translate(screenX, screenY);
      ctx.rotate(body.currentRotation);
      ctx.drawImage(
        cachedImage,
        -screenRadius, // Draw centered around the translated origin
        -screenRadius,
        screenRadius * 2,
        screenRadius * 2
      );
      textureDrawn = true;
    } else {
      // Trigger loading using the imported function if not already loading/loaded
      loadImage(body.texturePath).catch(() => { /* Error handled in loadImage */ });
      // Fallback to color while loading
    }
  }

  // --- Fallback to drawing a colored circle ---
  if (!textureDrawn) {
    // Add shadow for the sun (only if drawing fallback circle)
    if (body.type === 'star') {
        ctx.shadowBlur = 50 * zoom;
        ctx.shadowColor = body.color || 'yellow';
    }
    ctx.beginPath();
    ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
    ctx.fillStyle = body.color;
    ctx.fill();
  }

  ctx.restore(); // Restore context before drawing labels

  // --- Draw labels (name and speed) for non-star bodies ---
  // Check if body is a Planet to access velocity (Sun type doesn't have it implicitly)
  if (body.type !== 'star' && 'velocity' in body) {
    const planetBody = body as Planet; // Type assertion
    ctx.fillStyle = 'white';
    ctx.font = `${Math.max(8, 12 * zoom)}px sans-serif`; // Ensure minimum font size
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(
      `${body.name}`,
      screenX + screenRadius + 4,
      screenY - screenRadius - 4 // Position above the planet
    );

    // Calculate and display speed
    const speed = Math.sqrt(planetBody.velocity.x ** 2 + planetBody.velocity.y ** 2).toFixed(2);
    ctx.textBaseline = 'top';
    ctx.fillText(
      `v=${speed}`,
      screenX + screenRadius + 4,
      screenY - screenRadius - 4 + (Math.max(8, 12 * zoom) + 2) // Position below the name
    );

    // Optionally display acceleration if needed (example)
    // const accel = Math.sqrt(planetBody.acceleration.x ** 2 + planetBody.acceleration.y ** 2).toFixed(2);
    // ctx.fillText(
    //   `a=${accel}`,
    //   screenX + screenRadius + 4,
    //   screenY - screenRadius - 4 + 2 * (Math.max(8, 12 * zoom) + 2) // Position below speed
    // );
  }
}

/**
 * Helper function to parse hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Helper function to parse CSS color name to RGB (basic colors only)
 */
function nameToRgb(colorName: string): { r: number; g: number; b: number } | null {
    const colorMap: { [key: string]: { r: number; g: number; b: number } } = {
        'red': { r: 255, g: 0, b: 0 },
        'green': { r: 0, g: 128, b: 0 },
        'blue': { r: 0, g: 0, b: 255 },
        'yellow': { r: 255, g: 255, b: 0 },
        'orange': { r: 255, g: 165, b: 0 },
        'purple': { r: 128, g: 0, b: 128 },
        'pink': { r: 255, g: 192, b: 203 },
        'cyan': { r: 0, g: 255, b: 255 },
        'magenta': { r: 255, g: 0, b: 255 },
        'gray': { r: 128, g: 128, b: 128 },
        'grey': { r: 128, g: 128, b: 128 },
        'white': { r: 255, g: 255, b: 255 },
        'black': { r: 0, g: 0, b: 0 },
    };
    return colorMap[colorName.toLowerCase()] || null;
}

/**
 * Draws the orbital trail for a planet with fade-out effect.
 */
function drawTrail(
    ctx: CanvasRenderingContext2D,
    planetId: string, // Use planet ID
    planetColor: string, // Pass color separately
    trail: TrailMap,
    viewParams: ViewParameters,
    centerPos: { x: number; y: number },
    canvasWidth: number,
    canvasHeight: number
) {
    const { zoom } = viewParams;
    const path = trail.get(planetId) || []; // Get trail using ID
    if (path.length < 2) return; // Need at least two points to draw a line

    ctx.save();

    // Parse planet color to RGB for fade effect
    let rgb = hexToRgb(planetColor) || nameToRgb(planetColor);
    if (!rgb) {
        // Fallback to a default color if parsing fails
        rgb = { r: 255, g: 255, b: 255 };
    }

    const lineWidth = Math.max(0.5, 1 * zoom); // Ensure minimum line width
    const totalPoints = path.length;

    // Draw trail segments with increasing opacity towards the end
    for (let i = 1; i < totalPoints; i++) {
        const prevPoint = path[i - 1];
        const currentPoint = path[i];

        // Calculate screen coordinates
        const prevX = (prevPoint.x - centerPos.x) * zoom + canvasWidth / 2;
        const prevY = (prevPoint.y - centerPos.y) * zoom + canvasHeight / 2;
        const currentX = (currentPoint.x - centerPos.x) * zoom + canvasWidth / 2;
        const currentY = (currentPoint.y - centerPos.y) * zoom + canvasHeight / 2;

        // Calculate alpha based on position in trail (fade from start to end)
        const normalizedPosition = i / (totalPoints - 1); // 0 to 1
        const alpha = Math.pow(normalizedPosition, 0.7) * 0.8; // Non-linear fade, max 0.8 opacity

        // Set style for this segment
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        ctx.lineWidth = lineWidth * (0.3 + normalizedPosition * 0.7); // Also fade line width
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw this segment
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Draws the predicted orbital path for a selected planet.
 */
function drawPredictionPath(
    ctx: CanvasRenderingContext2D,
    path: Vector2D[],
    viewParams: ViewParameters,
    centerPos: { x: number; y: number },
    canvasWidth: number,
    canvasHeight: number
) {
    if (path.length < 2) return;

    const { zoom } = viewParams;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // White, semi-transparent
    ctx.lineWidth = Math.max(0.5, 1 * zoom);
    ctx.setLineDash([5 * zoom, 5 * zoom]); // Dashed line
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
  planetTrails: TrailMap,
  predictedPath: Vector2D[], // Add predictedPath parameter
  particleManager?: ParticleManager // Add particle manager parameter
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
    // Pass ID and color to drawTrail
    drawTrail(ctx, planet.id, planet.color, planetTrails, viewParams, centerPos, width, height);
    drawBody(ctx, planet, viewParams, centerPos, width, height);
  });

  // Draw Predicted Path (if any)
  drawPredictionPath(ctx, predictedPath, viewParams, centerPos, width, height);

  // Draw Particles (if particle manager is provided)
  if (particleManager) {
    particleManager.draw(ctx, viewParams, centerPos, width, height);
  }
}
