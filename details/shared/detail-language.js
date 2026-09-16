(() => {
  const start = () => {
    const key = 'lydia-site-language';
    const page = location.pathname.split('/').pop();
    // These projects also update their own 3D scene / reader state on language changes.
    // Keep their handlers and original data-zh nodes under their existing ownership.
    const native = new Set(['din-tai-fung-zine.html', 'emotion.html', 'snowy.html', 'candy-box.html', 'gallery.html']).has(page);
    let button = document.querySelector('nav .lang-toggle, nav #lang, nav #lang-toggle, header #lang');
    if (!button) {
      const nav = document.querySelector('nav, header');
      if (!nav) return;
      button = document.createElement('button');
      button.className = 'lang-toggle shared-language-toggle';
      const logo = nav.querySelector('.nav-logo');
      if (logo) {
        const group = document.createElement('div'); group.className = 'shared-language-identity';
        logo.before(group); group.append(logo, button);
      } else nav.append(button);
    }
    button.classList.add('site-language-control');
    button.disabled = false; button.type = 'button'; button.removeAttribute('title');
    let current = 'en';
    try { if (localStorage.getItem(key) === 'zh-CN') current = 'zh-CN'; } catch (_) {}
    const normalize = value => value.replace(/\s+/g, '').toLowerCase();
    const inlineSources = new WeakMap();
    // Remember which English state an adjacent data-zh belongs to. A dynamic
    // update of the same element must not inherit a previous state's translation.
    document.querySelectorAll('[data-zh]').forEach(element => {
      inlineSources.set(element, normalize(element.dataset.en || element.textContent));
    });
    const originals = new Map();
    const backNodes = [];
    document.querySelectorAll('nav .back-btn, header .back').forEach(back => {
      const walker = document.createTreeWalker(back, NodeFilter.SHOW_TEXT);
      let node; while ((node = walker.nextNode())) if (/Back/.test(node.textContent)) backNodes.push([node, node.textContent]);
    });
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (current !== 'zh-CN' || scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; translate(); });
    });
    const observe = () => observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    function translate() {
      observer.disconnect();
      for (const [element, saved] of originals) {
        if (!element.isConnected) { originals.delete(element); continue; }
        if (element.innerHTML !== saved.rendered) { originals.delete(element); continue; }
        if (current === 'en') {
          // Reattach the original nodes, preserving their listeners and inline markup.
          element.replaceChildren(...saved.nodes);
          originals.delete(element);
        }
      }
      if (current === 'zh-CN') {
        const translatedParents = new Set();
        document.querySelectorAll('h1,h2,h3,h4,p,dt,dd,figcaption,span,a,button,summary,label,div').forEach(element => {
          if (!element.isConnected || element === button || element.closest('svg,canvas,script,style,[contenteditable],.back-btn,header .back,[data-i18n-ignore]')) return;
          if (element.querySelector('h1,h2,h3,h4,p,div,a,button,input,textarea,video,audio,canvas,svg,img,iframe,select')) return;
          let parent = element.parentElement;
          while (parent) { if (translatedParents.has(parent)) return; parent = parent.parentElement; }
          if (native && element.closest('[data-zh]:not([data-i18n-managed])')) return;
          const saved = originals.get(element);
          if (saved && element.innerHTML === saved.rendered) { translatedParents.add(element); return; }
          const english = element.textContent;
          let zh;
          if (element.hasAttribute('data-zh')) {
            if (!inlineSources.has(element)) inlineSources.set(element, normalize(element.dataset.en || english));
            if (normalize(english) === inlineSources.get(element)) zh = element.dataset.zh;
          }
          // Inline translation > page-specific dynamic translation > common vocabulary.
          if (zh === undefined) zh = window.LydiaI18n?.lookup(english);
          if (zh === undefined || zh === element.innerHTML) return;
          const nodes = Array.from(element.childNodes);
          const template = document.createElement('template');
          template.innerHTML = zh; // Authored, local translations only; never remote content.
          element.replaceChildren(template.content.cloneNode(true));
          originals.set(element, { nodes, rendered: element.innerHTML });
          translatedParents.add(element);
        });
      }
      backNodes.forEach(([node, en]) => { if (node.isConnected) node.textContent = current === 'en' ? en : en.replace('Back', '返回'); });
      button.textContent = current === 'en' ? '中文' : 'EN';
      button.lang = current === 'en' ? 'zh-CN' : 'en';
      button.setAttribute('aria-label', current === 'en' ? '切换为中文' : 'Switch to English');
      observe();
    }
    if (native && current === 'zh-CN') button.click();
    document.documentElement.lang = current;
    translate();
    button.addEventListener('click', () => {
      current = current === 'en' ? 'zh-CN' : 'en';
      document.documentElement.lang = current;
      try { localStorage.setItem(key, current); } catch (_) {}
      translate();
      window.ScrollTrigger?.refresh();
    });
    window.addEventListener('storage', event => {
      if (event.key === key && ['en','zh-CN'].includes(event.newValue) && event.newValue !== current) button.click();
    });
    window.addEventListener('pageshow', () => {
      try { const saved = localStorage.getItem(key); if (['en','zh-CN'].includes(saved) && saved !== current) button.click(); } catch (_) {}
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
