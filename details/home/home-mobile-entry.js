/* Run before desktop previews are moved to body. No scroll interception. */
(() => {
  const entries = [...document.querySelectorAll('#work-section .collection-item')];
  const mobile = window.matchMedia('(max-width: 768px)');
  let active = null;
  let frame = 0;
  let observing = false;
  function prepare() {
    entries.forEach(entry => {
      if (entry.querySelector('.mobile-entry-preview')) return;
      const image = entry.querySelector('.hover-image');
      if (!image) return;
      const preview = image.cloneNode(false);
      preview.className = 'mobile-entry-preview';
      preview.alt = '';
      preview.setAttribute('aria-hidden', 'true');
      preview.decoding = 'async';
      const art = document.createElement('div');
      art.className = 'mobile-entry-art';
      art.setAttribute('aria-hidden', 'true');
      if (entry.id === 'work-book' || entry.id === 'work-art') {
        for (let i = 0; i < 2; i++) {
          const paper = document.createElement('span');
          paper.className = 'entry-paper';
          art.appendChild(paper);
        }
      }
      art.appendChild(preview);
      entry.appendChild(art);
    });
  }
  function update() {
    frame = 0;
    let next = null;
    let distance = Infinity;
    let activeDistance = Infinity;
    const height = window.innerHeight;
    if (mobile.matches && !document.querySelector('.book-overlay.is-active')) {
      entries.forEach(entry => {
        const rect = entry.getBoundingClientRect();
        const gap = Math.abs(rect.top + rect.height / 2 - height * .5);
        if (rect.bottom > height * .18 && rect.top < height * .82) {
          if (entry === active) activeDistance = gap;
          if (gap < distance) {
            distance = gap;
            next = entry;
          }
        }
      });
      // A small dead band avoids flickering between two entries near the midpoint.
      if (active && next !== active && activeDistance < distance + 28) next = active;
    }
    if (next === active) return;
    active?.classList.remove('is-mobile-focus');
    next?.classList.add('is-mobile-focus');
    active = next;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function configure() {
    if (mobile.matches && !observing) {
      window.addEventListener('scroll', schedule, { passive: true });
      observing = true;
    } else if (!mobile.matches && observing) {
      window.removeEventListener('scroll', schedule);
      observing = false;
    }
    schedule();
  }
  prepare();
  mobile.addEventListener('change', configure);
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('click', schedule);
  configure();
})();
