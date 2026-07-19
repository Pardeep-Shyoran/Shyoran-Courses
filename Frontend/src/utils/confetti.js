/**
 * Sleek, lightweight, pure-canvas confetti celebration utility.
 * No external dependencies.
 */
export function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = [
    "#FFD700", // Gold
    "#FF5733", // Saffron / Orange-Red
    "#33FF57", // Emerald Green
    "#3357FF", // Royal Blue
    "#FF33D1", // Magenta
    "#33FFF0", // Cyan
    "#E2583E", // Primary Shyoran Orange
    "#EA9E24", // Yellow-Gold
  ];

  const particles = [];

  // Create particles shooting from bottom corners and center
  const spawnPoints = [
    { x: 0, y: height, angle: -Math.PI / 4 }, // Left corner
    { x: width, y: height, angle: (-3 * Math.PI) / 4 }, // Right corner
    { x: width / 2, y: height, angle: -Math.PI / 2 }, // Center shooting up
  ];

  spawnPoints.forEach((point) => {
    const count = point.x === width / 2 ? 60 : 40;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: point.x,
        y: point.y,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        // Velocity vector
        vx: Math.cos(point.angle + (Math.random() - 0.5) * 0.5) * (Math.random() * 15 + 10),
        vy: Math.sin(point.angle + (Math.random() - 0.5) * 0.5) * (Math.random() * 20 + 12),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        gravity: 0.35,
        drift: (Math.random() - 0.5) * 0.15,
      });
    }
  });

  let startTime = Date.now();
  const duration = 4000; // 4 seconds animation

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration || particles.length === 0) {
      document.body.removeChild(canvas);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.gravity;
      p.vx += p.drift;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - elapsed / duration);

      if (p.y > height + 20 || p.x < -20 || p.x > width + 20 || p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      
      // Draw rectangular confetti piece
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  animate();
}
