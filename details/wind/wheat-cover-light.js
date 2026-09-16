/* Pointer-driven warm light, confined to the cover. No persistent animation loop. */
(() => {
  const figure = document.querySelector('.hero-art');
  const photo = figure?.querySelector('img');
  if (!photo) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.textContent = `
    .wheat-cover-surface { position: relative; isolation: isolate; transition: transform .4s; }
    .wheat-cover-surface:hover { transform: rotate(-1deg) scale(1.015); }
    .hero-art .wheat-cover-surface img:hover { transform: none; }
    .wheat-cover-light { position: absolute; inset: 0; border-radius: 3px;
      pointer-events: none; mix-blend-mode: screen; opacity: 0; transition: opacity .45s ease;
      background: radial-gradient(circle 125px at var(--light-x,50%) var(--light-y,50%),
        rgba(255,220,142,.22) 0%, rgba(244,190,93,.10) 35%, rgba(244,190,93,0) 100%); }
    .wheat-cover-surface.is-lit .wheat-cover-light { opacity: 1; }
    @media (prefers-reduced-motion: reduce) {
      .wheat-cover-surface { transition: none; }
      .wheat-cover-surface:hover { transform: none; }
      .wheat-cover-light { transition: none; }
    }
  `;
  document.head.append(style);
  const surface = document.createElement('div');
  surface.className = 'wheat-cover-surface';
  photo.before(surface); surface.append(photo);
  const light = document.createElement('span');
  light.className = 'wheat-cover-light'; light.setAttribute('aria-hidden', 'true'); surface.append(light);
  let frame = 0, point = null, touchTimer = 0;
  function hide() { cancelAnimationFrame(frame); frame = 0; clearTimeout(touchTimer); surface.classList.remove('is-lit'); }
  function update() {
    frame = 0;
    const r = surface.getBoundingClientRect();
    const transform = getComputedStyle(surface).transform;
    const inverse = new DOMMatrix(transform === 'none' ? undefined : transform).inverse();
    const p = new DOMPoint(point.x-r.left-r.width/2,point.y-r.top-r.height/2).matrixTransform(inverse);
    const x = p.x+surface.clientWidth/2, y = p.y+surface.clientHeight/2;
    light.style.setProperty('--light-x', `${x}px`); light.style.setProperty('--light-y', `${y}px`);
    surface.classList.add('is-lit');
  }
  function move(e) {
    if (e.pointerType === 'touch' && e.type !== 'pointerdown') return;
    point = {x:e.clientX,y:e.clientY};
    if (!frame) frame = requestAnimationFrame(update);
    if (e.pointerType === 'touch') { clearTimeout(touchTimer); touchTimer = setTimeout(hide,1100); }
  }
  surface.addEventListener('pointerenter',move,{passive:true});
  surface.addEventListener('pointermove',move,{passive:true});
  surface.addEventListener('pointerdown',move,{passive:true});
  surface.addEventListener('pointerleave',hide);
  surface.addEventListener('pointercancel',hide);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
  new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)hide()}).observe(surface);
  reduced.addEventListener('change',hide);
})();
