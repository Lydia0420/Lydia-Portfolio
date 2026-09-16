/* Normalize navigation without replacing page-specific controls or handlers. */
(() => {
  const nav=document.querySelector('nav');
  const back=nav?.querySelector('a[href*="index.html"]');
  if(!back)return;
  const ink=getComputedStyle(back).color, surface=getComputedStyle(nav).backgroundColor;
  nav.style.setProperty('--nav-ink',ink);
  nav.style.setProperty('--nav-surface',surface);
  nav.classList.add('project-nav','section34-nav');
  nav.setAttribute('aria-label','Project navigation');
  back.classList.add('back-btn');
  back.innerHTML='<span><svg class="back-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Back</span>';
  let language=nav.querySelector('#lang-toggle, #lang');
  if(!language){language=document.createElement('button');language.type='button';language.textContent='中文';language.disabled=true;language.title='Chinese translation coming soon';language.setAttribute('aria-label','Chinese translation is not available yet');}
  language.classList.add('lang-toggle');
  const group=document.createElement('div');group.className='lang-right';group.append(language);back.after(group);
  const sound=nav.querySelector('#sound');
  if(sound){const controls=document.createElement('div');controls.className='nav-extra';controls.append(sound);nav.append(controls);}
  [...nav.children].filter(e=>e.tagName==='DIV'&&!e.children.length).forEach(e=>e.remove());
  const style=document.createElement('style');style.textContent=`
    nav.project-nav.section34-nav .back-btn{font:400 16px/24px 'Helvetica Neue',Arial,sans-serif;letter-spacing:0;text-decoration:none;border-bottom:0}
    nav.project-nav.section34-nav .lang-right{margin:0;padding:0;gap:0}
    nav.project-nav.section34-nav .nav-extra{margin-left:auto;pointer-events:auto;display:flex;align-items:center}
    nav.project-nav.section34-nav .nav-extra button{font:400 13px/20px 'Helvetica Neue',Arial,sans-serif;min-height:44px}
  `;document.head.append(style);
})();
