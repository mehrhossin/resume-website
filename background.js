const canvas = document.getElementById("network-bg");
const ctx = canvas.getContext("2d");

let width;
let height;
let particles = [];
let particleCount;

const mouse = {
  x: null,
  y: null,
  radius: 140
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
    particleCount = 42;
  } else if (width < 1000) {
    particleCount = 65;
  } else {
    particleCount = 88;
  }

  createParticles();
}

function createParticles() {
  particles = [];

  for (let i = 0; i < particleCount; i++) {
    const size = Math.random() * 1.7 + 0.8;

    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      size: size
    });
  }
}

function drawParticles() {
  for (const p of particles) {
    const glow = ctx.createRadialGradient(
      p.x,
      p.y,
      0,
      p.x,
      p.y,
      p.size * 6
    );

    glow.addColorStop(0, "rgba(125, 211, 252, 0.9)");
    glow.addColorStop(0.45, "rgba(59, 130, 246, 0.38)");
    glow.addColorStop(1, "rgba(59, 130, 246, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(226, 232, 240, 0.95)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function connectParticles() {
  const maxDistance = width < 700 ? 95 : 138;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;

        ctx.strokeStyle = `rgba(96, 165, 250, ${opacity * 0.34})`;
        ctx.lineWidth = opacity * 1.1;

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

    if (p.x <= 0 || p.x >= width) {
      p.vx *= -1;
    }

    if (p.y <= 0 || p.y >= height) {
      p.vy *= -1;
    }

    // فرار از موس
    if (mouse.x !== null && mouse.y !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);

        p.x += Math.cos(angle) * force * 4.6;
        p.y += Math.sin(angle) * force * 4.6;
      }
    }

    // واکنش به اسکرول موس
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

    p.x = Math.max(0, Math.min(width, p.x));
    p.y = Math.max(0, Math.min(height, p.y));
  }

  scrollForce.power *= 0.91;
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
