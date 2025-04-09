import React, { useRef, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const sun = { x: width / 2, y: height / 2, radius: 30, color: 'yellow' };

    const planets = [
      { radius: 5, distance: 60, speed: 0.02, angle: 0, color: 'gray' },    // Mercury
      { radius: 8, distance: 100, speed: 0.015, angle: 0, color: 'orange' }, // Venus
      { radius: 9, distance: 140, speed: 0.01, angle: 0, color: 'blue' },    // Earth
      { radius: 7, distance: 180, speed: 0.008, angle: 0, color: 'red' },    // Mars
      { radius: 15, distance: 240, speed: 0.005, angle: 0, color: 'brown' }, // Jupiter
      { radius: 12, distance: 300, speed: 0.004, angle: 0, color: 'beige' }, // Saturn
      { radius: 10, distance: 350, speed: 0.003, angle: 0, color: 'lightblue' }, // Uranus
      { radius: 10, distance: 400, speed: 0.002, angle: 0, color: 'darkblue' },  // Neptune
    ];

    function draw() {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      // draw sun
      ctx.beginPath();
      ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
      ctx.fillStyle = sun.color;
      ctx.fill();

      // draw planets
      planets.forEach(planet => {
        planet.angle += planet.speed;
        const x = sun.x + planet.distance * Math.cos(planet.angle);
        const y = sun.y + planet.distance * Math.sin(planet.angle);

        ctx.beginPath();
        ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return (
    <canvas ref={canvasRef} style={{ display: 'block' }} />
  );
}

export default App;
