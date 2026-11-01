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
  const windLayer = document.getElementById("wind-lines");
  const ctx = canvas?.getContext("2d") ?? null;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0, h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    if (!canvas || !ctx) return;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function placeholder(i) {
    const hue = (i * 47) % 360;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},70%,72%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},70%,52%)"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><circle cx="140" cy="60" r="22" fill="rgba(255,255,255,.6)"/><path d="M0 200 L70 110 L120 160 L150 130 L200 200Z" fill="rgba(255,255,255,.35)"/></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  const windPaths = [
    "M 4 25 C 44 2 78 7 110 21 S 175 40 216 12",
    "M 6 31 C 48 10 88 17 117 25 S 174 13 218 30",
    "M 5 18 C 36 31 76 9 111 18 S 174 33 215 21",
    "M 7 28 C 47 17 64 37 108 25 S 167 5 218 20",
  ];
  if (windLayer && !reduce) {
    windPaths.forEach((curve, index) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svg.setAttribute("viewBox", "0 0 224 48");
      svg.classList.add("wind-streak");
      svg.style.top = `${14 + index * 19}%`;
      svg.style.animationDelay = `${-index * 1.8}s`;
      svg.style.animationDuration = `${8 + (index % 2)}s`;
      path.setAttribute("d", curve);
      svg.appendChild(path);
      const echo = path.cloneNode();
      echo.setAttribute("transform", "translate(0 7)");
      echo.setAttribute("opacity", "0.42");
      svg.appendChild(echo);
      windLayer.appendChild(svg);
    });
  }

  /* Deprecated wave renderer retained for reference; it is no longer called. */
  const BANDS = 7;
  const BAND_COLORS = ["#d6e8d8", "#add9cc", "#80c2b8", "#5aa2a6", "#417f91", "#2c657e", "#1c4d69"];
  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = grainCanvas.height = 96;
  const grainCtx = grainCanvas.getContext("2d");
  for (let i = 0; i < 420; i++) {
    grainCtx.fillStyle = Math.random() < 0.5
      ? "rgba(255,255,255,0.18)"
      : "rgba(25,55,50,0.12)";
    grainCtx.fillRect(Math.random() * 96, Math.random() * 96, 1, 1);
  }
  grainCtx.lineWidth = 0.5;
  for (let i = 0; i < 45; i++) {
    const x = Math.random() * 96, y = Math.random() * 96;
    grainCtx.strokeStyle = Math.random() < 0.5
      ? "rgba(255,255,255,0.16)"
      : "rgba(25,55,50,0.1)";
    grainCtx.beginPath();
    grainCtx.moveTo(x, y);
    grainCtx.lineTo(x + 2 + Math.random() * 5, y + (Math.random() - 0.5) * 2);
    grainCtx.stroke();
  }
  const paperGrain = ctx?.createPattern(grainCanvas, "repeat") ?? null;

  function tearNoise(x, seed) {
    const segmentWidth = 11;
    const segment = Math.floor(x / segmentWidth);
    const position = (x - segment * segmentWidth) / segmentWidth;
    const sample = (index) => {
      const value = Math.sin((index + seed) * 127.1) * 43758.5453;
      return (value - Math.floor(value)) * 2 - 1;
    };
    return (sample(segment) * (1 - position) + sample(segment + 1) * position) * 7;
  }

  function drawSea(t) {
    if (!ctx || !paperGrain) return;
    ctx.fillStyle = "#edf0e3";
    ctx.fillRect(0, 0, w, h);

    for (let b = 0; b < BANDS; b++) {
      const spacing = h / (BANDS + 1);
      const y0 = spacing * (0.85 + b);
      const depth = spacing * 1.65;
      const amp = 12 + b * 2, len = 260 + b * 35;
      const phase = b * 1.3;
      const topAt = (x) => y0
        + Math.sin(x / len + t * 0.22 + phase) * amp
        + Math.sin(x / (len * 0.53) - t * 0.13 + phase) * amp * 0.22
        + tearNoise(x + t * 9, b * 17);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y = topAt(x);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      for (let x = w; x >= 0; x -= 6) {
        const y = y0 + depth + Math.sin(x / (len * 1.15) + phase + 1.2) * amp * 0.55;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = BAND_COLORS[b];
      ctx.shadowColor = "rgba(23, 49, 52, 0.17)";
      ctx.shadowBlur = 9;
      ctx.shadowOffsetY = 5;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = paperGrain;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y = topAt(x);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
      ctx.lineWidth = 2;
      ctx.stroke();
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
      windStrength: 0.7 + Math.random() * 0.6,
      windFreq: 0.2 + Math.random() * 0.2,
    };
    reset(it, true);
    items.push(it);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const t = now / 1000;
    const breeze = Math.sin(t * 0.28) + Math.sin(t * 0.53 + 1.1) * 0.25;

    for (const it of items) {
      const gust = reduce ? 0 : breeze * it.windStrength
        + Math.sin(t * it.windFreq + it.phase) * 0.18;
      if (!reduce) it.x += it.speed * SPEED * (1 + gust * 0.16) * dt;
      if (it.x > w + 20) reset(it, false);
      const y = it.baseY + (reduce ? 0 : Math.sin(t * it.freq + it.phase) * it.amp + gust * 9);
      const x = it.x + gust * 10;
      const rot = reduce ? 0 : Math.sin(t * it.freq * 0.8 + it.phase) * 5 + gust * 2.5;
      it.el.style.transform = `translate3d(${x}px,${y - it.size / 2}px,0) rotate(${rot}deg)`;
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  addEventListener("resize", () => { resize(); if (reduce) requestAnimationFrame(frame); });
  requestAnimationFrame(frame);
})();
