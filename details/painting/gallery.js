import * as THREE from './vendor/three.module.js';
import {organicMaterial,contactShade,daylightSky,blossomClusters} from './surface-detail.mjs';
import {loadSurfaces,scannedSurface} from './pbr-textures.mjs';
import {installRelief} from './relief.mjs?v=13';
import {Navigation} from './navigation.mjs';
const $=id=>document.getElementById(id),asset='./';
const rooms=[
 {en:'Elementary School',zh:'小学',short:'Elementary',sub:'The first brushstrokes.',subzh:'最初的笔触。',wall:0xe9e5d9,floor:0xc6ae88,color:'#d9c9aa'},
 {en:'Middle School',zh:'初中',short:'Middle',sub:'Looking closer. Trying something new.',subzh:'仔细观察，也试着改变。',wall:0xe8e5e1,floor:0xd6b7bd,color:'#d8b6bd'},
 {en:'High School',zh:'高中',short:'High',sub:'More colour. More possibilities.',subzh:'更多色彩，更多可能。',wall:0x8c8983,floor:0xb59a79,color:'#a8a18e'},
 {en:'University',zh:'大学',short:'University',sub:'An ongoing conversation.',subzh:'创作仍在继续。',wall:0xe6e1d7,floor:0xc0aa92,color:'#be8c72'}
];
let language='zh',activeRoom=0,selected=0,works=[],renderer,scene,camera,drag=null,keys=new Set(),last=0,ready=false;
let yaw=0,pitch=0,targetYaw=0,targetPitch=0,dolly=0;
const colliders=[],walkable=[],pointers=new Map();let pinch=0;
const artTargets=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const tr=(a,b)=>language==='en'?a:b;
function textRoom(){const r=rooms[activeRoom]||{en:'The Atrium',zh:'天井大厅',sub:'A place to begin. And return.',subzh:'从这里出发，也回到这里。'};$('room-number').textContent=activeRoom<0?tr('THE GALLERY','绘画展馆'):tr('ROOM ','展厅 ')+String(activeRoom+1).padStart(2,'0');$('room-name').textContent=r[language];$('room-subtitle').textContent=language==='en'?r.sub:r.subzh;document.body.dataset.room=activeRoom;document.querySelectorAll('[data-room]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(+b.dataset.room===activeRoom));});}
function nav(){ $('room-nav').innerHTML=rooms.map((r,i)=>`<button data-room="${i}" style="--room-color:${r.color}" aria-pressed="${i===activeRoom}"><b>0${i+1}</b>${language==='en'?r.short:r.zh}</button>`).join('');textRoom();}
function artName(w){return tr('Work ','作品 ')+String(w.number).padStart(2,'0');}
function catalog(){ $('catalog-rooms').innerHTML=rooms.map((r,i)=>`<section class="catalog-section"><h3>0${i+1} / ${r[language]}</h3><div class="catalog-grid">${works.filter(w=>w.room===i).map(w=>`<button class="catalog-item" data-work="${works.indexOf(w)}"><img src="${w.file}" alt="${r[language]} — ${artName(w)}" loading="lazy"><span>${artName(w)}</span></button>`).join('')}</div></section>`).join('');}
function showWork(index){selected=(index+works.length)%works.length;const w=works[selected];$('art-image').src=w.original||w.file;$('art-image').alt=rooms[w.room][language]+' — '+artName(w);$('art-era').textContent=rooms[w.room][language];$('art-title').textContent=artName(w);$('art-index').textContent=String(selected+1).padStart(2,'0')+' / '+works.length;if(!$('art-dialog').open)$('art-dialog').showModal();stopMoving();}
$('art-prev').onclick=()=>showWork(selected-1);$('art-next').onclick=()=>showWork(selected+1);
$('art-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showWork(selected-1);}if(e.key==='ArrowRight'){e.preventDefault();showWork(selected+1);}});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('browse').onclick=()=>{$('catalog').showModal();stopMoving();};$('catalog-rooms').onclick=e=>{const b=e.target.closest('[data-work]');if(b)showWork(+b.dataset.work);};
$('lang').onclick=()=>{language=language==='en'?'zh':'en';document.documentElement.lang=language==='en'?'en':'zh-CN';document.querySelectorAll('[data-en]').forEach(e=>e.textContent=e.dataset[language]);$('lang').textContent=language==='en'?'中文':'EN';nav();catalog();if(ready)refreshMode();if($('art-dialog').open)showWork(selected);};
$('room-nav').onclick=e=>{const b=e.target.closest('[data-room]');if(b)goRoom(+b.dataset.room);};
let waterMaterial;const waterTime={value:0},waterReflection={value:null},waterProjection={value:new THREE.Matrix4()};let updateReflection=()=>{};
let mode='guided',navigation,transfer=null,hovered=-1,freeYaw=0,freePitch=0,lastMap=0,lastHover=0;
let entered=false,progress=0,target=0,focus=null,returning=false,meta;
const mounts=[],nodes=[],roomStarts=[],V=a=>new THREE.Vector3(...a);let total=0;
function node(p,look,room=-1){p=V(p);look=V(look);if(nodes.length){total+=p.distanceTo(nodes.at(-1).p);}nodes.push({p,look,room,d:total});return total;}
function atWork(w,dist=2){return V(w.center).addScaledVector(V(w.normal),dist).setY(1.6);}
function buildRoute(ret){
 const add=(p,l,r=-1)=>node(p,l,r),polar=a=>[8.05*Math.cos(a*Math.PI/180),1.6,-8.05*Math.sin(a*Math.PI/180)];
 add([0,1.6,24],[0,2.05,15]);add([2.5,1.6,22],[0,1.1,19.44]);add([3,1.6,19.8],[0,1.2,19.44]);add([2.5,1.6,17.3],[0,1.7,15]);add([0,1.6,15.4],[.1,1.7,13]);
 const a=meta.walls.Wall_06,b=meta.walls.Wall_07;
 for(let i=a.length-1;i>=0;i--){const p=V(a[i]).add(V(b[i])).multiplyScalar(.5).setY(1.6);const j=Math.max(0,i-3),l=V(a[j]).add(V(b[j])).multiplyScalar(.5).setY(1.65);if(i===0)l.copy(V(polar(-60)));add(p.toArray(),l.toArray());}
 const arc=(a,b)=>{for(let t=a;t<=b+.01;t+=2){const p=polar(t),l=polar(t+20);add(p,l,0);}};
 roomStarts[0]=total;arc(-65,29);
 // In plan view (X, -Z), enter on the right and circle each room counterclockwise. Center before crossing the inner arch.
 const r2=(x,y)=>[9.61288166+(x-13.6)*.8660254-(y-6.56)*.5,1.6,-(5.55+(x-13.6)*.5+(y-6.56)*.8660254)];
 const push2=(x,y,id)=>add(r2(x,y),works.find(w=>w.id==='middle_'+id).center,1);
 roomStarts[1]=total;push2(13.4,6.56,5);push2(16.5,3.2,1);push2(19.2,3.2,2);push2(20.4,6.56,5);push2(22.6,6.56,5);push2(25.3,3.1,3);push2(27.6,4.0,4);push2(27.6,6.56,5);push2(27.6,9.0,6);push2(25.3,9.0,7);push2(22.6,6.56,5);push2(20.4,6.56,5);push2(19.2,9.1,8);push2(16.5,9.1,9);push2(13.4,6.56,9);add(polar(30),polar(35),0);arc(32,160);
 const out=V([-10.479388237,1.6,-3.659566164]),dir=V([-0.944,.0,-.330]).normalize();
 roomStarts[2]=total;add(out.toArray(),works.find(w=>w.id==='high_1').center,2);add(out.clone().addScaledVector(dir,1.9).toArray(),works.find(w=>w.id==='high_1').center,2);
 // Follow the aisle continuously; inner-face works remain available through click-to-view.
 for(const id of [2,4,5,6,7,8,9,10,11,12]){const w=works.find(w=>w.id==='high_'+id);add(atWork(w,2.55).toArray(),w.center,2);}
 add(out.clone().addScaledVector(dir,1.9).toArray(),out.toArray(),2);add(out.toArray(),polar(164),2);add(polar(162),polar(168),0);arc(164,234);
 add([-4.5,1.6,8.1],[-5.7,1.65,10]);roomStarts[3]=total;
 ret.forEach((p,i)=>{const l=ret[Math.min(i+3,ret.length-1)].slice();l[1]=1.65;add(p,l,3);});
 roundRouteCorners();
 roomStarts.forEach((d,i)=>roomStarts[i]=nodes.find(n=>n.room===i).d/total);nodes.forEach(n=>n.t=n.d/total);
 for(let i=1;i<nodes.length;i++){let j=i+1;while(j<nodes.length-1&&nodes[j].d-nodes[i].d<2.8)j++;if(j<nodes.length && !(nodes[i].room>0 && nodes[i].d-nodes.find(n=>n.room===nodes[i].room).d<.7)){nodes[i].look.copy(nodes[j].p);nodes[i].look.y=1.72;}}
}
// Quadratic fillets stay in each corner's convex hull, capped at 18 cm near doorways.
function roundRouteCorners(){
 const source=nodes.slice(),rounded=[source[0]];
 for(let i=1;i<source.length-1;i++){
  const a=source[i-1],b=source[i],c=source[i+1];
  const incoming=b.p.clone().sub(a.p),outgoing=c.p.clone().sub(b.p);
  if(a.room!==b.room||b.room!==c.room||incoming.length()<.25||outgoing.length()<.25){rounded.push(b);continue;}
  const cut=Math.min(.18,incoming.length()*.2,outgoing.length()*.2);
  const start=b.p.clone().addScaledVector(incoming.normalize(),-cut),end=b.p.clone().addScaledVector(outgoing.normalize(),cut);
  for(let k=0;k<=8;k++){const t=k/8;rounded.push({...b,p:start.clone().multiplyScalar((1-t)**2).addScaledVector(b.p,2*t*(1-t)).addScaledVector(end,t*t),look:b.look.clone()});}
 }
 rounded.push(source.at(-1));nodes.length=0;total=0;
 for(const n of rounded){if(nodes.length)total+=n.p.distanceTo(nodes.at(-1).p);nodes.push({...n,d:total});}
}
function poseAt(t){let lo=0,hi=nodes.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(nodes[m].t<t)lo=m;else hi=m;}const a=nodes[lo],b=nodes[hi],f=THREE.MathUtils.clamp((t-a.t)/(b.t-a.t||1),0,1);return{p:a.p.clone().lerp(b.p,f),look:a.look.clone().lerp(b.look,f),room:f>.999?b.room:a.room};}
function stopMoving(){target=progress;drag=null;keys.clear();}
function goRoom(i){if(!entered)return;closePanels();if(focus){returning=true;leaveFocus();return;}if(mode==='free'){travelToRoom(i);return;}target=roomStarts[i];}
function frontPose(index){const w=works[index],v=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));const dist=Math.min(2.65,Math.max(w.height/(2*v),w.width/(2*v*camera.aspect))*1.25+.18);return{p:V(w.center).addScaledVector(V(w.normal),dist),look:V(w.center)};}
function focusWork(index){if(!entered||transfer)return;stopMoving();closePanels();hovered=-1;focus={index,savedP:camera.position.clone(),savedQ:camera.quaternion.clone(),pose:frontPose(index)};returning=false;selected=index;$('focus-label').textContent=rooms[works[index].room][language]+' / '+artName(works[index]);$('focus-panel').hidden=false;document.body.classList.add('viewing');$('continue').focus({preventScroll:true});}
function leaveFocus(){if(!focus)return;returning=true;$('focus-panel').hidden=true;document.body.classList.remove('viewing');}
$('continue').onclick=leaveFocus;$('original').onclick=()=>showWork(selected);
$('reset').onclick=()=>{if(focus)return;if(mode==='free'){travelToRoom(-1);return;}progress=target=0;stopMoving();};
$('journey').oninput=e=>{if(!entered||mode!=='guided'||focus)return;target=+e.target.value;};
function advance(delta){if(!entered||focus||mode!=='guided'||document.querySelector('dialog[open]'))return;target=THREE.MathUtils.clamp(target+delta,0,1);}
function hitWork(e){const rect=renderer.domElement.getBoundingClientRect();pointer.set(e?(e.clientX-rect.left)/rect.width*2-1:0,e?-(e.clientY-rect.top)/rect.height*2+1:0);ray.setFromCamera(pointer,camera);for(const hit of ray.intersectObjects(scene.children,true)){if(hit.object.userData.passRay)continue;return hit.object.userData.index!==undefined&&hit.distance<12?hit.object.userData.index:-1;}return -1;}
function insideFocusedFrame(e){const w=works[focus.index],center=V(w.center),right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),V(w.normal)).normalize(),rect=renderer.domElement.getBoundingClientRect();const points=[];for(const x of [-1,1])for(const y of [-1,1]){const p=center.clone().addScaledVector(right,x*(w.width/2+.16));p.y+=y*(w.height/2+.16);p.project(camera);points.push([(p.x+1)*rect.width/2+rect.left,(1-p.y)*rect.height/2+rect.top]);}return e.clientX>=Math.min(...points.map(p=>p[0]))&&e.clientX<=Math.max(...points.map(p=>p[0]))&&e.clientY>=Math.min(...points.map(p=>p[1]))&&e.clientY<=Math.max(...points.map(p=>p[1]));}
function pick(e){if(focus){if(!returning&&!insideFocusedFrame(e))leaveFocus();return;}const index=hitWork(e);if(index>=0)focusWork(index);}
async function init(){
 const scanned=await loadSurfaces();
 navigation=new Navigation(await(await fetch('./navigation.json')).json());
 meta=await(await fetch('./scene.json')).json();works=meta.works.map(w=>({...w,room:['elementary','middle','high','university'].indexOf(w.era)}));nav();catalog();
 $('status').textContent='正在载入第二十版场景…';
 renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;
 scene=new THREE.Scene();scene.background=new THREE.Color(0xd4e1ed);camera=new THREE.PerspectiveCamera(innerWidth<700?76:74,innerWidth/innerHeight,.045,140);
 scene.add(new THREE.HemisphereLight(0xfff9ed,0xe8dcc7,.85));const sun=new THREE.DirectionalLight(0xfff0d9,2.4);sun.position.set(-9,25,22);sun.target.position.set(0,0,10);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-33,right:33,top:33,bottom:-33,near:1,far:85});sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sun.shadow.radius=3;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 const fill=new THREE.PointLight(0xfff5e6,10,9,2);fill.position.set(2,3.6,22.2);scene.add(fill);
 const canvas=renderer.domElement;$('stage').append(canvas);canvas.tabIndex=0;canvas.setAttribute('aria-label','滑动沿路线参观，点击作品正面欣赏');
 const response=await fetch('./scene.bin.gz?v=11');const buf=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const aoMeta=await(await fetch('./detail-ao.json')).json();
 const aoResponse=await fetch('./detail-ao.bin.gz');const aoBuffer=await new Response(aoResponse.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const texLoader=new THREE.TextureLoader();const textures=[];
 for(const g of meta.groups){if(/Lobby carved ivory/.test(g.name))continue;const values=new Float32Array(buf,g.offset,g.count*8);refineOrganicGeometry(values,g.name);const ib=new THREE.InterleavedBuffer(values,8),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.InterleavedBufferAttribute(ib,3,0));geo.setAttribute('normal',new THREE.InterleavedBufferAttribute(ib,3,3));geo.setAttribute('uv',new THREE.InterleavedBufferAttribute(ib,2,6));let mat,index;
 if(g.name.startsWith('art:')){index=works.findIndex(w=>w.id===g.name.slice(4));mat=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide,toneMapped:false});textures.push(texLoader.loadAsync(works[index].file).then(t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;mat.map=t;mat.needsUpdate=true;}));}
 else{const m=meta.materials[g.name];mat=new THREE.MeshStandardMaterial({color:new THREE.Color(...m.color),roughness:m.roughness,metalness:m.metalness,side:THREE.DoubleSide});if(/stone|plaster|limestone/i.test(g.name))mineralMaterial(mat,g.name);if(m.emission){mat.emissive.copy(mat.color);mat.emissiveIntensity=m.emission;}if(m.transmission>.7){mat.transparent=true;mat.opacity=.12;mat.depthWrite=false;}else if(m.transmission>0){mat.transparent=true;mat.opacity=.72;}mat=scannedSurface(organicMaterial(finishMaterial(mat,g.name),g.name),g.name,scanned);}
 if(aoMeta[g.name]){const info=aoMeta[g.name],ao=new Float32Array(aoBuffer,info.offset,info.count),colors=new Float32Array(info.count*3);for(let i=0;i<ao.length;i++)colors.fill(Math.pow(ao[i],/carved/.test(g.name)?.85:/ceramic/.test(g.name)?.95:1),i*3,i*3+3);geo.setAttribute('color',new THREE.BufferAttribute(colors,3));mat.vertexColors=true;}
 if(g.name==='Charcoal print frame'){
  const track=new THREE.MeshStandardMaterial({color:0xdedbd3,roughness:.64,metalness:.08});
  let start=0,lastMaterial=-1;for(let i=0;i<g.count;i+=3){const id=values[i*8+1]>3.3&&values[(i+1)*8+1]>3.3&&values[(i+2)*8+1]>3.3?1:0;if(id!==lastMaterial){if(i>start)geo.addGroup(start,i-start,lastMaterial);start=i;lastMaterial=id;}}geo.addGroup(start,g.count-start,lastMaterial);mat=[mat,track];
 }
 const mesh=new THREE.Mesh(geo,mat);mesh.name=g.name;if(/satin ceramic|gold stamens/.test(g.name))mesh.scale.y=1.18;mesh.userData.floorReflection=g.name==='Honed limestone'||/Lobby stone floor/.test(g.name);if(index!==undefined){mesh.userData.index=index;artTargets.push(mesh);}if(mat.transparent)mesh.userData.passRay=true;mesh.castShadow=!mat.transparent;mesh.receiveShadow=true;scene.add(mesh);
 }
 await Promise.all(textures);await installRelief(scene);buildRoute(await(await fetch('./return-route.json')).json());scene.updateMatrixWorld(true);
 blossomClusters(scene,meta,buf);installEnvironment();contactShade(scene,0,19.44,1.3,.95,.38);contactShade(scene,0,0,1.5,1.2,.3);installAtriumLighting();installExhibitionLights();captureWaterReflection();installPlanarReflection();renderer.shadowMap.needsUpdate=true;const initial=poseAt(0);camera.fov=innerWidth<700?82:74;camera.updateProjectionMatrix();camera.position.copy(initial.p);camera.lookAt(initial.look);ready=entered=true;const at=Number(new URLSearchParams(location.search).get('at'));if(Number.isFinite(at)&&at>0&&at<=1)progress=target=at;activeRoom=-1;textRoom();$('status').hidden=true;document.body.classList.add('entered');
 setupInteraction(canvas);
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(focus&&!returning)focus.pose=frontPose(focus.index);});
 addEventListener('blur',stopMoving);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();entered=false;$('status').hidden=false;$('status').textContent='画面已暂停，请刷新页面重新进入。';});
 const aim=new THREE.PerspectiveCamera();
 function loop(t){requestAnimationFrame(loop);const dt=Math.min((t-last)/1000,.05);last=t;const speed=reduced?1:1-Math.exp(-6*dt);
 if(!document.querySelector('dialog[open]')){if(focus){if(returning){camera.position.lerp(focus.savedP,speed);camera.quaternion.slerp(focus.savedQ,speed);if(camera.position.distanceTo(focus.savedP)<.005&&camera.quaternion.angleTo(focus.savedQ)<.003){focus=null;returning=false;}}else{aim.position.copy(focus.pose.p);aim.lookAt(focus.pose.look);camera.position.lerp(focus.pose.p,speed);camera.quaternion.slerp(aim.quaternion,speed);}}
 else if(entered&&transfer){stepTransfer(dt,aim,speed);}
 else if(entered&&mode==='free'){stepFree(dt);}
 else if(entered){progress+=(target-progress)*(reduced?1:1-Math.exp(-8*dt));if(Math.abs(target-progress)<.000001)progress=target;const pose=poseAt(progress);camera.fov=THREE.MathUtils.lerp(innerWidth<700?82:74,innerWidth<700?82:74,Math.min(1,progress*total/4));camera.updateProjectionMatrix();camera.position.copy(pose.p);aim.position.copy(pose.p);aim.lookAt(pose.look);camera.quaternion.slerp(aim.quaternion,speed);if(activeRoom!==pose.room){activeRoom=pose.room;textRoom();}if(document.activeElement!==$('journey'))$('journey').value=progress;$('journey-count').textContent=Math.round(progress*100)+'%';}}
 if(t-lastMap>120){updateMap();lastMap=t;}
 waterTime.value=reduced?0:t*.001;updateReflection(t);renderer.render(scene,camera);}
 requestAnimationFrame(loop);
 window.galleryPreview={get progress(){return progress},get room(){return activeRoom},get workCount(){return works.length},get ready(){return ready},get mode(){return mode},get renderInfo(){return renderer.info.render},goRoom,focusWork,leaveFocus};
}
init().catch(e=>{document.body.classList.add('entered');$('status').hidden=false;$('status').textContent='场景未能载入，请刷新重试。'+e.message;console.error(e);});
function mineralMaterial(material,name){
 material.roughness=Math.min(.72,Math.max(.38,material.roughness));
 material.onBeforeCompile=shader=>{
 shader.uniforms.stoneReflection=waterReflection;shader.uniforms.stoneProjection=waterProjection;
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vStoneWorld; varying vec3 vStoneN;');
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStoneWorld=(modelMatrix*vec4(transformed,1.)).xyz; vStoneN=normalize(mat3(modelMatrix)*objectNormal);');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
 varying vec3 vStoneWorld; varying vec3 vStoneN;
 uniform sampler2D stoneReflection;uniform mat4 stoneProjection;
 float stoneHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
 float stoneNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(stoneHash(i),stoneHash(i+vec3(1,0,0)),f.x),mix(stoneHash(i+vec3(0,1,0)),stoneHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(stoneHash(i+vec3(0,0,1)),stoneHash(i+vec3(1,0,1)),f.x),mix(stoneHash(i+vec3(0,1,1)),stoneHash(i+vec3(1,1,1)),f.x),f.y),f.z);}`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float stoneCoarse=stoneNoise(vStoneWorld*3.4);float stoneFine=stoneNoise(vStoneWorld*85.);
 diffuseColor.rgb*=mix(.94,1.025,stoneCoarse)*mix(.977,1.018,stoneFine);
 if(abs(vStoneN.y)>.8 && vStoneWorld.y<.08){
 vec2 uv=vStoneWorld.xz;vec2 slab=floor(uv/vec2(1.8,1.2));
 float cloud=stoneNoise(vec3(uv*.72,2.));
 float vein=stoneNoise(vec3(uv.x*2.2+cloud*1.8,uv.y*.65,7.));
 diffuseColor.rgb*=mix(.965,1.025,stoneHash(vec3(slab,1.)))*mix(.91,1.04,cloud);
 diffuseColor.rgb*=1.-.085*smoothstep(.57,.73,vein);
 vec2 tile=abs(fract(uv/vec2(1.8,1.2)+.5)-.5)*vec2(1.8,1.2);
 vec2 aa=max(fwidth(uv),vec2(.0005));vec2 joint=1.-smoothstep(vec2(.0006),aa+vec2(.0012),tile);
 
 }`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`if(abs(vStoneN.y)>.8 && vStoneWorld.y<.08){
 vec4 rp=stoneProjection*vec4(vStoneWorld,1.);vec2 uv=rp.xy/rp.w;
 if(rp.w>0. && uv.x>0. && uv.x<1. && uv.y>0. && uv.y<1.){
 vec3 reflected=texture2D(stoneReflection,uv).rgb*.28;
 reflected+=texture2D(stoneReflection,uv+vec2(.009,0.)).rgb*.18;
 reflected+=texture2D(stoneReflection,uv-vec2(.009,0.)).rgb*.18;
 reflected+=texture2D(stoneReflection,uv+vec2(0.,.009)).rgb*.18;
 reflected+=texture2D(stoneReflection,uv-vec2(0.,.009)).rgb*.18;
 reflected=mix(vec3(dot(reflected,vec3(.2126,.7152,.0722))),reflected,.35)*vec3(1.03,1.,.96);
 float fresnel=.022+.07*pow(1.-abs(dot(normal,geometryViewDir)),3.);
 outgoingLight=mix(outgoingLight,reflected,fresnel);
 }}
#include <opaque_fragment>`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nif(abs(vStoneN.y)>.8 && vStoneWorld.y<.08) roughnessFactor=.3+.09*stoneNoise(vStoneWorld*2.);');
 shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nfloat stoneHeight=stoneNoise(vStoneWorld*85.);normal=normalize(normal+vec3(dFdx(stoneHeight),dFdy(stoneHeight),0.)*.12);');
 };
 material.customProgramCacheKey=()=> 'mineral-v6';
}
function installEnvironment(){
 daylightSky(renderer,scene);
 for(const f of [.2,.55,.85]){const p=meta.walls.Wall_07[Math.floor((meta.walls.Wall_07.length-1)*f)],lamp=new THREE.PointLight(0xffe3bd,4,4.5,2);lamp.position.set(p[0]+.25,3.85,p[2]);scene.add(lamp);}
}

