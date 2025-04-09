export function drawSolarSystem(ctx, width, height, sun, planets, G, timeScaleRef, isRunningRef) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  // 太陽
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
  ctx.fillStyle = sun.color;
  ctx.fill();

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
      ctx.moveTo(p.trail[i].x, p.trail[i].y);
      ctx.lineTo(p.trail[i + 1].x, p.trail[i + 1].y);
    }
    ctx.stroke();

    // 惑星
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
}
