(() => {
  const modal = document.getElementById('tv-modal');
  if (!modal || modal.querySelector('.mobile-film-lightbox')) return;
  const make = (tag,cls) => Object.assign(document.createElement(tag),{className:cls});
  const lightbox = make('div','mobile-film-lightbox');
  const heading = make('div','film-lightbox-heading');
  const headingTitle = make('span',''), count = make('span','');
  heading.append(headingTitle,count);
  const grid = make('div','film-lightbox-grid'), bindings = [];
  modal.querySelectorAll('.tv-container .photo-item').forEach((source,index) => {
    const href = source.getAttribute('href') || (source.getAttribute('onclick') || '').match(/location\.href\s*=\s*['"]([^'"]+)['"]/)?.[1];
    const original = source.querySelector('img'), info = source.querySelector('.photo-info');
    if (!href || !original || !info) return;
    const link = make('a','film-slide'); link.href = href;
    link.dataset.format = source.matches('.t-1,.t-4') ? 'landscape' : 'square';
    const frame = make('span','film-slide-frame');
    const code = make('span','film-slide-code');
    const isModel = source.matches('.t-2,.t-3');
    code.textContent = String(index+1).padStart(2,'0') + (isModel ? ' / VIEW' : ' / PLAY');
    const image = make('img','film-slide-image'); image.src = original.getAttribute('src'); image.loading = 'lazy'; image.decoding = 'async';
    const title = make('span','film-slide-title'), meta = make('span','film-slide-meta');
    frame.append(code,image); link.append(frame,title,meta); grid.append(link);
    bindings.push({source,info,title,meta,image});
  });
  lightbox.append(heading,grid); modal.append(lightbox);
  function sync() {
    const zh = document.documentElement.lang.startsWith('zh');
    headingTitle.textContent = zh ? '动态影像档案' : 'MOVING IMAGE';
    count.textContent = String(bindings.length).padStart(2,'0');
    bindings.forEach(({source,info,title,meta,image}) => {
      // Distinguish the two models using their existing named project links.
      title.textContent = source.matches('.t-2') ? 'Snowy' : source.matches('.t-3') ? 'Candy Box' : source.matches('.t-4') ? 'Twenty' : info.querySelector('.title').textContent;
      image.alt = title.textContent;
      meta.textContent = [...info.querySelectorAll('.meta')].map(line => line.textContent).join(' · ');
    });
  }
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  bindings.forEach(({info}) => observer.observe(info,{subtree:true,childList:true,characterData:true}));
})();
