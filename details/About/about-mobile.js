/* Mobile reading and paper motion. Desktop keeps its existing reveal.
   Layout lives in about-mobile.css; no content is hidden by this script. */
(() => {
  const mobile = window.matchMedia('(max-width: 768px)');
  const timeline = document.querySelector('.timeline-container');
  const items = [...document.querySelectorAll('.timeline-item')];
  const line = document.querySelector('.timeline-line-fill');
  const portrait = document.getElementById('photo-trigger');
  const atmosphere = document.getElementById('about-atmosphere');
  const section = document.getElementById('timelineSection');
  const ending = document.querySelector('.timeline-ending');
  const photos = [...document.querySelectorAll('.timeline-image')];
  const navSurface = document.getElementById('about-nav-surface');
  const thread = document.getElementById('about-story-thread');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  let threadStart = 0;
  let threadHeight = 1;
  let portraitStart = 0;
  let celebrated = false;
  let frame = 0;

  // Geometry changes only on layout changes, never on each scroll frame.
  // One fixed reading axis; only the portrait-to-axis connection curves.
  function measureThread() {
    if (!mobile.matches) return;
    const photo = portrait.getBoundingClientRect();
    const target = timeline.getBoundingClientRect();
    portraitStart = photo.top + window.scrollY;
    threadStart = photo.bottom + window.scrollY - 24;
    const end = ending.getBoundingClientRect();
    threadHeight = Math.max(80, end.bottom + window.scrollY + 96 - threadStart);
    const x = photo.left + 28;
    const rail = target.left;
    const path = `M ${x} 0 C ${x} 42, ${rail} 36, ${rail} 96 L ${rail} ${threadHeight}`;
    thread.style.top = `${threadStart}px`;
    thread.style.height = `${threadHeight}px`;
    thread.setAttribute('viewBox', `0 0 ${window.innerWidth} ${threadHeight}`);
    thread.querySelector('path').setAttribute('d', path);
    schedule();
  }

  // One read phase, then one write phase per scroll frame. No easing tail:
  // when scrolling stops, the photo angles and line stop at that exact point.
  function updateReading() {
    frame = 0;
    if (!mobile.matches) return;
    const readingY = window.innerHeight * .46;
    const bounds = timeline.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (readingY - bounds.top) / bounds.height));
    const positions = items.map(item => item.getBoundingClientRect());
    // Fade starts before the timeline enters, finishing at 35% of the viewport.
    // Adjust 1.2 / .35 together to lengthen or shorten this quiet transition.
    const fade = Math.max(0, Math.min(1,
      (window.innerHeight * 1.2 - section.getBoundingClientRect().top) / (window.innerHeight * .85)));
    const endBounds = ending.getBoundingClientRect();
    const photoPositions = photos.map(photo => photo.getBoundingClientRect());
    let current = -1;
    positions.forEach((rect, index) => { if (rect.top <= readingY && rect.bottom > 0) current = index; });
    line.style.transform = `scaleY(${progress})`;
    atmosphere.style.opacity = String(fade);
    navSurface.style.opacity = String(clamp(window.scrollY / 120));
    const portraitProgress = clamp((window.scrollY - Math.max(0, portraitStart - window.innerHeight * .4)) / (window.innerHeight * .55));
    const lift = reduced.matches ? 0 : Math.sin(portraitProgress * Math.PI);
    portrait.style.transform = reduced.matches ? 'rotate(-3deg)' :
      `perspective(900px) translateY(${-10 * lift}px) rotateX(${7 * lift}deg) rotateY(${-5 * lift}deg) rotateZ(${-3 + 2 * portraitProgress}deg)`;
    portrait.style.setProperty('--paper-lift', String(lift));
    photos.forEach((photo, index) => {
      const progress = clamp((window.innerHeight * .9 - photoPositions[index].top) / (window.innerHeight * .45));
      // Transform the image, measure its stationary wrapper: no feedback jitter.
      const remaining = reduced.matches ? 0 : 1 - progress;
      const angle = [-5, 4.5, -4, 5, -4.5, 4, -5][index % 7] * remaining;
      const media = photo.querySelector('img, video');
      media.style.transform = `perspective(900px) translateY(${18 * remaining}px) rotateX(${8 * remaining}deg) rotateY(${(index % 2 ? -3 : 3) * remaining}deg) rotateZ(${angle}deg) scale(${1 - .03 * remaining})`;
      photo.style.setProperty('--paper-lift', String(remaining));
    });
    // Release the last strand as the closing words enter: at the document end
    // the reading marker cannot otherwise reach the bottom of the viewport.
    const tailProgress = clamp((window.innerHeight - endBounds.bottom) / (window.innerHeight * .15));
    const penY = window.scrollY + readingY + tailProgress * (window.innerHeight - readingY);
    const threadProgress = clamp((penY - threadStart) / threadHeight);
    thread.style.clipPath = `inset(0 0 ${(1 - threadProgress) * 100}% 0)`;
    items.forEach((item, index) => item.classList.toggle('is-reading', index === current));
    if (!celebrated && penY >= endBounds.top + window.scrollY && endBounds.bottom > 0 && typeof window.confetti === 'function') {
      celebrated = true;
      window.confetti({ particleCount: 55, spread: 85, startVelocity: 24,
        ticks: 160, scalar: .85, origin: { x: .5, y: Math.max(.25, Math.min(.8, endBounds.top / window.innerHeight)) },
        colors: ['#D5B76A', '#E6A3B1', '#A6C6E3', '#FFFFFF'], disableForReducedMotion: true });
    }
  }
  function schedule() { if (!frame) frame = window.requestAnimationFrame(updateReading); }
  function configure() {
    document.body.classList.toggle('about-mobile', mobile.matches);
    if (!mobile.matches) {
      line.style.removeProperty('transform');
      portrait.style.removeProperty('transform');
      portrait.style.removeProperty('--paper-lift');
      photos.forEach(photo => {
        photo.querySelector('img, video').style.removeProperty('transform');
        photo.style.removeProperty('--paper-lift');
      });
      items.forEach(item => item.classList.remove('is-reading'));
    }
    portrait.disabled = mobile.matches;
    portrait.setAttribute('aria-label', mobile.matches ? 'Lydia' : 'Lydia — discover my story');
    measureThread();
    schedule();
  }
  mobile.addEventListener('change', configure);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measureThread, { passive: true });
  window.addEventListener('load', measureThread);
  reduced.addEventListener('change', schedule);
  document.querySelectorAll('.timeline-image img, #photo-trigger img').forEach(image => image.addEventListener('load', measureThread));
  if (window.ResizeObserver) {
    const observer = new window.ResizeObserver(measureThread);
    observer.observe(document.querySelector('.about-container'));
    observer.observe(section);
  }
  document.fonts?.ready.then(measureThread);
  configure();
})();
