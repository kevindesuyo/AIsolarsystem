import React, { useRef, useEffect, useState } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [timeScale, setTimeScale] = useState(1);

  const sunRef = useRef(null);
  const planetsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const G = 0.1;

    // 初回のみ天体を初期化
    if (!sunRef.current) {
      sunRef.current = { 
        x: width / 2, 
        y: height / 2, 
        radius: 30, 
        mass: 10000, 
        color: 'yellow' 
      };
    }
    const sun = sunRef.current;

    if (!planetsRef.current) {
      planetsRef.current = [
        { radius: 5, color: 'gray', mass: 1, x: sun.x + 60, y: sun.y, vx: 0, vy: 2.5, trail: [] },
        { radius: 8, color: 'orange', mass: 1, x: sun.x + 100, y: sun.y, vx: 0, vy: 2.0, trail: [] },
        { radius: 9, color: 'blue', mass: 1, x: sun.x + 140, y: sun.y, vx: 0, vy: 1.7, trail: [] },
        { radius: 7, color: 'red', mass: 1, x: sun.x + 180, y: sun.y, vx: 0, vy: 1.5, trail: [] },
        { radius: 15, color: 'brown', mass: 1, x: sun.x + 240, y: sun.y, vx: 0, vy: 1.2, trail: [] },
        { radius: 12, color: 'beige', mass: 1, x: sun.x + 300, y: sun.y, vx: 0, vy: 1.0, trail: [] },
        { radius: 10, color: 'lightblue', mass: 1, x: sun.x + 350, y: sun.y, vx: 0, vy: 0.9, trail: [] },
        { radius: 10, color: 'darkblue', mass: 1, x: sun.x + 400, y: sun.y, vx: 0, vy: 0.8, trail: [] },
      ];
    }
    const planets = planetsRef.current;

    function draw() {
      // 星空背景
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      // 太陽のグロー
      const gradient = ctx.createRadialGradient(sun.x, sun.y, sun.radius, sun.x, sun.y, sun.radius * 4);
      gradient.addColorStop(0, 'rgba(255,255,0,1)');
      gradient.addColorStop(1, 'rgba(255,255,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.radius * 4, 0, Math.PI * 2);
      ctx.fill();

      // 太陽本体
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
      ctx.fillStyle = sun.color;
      ctx.fill();

      // 惑星の更新と描画
      planets.forEach(p => {
        // 重力計算
        const dx = sun.x - p.x;
        const dy = sun.y - p.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        const force = (G * sun.mass) / distSq;
        const ax = force * dx / dist;
        const ay = force * dy / dist;

        p.vx += ax * timeScale;
        p.vy += ay * timeScale;

        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;

        // 軌跡を保存
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 100) p.trail.shift();

        // 軌道の描画
        ctx.beginPath();
        for (let i = 0; i < p.trail.length - 1; i++) {
          ctx.moveTo(p.trail[i].x, p.trail[i].y);
          ctx.lineTo(p.trail[i + 1].x, p.trail[i + 1].y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 惑星の描画
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div style={{ position: 'fixed', top: 10, left: 10, color: 'white' }}>
        <button onClick={() => setTimeScale(timeScale * 0.5)}>遅く</button>
        <button onClick={() => setTimeScale(timeScale * 2)}>速く</button>
        <button onClick={() => setTimeScale(0)}>停止</button>
        <button onClick={() => setTimeScale(1)}>リセット</button>
        <div>時間倍率: {timeScale.toFixed(2)}</div>
      </div>
    </>
  );
}

export default App;
