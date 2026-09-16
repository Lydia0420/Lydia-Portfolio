(() => {
  const modal = document.getElementById('imac-modal');
  if (!modal || modal.querySelector('.mobile-folder-library')) return;
  const make = (tag,cls) => Object.assign(document.createElement(tag),{className:cls});
  const library = make('div','mobile-folder-library');
  const bindings = [];
  modal.querySelectorAll('.imac-project').forEach((source,index) => {
    const folder = make('div','project-folder');
    const summary = make('a','folder-direct-link');
    const art = make('span','folder-art');
    const skin = make('img',''); skin.src = './details/home/03/folder.png'; skin.alt = ''; skin.setAttribute('aria-hidden','true');
    const caption = make('span','folder-caption');
    const number = make('span','folder-index'); number.textContent = '0' + (index+1);
    const title = make('span','folder-name'), hint = make('span','folder-hint');
    const peek = make('img','folder-peek');
    peek.src = source.querySelector('.imac-project-image').getAttribute('src');
    peek.alt = ''; peek.setAttribute('aria-hidden','true');
    const front = make('span','folder-frosted-front');
    caption.append(number,title,hint); front.append(caption);
    art.append(skin,peek,front); summary.append(art);
    const documentCard = make('div','folder-document');
    const image = make('img',''); image.src = source.querySelector('.imac-project-image').getAttribute('src'); image.loading = 'lazy'; image.decoding = 'async';
    const meta = make('p','');
    // Project 01 currently has no existing detail file. Keep its preview accessible.
    const available = index !== 0;
    const action = make(available ? 'a' : 'span','folder-action');
    if (available) action.href = source.getAttribute('onclick').match(/location\.href\s*=\s*['"]([^'"]+)['"]/)[1];
    summary.href = available ? action.href : image.src;
    if (!available) { summary.target = '_blank'; summary.rel = 'noopener'; }
    folder.append(summary); library.append(folder);
    bindings.push({source,title,hint,image,meta,action,available,folder});
  });
  modal.append(library);
  function sync() {
    const zh = document.documentElement.lang.startsWith('zh');
    bindings.forEach(({source,title,hint,image,meta,action,available,folder}) => {
      title.textContent = available ? source.querySelector('.imac-project-name').textContent.trim() : (zh ? '项目 01' : 'Project 01');
      image.alt = title.textContent;
      meta.textContent = source.querySelector('.imac-project-type').textContent.trim();
      hint.textContent = available ? (zh ? '查看作品 ↗' : 'Explore project ↗') : (zh ? '查看预览 ↗' : 'View preview ↗');
      action.textContent = available ? (zh ? '查看作品 →' : 'Explore project →') : (zh ? '详情尚未开放' : 'Project page not yet available');
    });
  }
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  bindings.forEach(({source}) => observer.observe(source.querySelector('.imac-project-meta'),{subtree:true,childList:true,characterData:true}));
})();
