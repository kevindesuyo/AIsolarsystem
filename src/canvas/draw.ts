import { Planet, Sun, ViewParameters, TrailMap, CelestialBody, Vector2D } from '../types';
import { loadImage, getCachedImage } from './textureLoader'; // Import from new module
import { ParticleManager } from './particles';

const STAR_COUNT = 400; // Number of background stars (increased for better visuals)
const NEBULA_COUNT = 5; // Number of distant nebulae

// Star data for twinkling effect
type Star = {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
};

let stars: Star[] = [];
let lastStarWidth = 0;
let lastStarHeight = 0;

// Nebula data for background ambiance
type Nebula = {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  rotation: number;
};

let nebulae: Nebula[] = [];

/**
 * Generates star and nebula data for the background
 */
function generateStarField(width: number, height: number) {
  if (lastStarWidth === width && lastStarHeight === height && stars.length > 0) {
    return; // Already generated for this size
  }
  
  lastStarWidth = width;
  lastStarHeight = height;
  stars = [];
  nebulae = [];
  
  // Star color palette (realistic star colors)
  const starColors = [
    'rgba(255, 255, 255, 1)',    // White
    'rgba(255, 244, 234, 1)',    // Warm white
    'rgba(255, 210, 161, 1)',    // Orange-ish
    'rgba(200, 220, 255, 1)',    // Blue-ish
    'rgba(255, 200, 200, 1)',    // Red-ish
    'rgba(180, 180, 255, 1)',    // Purple-ish
  ];
  
  // Generate stars
  for (let i = 0; i < STAR_COUNT; i++) {
    const colorIndex = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * starColors.length);
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.3 + Math.random() * 1.5,
      brightness: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinklePhase: Math.random() * Math.PI * 2,
      color: starColors[colorIndex],
    });
  }
  
  // Generate nebulae
  const nebulaColors = [
    'rgba(100, 50, 150, 0.03)',   // Purple
    'rgba(50, 100, 150, 0.03)',   // Blue
    'rgba(150, 50, 100, 0.02)',   // Pink
    'rgba(50, 150, 100, 0.02)',   // Green/teal
    'rgba(150, 100, 50, 0.02)',   // Orange
  ];
  
  for (let i = 0; i < NEBULA_COUNT; i++) {
    nebulae.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radiusX: 100 + Math.random() * 300,
      radiusY: 100 + Math.random() * 300,
      color: nebulaColors[i % nebulaColors.length],
      rotation: Math.random() * Math.PI,
    });
  }
}

// Animation frame counter for twinkling
let starAnimationFrame = 0;

/**
 * Draws animated background with stars and nebulae
 */
function drawStars(ctx: CanvasRenderingContext2D, width: number, height: number) {
  generateStarField(width, height);
  
  starAnimationFrame++;
  const time = starAnimationFrame * 0.016; // Approximate time in seconds (60fps)
  
  ctx.save();
  
  // Draw nebulae first (behind stars)
  for (const nebula of nebulae) {
    ctx.save();
    ctx.translate(nebula.x, nebula.y);
    ctx.rotate(nebula.rotation);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(nebula.radiusX, nebula.radiusY));
    gradient.addColorStop(0, nebula.color);
    gradient.addColorStop(0.5, nebula.color.replace(/[\d.]+\)$/, '0.02)'));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, nebula.radiusX, nebula.radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // Draw stars with twinkling effect
  for (const star of stars) {
    // Calculate twinkling brightness
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
    const currentBrightness = star.brightness * (0.7 + 0.3 * twinkle);
    
    ctx.globalAlpha = currentBrightness;
    
    // Draw star glow for brighter stars
    if (star.radius > 1) {
      const glowRadius = star.radius * 3;
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glowRadius
      );
      gradient.addColorStop(0, star.color);
      gradient.addColorStop(0.3, star.color.replace('1)', '0.3)'));
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw star core
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

/**
 * Draws Saturn's rings
 */
function drawRings(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  screenRadius: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(rotation);
  
  // Draw multiple ring layers for realistic effect
  const ringLayers = [
    { inner: 1.3, outer: 1.5, color: 'rgba(210, 180, 140, 0.4)' },
    { inner: 1.55, outer: 1.8, color: 'rgba(255, 228, 196, 0.5)' },
    { inner: 1.85, outer: 2.1, color: 'rgba(218, 165, 32, 0.4)' },
    { inner: 2.15, outer: 2.3, color: 'rgba(205, 133, 63, 0.3)' },
  ];
  
  for (const layer of ringLayers) {
    const inner = screenRadius * layer.inner;
    const outer = screenRadius * layer.outer;
    
    // Create ring gradient
    const gradient = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.2, layer.color);
    gradient.addColorStop(0.8, layer.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    
    // Draw elliptical ring (tilted view)
    ctx.beginPath();
    ctx.ellipse(0, 0, outer, outer * 0.3, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 0, inner, inner * 0.3, 0, 0, Math.PI * 2);
    ctx.fill('evenodd');
  }
  
  ctx.restore();
}

/**
 * Checks if a planet should have rings (Saturn-like)
 */
function shouldHaveRings(name: string): boolean {
  const lowerName = name.toLowerCase();
  return lowerName === 'saturn' || lowerName.includes('ring');
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

  ctx.restore(); // Restore context before drawing rings and labels

  // --- Draw rings for Saturn-like planets ---
  if (shouldHaveRings(body.name)) {
    drawRings(ctx, screenX, screenY, screenRadius, body.currentRotation * 0.1);
  }

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