function finishMaterial(base,name){
 if(name==='Honed limestone'||/Lobby stone floor/.test(name)){base.color.setRGB(.77,.705,.605);base.roughness=.34;base.envMapIntensity=.9;}
 if(name==='Stone fine joint shadow')base.color.setRGB(.54,.51,.45);
 if(/carved ivory/.test(name)){mineralMaterial(base,name);base.color.setRGB(.88,.82,.72);base.roughness=.64;base.envMapIntensity=.5;}
 if(/Warm white plaster|Lobby fine mineral plaster/.test(name))base.color.setRGB(.86,.815,.735);
 if(/gold|champagne/.test(name)){base.roughness=.3;base.envMapIntensity=1.1;}
 if(/satin ceramic/.test(name)){
  const mat=new THREE.MeshPhysicalMaterial({color:base.color,roughness:.38,metalness:0,side:THREE.DoubleSide,clearcoat:.16,clearcoatRoughness:.35,transmission:.035,thickness:.045,ior:1.46});
  mat.envMapIntensity=.55;return mat;
 }
 if(/glass/i.test(name)){
  // Thin glazing: opacity is angle dependent, keeping the courtyard visible head-on.
  base.opacity=.035;base.roughness=.08;base.envMapIntensity=.7;base.depthWrite=false;
  base.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float edgeFresnel=pow(1.-abs(dot(normal,geometryViewDir)),4.);
 diffuseColor.a=clamp(diffuseColor.a+edgeFresnel*.20,0.,.36);
 #include <opaque_fragment>`);};
  base.customProgramCacheKey=()=> 'thin-glass-v3';
 }
 if(/pool water/i.test(name)){
  const mat=new THREE.MeshPhysicalMaterial({color:0x899f99,roughness:.09,metalness:0,ior:1.333,transparent:true,opacity:.94,clearcoat:1,clearcoatRoughness:.12,side:THREE.DoubleSide,depthWrite:false});
  mat.envMapIntensity=1.2;
  mat.onBeforeCompile=shader=>{
   shader.uniforms.waterTime=waterTime;shader.uniforms.waterReflection=waterReflection;shader.uniforms.waterProjection=waterProjection;
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 waterWorld;varying vec4 waterProjected;uniform mat4 waterProjection;');
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwaterWorld=(modelMatrix*vec4(transformed,1.)).xyz;waterProjected=waterProjection*vec4(waterWorld,1.);');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 waterWorld;varying vec4 waterProjected;uniform sampler2D waterReflection;uniform float waterTime;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
 vec2 ripple=vec2(cos(waterWorld.x*19.+waterWorld.z*13.+waterTime*.55),sin(waterWorld.z*23.-waterWorld.x*9.-waterTime*.42))*.055;
 ripple+=vec2(sin(waterWorld.x*7.+waterWorld.z*5.-waterTime*.32),cos(waterWorld.z*11.-waterWorld.x*4.+waterTime*.28))*.04;
 normal=normalize(normal+mat3(viewMatrix)*vec3(ripple.x,0.,ripple.y));`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`vec2 reflectedUV=waterProjected.xy/waterProjected.w+ripple*.035;
 vec3 reflectedScene=texture2D(waterReflection,reflectedUV).rgb;
 float waterFresnel=.28+.3*pow(1.-abs(dot(normal,geometryViewDir)),3.);
 outgoingLight=mix(outgoingLight,reflectedScene,waterFresnel);
 #include <opaque_fragment>`);
  };mat.customProgramCacheKey=()=> 'pool-ripple-v3-planar';waterMaterial=mat;return mat;
 }
 return base;
}
function installAtriumLighting(){
 // A local shadow map retains carving shadows that disappear in the whole-building map.
 const light=new THREE.DirectionalLight(0xfff2df,1.4);light.position.set(-2.8,8.2,24.4);light.target.position.set(0,.65,19.44);
 light.castShadow=true;light.shadow.mapSize.set(4096,4096);Object.assign(light.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:19});light.shadow.radius=3;light.shadow.bias=-.00008;light.shadow.normalBias=.008;
 scene.add(light,light.target);
 const bounce=new THREE.PointLight(0xfff4e3,8,10,2);bounce.position.set(0,3.4,22.5);scene.add(bounce);
}
function captureWaterReflection(){
 if(!waterMaterial)return;
 const target=new THREE.WebGLCubeRenderTarget(256,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
 const probe=new THREE.CubeCamera(.08,45,target);probe.position.set(0,.03,19.44);
 const hidden=[];scene.traverse(o=>{if(o.isMesh&&o.material===waterMaterial){hidden.push(o);o.visible=false;}});
 probe.update(renderer,scene);hidden.forEach(o=>o.visible=true);
 const pmrem=new THREE.PMREMGenerator(renderer);waterMaterial.envMap=pmrem.fromCubemap(target.texture).texture;pmrem.dispose();target.dispose();
}

function installPlanarReflection(){
 if(!waterMaterial)return;
 const target=new THREE.WebGLRenderTarget(1024,768,{type:THREE.HalfFloatType});waterReflection.value=target.texture;
 const mirror=new THREE.PerspectiveCamera(),direction=new THREE.Vector3(),look=new THREE.Vector3();
 const plane=new THREE.Plane(new THREE.Vector3(0,1,0),.035),bias=new THREE.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
 let last=-Infinity;const waterMeshes=[];scene.traverse(o=>{if(o.isMesh&&(o.material===waterMaterial||o.userData.floorReflection))waterMeshes.push(o);});
 updateReflection=t=>{
  if(t-last<180)return;last=t;
  camera.updateMatrixWorld();mirror.copy(camera);mirror.position.y=-.07-camera.position.y;
  camera.getWorldDirection(direction);look.copy(camera.position).add(direction);look.y=-.07-look.y;mirror.up.set(0,-1,0);mirror.lookAt(look);mirror.updateMatrixWorld();
  waterProjection.value.copy(bias).multiply(mirror.projectionMatrix).multiply(mirror.matrixWorldInverse);
  waterMeshes.forEach(o=>o.visible=false);const old=renderer.getRenderTarget(),clips=renderer.clippingPlanes;
  renderer.clippingPlanes=[plane];renderer.setRenderTarget(target);renderer.render(scene,mirror);renderer.setRenderTarget(old);renderer.clippingPlanes=clips;waterMeshes.forEach(o=>o.visible=true);
 };
}

function installExhibitionLights(){
 // Warm, feathered pools of light articulate the fixed wall colours and frame profiles.
 for(const w of works.filter(w=>w.era==='middle'||w.era==='high')){
  const spot=new THREE.SpotLight(0xffedd3,7,5.5,.65,.85,2);
  spot.position.copy(V(w.center)).addScaledVector(V(w.normal),1.35);spot.position.y+=1.9;
  spot.target.position.copy(V(w.center));scene.add(spot,spot.target);
 }
}

function closePanels(){for(const name of ['map','route']){$(name+'-panel').hidden=true;$(name+'-toggle').setAttribute('aria-expanded','false');}}
function setHint(zh,en){$('interaction-hint').textContent=tr(en,zh);}
function syncFreeAngles(){const d=new THREE.Vector3();camera.getWorldDirection(d);freeYaw=Math.atan2(d.x,-d.z);freePitch=Math.asin(THREE.MathUtils.clamp(d.y,-1,1));}
function refreshMode(){
 $('mode-toggle').textContent=mode==='free'?tr('Resume guided tour','接回导览'):tr('Explore freely','自由参观');$('mode-toggle').setAttribute('aria-pressed',String(mode==='free'));
 $('free-controls').hidden=mode!=='free'||!!focus||!!transfer;$('journey').closest('.journey-bar').hidden=mode==='free';
 $('route-note').textContent=mode==='free'?tr('Explore freely. Resume the tour to see your progress.','自由参观中，接回导览后显示路线进度。'):tr('Guided tour · Counterclockwise in both galleries','沿路线导览 · 两个独立展厅逆时针参观');
 for(const [id,zh,en] of [['map-toggle','小地图','Map'],['route-toggle','参观路线','Tour route'],['browse','作品目录','Collection'],['reset','回到大厅','Return to atrium'],['cancel-transfer','停止带路','Stop guiding']])$(id).textContent=tr(en,zh);
 document.body.dataset.mode=mode;setHint(mode==='free'?'拖动转头 · WASD / 方向键或按钮行走 · 点击画作近看':'滑动沿路线参观 · 点击画作近看',mode==='free'?'Drag to look · WASD / arrows to walk · Click a painting':'Scroll to explore · Click a painting');
}
function enableFree(){stopMoving();const q=[camera.position.x,camera.position.z];if(!navigation.contains(...q)){setHint('这里较窄，请沿导览稍向前再进入自由参观。','This spot is narrow. Move slightly along the tour first.');return;}mode='free';syncFreeAngles();refreshMode();}
function startTransfer(goals,indices,finishMode){
 const route=navigation.path([camera.position.x,camera.position.z],goals);if(!route){setHint('当前无法找到通行路线，请先稍微移动。','No clear path here. Move a little and try again.');return;}
 stopMoving();transfer={points:route.points,index:1,node:indices[route.goal],finishMode};$('cancel-transfer').hidden=false;$('free-controls').hidden=true;const destination=nodes[transfer.node].room,name=destination<0?tr('Atrium','大厅'):rooms[destination][language];setHint((finishMode==='guided'?'正在接回':'正在前往')+name+(finishMode==='guided'?'导览，可随时停止。':'入口，可随时停止。'),(finishMode==='guided'?'Rejoining ':'Walking to ')+name+'. Stop at any time.');
}
function resumeGuided(){const candidates=nodes.map((n,i)=>({n,i})).filter(({n})=>navigation.contains(n.p.x,n.p.z)).sort((a,b)=>Math.abs(b.n.t-progress)-Math.abs(a.n.t-progress));startTransfer(candidates.map(({n})=>[n.p.x,n.p.z]),candidates.map(({i})=>i),'guided');}
function travelToRoom(room){const idx=room<0?0:nodes.findIndex(n=>n.room===room),p=nodes[idx].p;startTransfer([[p.x,p.z]],[idx],'free');}
function cancelTransfer(){if(!transfer)return;transfer=null;mode='free';syncFreeAngles();$('cancel-transfer').hidden=true;refreshMode();}
function stepTransfer(dt,aim,speed){
 let budget=dt*1.8;
 while(transfer&&budget>0){const q=transfer.points[transfer.index];if(!q){const n=nodes[transfer.node];aim.position.copy(n.p);aim.lookAt(n.look);camera.position.lerp(n.p,speed);camera.quaternion.slerp(aim.quaternion,speed);if(camera.position.distanceTo(n.p)>.008||camera.quaternion.angleTo(aim.quaternion)>.01)return;progress=target=n.t;mode=transfer.finishMode;transfer=null;syncFreeAngles();$('cancel-transfer').hidden=true;refreshMode();return;}
  const dx=q[0]-camera.position.x,dz=q[1]-camera.position.z,d=Math.hypot(dx,dz),step=Math.min(budget,d);
  if(d<.015){transfer.index++;continue;}camera.position.x+=dx/d*step;camera.position.z+=dz/d*step;camera.position.y=THREE.MathUtils.lerp(camera.position.y,1.6,Math.min(1,dt*4));
  aim.position.copy(camera.position);aim.lookAt(camera.position.x+dx/d*2,camera.position.y,camera.position.z+dz/d*2);camera.quaternion.slerp(aim.quaternion,speed);budget-=step;
  if(step>=d-.001)transfer.index++;
 }
 updateFreeRoom();
}
function stepFree(dt){
 const forward=(keys.has('w')||keys.has('arrowup')||keys.has('forward')?1:0)-(keys.has('s')||keys.has('arrowdown')||keys.has('back')?1:0);
 const side=(keys.has('d')||keys.has('arrowright')||keys.has('right')?1:0)-(keys.has('a')||keys.has('arrowleft')||keys.has('left')?1:0);
 if(forward||side){const scale=dt*1.8/Math.max(1,Math.hypot(forward,side)),dx=(Math.sin(freeYaw)*forward+Math.cos(freeYaw)*side)*scale,dz=(-Math.cos(freeYaw)*forward+Math.sin(freeYaw)*side)*scale,p=navigation.move([camera.position.x,camera.position.z],dx,dz);camera.position.x=p[0];camera.position.z=p[1];}
 camera.position.y=THREE.MathUtils.lerp(camera.position.y,1.6,Math.min(1,dt*3));camera.lookAt(camera.position.x+Math.sin(freeYaw)*Math.cos(freePitch),camera.position.y+Math.sin(freePitch),camera.position.z-Math.cos(freeYaw)*Math.cos(freePitch));updateFreeRoom();
}
function updateFreeRoom(){let best=Infinity,room=activeRoom;for(const n of nodes){const d=(n.p.x-camera.position.x)**2+(n.p.z-camera.position.z)**2;if(d<best){best=d;room=n.room;}}if(room!==activeRoom){activeRoom=room;textRoom();}}

let mapBase,mapTransform,mapDestinations=[];
function prepareMap(){
 const c=$('map-canvas'),ctx=c.getContext('2d'),n=navigation;let xmin=n.width,xmax=0,zmin=n.height,zmax=0;for(let i=0;i<n.cells.length;i++)if(n.valid(i)){const x=i%n.width,z=Math.floor(i/n.width);xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);zmin=Math.min(zmin,z);zmax=Math.max(zmax,z);}
 const scale=Math.min((c.width-50)/((xmax-xmin+1)*n.step),(c.height-50)/((zmax-zmin+1)*n.step));const ox=25-(n.x0+xmin*n.step)*scale,oz=25-(n.z0+zmin*n.step)*scale;mapTransform=p=>[ox+p[0]*scale,oz+p[1]*scale];
 ctx.fillStyle='#f4f0e7';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#ded7ca';for(let i=0;i<n.cells.length;i++)if(n.valid(i)){const p=mapTransform(n.point(i));ctx.fillRect(p[0]-scale*n.step/2,p[1]-scale*n.step/2,scale*n.step+.4,scale*n.step+.4);}
 ctx.strokeStyle='#afa38e';ctx.lineWidth=1;ctx.setLineDash([4,5]);ctx.beginPath();nodes.forEach((n,i)=>{const p=mapTransform([n.p.x,n.p.z]);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();ctx.setLineDash([]);
 mapDestinations=[-1,0,1,2,3].map(room=>{const n=room<0?nodes[0]:nodes.find(n=>n.room===room),p=mapTransform([n.p.x,n.p.z]);return {room,p};});
 for(const {room,p}of mapDestinations){ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.arc(...p,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a99b86';ctx.stroke();ctx.fillStyle='#514936';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(room<0?'厅':String(room+1),...p);}
 mapBase=ctx.getImageData(0,0,c.width,c.height);
}
function updateMap(){if($('map-panel').hidden)return;if(!mapBase)prepareMap();const ctx=$('map-canvas').getContext('2d');ctx.putImageData(mapBase,0,0);if(transfer){ctx.strokeStyle='#8f683b';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(...mapTransform([camera.position.x,camera.position.z]));for(const q of transfer.points.slice(transfer.index))ctx.lineTo(...mapTransform(q));ctx.stroke();}const p=mapTransform([camera.position.x,camera.position.z]),d=new THREE.Vector3();camera.getWorldDirection(d);const angle=Math.atan2(d.z,d.x);ctx.save();ctx.translate(...p);ctx.rotate(angle);ctx.fillStyle='#89704955';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,24,-.48,.48);ctx.closePath();ctx.fill();ctx.fillStyle='#65492e';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.restore();}
function setupInteraction(canvas){
 refreshMode();
 for(const name of ['map','route']){$(name+'-toggle').onclick=()=>{const open=$(name+'-panel').hidden;closePanels();$(name+'-panel').hidden=!open;$(name+'-toggle').setAttribute('aria-expanded',String(open));if(open){stopMoving();$(name+'-close').focus();updateMap();}};$(name+'-close').onclick=()=>{closePanels();$(name+'-toggle').focus();};}
 $('mode-toggle').onclick=()=>{if(!entered||focus)return;closePanels();if(transfer){cancelTransfer();return;}if(mode==='guided')enableFree();else resumeGuided();};
 $('cancel-transfer').onclick=cancelTransfer;
 $('map-canvas').onclick=e=>{const r=e.currentTarget.getBoundingClientRect(),p=[(e.clientX-r.left)*600/r.width,(e.clientY-r.top)*440/r.height];for(const d of mapDestinations)if(Math.hypot(p[0]-d.p[0],p[1]-d.p[1])<21){if(d.room<0)$('reset').click();else goRoom(d.room);closePanels();break;}};
 document.querySelectorAll('[data-walk]').forEach(b=>{b.onclick=()=>{if(mode!=='free'||focus)return;cancelTransfer();keys.add(b.dataset.walk);stepFree(.12);keys.delete(b.dataset.walk);};b.onpointerdown=e=>{e.preventDefault();cancelTransfer();keys.add(b.dataset.walk);b.setPointerCapture(e.pointerId);};for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.walk));});
 addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.key==='Escape'){if(focus)leaveFocus();else if(transfer)cancelTransfer();else closePanels();return;}if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;const k=e.key.toLowerCase();if(mode==='free'&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();cancelTransfer();keys.add(k);}else if(['ArrowUp','ArrowDown','PageUp','PageDown',' '].includes(e.key)){e.preventDefault();advance(['ArrowUp','PageUp'].includes(e.key)?-.003:.003);}});
 addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 canvas.addEventListener('wheel',e=>{if(e.ctrlKey||document.querySelector('dialog[open]'))return;e.preventDefault();advance(THREE.MathUtils.clamp(e.deltaY*(e.deltaMode===1?20:1),-160,160)*.000025);},{passive:false});
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!entered||drag)return;canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;if(drag.moved&&!focus){if(mode==='free'){cancelTransfer();freeYaw-=(e.clientX-drag.lastX)*.003;freePitch=THREE.MathUtils.clamp(freePitch-(e.clientY-drag.lastY)*.003,-1.05,1.05);}else advance((drag.lastY-e.clientY)*.000045);}drag.lastX=e.clientX;drag.lastY=e.clientY;});
 canvas.addEventListener('pointerup',e=>{if(drag&&drag.id===e.pointerId&&!drag.moved)pick(e);drag=null;});canvas.addEventListener('pointercancel',()=>drag=null);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMoving();});
}

