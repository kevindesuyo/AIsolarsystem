import { Planet, Sun, ViewParameters, TrailMap, CelestialBody, Vector2D } from '../types'; // Add Vector2D

const STAR_COUNT = 100; // Number of background stars

// Simple cache for loaded texture images
const textureCache = new Map<string, HTMLImageElement>();
const imageLoadPromises = new Map<string, Promise<HTMLImageElement>>();

// Function to load an image and return a promise
function loadImage(src: string): Promise<HTMLImageElement> {
    if (textureCache.has(src)) {
        return Promise.resolve(textureCache.get(src)!);
    }
    if (imageLoadPromises.has(src)) {
        return imageLoadPromises.get(src)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            textureCache.set(src, img);
            imageLoadPromises.delete(src); // Remove promise once loaded
            resolve(img);
        };
        img.onerror = (err) => {
            console.error(`Failed to load image: ${src}`, err);
            imageLoadPromises.delete(src); // Remove promise on error
            reject(err);
        };
        img.src = src; // Start loading
    });

    imageLoadPromises.set(src, promise);
    return promise;
}

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
    // Check cache first
    const cachedImage = textureCache.get(body.texturePath);
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
      // Trigger loading if not already loading/loaded
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
  predictedPath: Vector2D[] // Add predictedPath parameter
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
    drawTrail(ctx, planet, planetTrails, viewParams, centerPos, width, height); // Draw historical trail first
    drawBody(ctx, planet, viewParams, centerPos, width, height);
  });

  // Draw Predicted Path (if any)
  drawPredictionPath(ctx, predictedPath, viewParams, centerPos, width, height);
}
