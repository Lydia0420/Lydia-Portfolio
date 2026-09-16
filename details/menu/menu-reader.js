(() => {
  'use strict';

  const script = document.currentScript;
  const assetBase = new URL('./menu-reader-pages/', script.src);
  const imageURL = n => new URL(`page-${String(n).padStart(2, '0')}.jpg`, assetBase).href;

  const cover = document.querySelector('.final-menu .final-image');
  if (!cover || document.getElementById('umami-reader')) return;

  cover.classList.add('umami-cover-trigger');
  cover.tabIndex = 0;
  cover.setAttribute('role', 'button');
  cover.setAttribute('aria-haspopup', 'dialog');
  cover.setAttribute('aria-label', 'Open final menu');

  const dialog = document.createElement('dialog');
  dialog.id = 'umami-reader';
  dialog.setAttribute('aria-labelledby', 'umami-title');
  dialog.innerHTML = `
    <header class="umami-toolbar">
      <h2 id="umami-title" data-i18n-managed="true" data-zh="UMAMI / 最终菜单">UMAMI / FINAL MENU</h2>
      <div class="umami-tools">
        <button id="umami-zoom" aria-pressed="false">放大 / Zoom</button>
        <button id="umami-close" aria-label="Close / 关闭">×</button>
      </div>
    </header>
    <div class="umami-stage">
      <div class="umami-book closed">
        <img class="umami-spread" alt="Final menu, original left and right spread">
        <div class="umami-still" hidden></div>
        <div class="umami-leaf" hidden>
          <div class="umami-face umami-front"></div>
          <div class="umami-face umami-back"></div>
        </div>
      </div>
    </div>
    <footer class="umami-footer">
      <div class="umami-controls">
        <button id="umami-prev" aria-label="Previous spread / 上一跨页">←</button>
        <span class="umami-status" aria-live="polite"></span>
        <button id="umami-next" aria-label="Next spread / 下一跨页">→</button>
        <select id="umami-jump" aria-label="Choose spread / 选择跨页"></select>
      </div>
      <p class="umami-note">
        拖动放大后的页面阅读 · 方向键翻页 · Esc 关闭<br>
        Scroll to explore when zoomed · Arrow keys to turn
      </p>
    </footer>
  `;

  qEnglishLabels(dialog);

  function qEnglishLabels(root) {
    root.querySelector('#umami-zoom').textContent = 'Zoom';
    for (const [id, label] of [
      ['umami-close', 'Close'],
      ['umami-prev', 'Previous spread'],
      ['umami-next', 'Next spread'],
      ['umami-jump', 'Choose spread'],
    ]) {
      root.querySelector('#' + id).setAttribute('aria-label', label);
    }
    root.querySelector('.umami-note').textContent =
      'Original spreads · Click left or right to turn · Scroll to explore when zoomed · Esc to close';
  }

  document.body.append(dialog);

  const q = s => dialog.querySelector(s);
  const book = q('.umami-book');
  const spread = q('.umami-spread');
  const leaf = q('.umami-leaf');
  const front = q('.umami-front');
  const back = q('.umami-back');
  const still = q('.umami-still');
  const stage = q('.umami-stage');
  const prev = q('#umami-prev');
  const next = q('#umami-next');
  const jump = q('#umami-jump');
  const zoom = q('#umami-zoom');

  const names = [
    'Appetizer', 'Mushroom dishes', 'Main', 'Recommendations', 'Vegan',
    'Vegetables', 'Jade Garden', 'Chinese noodles', 'Drunk food', 'Desserts',
    'White Lotus Mist', 'Seasonal dishes', 'Tea', 'Bar', 'Yum Cha',
  ];
  names.forEach((name, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = `${String(i + 1).padStart(2, '0')} / ${name}`;
    jump.append(o);
  });

  let current = 0;
  let busy = false;
  let generation = 0;
  let animation = null;
  let returnFocus = null;

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cache = new Map();

  function load(url) {
    if (!cache.has(url)) {
      cache.set(url, new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          cache.delete(url);
          reject(new Error('Image unavailable'));
        };
        img.src = url;
      }));
    }
    return cache.get(url);
  }

  function controls() {
    prev.disabled = busy || current === 0;
    next.disabled = busy || current === 14;
    jump.disabled = busy;
    zoom.disabled = busy;
    jump.value = current;
    q('.umami-status').textContent = `Spread ${current + 1} / 15`;
  }

  function clean() {
    leaf.hidden = true;
    still.hidden = true;
    leaf.style.transform = '';
    book.classList.remove('closed');
    animation = null;
  }

  function animate(from, to, duration) {
    animation = leaf.animate(
      [{ transform: from }, { transform: to }],
      { duration: reduced() ? 0 : duration, easing: 'cubic-bezier(.35,.05,.2,1)', fill: 'forwards' }
    );
    return animation.finished.catch(() => {});
  }

  async function open() {
    if (dialog.open) return;

    returnFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('umami-reading');
    q('#umami-close').focus();
    stage.classList.remove('zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    current = 0;
    busy = true;
    controls();
    q('.umami-status').textContent = 'Opening…';

    const token = ++generation;
    try {
      await Promise.all([load(imageURL(1)), load(imageURL(2))]);
      if (token !== generation) return;

      spread.src = imageURL(2);
      leaf.className = 'umami-leaf cover';
      front.style.backgroundImage = `url("${imageURL(1)}")`;
      back.style.backgroundImage = `url("${imageURL(2)}")`;
      leaf.hidden = false;
      still.hidden = true;
      book.classList.add('closed');

      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (token !== generation) return;
      book.classList.remove('closed');

      await animate('rotateY(0deg)', 'rotateY(-180deg)', 1050);
      if (token !== generation) return;

      animation?.cancel();
      clean();
      busy = false;
      controls();
      load(imageURL(3)).catch(() => {});
    } catch {
      if (token !== generation) return;
      busy = false;
      controls();
      q('.umami-status').textContent = 'Unable to load images. Please close and reopen.';
    }
  }

  async function turn(target) {
    target = Number(target);
    if (busy || target === current || target < 0 || target > 14) return;

    busy = true;
    controls();
    const token = generation;
    const old = current;
    const forward = target > old;

    try {
      await load(imageURL(target + 2));
      if (token !== generation) return;

      if (stage.classList.contains('zoomed') || reduced()) {
        spread.src = imageURL(target + 2);
        current = target;
        busy = false;
        controls();
        return;
      }

      spread.src = imageURL(target + 2);
      still.className = `umami-still${forward ? '' : ' reverse'}`;
      still.style.backgroundImage = `url("${imageURL(old + 2)}")`;
      still.hidden = false;

      leaf.className = `umami-leaf${forward ? '' : ' reverse'}`;
      front.style.backgroundImage = `url("${imageURL(old + 2)}")`;
      back.style.backgroundImage = `url("${imageURL(target + 2)}")`;
      leaf.hidden = false;

      await animate('rotateY(0deg)', forward ? 'rotateY(-180deg)' : 'rotateY(180deg)', 850);
      if (token !== generation) return;

      animation?.cancel();
      current = target;
      clean();
      busy = false;
      controls();
      if (current < 14) load(imageURL(current + 3)).catch(() => {});
    } catch {
      if (token !== generation) return;
      spread.src = imageURL(old + 2);
      clean();
      busy = false;
      controls();
      q('.umami-status').textContent = 'Unable to load this spread. Please try again.';
    }
  }

  cover.addEventListener('click', open);
  cover.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  document.querySelectorAll('[data-umami-open]').forEach(button =>
    button.addEventListener('click', open)
  );

  const hint = document.createElement('span');
  hint.className = 'umami-pointer-hint';
  hint.setAttribute('aria-hidden', 'true');
  book.append(hint);

  let pointerStart = null;
  const directionAt = x =>
    x < book.getBoundingClientRect().left + book.getBoundingClientRect().width / 2 ? -1 : 1;

  function clearHint() {
    hint.hidden = true;
    book.style.cursor = '';
  }
  clearHint();

  book.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || busy || stage.classList.contains('zoomed')) {
      clearHint();
      return;
    }
    const direction = directionAt(e.clientX);
    const available = current + direction >= 0 && current + direction <= 14;
    hint.textContent = available
      ? (direction < 0 ? '← Previous spread' : 'Next spread →')
      : (direction < 0 ? 'First spread' : 'Last spread');
    hint.style.left = direction < 0 ? '14px' : 'auto';
    hint.style.right = direction > 0 ? '14px' : 'auto';
    hint.hidden = false;
    book.style.cursor = available ? 'pointer' : 'default';
  });

  book.addEventListener('pointerleave', clearHint);
  book.addEventListener('pointerdown', e => {
    pointerStart = { x: e.clientX, y: e.clientY };
  });
  book.addEventListener('pointercancel', () => {
    pointerStart = null;
    clearHint();
  });
  book.addEventListener('click', e => {
    if (busy || stage.classList.contains('zoomed')) return;
    if (pointerStart && Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 12) {
      pointerStart = null;
      return;
    }
    pointerStart = null;
    clearHint();
    turn(current + directionAt(e.clientX));
  });

  spread.draggable = false;

  prev.addEventListener('click', () => turn(current - 1));
  next.addEventListener('click', () => turn(current + 1));
  jump.addEventListener('change', () => turn(jump.value));

  q('#umami-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    generation++;
    animation?.cancel();
    clean();
    busy = false;
    document.body.classList.remove('umami-reading');
    returnFocus?.focus();
  });

  dialog.addEventListener('keydown', e => {
    if (e.target === jump) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      turn(current + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });

  zoom.addEventListener('click', () => {
    const on = stage.classList.toggle('zoomed');
    zoom.setAttribute('aria-pressed', String(on));
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  });

  let startX = null;
  stage.addEventListener('touchstart', e => {
    startX = e.touches.length === 1 ? e.touches[0].clientX : null;
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (startX !== null && !stage.classList.contains('zoomed')) {
      const delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 65) turn(current + (delta < 0 ? 1 : -1));
    }
    startX = null;
  }, { passive: true });
})();
