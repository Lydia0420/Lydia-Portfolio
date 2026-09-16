import * as THREE from '../../../candy-box/vendor/three.module.js';
const $=id=>document.getElementById(id),asset='./05/gallery/';
const rooms=[
 {en:'Elementary School',zh:'小学',short:'Elementary',sub:'The first brushstrokes.',subzh:'最初的笔触。',wall:0xe9e5d9,floor:0xc6ae88,color:'#d9c9aa'},
 {en:'Middle School',zh:'初中',short:'Middle',sub:'Looking closer. Trying something new.',subzh:'仔细观察，也试着改变。',wall:0xe8e5e1,floor:0xd6b7bd,color:'#d8b6bd'},
 {en:'High School',zh:'高中',short:'High',sub:'More colour. More possibilities.',subzh:'更多色彩，更多可能。',wall:0x8c8983,floor:0xb59a79,color:'#a8a18e'},
 {en:'University',zh:'大学',short:'University',sub:'An ongoing conversation.',subzh:'创作仍在继续。',wall:0xe6e1d7,floor:0xc0aa92,color:'#be8c72'}
];
let language='en',activeRoom=0,selected=0,works=[],renderer,scene,camera,drag=null,keys=new Set(),last=0,ready=false;
let yaw=0,pitch=0,targetYaw=0,targetPitch=0,dolly=0;
const colliders=[],walkable=[],pointers=new Map();let pinch=0;
const artTargets=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const tr=(a,b)=>language==='en'?a:b;
function textRoom(){const r=rooms[activeRoom]||{en:'The Atrium',zh:'天井大厅',sub:'A place to begin. And return.',subzh:'从这里出发，也回到这里。'};$('room-number').textContent=activeRoom<0?tr('THE GALLERY','绘画展馆'):tr('ROOM ','展厅 ')+String(activeRoom+1).padStart(2,'0');$('room-name').textContent=r[language];$('room-subtitle').textContent=language==='en'?r.sub:r.subzh;document.body.dataset.room=activeRoom;document.querySelectorAll('[data-room]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(+b.dataset.room===activeRoom));});}
function nav(){ $('room-nav').innerHTML=rooms.map((r,i)=>`<button data-room="${i}" style="--room-color:${r.color}" aria-pressed="${i===activeRoom}"><b>0${i+1}</b>${language==='en'?r.short:r.zh}</button>`).join('');textRoom();}
function artName(w){return tr('Work ','作品 ')+String(w.number).padStart(2,'0');}
function catalog(){ $('catalog-rooms').innerHTML=rooms.map((r,i)=>`<section class="catalog-section"><h3>0${i+1} / ${r[language]}</h3><div class="catalog-grid">${works.filter(w=>w.room===i).map(w=>`<button class="catalog-item" data-work="${works.indexOf(w)}"><img src="${asset}thumb/${w.id}.webp" alt="${r[language]} — ${artName(w)}" loading="lazy"><span>${artName(w)}</span></button>`).join('')}</div></section>`).join('');}
function showWork(index){selected=(index+works.length)%works.length;const w=works[selected];$('art-image').src=w.file;$('art-image').alt=rooms[w.room][language]+' — '+artName(w);$('art-era').textContent=rooms[w.room][language];$('art-title').textContent=artName(w);$('art-index').textContent=String(selected+1).padStart(2,'0')+' / '+works.length;if(!$('art-dialog').open)$('art-dialog').showModal();stopMoving();}
$('art-prev').onclick=()=>showWork(selected-1);$('art-next').onclick=()=>showWork(selected+1);
$('art-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showWork(selected-1);}if(e.key==='ArrowRight'){e.preventDefault();showWork(selected+1);}});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('browse').onclick=()=>{$('catalog').showModal();stopMoving();};$('catalog-rooms').onclick=e=>{const b=e.target.closest('[data-work]');if(b)showWork(+b.dataset.work);};
$('lang').onclick=()=>{language=language==='en'?'zh':'en';document.documentElement.lang=language==='en'?'en':'zh-CN';document.querySelectorAll('[data-en]').forEach(e=>e.textContent=e.dataset[language]);$('lang').textContent=language==='en'?'中文':'EN';nav();catalog();if($('art-dialog').open)showWork(selected);};
$('room-nav').onclick=e=>{const b=e.target.closest('[data-room]');if(b)goRoom(+b.dataset.room);};
function box(w,h,d,x,y,z,material,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);parent.add(m);return m;}
const mat=(color,roughness=.9)=>new THREE.MeshStandardMaterial({color,roughness});
let path,total=0,progress=0,target=0,focus=null,returning=false,entered=false;
const mounts=[],startAt=[.055,.40,.58,.81],endAt=[.39,.57,.80,.955];
function buildPath(){
 path=new THREE.CurvePath();let p=new THREE.Vector3(0,2.6,30);
 const line=(x,z)=>{const q=new THREE.Vector3(x,2.6,z);path.add(new THREE.LineCurve3(p,q));p=q;};
 const bend=(cx,cz,x,z)=>{const q=new THREE.Vector3(x,2.6,z);path.add(new THREE.QuadraticBezierCurve3(p,new THREE.Vector3(cx,2.6,cz),q));p=q;};
 line(26,30);bend(40,30,40,16);line(40,-16);bend(40,-30,26,-30);line(-26,-30);bend(-40,-30,-40,-16);line(-40,16);bend(-40,30,-26,30);line(0,30);total=path.getLength();
}
const sample=t=>path.getPointAt(THREE.MathUtils.clamp(t,0,1));
function normalAt(t){const d=path.getTangentAt(THREE.MathUtils.clamp(t,0,1));return new THREE.Vector3(-d.z,0,d.x).normalize();}
function roomAt(t){return startAt.findIndex((a,i)=>t>=a&&t<=endAt[i]);}
function strip(points,height,color){const v=[],idx=[];for(let i=0;i<points.length;i++){const p=points[i];v.push(p.x,0,p.z,p.x,height,p.z);if(i<points.length-1){const j=i*2;idx.push(j,j+1,j+2,j+1,j+3,j+2);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=mat(color);m.side=THREE.DoubleSide;const mesh=new THREE.Mesh(g,m);scene.add(mesh);return mesh;}
function ribbon(points,width,y,color){const v=[],idx=[];for(let i=0;i<points.length;i++){const d=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]).normalize(),n=new THREE.Vector3(-d.z,0,d.x).multiplyScalar(width/2),p=points[i];v.push(p.x+n.x,y,p.z+n.z,p.x-n.x,y,p.z-n.z);if(i<points.length-1){const j=i*2;idx.push(j,j+2,j+1,j+1,j+2,j+3);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=mat(color,.8);m.side=THREE.DoubleSide;scene.add(new THREE.Mesh(g,m));}
function buildMuseum(){
 buildPath();
 // Continuous architecture follows the same physical circuit as the visitor.
 const count=640;
 for(let i=0;i<count;i++){
  const t=i/count,u=(i+1)/count,p=sample(t),q=sample(u),n=normalAt(t),m=normalAt(u),r=roomAt(t),dark=r===2;
  ribbon([p,q],10.2,-.03,dark?0x454746:r===1?0xe9e4de:0xe5e3dc);
  const lobby=p.distanceTo(new THREE.Vector3(0,2.6,30))<7.6;
  if(!lobby){
   for(const side of [-1,1]){
    const a=p.clone().addScaledVector(n,side*5),b=q.clone().addScaledVector(m,side*5);strip([a,b],6.4,r===1?0xf0edE8:0xf0f0e9);
    if(dark){const g=new THREE.BufferGeometry().setFromPoints([a.clone().setY(.075),b.clone().setY(.075)]);scene.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0xfff5dc})));}
   }
   ribbon([p,q],10.2,6.4,0xe8e8e2);
  }
 }
 // Quiet linear roof lights define scale, without decorative furniture.
 for(let t=.045;t<.97;t+=.018){const p=sample(t);if(p.distanceTo(new THREE.Vector3(0,2.6,30))<10)continue;const light=box(.07,.025,2.4,p.x,6.34,p.z,new THREE.MeshBasicMaterial({color:0xffffff}));light.rotation.y=Math.atan2(path.getTangentAt(t).x,path.getTangentAt(t).z);}
 buildAtrium();
 works.forEach(w=>{
  const group=works.filter(a=>a.room===w.room),i=group.indexOf(w),t=startAt[w.room]+(endAt[w.room]-startAt[w.room])*(i+.5)/group.length;
  const p=sample(t),n=normalAt(t),g=new THREE.Group();g.position.copy(p).addScaledVector(n,4.88);g.position.y=2.8;g.rotation.y=Math.atan2(-n.x,-n.z);scene.add(g);
  const spacing=(endAt[w.room]-startAt[w.room])*total/group.length;
  let h=2.25,width=h*w.width/w.height,maxWidth=Math.min(3.1,spacing-.48);if(width>maxWidth){width=maxWidth;h=width*w.height/w.width;}
  box(width+.13,h+.13,.10,0,0,0,mat(w.room===0?0xa89983:0x373937),g);box(width+.055,h+.055,.11,0,0,.015,new THREE.MeshBasicMaterial({color:0xf5f2e9}),g);
  const surface=new THREE.Mesh(new THREE.PlaneGeometry(width,h),new THREE.MeshBasicMaterial({color:0xeeeae0,toneMapped:false}));surface.position.z=.085;surface.userData.index=works.indexOf(w);g.add(surface);artTargets.push(surface);
  new THREE.TextureLoader().load(asset+'art/'+w.id+'.webp',tex=>{tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());surface.material.map=tex;surface.material.color.set(0xffffff);surface.material.needsUpdate=true;});
  mounts.push({g,t,width,height:h,normal:n.clone().negate()});
  if(w.room===1){const edge=sample(t+(spacing/total)*.45),norm=normalAt(t+(spacing/total)*.45);edge.addScaledVector(norm,4.55);const fin=box(.09,5.6,.9,edge.x,2.8,edge.z,mat(0xe3e2dc));fin.rotation.y=Math.atan2(norm.x,norm.z);}

  box(.22,.09,.02,width/2-.1,-h/2-.19,.025,mat(0xc8c8c0),g);
 });
}
function buildAtrium(){
 const center=new THREE.Vector3(0,0,30),radius=9;
 const floor=new THREE.Mesh(new THREE.CircleGeometry(radius,96),mat(0xe8e6df));floor.rotation.x=-Math.PI/2;floor.position.copy(center);scene.add(floor);
 for(let i=0;i<128;i++){const a=i/128*Math.PI*2,b=(i+1)/128*Math.PI*2;if(Math.abs(Math.sin((a+b)/2))<.555)continue;strip([new THREE.Vector3(radius*Math.cos(a),0,30+radius*Math.sin(a)),new THREE.Vector3(radius*Math.cos(b),0,30+radius*Math.sin(b))],8.2,0xeeeFe9);}
 const roof=new THREE.Mesh(new THREE.RingGeometry(4.4,9.15,96),mat(0xe4e6df));roof.material.side=THREE.DoubleSide;roof.rotation.x=Math.PI/2;roof.position.set(0,8.2,30);scene.add(roof);
 const well=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.4,2.1,96,1,true),mat(0xf0f2ec));well.material.side=THREE.DoubleSide;well.position.set(0,9.25,30);scene.add(well);
 const sky=new THREE.Mesh(new THREE.CircleGeometry(4.4,96),new THREE.MeshBasicMaterial({color:0xf5fbff,side:THREE.DoubleSide}));sky.rotation.x=Math.PI/2;sky.position.set(0,10.32,30);scene.add(sky);
 // Soft radial light on the floor, generated as a small local canvas texture.
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(255,255,245,.65)');gradient.addColorStop(1,'rgba(255,255,245,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(13,13),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.set(-1,.012,30);scene.add(glow);
}
function batchArchitecture(){
 const buckets=new Map();scene.updateMatrixWorld(true);
 for(const mesh of [...scene.children]){if(!mesh.isMesh||mesh.material.map||mesh.material.transparent)continue;const m=mesh.material,key=m.type+':'+m.color.getHex()+':'+m.side;let b=buckets.get(key);if(!b){b={material:m,p:[],n:[]};buckets.set(key,b);}const g=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(mesh.matrixWorld);b.p.push(...g.attributes.position.array);b.n.push(...g.attributes.normal.array);scene.remove(mesh);g.dispose();mesh.geometry.dispose();}
 for(const b of buckets.values()){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));scene.add(new THREE.Mesh(g,b.material));}
}
function stopMoving(){target=progress;drag=null;keys.clear();}
function poseAt(t){const p=sample(t),d=path.getTangentAt(Math.min(.99999,t)),look=p.clone().addScaledVector(d,8);const edge=Math.min(t,1-t);if(edge<.035){const blend=(1-edge/.035)**2;p.x-=6*blend;look.lerp(new THREE.Vector3(0,8.1,30),blend);}return{p,look};}
function goRoom(i){if(!entered)return;leaveFocus();target=startAt[i];}
function updateHeading(){const i=roomAt(progress);if(i!==activeRoom){activeRoom=i;textRoom();}if(document.activeElement!==$('journey'))$('journey').value=progress;$('journey-count').textContent=Math.round(progress*100)+'%';}
function frontPose(index){const a=mounts[index],v=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),dist=Math.max(a.height/(2*v),a.width/(2*v*camera.aspect))*1.35+.25;const look=a.g.position.clone();return{p:look.clone().addScaledVector(a.normal,dist),look};}
function focusWork(index){if(!entered)return;stopMoving();focus={index,savedP:camera.position.clone(),savedQ:camera.quaternion.clone(),pose:frontPose(index)};returning=false;selected=index;$('focus-label').textContent=rooms[works[index].room][language]+' / '+artName(works[index]);$('focus-panel').hidden=false;document.body.classList.add('viewing');$('continue').focus({preventScroll:true});}
function leaveFocus(){if(!focus)return;returning=true;$('focus-panel').hidden=true;document.body.classList.remove('viewing');}
$('continue').onclick=leaveFocus;$('original').onclick=()=>showWork(selected);$('reset').onclick=()=>{leaveFocus();target=1;};
$('journey').oninput=e=>{if(!entered)return;leaveFocus();target=+e.target.value;};
function advance(delta){if(!entered||focus||document.querySelector('dialog[open]'))return;target=THREE.MathUtils.clamp(target+delta,0,1);}
addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.key==='Escape'){leaveFocus();return;}if(e.target.closest('button,a,input'))return;if(['ArrowUp','ArrowDown','PageUp','PageDown',' '].includes(e.key)){e.preventDefault();advance(['ArrowUp','PageUp'].includes(e.key)?-.009:.009);}});
function pick(e){const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(scene.children,true)[0];if(hit&&hit.distance<18&&hit.object.userData.index!==undefined)focusWork(hit.object.userData.index);}
async function init(){
 works=await(await fetch(asset+'works.json')).json();nav();catalog();
 try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{document.body.classList.add('entered');$('status').textContent='3D unavailable. Open Collection to view the paintings. / 可通过作品目录浏览。';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 scene=new THREE.Scene();scene.background=new THREE.Color(0xe9eae5);camera=new THREE.PerspectiveCamera(innerWidth<700?66:62,innerWidth/innerHeight,.08,150);scene.add(new THREE.HemisphereLight(0xf8fcff,0x9b998f,2.3));const sun=new THREE.DirectionalLight(0xfff7e9,1.65);sun.position.set(-12,25,20);scene.add(sun);
 const canvas=renderer.domElement;$('stage').append(canvas);canvas.tabIndex=0;canvas.setAttribute('aria-label','Scroll to follow the gallery route. Click a painting to face it.');buildMuseum();batchArchitecture();scene.updateMatrixWorld(true);
 const first=poseAt(0);camera.position.copy(first.p);camera.lookAt(first.look);activeRoom=-1;textRoom();ready=true;renderer.render(scene,camera);$('status').hidden=true;
 requestAnimationFrame(()=>{document.body.classList.add('revealing');setTimeout(()=>{document.body.classList.add('entered');entered=true;},reduced?0:2200);});
 canvas.addEventListener('wheel',e=>{if(e.ctrlKey||document.querySelector('dialog[open]'))return;e.preventDefault();advance(THREE.MathUtils.clamp(e.deltaY*(e.deltaMode===1?20:1),-160,160)*.000065);},{passive:false});
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!entered||focus)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;if(drag.moved)advance((drag.lastY-e.clientY)*.00009);drag.lastY=e.clientY;});
 canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved)pick(e);drag=null;});canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();entered=false;$('status').hidden=false;$('status').textContent='Please refresh the gallery. / 请刷新画廊。';});
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?66:62;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(focus&&!returning)focus.pose=frontPose(focus.index);});
 const aim=new THREE.Object3D();
 function loop(t){requestAnimationFrame(loop);const dt=Math.min((t-last)/1000,.05);last=t;
  if(!document.querySelector('dialog[open]')){
   if(focus){const speed=reduced?1:1-Math.exp(-6*dt);if(returning){camera.position.lerp(focus.savedP,speed);camera.quaternion.slerp(focus.savedQ,speed);if(camera.position.distanceTo(focus.savedP)<.005&&camera.quaternion.angleTo(focus.savedQ)<.003){camera.position.copy(focus.savedP);camera.quaternion.copy(focus.savedQ);focus=null;returning=false;canvas.focus({preventScroll:true});}}else{aim.position.copy(focus.pose.p);aim.lookAt(focus.pose.look); // Cameras look down -Z, Object3D looks down +Z.
    aim.rotateY(Math.PI);camera.position.lerp(focus.pose.p,speed);camera.quaternion.slerp(aim.quaternion,speed);}
   }else if(entered){progress+=(target-progress)*(reduced?1:1-Math.exp(-8*dt));if(Math.abs(target-progress)<.00001)progress=target;const pose=poseAt(progress);camera.position.copy(pose.p);camera.lookAt(pose.look);updateHeading();}
  }
  renderer.render(scene,camera);
 }
 requestAnimationFrame(loop);
}
init().catch(e=>{document.body.classList.add('entered');$('status').hidden=false;$('status').textContent='Unable to open the gallery. Please refresh. / 请刷新重试。';console.error(e);});

