(() => {
  const modal = document.getElementById('game-modal');
  if (!modal || modal.querySelector('.mobile-game-library')) return;
  const element = (tag, name) => Object.assign(document.createElement(tag),{className:name});
  const library = element('div','mobile-game-library');
  const heading = element('div','cartridge-heading');
  const headingTitle = element('span','');
  const count = element('span','');
  heading.append(headingTitle,count);
  library.append(heading);
  const bindings = [], rows = [];
  let row;
  // Left column: GAME 01–03. Right column: the other three works.
  const sources = [1,4,2,5,3,6].map(number => modal.querySelector('.game-container .g-' + number));
  sources.forEach((source,index) => {
    if (!source) return;
    const destination = (source.getAttribute('onclick') || '').match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
    const original = source.querySelector('img'), info = source.querySelector('.photo-info');
    if (!destination || !original || !info) return;
    if (index % 2 === 0) { row = element('div','cartridge-row'); rows.push(row); library.append(row); }
    const link = element('a','cartridge-link'); link.href = destination[1];
    const slot = element('div','cartridge-slot'), shell = element('div','cartridge-shell');
    const number = element('span','cartridge-number'); number.textContent = source.querySelector('.game-slot-number').textContent.trim();
    const image = element('img','cartridge-image'); image.src = original.getAttribute('src'); image.loading = 'lazy'; image.decoding = 'async';
    shell.append(number,image); slot.append(shell);
    const title = element('span','cartridge-title'), meta = element('span','cartridge-meta');
    link.append(slot,title,meta); row.append(link);
    bindings.push({info,title,meta,image});
  });
  modal.append(library);
  function sync() {
    const zh = document.documentElement.lang.startsWith('zh');
    // Shared labels sit next to their English originals for easy maintenance.
    headingTitle.textContent = zh ? '选择一个游戏' : 'SELECT A GAME';
    count.textContent = zh ? `${bindings.length} 个游戏` : `${String(bindings.length).padStart(2,'0')} GAMES`;
    bindings.forEach(({info,title,meta,image}) => {
      title.textContent = info.querySelector('.title').textContent;
      meta.textContent = [...info.querySelectorAll('.meta')].map(line => line.textContent).join(' · ');
      image.alt = title.textContent;
    });
  }
  sync();
  const textObserver = new MutationObserver(sync);
  bindings.forEach(({info}) => textObserver.observe(info,{subtree:true,childList:true,characterData:true}));
  textObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  const mobile = matchMedia('(max-width: 768px)');
  let frame = 0, selected = null;
  function update() {
    frame = 0;
    let next = null, distance = Infinity, oldDistance = Infinity;
    if (mobile.matches && modal.classList.contains('is-active')) {
      const bounds = modal.getBoundingClientRect(), center = bounds.top + bounds.height * .5;
      rows.forEach(row => {
        const rect = row.getBoundingClientRect();
        if (rect.bottom < bounds.top + 100 || rect.top > bounds.bottom) return;
        const gap = Math.abs(rect.top + rect.height/2 - center);
        if (row === selected) oldDistance = gap;
        if (gap < distance) { distance = gap; next = row; }
      });
      if (selected && oldDistance < distance+24) next = selected;
    }
    if (next === selected) return;
    selected?.classList.remove('is-selected');
    next?.classList.add('is-selected'); selected = next;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  modal.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  mobile.addEventListener('change',schedule);
  new MutationObserver(schedule).observe(modal,{attributes:true,attributeFilter:['class']});
  schedule();
})();
