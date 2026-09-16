'use strict';
const $=s=>document.querySelector(s);
const versions=[
 {label:'Version 02',page:'26:2',node:'27-3637',image:'2.2.jpg',kicker:'VERSION 02 / BOTTOM NAVIGATION',title:LydiaI18n.text("The controls stay within reach.", "简易化操作。"),description:LydiaI18n.text("A dark canvas places search, the menu, and directional controls along the bottom. Main opens a second choice between dishes, recommendations, and vegetables.", "深色界面将搜索、菜单与方向控件放在底部；主菜单进一步展开菜品、推荐与蔬菜的选择。"),hint:LydiaI18n.text("Open the cover, choose Main, then use the bottom menu control to return.", "打开封面并选择 Main，再通过底部菜单返回。")},
 {label:'Version 03',page:'26:2',node:'27-909',image:'3.1.jpg',kicker:'VERSION 03 / SIDE NAVIGATION',title:LydiaI18n.text("A rail becomes a menu.", "一列图标，展开为菜单。"),description:LydiaI18n.text("A narrow icon rail expands into a labeled sidebar. Main opens its subcategories inside the same panel, changing the way the menu reveals its structure.", "窄窄的图标栏展开为带文字的侧边栏，主菜的子分类也在同一面板中呈现。"),hint:LydiaI18n.text("Expand the top-left menu, then open Main and its subcategories.", "展开左上角菜单，打开 Main 及其子分类。")},
 {label:'Final',page:'177:2875',node:'360-4794',image:'final-01.jpg',kicker:LydiaI18n.text("FINAL / A COHESIVE DIRECTION", "最终版 / 统一的方向"),title:LydiaI18n.text("An introduction, then exploration.", "先引导，再探索。"),description:LydiaI18n.text("The final flow introduces scrolling before the category list. Green controls and corner motifs carry the visual identity into navigation.", "终稿选择先进行操作提示，再呈现分类列表。绿色控件与角饰将视觉识别延伸到导航中。"),hint:LydiaI18n.text("Open the cover, continue past the guide, then choose Main.", "打开封面，经过引导页，再选择 Main。")}
];
// Keep archive filenames stable; presentation follows the newly named sections.
Object.assign(versions[0],{label:'Version 01',node:'244-6870',kicker:LydiaI18n.text("VERSION 01 / BOTTOM NAVIGATION", "版本 01 / 底部导航")});
Object.assign(versions[1],{label:'Version 02',node:'2001-2755',kicker:LydiaI18n.text("VERSION 02 / SIDE NAVIGATION", "版本 02 / 侧边导航")});
Object.assign(versions[2],{node:'4001-5759'});
function prototypeURL(v){const u=new URL('https://www.figma.com/design/rJihs4qdOrs7GfIO8wHngz/Lydia-s-Print-Menu');u.search=new URLSearchParams({'node-id':v.node}).toString();return u.href;}
// Keep the previous preview intact on disk; upgrade its presentation in this independent preview.
$('.phone-controls').remove();$('.demo-note').remove();
$('#phone-scroll').removeAttribute('tabindex');$('#phone-scroll').setAttribute('aria-label','Final menu cover');
const heroMenu=MenuNative.create(2);$('#phone').replaceChildren(heroMenu);$('#screen-status').textContent=LydiaI18n.text("Tap the cover to begin", "点击封面开始");
$('.hero-actions .text-button').removeAttribute('data-figma');$('.hero-actions .text-button').dataset.watch='';$('.hero-actions .text-button').textContent=LydiaI18n.text("Watch the final walkthrough →", "观看最终演示 →");
$('.journey .small-note').remove();
$('.version-tabs').innerHTML=versions.map((v,i)=>`<button role="tab" id="version-tab-${i}" aria-selected="${i===2}" aria-controls="version-panel" tabindex="${i===2?0:-1}" data-version="${i}">${v.label}</button>`).join('');
$('.annotation').outerHTML="<div class=\"try-task\"><span class=\"eyebrow\" data-i18n-managed=\"true\" data-zh=\"试试同一个任务\">TRY THE SAME TASK</span><p data-i18n-managed=\"true\" data-zh=\"找到一道主菜，&lt;br&gt;再返回分类。\">Find a main dish.<br>Then return to the categories.</p><span id=\"task-hint\"></span></div>";
$('.comparison-stage').outerHTML="<div class=\"prototype-stage\"><div class=\"prototype-bar\"><span id=\"version-stage-label\"></span><div><button id=\"proto-restart\" disabled>Restart ↺</button><button id=\"proto-expand\">Expand ↗</button></div></div><div id=\"prototype-slot\"><button id=\"prototype-poster\" aria-label=\"Start the selected Figma prototype\"><img id=\"version-image\" alt=\"Original design preview\"><span class=\"start-prototype\">Start prototype ↗</span></button><div id=\"inline-prototype\" hidden></div></div><div class=\"prototype-help\"><span id=\"prototype-status\" aria-live=\"polite\"></span><button id=\"version-watch\" class=\"walkthrough-link\" data-i18n-managed=\"true\" data-zh=\"观看最终演示\">Watch final walkthrough</button></div><div class=\"prototype-fallback\"><button id=\"proto-poster\">Back to preview</button></div></div>";
const recording=$('.recording video');
const videoDialog=document.createElement('dialog');videoDialog.id='video-dialog';videoDialog.innerHTML="<div class=\"dialog-bar\"><span data-i18n-managed=\"true\" data-zh=\"最终版 — Figma 演示录像\">Final — Recorded Figma walkthrough</span><button data-close=\"video-dialog\">Close ×</button></div>";videoDialog.append(recording);document.body.append(videoDialog);recording.preload='none';$('.recording').remove();$('.archive .eyebrow').textContent=LydiaI18n.text("04 / Behind the interface", "04 / 界面背后");
$('#figma-dialog').innerHTML='<div class="dialog-bar"><span id="dialog-prototype-title"></span><div><button id="dialog-restart">Restart ↺</button><button data-close="figma-dialog">Close ×</button></div></div><div id="figma-container"></div><p class="embed-help">Figma may require access. <a id="dialog-external" target="_blank" rel="noopener">Open in Figma ↗</a><button id="dialog-watch">Watch final walkthrough →</button></p>';
let selected=2,frame=null,owner=null,dialogVersion=2,resumeInline=false,loadingTimer;
// Players also expose data-version for styling. Only actual tab buttons belong here.
const tabs=[...document.querySelectorAll('.version-tabs button[role="tab"][data-version]')];
// Reserve the tallest description at this width so selecting a version cannot
// move the centered player. Hidden copies have no IDs or interactive elements.
const versionPanel=$('#version-panel');
const activeCopy=document.createElement('div');activeCopy.className='version-panel-copy';
activeCopy.append(...versionPanel.childNodes);versionPanel.append(activeCopy);
versions.forEach(v=>{
 const copy=document.createElement('div');copy.className='version-panel-copy version-size-reference';copy.setAttribute('aria-hidden','true');
 const kicker=document.createElement('span');kicker.className='eyebrow';kicker.textContent=v.kicker;
 const title=document.createElement('h3');title.textContent=v.title;
 const description=document.createElement('p');description.textContent=v.description;
 copy.append(kicker,title,description);versionPanel.append(copy);
});
const hintSlot=document.createElement('span');hintSlot.className='version-hint-slot';
$('#task-hint').replaceWith(hintSlot);
const activeHint=document.createElement('span');activeHint.id='task-hint';hintSlot.append(activeHint);
versions.forEach(v=>{const hint=document.createElement('span');hint.className='version-size-reference';hint.setAttribute('aria-hidden','true');hint.textContent=v.hint;hintSlot.append(hint);});
function openDialog(id){$('#'+id).showModal();document.body.classList.add('modal-open');}
function destroyFrame(){clearTimeout(loadingTimer);if(frame){frame.dispose();frame.remove();}frame=null;owner=null;$('#inline-prototype').hidden=true;$('#prototype-poster').hidden=false;$('#proto-restart').disabled=true;}
function makeFrame(i,target,start='cover'){destroyFrame();frame=MenuNative.create(i,start);owner=target;$(target==='inline'?'#inline-prototype':'#figma-container').append(frame);if(target==='inline'){$('#inline-prototype').hidden=false;$('#prototype-poster').hidden=true;$('#proto-restart').disabled=false;$('#prototype-status').textContent=LydiaI18n.text("Click to navigate · Scroll to read", "点击导航 · 滚动阅读");}}
// 下方代码会拼接这些英文标签；中文在这里一同维护。
LydiaI18n.register([
  [
    "FINAL / INTERACTIVE MENU",
    "最终版 / 交互菜单"
  ],
  [
    "VERSION 01 / INTERACTIVE MENU",
    "版本01 / 交互菜单"
  ],
  [
    "VERSION 02 / INTERACTIVE MENU",
    "版本02 / 交互菜单"
  ],
  [
    "Watch version 01 walkthrough",
    "观看版本01录屏演示"
  ],
  [
    "Watch version 02 walkthrough",
    "观看版本02录屏演示"
  ]
]);
function setVersion(i,start='cover'){const wasLive=owner==='inline';selected=i;const v=versions[i];tabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;});$('#version-panel').setAttribute('aria-labelledby',tabs[i].id);$('#version-image').src='./emenu/assets/'+v.image;$('#version-image').alt=v.label+' — original design preview';$('#version-kicker').textContent=v.kicker;$('#version-title').textContent=v.title;$('#version-description').textContent=v.description;$('#version-stage-label').textContent=v.label.toUpperCase()+' / INTERACTIVE MENU';$('#task-hint').textContent=v.hint;$('#version-watch').textContent=i===2?LydiaI18n.text("Watch final walkthrough", "观看最终演示"):'Watch '+v.label.toLowerCase()+' walkthrough';$('#prototype-status').textContent='Select a version. Tap to explore.';if(wasLive)makeFrame(i,'inline',start);}
tabs.forEach((b,i)=>{b.addEventListener('click',()=>setVersion(i));b.addEventListener('keydown',e=>{let j;if(e.key==='ArrowRight')j=(i+1)%tabs.length;if(e.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;if(j!==undefined){e.preventDefault();setVersion(j);tabs[j].focus();}});});
function expandPrototype(i,preserve=false){dialogVersion=i;resumeInline=preserve;$('#dialog-prototype-title').textContent=versions[i].label+' — Interactive menu';$('#dialog-external').href=prototypeURL(versions[i]);openDialog('figma-dialog');if(preserve&&owner==='inline'&&frame){clearTimeout(loadingTimer);$('#figma-container').append(frame);owner='dialog';}else makeFrame(i,'dialog');}
$('#prototype-poster').addEventListener('click',()=>makeFrame(selected,'inline'));
$('#proto-restart').addEventListener('click',()=>makeFrame(selected,'inline'));
$('#proto-poster').addEventListener('click',()=>{makeFrame(selected,'inline');frame.querySelector('.native-viewport').focus({preventScroll:true});});
$('#proto-expand').addEventListener('click',()=>expandPrototype(selected,true));
$('#dialog-restart').addEventListener('click',()=>makeFrame(dialogVersion,'dialog'));
$('#enter-menu').addEventListener('click',()=>{heroMenu.navigate('guide');$('#phone').scrollIntoView({block:'center',behavior:'smooth'});heroMenu.querySelector('.native-viewport').focus({preventScroll:true});});
$('#figma-dialog').addEventListener('close',()=>{if(resumeInline&&frame){$('#inline-prototype').append(frame);owner='inline';$('#inline-prototype').hidden=false;$('#prototype-poster').hidden=true;$('#proto-restart').disabled=false;$('#prototype-status').textContent=LydiaI18n.text("Click to navigate · Scroll to read", "点击导航 · 滚动阅读");}else destroyFrame();resumeInline=false;});
const walkthroughs=['./emenu/assets/version-01-walkthrough.mp4','./emenu/assets/version-02-walkthrough.mp4','./emenu/assets/walkthrough.mp4'];
function showVideo(i=2){if($('#figma-dialog').open)$('#figma-dialog').close();recording.pause();recording.src=walkthroughs[i];recording.removeAttribute('poster');recording.setAttribute('aria-label',versions[i].label+' recorded walkthrough');videoDialog.querySelector('.dialog-bar span').textContent=versions[i].label+' — Recorded walkthrough';recording.load();openDialog('video-dialog');recording.play().catch(()=>{});}
document.querySelectorAll('[data-watch]').forEach(b=>b.addEventListener('click',()=>showVideo(2)));$('#dialog-watch').textContent=LydiaI18n.text("Watch walkthrough →", "观看演示 →");$('#dialog-watch').addEventListener('click',()=>showVideo(dialogVersion));$('#version-watch').addEventListener('click',()=>showVideo(selected));videoDialog.addEventListener('close',()=>recording.pause());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>document.body.classList.toggle('modal-open',!!document.querySelector('dialog[open]')));d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
function showImage(src,label){$('#archive-large').src=src;$('#archive-large').alt=label;$('#image-label').textContent=label;openDialog('image-dialog');$('#image-dialog').scrollTop=0;}
const journeyTargets=['categories','main-menu','main'];
document.querySelectorAll('[data-menu-screen]').forEach(b=>b.addEventListener('click',()=>{
 const screen=b.dataset.menuScreen;if(!journeyTargets.includes(screen))return;
 setVersion(2,screen);if(owner!=='inline')makeFrame(2,'inline',screen);
 const viewport=frame.querySelector('.native-viewport');
 viewport.focus({preventScroll:true});
 $('.prototype-stage').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 $('#prototype-status').textContent='Final / '+b.querySelector('h3').childNodes[0].textContent.trim()+' · Click to explore';
}));
const sequence=(count,prefix,start=1)=>Array.from({length:count},(_,i)=>`${prefix}${i+start}.jpg`);
const groups={wireframe:sequence(3,'wireframe-'),'1':sequence(16,'1.'),'2':sequence(16,'2.'),'3':['3.0.jpg','3.00.jpg','3.000.jpg',...sequence(22,'3.')],final:Array.from({length:18},(_,i)=>`final-${String(i+1).padStart(2,'0')}.jpg`)};
function setArchive(group){document.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===group)));const grid=$('#archive-grid');grid.replaceChildren();groups[group].forEach((file,i)=>{const b=document.createElement('button');b.className='archive-item';const img=document.createElement('img');img.src='./emenu/assets/'+file;img.loading='lazy';img.alt=`${archiveLabels[group]} — screen ${i+1}`;const caption=document.createElement('span');caption.textContent=`${String(i+1).padStart(2,'0')} / VIEW SCREEN ↗`;b.append(img,caption);b.addEventListener('click',()=>showImage(img.src,img.alt));grid.append(b);});}
document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>setArchive(b.dataset.group)));
$('#archive').addEventListener('toggle',()=>{if($('#archive').open&&!$('#archive-grid').children.length)setArchive('wireframe');});
setVersion(2);
makeFrame(2,'inline');
$('#proto-poster').textContent=LydiaI18n.text("Return to cover ↺", "返回封面 ↺");
$('.embed-help').firstChild.textContent='Click to navigate · Scroll to read. ';
$('#dialog-external').hidden=true;

$('#prototype-poster').setAttribute('aria-label','Explore the selected menu on this page');
$('.start-prototype').textContent=LydiaI18n.text("Explore menu →", "探索菜单 →");
const archiveLabels={wireframe:'Wireframes','1':'Version 03','2':'Version 01','3':'Version 02',final:'Final screens'};
document.querySelectorAll('[data-group]').forEach(b=>{b.textContent=archiveLabels[b.dataset.group];});
heroMenu.addEventListener('menuchange',e=>{$('#screen-status').textContent=e.detail.screen==='cover'?LydiaI18n.text("Tap the cover to begin", "点击封面开始"):e.detail.screen==='guide'?'Tap to continue to the menu':'Click to explore · Scroll to read';});

const heroReset=document.createElement('button');heroReset.className='hero-reset';heroReset.textContent=LydiaI18n.text("Return to cover ↺", "返回封面 ↺");heroReset.setAttribute('aria-label','Reset the hero menu to its cover');heroReset.addEventListener('click',()=>heroMenu.reset());$('.phone-caption').after(heroReset);


