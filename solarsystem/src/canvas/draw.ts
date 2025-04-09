export function drawSolarSystem(ctx, width, height, sun, planets, G, timeScaleRef, isRunningRef, zoom = 1, cameraTarget = 'sun') {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  // 星空の描画
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }

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
  ctx.save();
  ctx.shadowBlur = 50 * zoom;
  ctx.shadowColor = 'yellow';
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
  ctx.restore();

  planets.forEach(p => {
    if (isRunningRef.current) {
      let axTotal = 0;
      let ayTotal = 0;

      // 太陽の重力
      const dxSun = sun.x - p.x;
      const dySun = sun.y - p.y;
      const distSqSun = dxSun * dxSun + dySun * dySun;
      const distSun = Math.sqrt(distSqSun);
      const forceSun = (G * sun.mass) / distSqSun;
      axTotal += forceSun * dxSun / distSun;
      ayTotal += forceSun * dySun / distSun;

      // 他の惑星の重力
      planets.forEach(other => {
        if (other === p) return;
        const dx = other.x - p.x;
        const dy = other.y - p.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        if (distSq === 0) return; // 同位置は無視
        const force = (G * other.mass) / distSq;
        axTotal += force * dx / dist;
        ayTotal += force * dy / dist;
      });

      p.vx += axTotal * timeScaleRef.current;
      p.vy += ayTotal * timeScaleRef.current;

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

    // 惑星名と速度表示
    ctx.fillStyle = 'white';
    ctx.font = `${12 * zoom}px sans-serif`;
    ctx.fillText(
      `${p.name}`,
      (p.x - centerX) * zoom + width / 2 + p.radius * zoom + 4,
      (p.y - centerY) * zoom + height / 2 - p.radius * zoom - 4
    );
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy).toFixed(2);
    ctx.fillText(
      `v=${speed}`,
      (p.x - centerX) * zoom + width / 2 + p.radius * zoom + 4,
      (p.y - centerY) * zoom + height / 2 + p.radius * zoom + 12
    );
  });
}
