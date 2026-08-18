// The source code was taken from: https://codepen.io/hakimel/pen/bzrZGo
// I made a couple of changes to the structure of the JavaScript script
// And added small changes to the styles of the stars

document.addEventListener("DOMContentLoaded", function () {
  const STAR_COLORS = ["#ffffff", "#ffe9c4", "#d4fbff"]; // White, light yellow and light blue
  const STAR_MIN_SIZE = 1;
  const STAR_MAX_SIZE = 5;
  const STAR_MIN_SCALE = 0.3;
  const OVERFLOW_THRESHOLD = 50;
  const STAR_COUNT = Math.max(30, (window.innerWidth + window.innerHeight) / 18);
  const COMET_COUNT = 3;

  const canvas = document.querySelector("canvas");
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }
  const context = canvas.getContext("2d");

  let scale = window.devicePixelRatio || 1;
  let width;
  let height;
  let stars = [];
  let comets = [];
  let planet = { x: 0, y: 0, radius: 0 };
  let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };

  function init() {
    generate();
    generateComets();
    resize();
    step();

    window.addEventListener("resize", resize);
  }

  function generate() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: 0,
        y: 0,
        z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
        size: STAR_MIN_SIZE + Math.random() * (STAR_MAX_SIZE - STAR_MIN_SIZE),
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        alpha: 0.45 + Math.random() * 0.45,
      });
    }
  }

  function createComet() {
    const angle = (Math.random() * Math.PI * 2) - Math.PI;
    const speed = 1.5 + Math.random() * 3.2;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 45 + Math.random() * 65,
      alpha: 0.32 + Math.random() * 0.22,
      thickness: 0.7 + Math.random() * 0.6,
    };
  }

  function recycleComet(comet) {
    const edge = Math.floor(Math.random() * 4);
    const margin = 120;

    if (edge === 0) {
      comet.x = -margin;
      comet.y = Math.random() * height;
    } else if (edge === 1) {
      comet.x = width + margin;
      comet.y = Math.random() * height;
    } else if (edge === 2) {
      comet.x = Math.random() * width;
      comet.y = -margin;
    } else {
      comet.x = Math.random() * width;
      comet.y = height + margin;
    }

    const towardCenter = Math.atan2(height / 2 - comet.y, width / 2 - comet.x);
    const direction = towardCenter + (Math.random() - 0.5) * 0.7;
    const speed = 1.2 + Math.random() * 1.6;
    comet.vx = Math.cos(direction) * speed;
    comet.vy = Math.sin(direction) * speed;
    comet.length = 45 + Math.random() * 65;
    comet.alpha = 0.32 + Math.random() * 0.22;
    comet.thickness = 0.7 + Math.random() * 0.6;
  }

  function generateComets() {
    comets = [];
    for (let i = 0; i < COMET_COUNT; i++) {
      comets.push(createComet());
    }
  }

  function placeStar(star) {
    star.x = Math.random() * width;
    star.y = Math.random() * height;
  }

  function recycleStar(star) {
    let direction = "z";

    let vx = Math.abs(velocity.x),
      vy = Math.abs(velocity.y);

    if (vx > 1 || vy > 1) {
      let axis;

      if (vx > vy) {
        axis = Math.random() < vx / (vx + vy) ? "h" : "v";
      } else {
        axis = Math.random() < vy / (vx + vy) ? "v" : "h";
      }

      if (axis === "h") {
        direction = velocity.x > 0 ? "l" : "r";
      } else {
        direction = velocity.y > 0 ? "t" : "b";
      }
    }

    star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

    if (direction === "z") {
      star.z = 0.1;
      star.x = Math.random() * width;
      star.y = Math.random() * height;
    } else if (direction === "l") {
      star.x = -OVERFLOW_THRESHOLD;
      star.y = height * Math.random();
    } else if (direction === "r") {
      star.x = width + OVERFLOW_THRESHOLD;
      star.y = height * Math.random();
    } else if (direction === "t") {
      star.x = width * Math.random();
      star.y = -OVERFLOW_THRESHOLD;
    } else if (direction === "b") {
      star.x = width * Math.random();
      star.y = height + OVERFLOW_THRESHOLD;
    }
  }

  function resize() {
    scale = window.devicePixelRatio || 1;

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    context.setTransform(scale, 0, 0, scale, 0, 0);

    planet.x = width * 0.15;
    planet.y = height * 0.84;
    planet.radius = Math.max(52, Math.min(width, height) * 0.08);

    stars.forEach(placeStar);
    comets.forEach((comet) => recycleComet(comet));
  }

  function step() {
    context.clearRect(0, 0, width, height);

    update();
    render();

    requestAnimationFrame(step);
  }

  function update() {
    velocity.tx *= 0.96;
    velocity.ty *= 0.96;

    velocity.x += (velocity.tx - velocity.x) * 0.8;
    velocity.y += (velocity.ty - velocity.y) * 0.8;

    stars.forEach((star) => {
      star.x += velocity.x * star.z;
      star.y += velocity.y * star.z;

      star.x += (star.x - width / 2) * velocity.z * star.z;
      star.y += (star.y - height / 2) * velocity.z * star.z;
      star.z += velocity.z;

      if (
        star.x < -OVERFLOW_THRESHOLD ||
        star.x > width + OVERFLOW_THRESHOLD ||
        star.y < -OVERFLOW_THRESHOLD ||
        star.y > height + OVERFLOW_THRESHOLD
      ) {
        recycleStar(star);
      }
    });

    comets.forEach((comet) => {
      comet.x += comet.vx + velocity.x * 0.18;
      comet.y += comet.vy + velocity.y * 0.18;

      if (
        comet.x < -150 ||
        comet.x > width + 150 ||
        comet.y < -150 ||
        comet.y > height + 150
      ) {
        recycleComet(comet);
      }
    });
  }

  function drawPlanet() {
    context.save();
    context.globalAlpha = 1;
    context.translate(planet.x, planet.y);

    const surface = context.createRadialGradient(
      -planet.radius * 0.35,
      -planet.radius * 0.45,
      planet.radius * 0.08,
      0,
      0,
      planet.radius * 1.15
    );

    surface.addColorStop(0, "#f2c96d");
    surface.addColorStop(0.5, "#c9903f");
    surface.addColorStop(0.82, "#8b592d");
    surface.addColorStop(1, "#51311e");

    context.beginPath();
    context.arc(0, 0, planet.radius, 0, Math.PI * 2);
    context.fillStyle = surface;
    context.fill();

    context.save();
    context.beginPath();
    context.arc(0, 0, planet.radius, 0, Math.PI * 2);
    context.clip();

    context.beginPath();
    context.arc(-planet.radius * 0.3, -planet.radius * 0.12, planet.radius * 0.17, 0, Math.PI * 2);
    context.fillStyle = "#926133";
    context.fill();

    context.beginPath();
    context.arc(planet.radius * 0.36, planet.radius * 0.28, planet.radius * 0.12, 0, Math.PI * 2);
    context.fillStyle = "#7b4d2a";
    context.fill();

    context.beginPath();
    context.arc(planet.radius * 0.08, planet.radius * 0.54, planet.radius * 0.1, 0, Math.PI * 2);
    context.fillStyle = "#704524";
    context.fill();

    context.beginPath();
    context.arc(-planet.radius * 0.35, -planet.radius * 0.18, planet.radius * 0.1, 0, Math.PI * 2);
    context.fillStyle = "#dfa852";
    context.fill();

    context.beginPath();
    context.arc(planet.radius * 0.34, planet.radius * 0.22, planet.radius * 0.065, 0, Math.PI * 2);
    context.fillStyle = "#b87738";
    context.fill();
    context.restore();

    context.beginPath();
    context.arc(0, 0, planet.radius, 0, Math.PI * 2);
    context.strokeStyle = "#5c3821";
    context.lineWidth = 1.5;
    context.stroke();
    context.restore();
  }

  function renderComet(comet) {
    const speed = Math.hypot(comet.vx, comet.vy);
    const tailX = comet.x - (comet.vx / speed) * comet.length;
    const tailY = comet.y - (comet.vy / speed) * comet.length;
    const trail = context.createLinearGradient(tailX, tailY, comet.x, comet.y);

    trail.addColorStop(0, "rgba(210, 227, 244, 0)");
    trail.addColorStop(0.7, `rgba(210, 227, 244, ${comet.alpha * 0.45})`);
    trail.addColorStop(1, `rgba(255, 255, 255, ${comet.alpha})`);

    context.beginPath();
    context.moveTo(comet.x, comet.y);
    context.lineTo(tailX, tailY);
    context.strokeStyle = trail;
    context.lineWidth = comet.thickness;
    context.lineCap = "round";
    context.stroke();
  }

  function renderStar(star) {
    context.beginPath();
    context.lineCap = "round";
    context.lineWidth = star.size * star.z * scale;
    context.globalAlpha = star.alpha;
    context.strokeStyle = star.color;

    context.beginPath();
    context.moveTo(star.x, star.y);

    let tailX = velocity.x * 2,
      tailY = velocity.y * 2;

    if (Math.abs(tailX) < 0.1) tailX = 0.5;
    if (Math.abs(tailY) < 0.1) tailY = 0.5;

    context.lineTo(star.x + tailX, star.y + tailY);
    context.stroke();
  }

  function render() {
    context.globalAlpha = 1;

    stars.forEach(renderStar);
    comets.forEach(renderComet);
    drawPlanet();
  }

  init();
});
