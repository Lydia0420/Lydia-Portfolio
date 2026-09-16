/* A decorative cover interaction only; the original installation is unchanged. */
(() => {
  const cover = document.querySelector('.hero-media');
  const photo = cover?.querySelector('img');
  if (!photo) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  const frameInterval = 1000 / 30;
  const style = document.createElement('style');
  style.textContent = `
    .sakura-cover-petals { position: absolute; pointer-events: none;
      z-index: 2; transition: transform 0.3s ease; }
    .hero-media img:hover ~ .sakura-cover-petals {
      transform: scale(1.03) rotate(-1deg);
    }
    @media (prefers-reduced-motion: reduce) {
      .hero-media img:hover { transform: none; }
      .hero-media img:hover ~ .sakura-cover-petals { transform: none; }
    }
  `;
  document.head.append(style);
  const canvas = document.createElement('canvas');
  canvas.className = 'sakura-cover-petals';
  canvas.setAttribute('aria-hidden', 'true');
  cover.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { canvas.remove(); return; }
  let width = 0, height = 0, frame = 0, lastFrame = 0, lastEmission = -Infinity;
  let padding = 0, fallSpace = 0;
  let visible = true, previous = null;
  const petals = [];
  const random = (min, max) => min + Math.random() * (max - min);
  function clear() {
    cancelAnimationFrame(frame);
    frame = 0;
    petals.length = 0;
    previous = null;
    ctx.clearRect(-padding, -padding, canvas.width, canvas.height);
  }
  function resize() {
    clear();
    width = photo.clientWidth;
    height = photo.clientHeight;
    padding = coarse.matches ? 24 : 48;
    fallSpace = Math.min(180, Math.max(120, height * .4));
    const dpr = 1;
    canvas.width = Math.round((width + padding * 2) * dpr);
    canvas.height = Math.round((height + padding + fallSpace) * dpr);
    Object.assign(canvas.style, { left: `${photo.offsetLeft - padding}px`, top: `${photo.offsetTop - padding}px`,
      width: `${canvas.width}px`, height: `${canvas.height}px`,
      transformOrigin: `${padding + width / 2}px ${padding + height / 2}px` });
    ctx.setTransform(dpr, 0, 0, dpr, padding, padding);
  }
  function draw(now) {
    const elapsed = now - lastFrame;
    if (elapsed < frameInterval) { frame = requestAnimationFrame(draw); return; }
    const dt = Math.min((elapsed - elapsed % frameInterval) / 1000, .1);
    lastFrame = now - elapsed % frameInterval;
    ctx.clearRect(-padding, -padding, canvas.width, canvas.height);
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.age += dt;
      if (p.age >= p.life || p.y > height + fallSpace) { petals.splice(i, 1); continue; }
      p.x += (p.drift + Math.sin(p.age * 1.8 + p.phase) * 18) * dt;
      p.y += p.speed * dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.phase + p.age * p.spin);
      ctx.scale(p.size * (.65 + .35 * Math.cos(p.age * 2 + p.phase)), p.size);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.age / .18, (p.life - p.age) / .9,
        (height + fallSpace - p.y) / 45, (width + padding - p.x) / 20, (p.x + padding) / 20));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, .9);
      ctx.bezierCurveTo(-1.05, .05, -.7, -.95, -.18, -.65);
      ctx.lineTo(0, -.43);
      ctx.lineTo(.18, -.65);
      ctx.bezierCurveTo(.7, -.95, 1.05, .05, 0, .9);
      ctx.fill();
      ctx.restore();
    }
    frame = petals.length ? requestAnimationFrame(draw) : 0;
  }
  function release(event) {
    if (motion.matches || !visible || document.hidden || !width) return;
    if (event.pointerType === 'touch' && event.type !== 'pointerdown') return;
    const now = performance.now();
    const limit = coarse.matches ? 12 : 24;
    if (now - lastEmission < 240 || petals.length >= limit) return;
    const rect = photo.getBoundingClientRect();
    const inverse = new DOMMatrix(getComputedStyle(photo).transform).inverse();
    const point = new DOMPoint(event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2)).matrixTransform(inverse);
    const x = point.x + width / 2, y = point.y + height / 2;
    if (x < 0 || x > width || y < 0 || y > height) return;
    if (event.type === 'pointermove' && previous && Math.hypot(x - previous.x, y - previous.y) < 15) return;
    const direction = previous ? Math.max(-1, Math.min(1, (x - previous.x) / 50)) : .25;
    previous = { x, y };
    lastEmission = now;
    // Release from the photographed canopy, not from a cursor-shaped trail.
    const anchor = Math.max(.2, Math.min(.8, x / width));
    const crown = .16 + Math.abs(anchor - .5) * 1.05;
    for (let i = 0; i < (coarse.matches ? 3 : 4) && petals.length < limit; i++) {
      const startY = (crown + random(.02, .23)) * height;
      const speed = height * random(.23, .31);
      petals.push({ x: (anchor + random(-.06, .06)) * width,
        y: startY, age: 0, life: (height + fallSpace * .8 - startY) / speed + .4,
        speed, drift: direction * 18 + random(-9, 9),
        size: random(5, 8), phase: random(0, Math.PI * 2), spin: random(-.85, .85),
        color: ['#ffd5e5', '#efa6c5', '#fff0f5'][Math.floor(random(0, 3))] });
    }
    if (!frame) { lastFrame = now; frame = requestAnimationFrame(draw); }
  }
  cover.addEventListener('pointerenter', release);
  cover.addEventListener('pointermove', release, { passive: true });
  cover.addEventListener('pointerdown', release, { passive: true });
  cover.addEventListener('pointerleave', () => { previous = null; });
  new ResizeObserver(resize).observe(photo);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) clear();
  }).observe(cover);
  motion.addEventListener('change', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  resize();
})();
