export function drawSolarSystem(ctx, width, height, sun, planets, G, timeScaleRef, isRunningRef, zoom = 1, cameraTarget = 'sun') {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  let centerX = sun.x;
  let centerY = sun.y;

  if (cameraTarget !== 'sun') {
    const targetPlanet = planets.find(p => p.name === cameraTarget);
    if (targetPlanet) {
      centerX = targetPlanet.x;
      centerY = targetPlanet.y;
    }
  }

  // 太陽
  if (sun.image && sun.image.complete) {
    ctx.drawImage(
      sun.image,
      (sun.x - centerX) * zoom + width / 2 - sun.radius * zoom,
      (sun.y - centerY) * zoom + height / 2 - sun.radius * zoom,
      sun.radius * 2 * zoom,
      sun.radius * 2 * zoom
    );
  } else {
    ctx.beginPath();
    ctx.arc(
      (sun.x - centerX) * zoom + width / 2,
      (sun.y - centerY) * zoom + height / 2,
      sun.radius * zoom,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = sun.color;
    ctx.fill();
  }

  planets.forEach(p => {
    if (isRunningRef.current) {
      const dx = sun.x - p.x;
      const dy = sun.y - p.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      const force = (G * sun.mass) / distSq;
      const ax = force * dx / dist;
      const ay = force * dy / dist;

      p.vx += ax * timeScaleRef.current;
      p.vy += ay * timeScaleRef.current;

      p.x += p.vx * timeScaleRef.current;
      p.y += p.vy * timeScaleRef.current;

      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 100) p.trail.shift();
    }

    // 軌道
    ctx.beginPath();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;
    for (let i = 0; i < p.trail.length - 1; i++) {
      ctx.moveTo(
        (p.trail[i].x - centerX) * zoom + width / 2,
        (p.trail[i].y - centerY) * zoom + height / 2
      );
      ctx.lineTo(
        (p.trail[i + 1].x - centerX) * zoom + width / 2,
        (p.trail[i + 1].y - centerY) * zoom + height / 2
      );
    }
    ctx.stroke();

    // 惑星
    if (p.image && p.image.complete) {
      ctx.drawImage(
        p.image,
        (p.x - centerX) * zoom + width / 2 - p.radius * zoom,
        (p.y - centerY) * zoom + height / 2 - p.radius * zoom,
        p.radius * 2 * zoom,
        p.radius * 2 * zoom
      );
    } else {
      ctx.beginPath();
      ctx.arc(
        (p.x - centerX) * zoom + width / 2,
        (p.y - centerY) * zoom + height / 2,
        p.radius * zoom,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = p.color;
      ctx.fill();
    }
  });
}
