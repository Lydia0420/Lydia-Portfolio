'use strict';
// Image-backed local state graph. Original artwork is never stretched or redrawn.
(function(root){
const box=(name,to,x,y,w,h)=>({name,to,x,y,w,h});
const artBox=(name,to,x,y,w,h)=>({...box(name,to,x/786*100,y/1704*100,w/786*100,h/1704*100),art:{x,y,w,h}});
const catNames=['Appetizer','Main','Vegan','Noodles','Drunk Food','Desserts','Beverages','Yum Cha Set'];
// Desktop Figma: Final cover 4001:5759 → guide 4001:5763.
const entryTransition={type:'dissolve',duration:500,easing:'ease-out'};
function graph(version){
 const states={};const put=(id,file,spots=[],extra={})=>states[id]={file,spots,...extra};
 if(version===2){
  put('cover','final-01.jpg',[box('Open menu','guide',0,0,100,100)]);
  put('guide','final-02.jpg',[box('Continue to categories','categories',0,0,100,100)]);
  put('categories','final-04.jpg',catNames.map((n,i)=>artBox(n,['appetizer','main-menu','vegan','noodles','drunk','desserts','drinks-menu','yumcha'][i],243,340+i*134,308,74)));
  put('main-menu','final-05.jpg',['main','recommendation','vegetable'].map((n,i)=>artBox(n,n,188,652+i*166,418,86)));
  put('drinks-menu','final-06.jpg',[artBox('Bar','bar',188,732,418,86),artBox('Tea','tea',188,898,418,86)]);
  put('search','final-03.jpg');
  const pages={appetizer:7,vegan:9,main:10,vegetable:11,recommendation:12,noodles:13,drunk:14,desserts:15,tea:16,yumcha:17,bar:18};
  for(const [id,n] of Object.entries(pages))put(id,`final-${String(n).padStart(2,'0')}.jpg`);
  states.appetizer.detail={file:'final-08.jpg',name:'Preview the alternate cloud detail',x:0,y:23,w:100,h:36};
  states.main.next='recommendation';states.recommendation.prev='main';states.recommendation.next='vegetable';states.vegetable.prev='recommendation';
  for(const [id,s] of Object.entries(states)){if(['cover','guide'].includes(id))continue;s.spots.push(box(id==='search'?'Home':'Search',id==='search'?'cover':'search',4,2.5,10,4.7),box(id==='categories'?'Home':'Categories',id==='categories'?'cover':'categories',86,2.5,10,4.7));}
 }else if(version===0){
  put('cover','2.1.jpg',[box('Open menu','categories',0,0,100,100)]);
  put('categories','2.2.jpg',catNames.map((n,i)=>artBox(n,['appetizer','main-menu','vegan','noodles','drunk','desserts','drinks-menu','yumcha'][i],[242,246,245,245,246,246,246,246][i],[324,460,596,732,868,1004,1140,1276][i],294,70)));
  put('main-menu','2.3.jpg',['main','recommendation','vegetable'].map((n,i)=>artBox(n,n,188-i,618+i*160,418,80)));
  put('drinks-menu','2.4.jpg',[artBox('Bar','bar',184,732,418,80),artBox('Tea','tea',182,892,418,80)]);
  put('search','2.5.jpg');
  const pages={appetizer:6,recommendation:7,main:8,vegetable:9,vegan:10,noodles:11,drunk:12,desserts:13,tea:14,bar:15,yumcha:16};
  for(const [id,n] of Object.entries(pages))put(id,`2.${n}.jpg`);
  for(const [id,s] of Object.entries(states)){if(id==='cover')continue;s.spots.push(box('Search','search',10,91.4,13,7),box('Categories','categories',34,91.4,14,7),box('Previous screen','@back',56,91.4,13,7),box('Next screen',id==='categories'?'main-menu':'@forward',76,91.4,13,7));}
 }else{
  put('cover','3.0.jpg');put('categories','3.00.jpg');put('search','3.000.jpg');
  const groups=[['appetizer',1,2,27.6],['main',3,4,31.5],['vegan',7,8,35.6],['noodles',9,10,39.5],['drunk',15,16,43.5],['desserts',11,12,56],['bar',19,20,60],['tea',17,18,64],['yumcha',21,22,68]];
  for(const [id,menu,page,y] of groups){put(id,`3.${page}.jpg`);put(id+'-menu',`3.${menu}.jpg`,[box(id,id,5,y+5.5,40,5.5)]);}
  states['main-menu'].spots=['main','recommendation','vegetable'].map((n,i)=>box(n,n,5,36.4+i*4.8,40,4.6));
  put('recommendation','3.5.jpg');put('vegetable','3.6.jpg');put('desserts-black','3.13.jpg');put('desserts-seasonal','3.14.jpg');
  states['desserts-menu'].spots=['desserts','desserts-black','desserts-seasonal'].map((n,i)=>box(n,n,5,61+i*4.8,41,4.7));
  for(const [id,s] of Object.entries(states)){
   const opened=id==='categories'||id==='search'||id.endsWith('-menu');s.sidebar=opened;
   if(opened){s.spots.push(box('Close navigation','@close',27,1.5,8,7),box('Home','cover',0,1.5,9,7),box('Search','search',0,8,47,8));if(id==='categories')s.spots.push(...groups.map(([n,m,p,y])=>box(n,n+'-menu',1,y-2,46,4.5)));}
   else{s.spots.push(box('Open navigation','categories',0,1.5,18,7),box('Search','search',0,8,18,8),...groups.map(([n,m,p,y])=>box(n,n+'-menu',0,y-2,18,4.5)));}
  }
 }
 return states;
}
function create(version,start='cover'){
 const states=graph(version);const outer=document.createElement('div');outer.className='native-player';outer.dataset.version=String(version);
 outer.innerHTML='<div class="native-device"><div class="native-viewport" tabindex="0" aria-label="Interactive menu. Scroll to read."><div class="native-content"></div></div></div>';
 const viewport=outer.querySelector('.native-viewport'),content=outer.querySelector('.native-content'),device=outer.querySelector('.native-device');
 let current=states[start]?start:'cover',back=[],forward=[],underlying='cover',drawerDepth=0,scrolls={},epoch=0,buttons=[],animation,veil;
 function position(){const unit=viewport.clientWidth*1704/786/100;for(const [b,s] of buttons){b.style.left=s.x+'%';b.style.width=s.w+'%';b.style.top=s.y*unit+'px';b.style.height=s.h*unit+'px';if(b.classList.contains('native-menu-choice'))b.style.fontSize=(20*viewport.clientWidth/393)+'px';}}
 function go(id,history=true){
  if(outer.getAttribute('aria-busy')==='true')return;
  if(id==='@back'){if(!back.length)return;forward.push(current);go(back.pop(),false);return;}
  if(id==='@forward'){if(!forward.length)return;back.push(current);go(forward.pop(),false);return;}
  if(id==='@close'){back.length=drawerDepth;go(underlying,false);return;}
  if(!states[id])return;
  if(id===current&&content.children.length)return;
  const previous=current;scrolls[current]=viewport.scrollTop;
  if(animation)animation.cancel();
  if(veil)veil.remove();
  const oldImage=content.querySelector('img');
  if(oldImage){veil=document.createElement('div');veil.className='native-transition';const still=oldImage.cloneNode();still.alt='';still.style.transform=`translateY(${-viewport.scrollTop}px)`;veil.append(still);device.append(veil);}
  outer.setAttribute('aria-busy','true');
  if(!states[current].sidebar&&states[id].sidebar){underlying=current;drawerDepth=back.length;}
  if(history&&current!==id){back.push(current);forward=[];}
  current=id;outer.dataset.screen=id;const s=states[id],token=++epoch;
  const readingState=version===1&&s.sidebar?states[underlying]:s;
  const img=new Image();img.alt=versionsLabel(version)+' — '+id.replaceAll('-',' ');img.draggable=false;img.src='./emenu/assets/'+readingState.file;
  content.replaceChildren(img);buttons=[];
  device.querySelectorAll('.native-fixed,.native-arrow,.native-nav-art,.native-drawer-art').forEach(b=>b.remove());
  s.spots.forEach(spot=>{
   const b=document.createElement('button');b.className='native-hotspot';b.setAttribute('aria-label',spot.name);
   b.addEventListener('click',()=>go(spot.to));
   if(spot.art&&root.MenuDetails)root.MenuDetails.decorateButton(b,id,spot,s.file,version);
   const fixed=(version===2&&spot.y===2.5)||(version===0&&spot.y===91.4)||version===1;
   if(fixed){
    b.classList.add('native-fixed');b.style.left=spot.x+'%';b.style.width=spot.w+'%';b.style.top=spot.y+'%';b.style.height=spot.h+'%';b.dataset.icon=spot.name.toLowerCase();device.append(b);
   }else{content.append(b);buttons.push([b,spot]);}
  });
  for(const direction of ['prev','next'])if(s[direction]){const b=document.createElement('button');b.className='native-arrow '+direction;b.textContent=direction==='prev'?'‹':'›';b.setAttribute('aria-label',s[direction]);b.addEventListener('click',()=>go(s[direction]));device.append(b);}
  if(s.detail&&root.MenuDetails){const detailButton=root.MenuDetails.attachDetail(content,s.detail);buttons.push([detailButton,s.detail]);}
  if(version===2&&id==='tea'&&root.MenuDetails)root.MenuDetails.attachTea(content);
  let didLoad=false;
  function ready(){
   if(epoch!==token||didLoad)return;didLoad=true;
   if(version===2&&root.MenuDetails?.attachZoomDetails)root.MenuDetails.attachZoomDetails(content,id,img.naturalHeight);
   if(version===0&&id!=='cover'){
    const strip=document.createElement('span');strip.className='native-nav-art';
    const source=img.cloneNode();source.alt='';source.style.width='100%';source.style.top=(-(img.naturalHeight-170)/170*100)+'%';strip.append(source);device.append(strip);
   }
   if(version===1){
    const strip=document.createElement('span');strip.className='native-drawer-art';strip.style.width=(s.sidebar?380:148)/786*100+'%';
    const source=new Image();source.src='./emenu/assets/'+s.file;source.alt='';source.style.width=786/(s.sidebar?380:148)*100+'%';strip.append(source);device.append(strip);
   }
   position();viewport.scrollTop=version===1&&s.sidebar?(scrolls[underlying]||0):history?0:(scrolls[id]||0);device.classList.toggle('is-scrolled',viewport.scrollTop>3);outer.setAttribute('aria-busy','false');
   const layer=veil;veil=null;
   if(layer){
    if(version===2&&previous==='cover'&&id==='guide'&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&layer.animate){
     animation=layer.animate([{opacity:1},{opacity:0}],{duration:entryTransition.duration,easing:entryTransition.easing});
     animation.finished.catch(()=>{}).then(()=>layer.remove());
    }else layer.remove();
   }
   outer.dispatchEvent(new CustomEvent('menuchange',{detail:{screen:id},bubbles:true}));
  }
  img.onload=ready;
  img.onerror=()=>{if(epoch!==token)return;outer.setAttribute('aria-busy','false');if(veil)veil.remove();veil=null;img.alt='This menu image could not load. Restart to try again.';};
  position();viewport.scrollTop=0;if(img.complete&&img.naturalWidth)ready();
  // Guide → categories uses Smart animate in Figma; no fabricated global fade.
 }
 // Native touch scrolling plus mouse-drag scrolling; moving never triggers a hotspot click.
 viewport.addEventListener('scroll',()=>device.classList.toggle('is-scrolled',viewport.scrollTop>3),{passive:true});
 let drag=null,suppress=false;
 viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={y:e.clientY,top:viewport.scrollTop,moved:false};});
 const move=e=>{if(!drag)return;const dy=e.clientY-drag.y;if(Math.abs(dy)>6&&viewport.scrollHeight>viewport.clientHeight+1){drag.moved=true;viewport.scrollTop=drag.top-dy;}};
 const up=()=>{if(drag&&drag.moved){suppress=true;setTimeout(()=>suppress=false,0);}drag=null;};
 const cancel=()=>{drag=null;suppress=false;};
 window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);
 viewport.addEventListener('click',e=>{if(suppress){e.preventDefault();e.stopImmediatePropagation();}},true);
 const ro=new ResizeObserver(position);ro.observe(viewport);
 viewport.addEventListener('keydown',e=>{
  if(e.target!==viewport)return;
  if(e.key==='Escape'&&states[current].sidebar){e.preventDefault();go('@close');}
  else if(e.key==='ArrowLeft'&&states[current].prev){e.preventDefault();go(states[current].prev);}
  else if(e.key==='ArrowRight'&&states[current].next){e.preventDefault();go(states[current].next);}
 });
 outer.reset=()=>{epoch++;outer.setAttribute('aria-busy','false');back=[];forward=[];scrolls={};underlying='cover';drawerDepth=0;content.replaceChildren();go('cover',false);};
 outer.dispose=()=>{epoch++;ro.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);if(animation)animation.cancel();if(veil)veil.remove();};
 outer.navigate=go;go(current,false);return outer;
}
function versionsLabel(i){return ['Version 01','Version 02','Final'][i];}
root.MenuNative={create,graph,entryTransition};
})(typeof window==='undefined'?globalThis:window);

