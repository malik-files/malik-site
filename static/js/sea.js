/* =====================================================
   SEA SETTINGS
   ===================================================== */
// Put your own pictures in static/img/sea/ and list them here, e.g.
// const SEA_IMAGES = ["static/img/sea/beach.jpg", "static/img/sea/dog.jpg"];
// While the list is empty, coloured placeholders sail instead.
const SEA_IMAGES = [];
const PICTURE_COUNT = 16;   // how many pictures are afloat
const SPEED = 1;            // 1 = normal, 0.5 = slower, 2 = faster

(() => {
  const canvas = document.getElementById("sea-canvas");
  const layer = document.getElementById("sea-pictures");
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function placeholder(i) {
    const hue = (i * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},70%,72%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},70%,52%)"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><circle cx="140" cy="60" r="22" fill="rgba(255,255,255,.6)"/><path d="M0 200 L70 110 L120 160 L150 130 L200 200Z" fill="rgba(255,255,255,.35)"/></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  /* ---------- Waves ---------- */
  const BANDS = 7;
  function drawSea(t) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#c4e8f3");
    g.addColorStop(1, "#1b6590");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (let b = 0; b < BANDS; b++) {
      const y0 = h * (0.1 + b * 0.14);
      const amp = 8 + b * 2.5, len = 180 + b * 40, sp = 0.5 + b * 0.12;
      const dir = b % 2 ? 1 : -1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = y0 + Math.sin(x / len + t * sp * dir) * amp
                     + Math.sin(x / (len * 0.47) + t * sp * 1.7) * amp * 0.4;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,255,255,.28)";   // foam line
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = `rgba(${20 + b * 3},${90 + b * 5},${140 + b * 6},0.16)`;
      ctx.fill();
    }
  }

  /* ---------- Floating pictures ---------- */
  const items = [];

  function reset(it, initial) {
    it.x = initial ? Math.random() * (w + it.size) - it.size
                   : -it.size - Math.random() * 200;
    it.baseY = it.size / 2 + Math.random() * Math.max(h - it.size, 1);
  }

  resize();
  for (let i = 0; i < PICTURE_COUNT; i++) {
    const depth = Math.random();            // 0 = far away, 1 = close
    const size = 60 + depth * 90;
    const el = document.createElement("img");
    el.className = "sea-pic";
    el.alt = "";
    el.src = SEA_IMAGES.length ? SEA_IMAGES[i % SEA_IMAGES.length] : placeholder(i);
    el.style.width = el.style.height = size + "px";
    el.style.opacity = 0.65 + depth * 0.35;
    el.style.zIndex = Math.round(depth * 10);
    layer.appendChild(el);

    const it = {
      el, size,
      speed: (15 + depth * 30) * (0.8 + Math.random() * 0.4),  // px per second
      amp: 6 + Math.random() * 10,                              // bob height
      freq: 0.6 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    };
    reset(it, true);
    items.push(it);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const t = now / 1000;
    drawSea(t);

    for (const it of items) {
      if (!reduce) it.x += it.speed * SPEED * dt;
      if (it.x > w + 20) reset(it, false);
      const y = it.baseY + (reduce ? 0 : Math.sin(t * it.freq + it.phase) * it.amp);
      const rot = reduce ? 0 : Math.sin(t * it.freq * 0.8 + it.phase) * 5;
      it.el.style.transform = `translate3d(${it.x}px,${y - it.size / 2}px,0) rotate(${rot}deg)`;
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  addEventListener("resize", () => { resize(); if (reduce) requestAnimationFrame(frame); });
  requestAnimationFrame(frame);
})();
