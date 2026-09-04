const canvas = document.getElementById("network-bg");
const ctx = canvas.getContext("2d");

let width;
let height;
let particles = [];
let particleCount;

const mouse = {
  x: null,
  y: null,
  radius: 130
};

const scrollForce = {
  x: null,
  y: null,
  power: 0
};

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  if (width < 600) {
    particleCount = 45;
  } else if (width < 1000) {
    particleCount = 70;
  } else {
    particleCount = 95;
  }

  createParticles();
}

function createParticles() {
  particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      size: Math.random() * 2 + 1,
      baseSize: Math.random() * 2 + 1
    });
  }
}



function drawParticles() {
  for (const p of particles) {
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
    gradient.addColorStop(0, "rgba(125, 211, 252, 0.95)");
    gradient.addColorStop(0.45, "rgba(59, 130, 246, 0.45)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(219, 234, 254, 0.95)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function connectParticles() {
  const maxDistance = width < 700 ? 105 : 145;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;

        ctx.strokeStyle = `rgba(96, 165, 250, ${opacity * 0.38})`;
        ctx.lineWidth = opacity * 1.3;

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function updateParticles() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x <= 0 || p.x >= width) p.vx *= -1;
    if (p.y <= 0 || p.y >= height) p.vy *= -1;

    // فرار از موس
    if (mouse.x !== null && mouse.y !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);

        p.x += Math.cos(angle) * force * 4.2;
        p.y += Math.sin(angle) * force * 4.2;
      }
    }

    // فرار هنگام اسکرول
    if (scrollForce.power > 0 && scrollForce.x !== null && scrollForce.y !== null) {
      const dx = p.x - scrollForce.x;
      const dy = p.y - scrollForce.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = 230;

      if (distance < radius) {
        const force = (radius - distance) / radius;
        const angle = Math.atan2(dy, dx);

        p.x += Math.cos(angle) * force * scrollForce.power;
        p.y += Math.sin(angle) * force * scrollForce.power;
      }
    }

    // محدود نگه‌داشتن داخل صفحه
    p.x = Math.max(0, Math.min(width, p.x));
    p.y = Math.max(0, Math.min(height, p.y));
  }

  scrollForce.power *= 0.92;
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  
  updateParticles();
  connectParticles();
  drawParticles();

  requestAnimationFrame(animate);
}

window.addEventListener("mousemove", function (e) {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mouseleave", function () {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener(
  "wheel",
  function (e) {
    scrollForce.x = mouse.x ?? width / 2;
    scrollForce.y = mouse.y ?? height / 2;
    scrollForce.power = Math.min(18, Math.abs(e.deltaY) * 0.08 + 8);
  },
  { passive: true }
);

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animate();
