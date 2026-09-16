/* Shared navigation only; artwork, controls and return destinations stay intact. */
(() => {
 const back=document.querySelector('a[href$=".html"], a[href*=".html?"]');
 if(!back)return;
 let nav=back.closest('nav');
 if(!nav){nav=document.createElement('nav');back.before(nav);nav.append(back)}
 nav.classList.add('experience-nav');
 nav.setAttribute('aria-label','Experience navigation');
 if(location.pathname.includes('/sakura/sakura-experience/'))nav.classList.add('experience-nav-flow');
 back.classList.add('experience-back');
 back.innerHTML='<span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>Back to project</span>';
 back.setAttribute('aria-label','Back to project');
 const style=document.createElement('style');style.textContent=`
 nav.experience-nav{box-sizing:border-box;position:fixed;inset:0 0 auto;width:100%;max-width:none;height:60px;margin:0;padding:8px 24px;display:flex;flex-wrap:nowrap;gap:16px;align-items:center;justify-content:space-between;pointer-events:none;border-bottom:0;z-index:10000;font:400 16px/24px 'Helvetica Neue',Arial,sans-serif}
 nav.experience-nav-flow{position:relative;inset:auto;flex:0 0 60px}
 nav.experience-nav .experience-back{position:static!important;margin:0!important;padding:0!important;display:inline-flex;align-items:center;min-height:44px;flex-shrink:0;font:400 16px/24px 'Helvetica Neue',Arial,sans-serif!important;text-decoration:none!important;border:0!important;letter-spacing:0;pointer-events:auto}
 .experience-back>span{position:relative;display:inline-flex;align-items:center;gap:5px;padding-bottom:2px}
 .experience-back>span:after{content:'';position:absolute;inset:auto 0 0;height:1.5px;background:currentColor;pointer-events:none}
 .experience-back svg{display:block;flex:none}
 nav.experience-nav button{pointer-events:auto;font-family:'Helvetica Neue',Arial,sans-serif;font-size:16px;min-height:44px}
 nav.experience-nav .nav-center{position:absolute;left:50%;transform:translateX(-50%)}
 nav.experience-nav .nav-index{margin-left:auto}
 @media(max-width:640px){nav.experience-nav{padding-inline:16px;gap:10px}nav.experience-nav .nav-center{display:none}nav.experience-nav button{font-size:14px}}
 `;document.head.append(style);
})();
