'use strict';
(() => {
 const filters=document.querySelector('.archive-filters');
 const archiveOrder=['wireframe','2','3','1','final'];
 if(filters)for(const group of archiveOrder){
  const button=filters.querySelector(`[data-group="${group}"]`);
  if(button)filters.append(button); // Move existing buttons, preserving their listeners.
 }

 // One-time, native scroll reveals. Content stays visible without JS, animation
 // support, or an observer. No scroll hijacking and no movement inside a phone.
 if(!('IntersectionObserver' in window)||!Element.prototype.animate)return;
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 if(preference.matches)return;
 const animations=new Map();
 const targets=[...document.querySelectorAll(
  '.journey .section-heading,.journey-card,.evolution-copy>h2,.evolution-copy>.section-intro,'+
  '.identity .section-heading,.identity-layout figcaption,.language-grid>div,.archive>details>summary'
 )];
 const reveal=target=>{
  const animation=animations.get(target);
  if(!animation)return;
  animations.delete(target);animation.cancel();
 };
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   observer.unobserve(entry.target);
   if(preference.matches||entry.target.matches(':focus-within')){reveal(entry.target);continue;}
   const animation=animations.get(entry.target);
   if(animation)animation.play();
  }
 },{threshold:0,rootMargin:'0px 0px 72px 0px'});
 // Read geometry together before preparing any animation. Visible content is
 // never hidden, including after refresh or restoring a scrolled page.
 const upcoming=targets.filter(target=>target.getBoundingClientRect().top>window.innerHeight+72);
 for(const target of upcoming){
  try{
   const animation=target.animate([
    {opacity:0,transform:'translateY(8px)'},
    {opacity:1,transform:'translateY(0)'}
   ],{duration:420,easing:'cubic-bezier(.2,.65,.3,1)',fill:'both'});
   animation.pause();animations.set(target,animation);
   animation.finished.then(()=>reveal(target),()=>{});
   observer.observe(target);
  }catch{reveal(target);}
 }
 const onFocus=event=>{
  for(const target of animations.keys())if(target.contains(event.target)){observer.unobserve(target);reveal(target);}
 };
 document.addEventListener('focusin',onFocus);
 const stop=()=>{observer.disconnect();for(const target of [...animations.keys()])reveal(target);};
 const onPreference=()=>{if(preference.matches)stop();};
 preference.addEventListener('change',onPreference);
 window.addEventListener('pagehide',()=>{stop();document.removeEventListener('focusin',onFocus);preference.removeEventListener('change',onPreference);},{once:true});
})();
