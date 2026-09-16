const film=document.querySelector('#film');
const posterPlay=document.querySelector('#poster-play');
const comparison=document.querySelector('#comparison-video');
const excerpts={opening:{time:'00:18–00:34',earlierPoster:'twenty-assets/rough1-25.jpg',finalPoster:'twenty-assets/still-25.jpg',title:LydiaI18n.text("A title becomes an entry point.", "片名成为入口。"),description:LydiaI18n.text("The early assembly shows the handwritten notebook. In the final opening, the red Twenty title is layered over that same everyday surface. The personal question becomes the film’s introduction.", "早期剪辑呈现手写笔记本，最终开场则将红色 Twenty 片名叠加在同一日常表面上。个人问题由此成为影片的引子。"),note:LydiaI18n.text("Notice how the title treatment changes the role of the notebook: from an observed object to the beginning of a story.", "留意片名处理如何改变笔记本的角色：从被观看的物件，变成故事的开始。"),source:'ROUGH CUT 01'},closing:{time:'05:12–05:28',earlierPoster:'twenty-assets/rough2-320.jpg',finalPoster:'twenty-assets/still-320.jpg',title:LydiaI18n.text("The pressure moves onto the screen.", "压力，转移到屏幕上。"),description:LydiaI18n.text("At this point in Rough Cut 2, the image is a pond of lotus leaves. At the same time in the final film, a phone feed appears with a direct statement about social media. The two passages offer different ways into the film’s wider theme.", "在第二版粗剪的这一时间点，画面是一池荷叶；最终版同一时间点则出现手机信息流，以及对社交媒体的直接表述。两个段落以不同方式进入影片更广泛的主题。"),note:LydiaI18n.text("Compare what each passage makes visible: an outward-looking image of nature, or the screen through which comparison enters everyday life.", "比较两个段落让什么变得可见：向外观看的自然影像，或让比较进入日常生活的屏幕。"),source:'ROUGH CUT 02'}};
let selected='opening',version='final',request=0;
document.querySelectorAll('video').forEach(v=>v.addEventListener('play',()=>document.querySelectorAll('video').forEach(other=>{if(other!==v)other.pause();})));
const screening=document.querySelector('#screening');
const playbackStatus=document.querySelector('#playback-status');
let watchRequest=0;
function metadataReady(){
  if(film.readyState>=1)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>done(new Error('Metadata timeout')),20000);
    const loaded=()=>done(),failed=()=>done(new Error('Video load failed'));
    function done(error){clearTimeout(timer);film.removeEventListener('loadedmetadata',loaded);film.removeEventListener('error',failed);error?reject(error):resolve();}
    film.addEventListener('loadedmetadata',loaded,{once:true});film.addEventListener('error',failed,{once:true});
    if(film.networkState===HTMLMediaElement.NETWORK_EMPTY)film.load();
  });
}
async function watch(seconds){
  const token=++watchRequest;
  screening.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  playbackStatus.textContent=LydiaI18n.text("Loading selected moment…", "正在加载选定片段……");posterPlay.disabled=true;
  // Begin playback within the user gesture, then seek once metadata is ready.
  const ready=metadataReady();
  let playError=null;
  const playback=film.play().catch(error=>{playError=error;});
  try{
    await ready;if(token!==watchRequest)return;
    film.currentTime=Math.max(0,Math.min(seconds,film.duration-.05));
    await playback;if(token!==watchRequest)return;
    if(playError)await film.play();
    playbackStatus.textContent='';posterPlay.disabled=false;
  }catch{if(token!==watchRequest)return;posterPlay.disabled=false;playbackStatus.textContent=LydiaI18n.text("Please press Play to continue from the selected moment.", "请点击播放，从选定片段继续观看。");}
}
document.querySelectorAll('[data-watch]').forEach(button=>button.addEventListener('click',()=>watch(Number(button.dataset.watch))));
posterPlay.addEventListener('click',()=>watch(film.currentTime||0));
film.addEventListener('playing',()=>{screening.classList.add('has-started');posterPlay.disabled=false;playbackStatus.textContent='';});
film.addEventListener('error',()=>{posterPlay.disabled=false;playbackStatus.textContent=LydiaI18n.text("The film could not load. Please refresh and try again.", "影片未能加载，请刷新重试。");});
function updateComparison(preserve=false){const token=++request,position=preserve?comparison.currentTime:0;comparison.pause();comparison.src=`twenty-assets/${selected}-${version}.mp4`;comparison.poster=excerpts[selected][`${version}Poster`];comparison.setAttribute('aria-label',`${version} ${selected} excerpt`);comparison.load();comparison.addEventListener('loadedmetadata',()=>{if(token===request)comparison.currentTime=Math.min(position,Math.max(0,comparison.duration-.1));},{once:true});document.querySelectorAll('[data-comparison]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.comparison===selected)));document.querySelectorAll('[data-version]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.version===version)));const data=excerpts[selected];document.querySelector('#excerpt-time').textContent=data.time;document.querySelector('#comparison-title').textContent=data.title;document.querySelector('#comparison-description').textContent=data.description;document.querySelector('#comparison-note').textContent=data.note;document.querySelector('#source-caption').textContent=`${version==='final'?'FINAL FILM':data.source} / 16-SECOND EXCERPT`;}
document.querySelectorAll('[data-comparison]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.comparison;updateComparison();}));document.querySelectorAll('[data-version]').forEach(b=>b.addEventListener('click',()=>{version=b.dataset.version;updateComparison(true);}));
document.querySelector('.archive').addEventListener('toggle',e=>{if(e.currentTarget.open)e.currentTarget.querySelectorAll('[data-src]').forEach(v=>{v.src=v.dataset.src;delete v.dataset.src;});else e.currentTarget.querySelectorAll('video').forEach(v=>v.pause());});

