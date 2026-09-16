const movie=document.querySelector('#movie');
let seekTicket=0;
document.querySelectorAll('[data-time]').forEach(button=>button.addEventListener('click',async()=>{
  const ticket=++seekTicket;document.querySelector('#film').scrollIntoView();
  const ready=movie.readyState>=1?Promise.resolve():new Promise((resolve,reject)=>{movie.addEventListener('loadedmetadata',resolve,{once:true});movie.addEventListener('error',reject,{once:true});});
  const playing=movie.play().catch(()=>{});
  try{await ready;if(ticket!==seekTicket)return;movie.currentTime=Number(button.dataset.time);await playing;if(movie.paused)await movie.play();}catch{}
}));
const range=document.querySelector('#frame-range'),frame=document.querySelector('#lab-frame'),onion=document.querySelector('#onion-frame');
let current=1,timer=null;
const src=n=>`gingerbread-assets/frame-${String(n).padStart(2,'0')}.jpg`;
function paint(){frame.src=src(current);frame.alt=`Sampled frame ${current} from the decorating sequence`;range.value=current;document.querySelector('#frame-number').textContent=String(current).padStart(2,'0');document.querySelector('#frame-output').textContent=`${String(current).padStart(2,'0')} / 24`;onion.src=src(Math.max(1,current-1));onion.hidden=!document.querySelector('#onion-toggle').checked||current===1;}
function stop(){clearInterval(timer);timer=null;document.querySelector('#sequence-play').textContent=LydiaI18n.text("Play sequence ▶", "播放序列 ▶");}
range.addEventListener('input',()=>{stop();current=Number(range.value);paint();});
document.querySelector('#frame-prev').addEventListener('click',()=>{stop();current=Math.max(1,current-1);paint();});
document.querySelector('#frame-next').addEventListener('click',()=>{stop();current=Math.min(24,current+1);paint();});
document.querySelector('#onion-toggle').addEventListener('change',paint);
document.querySelector('#sequence-play').addEventListener('click',()=>{if(timer){stop();return;}for(let i=1;i<=24;i++){const im=new Image();im.src=src(i);}document.querySelector('#sequence-play').textContent=LydiaI18n.text("Pause sequence Ⅱ", "暂停 Ⅱ");timer=setInterval(()=>{current=current%24+1;paint();},1000/6);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(document.querySelector('#frame-lab'));
const viewer=document.querySelector('#photo-viewer');let sourceButton;
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{sourceButton=button;viewer.querySelector('img').src=button.dataset.photo;viewer.showModal();}));
document.querySelector('#photo-close').addEventListener('click',()=>viewer.close());viewer.addEventListener('close',()=>sourceButton?.focus());