function refineOrganicGeometry(v,name){
 const tree=/Sakura (bark|petal)/.test(name),flower=/satin ceramic/.test(name);if(!tree&&!flower)return;
 const treePoint=(x,y,z)=>{const t=Math.max(0,Math.min(1,(y-1.4)/3.4)),a=Math.atan2(z+.45,x-.35),s=1.1+t*(.43+.14*Math.sin(a*3+.7)+.06*Math.cos(a*5));let ny=y>0?y*(1.17+.24*t)+.16*t*Math.sin(a*2):y,nx=.35+(x-.35)*s+.18*t,nz=-.45+(z+.45)*s;const r=Math.hypot(nx,nz),limit=5.65+Math.max(0,ny-6.1)*.85;if(r>limit){nx*=limit/r;nz*=limit/r;}return[nx,ny,nz];};
 const curl=(x,z)=>{const r=Math.hypot(x,z-19.44),t=Math.max(0,Math.min(1,(r-.6)/1.1));return .045*Math.sin(Math.atan2(z-19.44,x)*5+.45)*t*t*(3-2*t);};
 for(let i=0;i<v.length;i+=8){const x=v[i],y=v[i+1],z=v[i+2];if(tree){const p=treePoint(x,y,z);v[i]=p[0];v[i+1]=p[1];v[i+2]=p[2];v[i+3]/=1.3;v[i+4]/=1.4;v[i+5]/=1.3;}else{const h=curl(x,z);v[i+1]+=h;v[i+3]-=(curl(x+.001,z)-curl(x-.001,z))/.002*v[i+4];v[i+5]-=(curl(x,z+.001)-curl(x,z-.001))/.002*v[i+4];}const n=Math.hypot(v[i+3],v[i+4],v[i+5]);if(n>0){v[i+3]/=n;v[i+4]/=n;v[i+5]/=n;}}
}
