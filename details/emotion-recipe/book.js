(() => {
const $=id=>document.getElementById(id),dialog=$('page-dialog'),spread=$('reader-spread');
const root='./blueprint-book/',total=32;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let current=1,busy=false,timer,touchX=0,openingId=0;
const src=i=>root+String(i+1).padStart(2,'0')+'.webp';
function setImage(el,i){el.hidden=i>=total;if(i<total){el.src=src(i);el.alt=`Emotion Recipe — ${i+1} / ${total}`;}}
function render(){setImage($('leaf-left'),current);setImage($('leaf-right'),current+1);$('reader-count').textContent=`${current+1}${current+1<total?' – '+(current+2):''} / ${total}`;$('reader-prev').disabled=busy;$('reader-next').disabled=busy||current>=total-2;}
function finishOpening(){spread.classList.remove('cover-closed','cover-opening');$('turning-leaf').hidden=true;busy=false;render();}
$('page-open').onclick=async()=>{
 if(busy)return;
 const id=++openingId;clearTimeout(timer);current=1;busy=true;render();
 const flap=$('turning-leaf');flap.className='turning-leaf forward';
 // The cover front is page 1, its reverse is page 2; page 3 waits underneath.
 setImage($('flip-front'),0);setImage($('flip-back'),1);flap.hidden=false;
 spread.classList.add('cover-closed');
 await Promise.all([$ ('flip-front'),$('flip-back'),$('leaf-right')].map(img=>img.decode().catch(()=>{})));
 if(id!==openingId)return;
 dialog.showModal();
 if(reduced.matches){finishOpening();return;}
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(id!==openingId||!dialog.open)return;
  spread.classList.add('cover-opening');spread.classList.remove('cover-closed');
  flap.classList.add('flipping');timer=setTimeout(finishOpening,1050);
 }));
};
function flip(direction){
 if(busy)return;const target=current+direction*2;if(target<1||target>=total)return;
 busy=true;render();const flap=$('turning-leaf');flap.className='turning-leaf '+(direction<0?'backward':'forward');
 setImage($('flip-front'),direction>0?current+1:current);setImage($('flip-back'),direction>0?target:Math.min(target+1,total-1));
 if(direction>0)setImage($('leaf-right'),target+1);else setImage($('leaf-left'),target);
 flap.hidden=false;void flap.offsetWidth;flap.classList.add('flipping');
 timer=setTimeout(()=>{current=target;busy=false;flap.hidden=true;render();},reduced.matches?0:720);
}
$('reader-next').onclick=()=>flip(1);$('reader-prev').onclick=()=>{if(busy)return;if(current===1){dialog.close();return;}flip(-1);};
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();flip(1);}if(e.key==='ArrowLeft'){e.preventDefault();$('reader-prev').click();}});
spread.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});spread.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-touchX;if(Math.abs(d)<55)return;if(d<0)flip(1);else $('reader-prev').click();},{passive:true});
dialog.addEventListener('close',()=>{++openingId;clearTimeout(timer);busy=false;spread.classList.remove('cover-closed','cover-opening');$('turning-leaf').hidden=true;});
})();

