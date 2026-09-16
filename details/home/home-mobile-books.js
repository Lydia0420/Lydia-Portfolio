/* Read the existing project cards so artwork, translations and destinations stay shared. */
(() => {
  const modal = document.getElementById('book-modal');
  if (!modal || modal.querySelector('.mobile-folios')) return;
  const collection = document.createElement('div');
  collection.className = 'mobile-folios';
  const bindings = [];
  let shelf;
  // Display the print and digital menus together; keep original project numbers.
  const sources = ['.b-1', '.b-3', '.b-2', '.b-4'].map(selector => modal.querySelector('.book-container ' + selector));
  sources.forEach((source, index) => {
    if (!source) return;
    const destination = (source.getAttribute('onclick') || '').match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
    const original = source.querySelector('img');
    const info = source.querySelector('.photo-info');
    if (!destination || !original || !info) return;
    if (index % 2 === 0) {
      shelf = document.createElement('div');
      shelf.className = 'folio-shelf';
      collection.append(shelf);
    }
    const folio = document.createElement('div');
    folio.className = 'mobile-folio';
    folio.dataset.project = source.className.match(/b-\d/)[0];
    const spine = document.createElement('div');
    spine.className = 'folio-spine';
    const number = document.createElement('span');
    number.className = 'folio-number';
    number.textContent = source.className.match(/b-(\d)/)[1].padStart(2,'0');
    const title = document.createElement('span');
    title.className = 'folio-title';
    spine.append(number,title);
    const link = document.createElement('a');
    link.className = 'folio-link';
    link.href = destination[1];
    const cover = document.createElement('div');
    cover.className = 'folio-cover';
    const image = document.createElement('img');
    image.src = original.getAttribute('src');
    image.loading = 'lazy';
    image.decoding = 'async';
    cover.append(image);
    const metadata = document.createElement('div');
    link.append(cover,spine,metadata);
    folio.append(link);
    shelf.append(folio);
    bindings.push({info,title,image,metadata});
  });
  modal.append(collection);
  function sync() {
    bindings.forEach(({info,title,image,metadata}) => {
      title.textContent = info.querySelector('.title').textContent;
      image.alt = title.textContent;
      metadata.replaceChildren(...[...info.querySelectorAll('.meta')].map(original => {
        const line = document.createElement('span');
        line.className = 'folio-meta';
        line.textContent = original.textContent;
        return line;
      }));
    });
  }
  sync();
  const observer = new MutationObserver(sync);
  bindings.forEach(({info}) => observer.observe(info,{childList:true,subtree:true,characterData:true}));
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
