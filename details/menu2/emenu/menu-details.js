'use strict';
(function(root){
 const sprites={
  appetizer:{file:'appetizer-button-states.png',width:382,x:36,y:40,activeY:156,w:308,h:74},
  main:{file:'main-button-states.png',width:574,x:78,y:40,activeY:156,w:418,h:86}
 };
 const imageCache=new Map();
 let filterSequence=0;
 function localLettering(state,lettering,image,rect){
  // SVG filters can display local artwork without reading protected image pixels.
  const ns='http://www.w3.org/2000/svg';
  const make=(tag,attrs)=>{const node=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));return node;};
  const id='menu-local-ink-'+(++filterSequence);
  const svg=make('svg',{viewBox:`${rect.x} ${rect.y} ${rect.w} ${rect.h}`,preserveAspectRatio:'none',class:'native-choice-lettering','aria-hidden':'true'});
  const defs=make('defs',{});
  const filter=make('filter',{id,x:'0%',y:'0%',width:'100%',height:'100%','color-interpolation-filters':'sRGB'});
  // Dark original letterforms become the colored foreground; the pale button
  // background becomes transparent. No replacement font is introduced.
  filter.append(make('feColorMatrix',{type:'matrix',values:'0 0 0 0 0.7451  0 0 0 0 0.3373  0 0 0 0 0.2784  -2.833333 0 0 0 1.166667'}));
  defs.append(filter);svg.append(defs);
  svg.append(make('image',{href:image.src,x:0,y:0,width:image.naturalWidth,height:image.naturalHeight,filter:`url(#${id})`}));
  lettering.remove();state.append(svg);
 }
 function sourceImage(file){
  if(!imageCache.has(file))imageCache.set(file,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src='./emenu/assets/'+file;}));
  return imageCache.get(file);
 }
 // Extract only the original lettering at runtime; no replacement font and no modified source files.
 function tintLettering(pixels){
  for(let i=0;i<pixels.length;i+=4){
   const ink=Math.max(0,Math.min(1,(105-Math.max(pixels[i],pixels[i+1],pixels[i+2]))/90));
   pixels[i]=190;pixels[i+1]=86;pixels[i+2]=71;pixels[i+3]=Math.round(255*ink);
  }
  return pixels;
 }
 function decorateButton(button,screen,spot,file,version=2){
  if(spot.art&&file){
   const {x,y,w,h}=spot.art;
   button.classList.add('native-art-choice');button.replaceChildren();
   button.style.setProperty('--choice-ratio',String(w/h));
   button.style.setProperty('--choice-radius',(16/w*100)+'% / '+(16/h*100)+'%');
   const state=document.createElement('span');state.className='native-choice-state';state.setAttribute('aria-hidden','true');
   const lettering=document.createElement('canvas');lettering.width=w;lettering.height=h;lettering.className='native-choice-lettering';state.append(lettering);button.append(state);
   sourceImage(file).then(image=>{
    try {
     const ctx=lettering.getContext('2d',{willReadFrequently:true});
     ctx.drawImage(image,x,y,w,h,0,0,w,h);
     const pixels=ctx.getImageData(0,0,w,h);tintLettering(pixels.data);ctx.putImageData(pixels,0,0);
    } catch(error) {
     localLettering(state,lettering,image,{x,y,w,h});
    }
    button.classList.add('art-ready');
   }).catch(()=>{state.remove();});
   return;
  }
  const key=screen==='categories'&&spot.to==='appetizer'?'appetizer':screen==='main-menu'&&spot.to==='main'?'main':null;
  if(!key)return;
  const s=sprites[key];button.classList.add('native-original-choice');button.replaceChildren();
  // Both states use the same source-sized viewport, including at fractional device scales.
  button.style.aspectRatio=s.w+'/'+s.h;
  button.style.setProperty('--choice-ratio',String(s.w/s.h));
  for(const [state,y] of [['rest',s.y],['selected',s.activeY]]){
   const crop=document.createElement('span');crop.className='choice-art '+state;crop.setAttribute('aria-hidden','true');
   const img=new Image();img.alt='';img.draggable=false;img.src='emenu/assets/'+s.file;
   Object.assign(img.style,{width:(s.width/s.w*100)+'%',left:(-s.x/s.w*100)+'%',top:(-y/s.h*100)+'%'});
   crop.append(img);button.append(crop);
  }
 }
 const teaStates=[
  {name:'White',x:982,y:3568,row:952},
  {name:'Green',x:982,y:1186,row:1206},
  {name:'Black',x:974,y:2334,row:1460},
  {name:'Yellow',x:974,y:60,row:1714}
 ];
 function attachTea(content){
  const region=document.createElement('div');region.className='native-tea-interaction';
  region.setAttribute('role','group');region.setAttribute('aria-label','Explore tea varieties');
  // The original prices and dish names stay in place. Only the illustrated left column changes.
  const layers=teaStates.map(s=>{
   const crop=document.createElement('span');crop.className='native-tea-art';crop.setAttribute('aria-hidden','true');
   const art=new Image();art.src='./emenu/assets/tea-variant-states.png';art.alt='';art.draggable=false;
   Object.assign(art.style,{width:(1860/350*100)+'%',left:(-s.x/350*100)+'%',top:(-s.y/1038*100)+'%'});
   crop.append(art);region.append(crop);return crop;
  });
  const correction=document.createElement('span');correction.className='native-tea-green';correction.textContent='Green';region.append(correction);
  let pinned=-1,hover=-1,focus=-1;
  const buttons=[];
  const update=()=>{
   const selected=hover>=0?hover:focus>=0?focus:pinned;
   layers.forEach((layer,i)=>layer.classList.toggle('is-active',selected===i));
   buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(pinned===i)));
  };
  teaStates.forEach((s,i)=>{
   const b=document.createElement('button');b.className='native-tea-trigger';b.setAttribute('aria-label','Explore '+s.name+' tea');b.setAttribute('aria-pressed','false');
   b.style.top=((s.row-920)/1038*100)+'%';
   b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=i;update();}});
   b.addEventListener('pointerleave',()=>{hover=-1;update();});
   b.addEventListener('focus',()=>{focus=i;update();});
   b.addEventListener('blur',()=>{focus=-1;update();});
   b.addEventListener('click',()=>{pinned=pinned===i?-1:i;focus=-1;update();});
   b.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=hover=focus=-1;update();}});
   buttons.push(b);region.append(b);
  });
  content.append(region);return {region,buttons,layers};
 }
 const zoomDetails={
  bar:[
   {name:'Hydrangea',file:'hydrangea-states.png',sheetWidth:684,crop:{x:312,y:40,w:276,h:338},x:455,y:305,w:276,h:338,rest:111/138,round:'50%',duration:500,easing:'ease-in-out'},
   {name:'Lotus leaf',file:'lotus-leaf-states.png',sheetWidth:684,crop:{x:320,y:94,w:276,h:338},x:455,y:626,w:276,h:338,rest:111/138,round:'10%',duration:300,easing:'ease-out'}
  ],
  desserts:[{name:'Autumn seasonal dish',file:'seasonal-dish-states.png',sheetWidth:1304,crop:{x:694,y:40,w:570,h:570},x:108,y:2176,w:570,h:570,rest:506/570,round:'50%',duration:0}]
 };
 function attachZoomDetails(content,screen,imageHeight){
  return (zoomDetails[screen]||[]).map(d=>{
   const button=document.createElement('button');button.className='native-image-detail';button.setAttribute('aria-label','Explore '+d.name+' image');button.setAttribute('aria-pressed','false');
   Object.assign(button.style,{left:d.x/786*100+'%',top:d.y/imageHeight*100+'%',width:d.w/786*100+'%',height:d.h/imageHeight*100+'%'});
   const crop=document.createElement('span');crop.className='native-image-detail-art';crop.style.borderRadius=d.round;crop.style.setProperty('--detail-rest',String(d.rest));
   if(d.duration)crop.style.transition=`opacity ${d.duration}ms ${d.easing}, transform ${d.duration}ms ${d.easing}`;
   const image=new Image();crop.style.visibility='hidden';image.onload=()=>{crop.style.visibility='visible';};image.src='./emenu/assets/'+d.file;image.alt='';image.draggable=false;
   if(image.complete&&image.naturalWidth)crop.style.visibility='visible';
   Object.assign(image.style,{width:d.sheetWidth/d.crop.w*100+'%',left:-d.crop.x/d.crop.w*100+'%',top:-d.crop.y/d.crop.h*100+'%'});
   crop.append(image);button.append(crop);
   let pinned=false,hover=false,focus=false;
   const update=()=>{button.classList.toggle('is-active',pinned||hover||focus);button.setAttribute('aria-pressed',String(pinned));};
   button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;update();}});
   button.addEventListener('pointerleave',()=>{hover=false;update();});
   button.addEventListener('focus',()=>{focus=true;update();});button.addEventListener('blur',()=>{focus=false;update();});
   button.addEventListener('click',()=>{pinned=!pinned;focus=false;update();});
   button.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=hover=focus=false;update();}});
   content.append(button);return button;
  });
 }
 function attachDetail(content,detail){
  const layer=new Image();layer.src='./emenu/assets/'+detail.file;layer.alt='';layer.className='native-detail-image';layer.setAttribute('aria-hidden','true');layer.draggable=false;
  const button=document.createElement('button');button.className='native-hotspot native-detail-trigger';button.setAttribute('aria-label',detail.name);button.setAttribute('aria-pressed','false');
  let pinned=false,hovered=false,focused=false;
  const update=()=>{layer.classList.toggle('is-active',pinned||hovered||focused);button.setAttribute('aria-pressed',String(pinned));};
  button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;update();}});
  button.addEventListener('pointerleave',()=>{hovered=false;update();});
  button.addEventListener('focus',()=>{focused=true;update();});
  button.addEventListener('blur',()=>{focused=false;update();});
  button.addEventListener('click',()=>{pinned=!pinned;focused=false;update();});
  content.append(layer,button);return button;
 }
 root.MenuDetails={decorateButton,attachDetail,attachTea,attachZoomDetails,zoomDetails,sprites,teaStates,tintLettering};
})(typeof window==='undefined'?globalThis:window);

