(() => {
  const host=document.querySelector('#character'),status=document.querySelector('#model-status');
  const buttons=[...document.querySelectorAll('[data-pose],#sprinkle')];
  function fallback(){status.textContent='3D is unavailable here. The original film and frame explorer still work.';buttons.forEach(b=>b.disabled=true);}
  if(!window.THREE){fallback();return;}
  const T=window.THREE;
  let renderer;
  try{renderer=new T.WebGLRenderer({alpha:true,antialias:true});}catch{fallback();return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;
  host.append(renderer.domElement);host.querySelector('.fallback').style.display='none';
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,50);
  camera.position.set(0,.35,7.5);camera.lookAt(0,0,0);
  scene.add(new T.HemisphereLight(0xfff8e4,0x9b7250,2.1));
  const key=new T.DirectionalLight(0xffeed7,3);key.position.set(-3,5,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=4;key.shadow.camera.bottom=-4;key.shadow.bias=-.001;scene.add(key);
  const fill=new T.DirectionalLight(0xffffff,1.2);fill.position.set(4,1,-2);scene.add(fill);
  const floor=new T.Mesh(new T.PlaneGeometry(20,20),new T.ShadowMaterial({opacity:.15}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.8;floor.receiveShadow=true;scene.add(floor);
  const rig=new T.Group();scene.add(rig);
  const shape=new T.Shape();
  // Rounded, tangent-connected outline: no straight neck, armpit or crotch joins.
  shape.moveTo(0,1.82);
  shape.bezierCurveTo(.43,1.82,.70,1.55,.70,1.24);
  shape.bezierCurveTo(.70,1.02,.58,.86,.54,.81);
  shape.bezierCurveTo(.50,.76,.68,.76,.89,.79);
  shape.bezierCurveTo(1.15,.83,1.32,.71,1.32,.48);
  shape.bezierCurveTo(1.32,.25,1.08,.17,.83,.09);
  shape.bezierCurveTo(.64,.03,.66,-.01,.67,-.15);
  shape.bezierCurveTo(.69,-.46,.89,-1.00,.87,-1.20);
  shape.bezierCurveTo(.85,-1.45,.66,-1.57,.46,-1.52);
  shape.bezierCurveTo(.25,-1.47,.18,-1.11,.07,-.93);
  shape.bezierCurveTo(.04,-.88,-.04,-.88,-.07,-.93);
  shape.bezierCurveTo(-.18,-1.11,-.25,-1.47,-.46,-1.52);
  shape.bezierCurveTo(-.66,-1.57,-.85,-1.45,-.87,-1.20);
  shape.bezierCurveTo(-.89,-1.00,-.69,-.46,-.67,-.15);
  shape.bezierCurveTo(-.66,-.01,-.64,.03,-.83,.09);
  shape.bezierCurveTo(-1.08,.17,-1.32,.25,-1.32,.48);
  shape.bezierCurveTo(-1.32,.71,-1.15,.83,-.89,.79);
  shape.bezierCurveTo(-.68,.76,-.50,.76,-.54,.81);
  shape.bezierCurveTo(-.58,.86,-.70,1.02,-.70,1.24);
  shape.bezierCurveTo(-.70,1.55,-.43,1.82,0,1.82);
  const textureCanvas=document.createElement('canvas');textureCanvas.width=512;textureCanvas.height=512;
  const ctx=textureCanvas.getContext('2d');ctx.fillStyle='#be7c30';ctx.fillRect(0,0,512,512);
  let seed=27;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<17000;i++){const dark=random()>.55;ctx.fillStyle=dark?'rgba(87,41,16,.10)':'rgba(249,201,126,.12)';ctx.beginPath();ctx.arc(random()*512,random()*512,.3+random()*1.5,0,Math.PI*2);ctx.fill();}
  const texture=new T.CanvasTexture(textureCanvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(.4,.4);
  const cookieMaterial=new T.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.008,roughness:.95,color:0xffffff});
  const cookie=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelThickness:.13,bevelSize:.11,bevelSegments:12,steps:1,curveSegments:48}),cookieMaterial);cookie.castShadow=true;cookie.receiveShadow=true;rig.add(cookie);
  const icing=new T.MeshStandardMaterial({color:0xfff2d9,roughness:.53});
  function ball(x,y,z,r,mat=icing){const m=new T.Mesh(new T.SphereGeometry(r,20,12),mat);m.position.set(x,y,z);m.scale.z=.55;m.castShadow=true;rig.add(m);return m;}
  const brown=new T.MeshStandardMaterial({color:0x64370f,roughness:.96});
  const leftEye=ball(-.24,1.24,.28,.075,brown),rightEye=ball(.24,1.24,.28,.075,brown);
  leftEye.scale.set(.85,1,.25);rightEye.scale.set(.85,1,.25);
  const blush=new T.MeshStandardMaterial({color:0xe9a069,roughness:.95});
  const cheekLeft=ball(-.40,1.05,.275,.115,blush),cheekRight=ball(.40,1.05,.275,.115,blush);
  cheekLeft.scale.set(1,.9,.15);cheekRight.scale.set(1,.9,.15);
  const buttonMaterial=new T.MeshStandardMaterial({color:0x9c3d1d,roughness:.76});
  ball(0,.48,.29,.092,buttonMaterial);ball(0,.12,.29,.092,buttonMaterial);ball(0,-.24,.29,.092,buttonMaterial);
  const smile=new T.QuadraticBezierCurve3(new T.Vector3(-.15,1.04,.285),new T.Vector3(0,.85,.29),new T.Vector3(.15,1.04,.285));rig.add(new T.Mesh(new T.TubeGeometry(smile,24,.026,8,false),brown));
  // Simple icing cuffs, matching the reference rather than a full-body outline.
  for(const side of [-1,1]){
    const wrist=new T.CatmullRomCurve3(Array.from({length:21},(_,i)=>new T.Vector3(side*(.99+Math.sin(i/20*Math.PI*3)*.036),.68-i/20*.43,.28)));
    rig.add(new T.Mesh(new T.TubeGeometry(wrist,60,.027,8,false),icing));
    const ankle=new T.CatmullRomCurve3(Array.from({length:25},(_,i)=>new T.Vector3(side*(.27+i/24*.46),-1.13+i/24*.20+Math.sin(i/24*Math.PI*5)*.025,.28)));
    rig.add(new T.Mesh(new T.TubeGeometry(ankle,64,.028,8,false),icing));
  }
  rig.rotation.y=-.22;rig.rotation.z=-.09;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let targetY=-.22,targetX=0,drag=null,pose=null,visible=true,last=0,raf=0,sugar=[];
  const sugarGeo=new T.SphereGeometry(.025,5,4),sugarMat=new T.MeshStandardMaterial({color:0xfff4d8,roughness:.6});
  function sprinkle(){
    for(const particle of sugar){scene.remove(particle.mesh);}sugar=[];
    for(let i=0;i<65;i++){const m=new T.Mesh(sugarGeo,sugarMat);m.position.set((random()-.5)*2.6,1.8+random()*1.7,(random()-.5)*1.4+.5);scene.add(m);sugar.push({mesh:m,speed:.6+random()*.9});}
    start();
  }
  document.querySelector('#sprinkle').addEventListener('click',sprinkle);
  document.querySelectorAll('[data-pose]').forEach(b=>b.addEventListener('click',()=>{
    pose={type:b.dataset.pose,start:performance.now(),from:targetY};
    if(reduce){targetY+=b.dataset.pose==='turn'?Math.PI*2:.25;rig.rotation.y=targetY;pose=null;renderer.render(scene,camera);}else start();
  }));
  host.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,ry:targetY,rx:targetX};host.setPointerCapture(e.pointerId);pose=null;});
  host.addEventListener('pointermove',e=>{if(!drag)return;targetY=drag.ry+(e.clientX-drag.x)*.012;targetX=Math.max(-.4,Math.min(.4,drag.rx+(e.clientY-drag.y)*.004));start();});
  const release=()=>drag=null;host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);
  function fit(){const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.render(scene,camera);}
  new ResizeObserver(fit).observe(host);fit();
  function tick(time){
    raf=0;if(!visible||document.hidden)return;
    const dt=Math.min((time-last)/1000,.05);last=time;
    if(pose){const elapsed=(time-pose.start)/1000,quantized=Math.floor(elapsed*12)/12;
      if(pose.type==='turn'){targetY=pose.from+Math.PI*2*Math.min(quantized/1.6,1);}
      else{rig.rotation.z=-.09+Math.sin(quantized*11)*.16;rig.position.y=Math.abs(Math.sin(quantized*7))*.12;}
      if(elapsed>1.65){pose=null;rig.rotation.z=-.09;rig.position.y=0;}
    }
    rig.rotation.y+=(targetY-rig.rotation.y)*(reduce?1:.18);rig.rotation.x+=(targetX-rig.rotation.x)*(reduce?1:.18);
    for(const p of sugar){p.mesh.position.y-=p.speed*dt*2;p.mesh.position.x+=Math.sin(time*.002+p.speed)*dt*.09;}
    sugar=sugar.filter(p=>{if(p.mesh.position.y< -1.75){scene.remove(p.mesh);return false;}return true;});
    renderer.render(scene,camera);
    if(pose||sugar.length||Math.abs(targetY-rig.rotation.y)>.002||Math.abs(targetX-rig.rotation.x)>.002)raf=requestAnimationFrame(tick);
  }
  function start(){if(!raf&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick);}}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(raf);raf=0;}}).observe(host);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);host.querySelector('.fallback').style.display='';renderer.domElement.hidden=true;fallback();});
  start();
})();
