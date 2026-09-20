const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let angle = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Configuración de las flores en el ramo gigante
const flowersConfig = [
  { relX: 0, relY: -110, radius: 58, delay: 400 },
  { relX: -65, relY: -60, radius: 48, delay: 1500 },
  { relX: 65, relY: -60, radius: 48, delay: 2600 },
  { relX: -110, relY: 10, radius: 45, delay: 3700 },
  { relX: 110, relY: 10, radius: 45, delay: 4800 },
  { relX: -45, relY: 25, radius: 50, delay: 5900 },
  { relX: 45, relY: 25, radius: 50, delay: 7000 },
  { relX: -80, relY: 75, radius: 42, delay: 8100 },
  { relX: 80, relY: 75, radius: 42, delay: 9200 },
  { relX: 0, relY: 85, radius: 46, delay: 10300 }
];

const flowers = flowersConfig.map(f => ({
  ...f,
  scale: 0,
  flashAlpha: 0,
  appeared: false
}));

// Partículas flotantes doradas
const particles = Array.from({ length: 90 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  size: Math.random() * 2.8 + 0.8,
  speedY: Math.random() * 0.6 + 0.2,
  alpha: Math.random() * 0.8 + 0.2
}));

const startTime = Date.now();

// Dibuja una flor individual con pétalos, centro y destello de luz
function drawSunflower(x, y, radius, scale, flashAlpha) {
  if (scale <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Destello resplandeciente al nacer
  if (flashAlpha > 0) {
    const flashGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 3.5);
    flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
    flashGrad.addColorStop(0.4, `rgba(255, 220, 80, ${flashAlpha * 0.8})`);
    flashGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');

    ctx.beginPath();
    ctx.arc(0, 0, radius * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = flashGrad;
    ctx.fill();
  }

  // Capa externa e interna de pétalos
  const petalsCount = 18;
  for (let layer = 0; layer < 2; layer++) {
    const layerRadius = layer === 0 ? radius * 1.15 : radius * 0.95;
    const offsetAngle = layer === 0 ? 0 : (Math.PI / petalsCount);
    
    for (let i = 0; i < petalsCount; i++) {
      const pAngle = (i * Math.PI * 2) / petalsCount + offsetAngle;
      ctx.save();
      ctx.rotate(pAngle);

      const petalGrad = ctx.createLinearGradient(0, 0, 0, layerRadius * 1.8);
      petalGrad.addColorStop(0, '#ffe033');
      petalGrad.addColorStop(0.6, '#ffaa00');
      petalGrad.addColorStop(1, '#e67300');

      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(0, layerRadius * 0.9, layerRadius * 0.28, layerRadius * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Centro del girasol
  const centerGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, radius * 0.65);
  centerGrad.addColorStop(0, '#4a2505');
  centerGrad.addColorStop(0.7, '#241000');
  centerGrad.addColorStop(1, '#e69900');

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = centerGrad;
  ctx.shadowColor = '#ffbb00';
  ctx.shadowBlur = 15;
  ctx.fill();

  ctx.restore();
}

// Bucle animado principal
function animate() {
  ctx.clearRect(0, 0, width, height);

  const elapsedTime = Date.now() - startTime;

  // 1. Renderizar partículas
  particles.forEach(p => {
    p.y -= p.speedY;
    if (p.y < 0) p.y = height;
    ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Movimiento de viento oscilatorio
  angle += 0.02;
  const sway = Math.sin(angle) * 8;

  const centerX = width / 2;
  const baseY = height * 0.52;

  // 2. Renderizar tallos verdes
  ctx.strokeStyle = '#2d5a27';
  ctx.lineWidth = 7;
  ctx.shadowBlur = 0;
  
  flowers.forEach(f => {
    if (f.scale > 0.05) {
      ctx.beginPath();
      ctx.moveTo(centerX, height + 50);
      ctx.quadraticCurveTo(centerX + sway * 0.4, baseY + 120, centerX + f.relX + sway, baseY + f.relY);
      ctx.stroke();
    }
  });

  // 3. Renderizar aparición progresiva de girasoles
  flowers.forEach(f => {
    if (elapsedTime > f.delay) {
      if (!f.appeared) {
        f.appeared = true;
        f.flashAlpha = 1.0;
      }

      if (f.scale < 1) {
        f.scale += 0.035;
      } else {
        f.scale = 1;
      }

      if (f.flashAlpha > 0) {
        f.flashAlpha -= 0.025;
      }
    }

    drawSunflower(
      centerX + f.relX + sway,
      baseY + f.relY,
      f.radius,
      f.scale,
      Math.max(0, f.flashAlpha)
    );
  });

  requestAnimationFrame(animate);
}

animate();