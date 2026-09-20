import * as THREE from './vendor/three.module.js';

// World-space detail keeps the imported geometry's scale and silhouettes intact.
const noiseGLSL=`
float dh(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float dn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(dh(i),dh(i+vec3(1,0,0)),f.x),mix(dh(i+vec3(0,1,0)),dh(i+vec3(1,1,0)),f.x),f.y),mix(mix(dh(i+vec3(0,0,1)),dh(i+vec3(1,0,1)),f.x),mix(dh(i+vec3(0,1,1)),dh(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec3 detailNormal(vec3 n,float h){vec3 p=-vViewPosition;vec3 dx=dFdx(p),dy=dFdy(p);vec3 r1=cross(dy,n),r2=cross(n,dx);float det=dot(dx,r1);return normalize(abs(det)*n-sign(det)*(dFdx(h)*r1+dFdy(h)*r2));}
`;
export function organicMaterial(mat,name){
 const bark=/bark/.test(name),petal=/Sakura petal/.test(name),ceramic=/satin ceramic/.test(name),moss=/moss/.test(name),rock=/rocks/.test(name);
 if(!bark&&!petal&&!ceramic&&!moss&&!rock)return mat;
 if(petal){mat.color.lerp(new THREE.Color(0xffe9e7),.24);mat.roughness=.55;}
 if(ceramic){mat.roughness=.31;mat.transmission=0;mat.clearcoat=.12;}
 mat.onBeforeCompile=shader=>{
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 detailP;');
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ndetailP=(modelMatrix*vec4(transformed,1.)).xyz;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 detailP;\n'+noiseGLSL);
 let color='',height='0.';
 if(bark){color='float ridge=dn(detailP*vec3(15.,1.8,15.));diffuseColor.rgb*=mix(.52,1.32,ridge)*mix(.85,1.12,dn(detailP*53.));';height='.016*dn(detailP*vec3(15.,1.8,15.))+.003*dn(detailP*53.)';}
 if(petal){color='float petalFine=dn(detailP*120.);diffuseColor.rgb*=mix(.96,1.025,petalFine);';height='.00035*dn(detailP*120.)';}
 if(ceramic){color='float rib=sin(atan(detailP.z-19.44,detailP.x)*165.+length(detailP.xz-vec2(0.,19.44))*5.);diffuseColor.rgb*=.996+.004*rib;';height='.00018*sin(atan(detailP.z-19.44,detailP.x)*165.+length(detailP.xz-vec2(0.,19.44))*5.)';}
 if(moss){color='diffuseColor.rgb*=mix(.65,1.3,dn(detailP*16.))*mix(.9,1.12,dn(detailP*90.));';height='.004*dn(detailP*90.)';}
 if(rock){color='diffuseColor.rgb*=mix(.7,1.2,dn(detailP*9.))*mix(.9,1.12,dn(detailP*70.));';height='.006*dn(detailP*45.)';}
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+color);
 shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=detailNormal(normal,'+height+');');
 };
 mat.customProgramCacheKey=()=> 'organic-v6-'+name;return mat;
}
export function contactShade(scene,x,z,rx,rz,opacity){
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,4,64,64,64);g.addColorStop(0,'rgba(49,44,32,.7)');g.addColorStop(.35,'rgba(49,44,32,.35)');g.addColorStop(1,'rgba(49,44,32,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(rx*2,rz*2),new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.001,z);mesh.userData.passRay=true;scene.add(mesh);
}
export function daylightSky(renderer,scene){
 // A single equirectangular image avoids cube-face cloud seams.
 const w=1024,h=512,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d'),data=ctx.createImageData(w,h);
 const hash=(x,y,z)=>{const a=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453;return a-Math.floor(a);};
 const noise=(x,y,z)=>{let ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);x-=ix;y-=iy;z-=iz;x=x*x*(3-2*x);y=y*y*(3-2*y);z=z*z*(3-2*z);let v=0;for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let d=0;d<2;d++)v+=hash(ix+a,iy+b,iz+d)*(a?x:1-x)*(b?y:1-y)*(d?z:1-z);return v;};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const theta=y/h*Math.PI,phi=x/w*Math.PI*2,sy=Math.cos(theta),sx=Math.sin(theta)*Math.cos(phi),sz=Math.sin(theta)*Math.sin(phi);const horizon=Math.pow(1-Math.max(0,sy),3);let rgb=sy<0?[207,198,181]:[133+80*horizon,181+43*horizon,222+13*horizon];let n=noise(sx*5,sy*5,sz*5)*.58+noise(sx*12,sy*12,sz*12)*.27+noise(sx*29,sy*29,sz*29)*.15;let cloud=Math.max(0,Math.min(1,(n-.51)*5))*Math.min(1,Math.max(0,sy)*6);const i=(y*w+x)*4;for(let k=0;k<3;k++)data.data[i+k]=rgb[k]*(1-cloud)+[255,252,247][k]*cloud;data.data[i+3]=255;}
 ctx.putImageData(data,0,0);const sky=new THREE.CanvasTexture(c);sky.colorSpace=THREE.SRGBColorSpace;sky.mapping=THREE.EquirectangularReflectionMapping;scene.background=sky;
 const gen=new THREE.PMREMGenerator(renderer);const envCanvas=document.createElement('canvas');envCanvas.width=w;envCanvas.height=h;const ex=envCanvas.getContext('2d');ex.drawImage(c,0,0);ex.globalAlpha=.72;ex.fillStyle='#fff4df';ex.fillRect(0,0,w,h);const env=new THREE.CanvasTexture(envCanvas);env.colorSpace=THREE.SRGBColorSpace;env.mapping=THREE.EquirectangularReflectionMapping;scene.environment=gen.fromEquirectangular(env).texture;scene.environmentIntensity=.32;gen.dispose();
}

export function blossomClusters(scene,meta,buffer){
 const candidates=[];
 for(const g of meta.groups.filter(g=>/Sakura petal/.test(g.name))){const v=new Float32Array(buffer,g.offset,g.count*8);for(let i=0;i<g.count;i+=9)if(v[i*8+1]>3.3)candidates.push(new THREE.Vector3(v[i*8],v[i*8+1],v[i*8+2]));}
 if(!candidates.length)return;
 let seed=6327;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const pg=[0,0,.16],pn=[0,0,1],pi=[];for(let k=0;k<10;k++){const a=k*Math.PI*2/10;pg.push(Math.cos(a),Math.sin(a),-.1);pn.push(0,0,1);pi.push(0,k+1,(k+1)%10+1);}const petalGeo=new THREE.BufferGeometry();petalGeo.setAttribute('position',new THREE.Float32BufferAttribute(pg,3));petalGeo.setIndex(pi);petalGeo.computeVertexNormals();
 const lower=lowerBranches(scene);
 const count=40000,geo=petalGeo,mat=new THREE.MeshStandardMaterial({color:0xffe0df,roughness:.58,side:THREE.DoubleSide});
 const petals=new THREE.InstancedMesh(geo,mat,count*5),bud=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),new THREE.MeshStandardMaterial({color:0xc47f83,roughness:.7}),count);
 const o=new THREE.Object3D(),q=new THREE.Quaternion(),axis=new THREE.Vector3(0,0,1),offset=new THREE.Vector3(),color=new THREE.Color();
 for(let i=0;i<count;i++){
  const center=(i%10<3?lower[Math.floor(rand()*lower.length)]:candidates[Math.floor(rand()*candidates.length)]).clone().add(new THREE.Vector3((rand()-.5)*.8,(rand()-.5)*.65,(rand()-.5)*.8));
  const rr=Math.hypot(center.x,center.z),limit=5.72+Math.max(0,center.y-6.1)*.85;if(rr>limit){center.x*=limit/rr;center.z*=limit/rr;}
  const size=.039+rand()*.019;q.setFromEuler(new THREE.Euler(rand()*Math.PI,rand()*Math.PI*2,rand()*Math.PI));
  for(let k=0;k<5;k++){const a=k*Math.PI*2/5;offset.set(Math.cos(a)*size*.68,Math.sin(a)*size*.68,.004).applyQuaternion(q);o.position.copy(center).add(offset);o.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(axis,a));o.scale.set(size,size*.64,size*.5);o.updateMatrix();petals.setMatrixAt(i*5+k,o.matrix);color.setHSL(.97+rand()*.025,.20+rand()*.13,.81+rand()*.13);petals.setColorAt(i*5+k,color);}
  o.position.copy(center);o.quaternion.copy(q);o.scale.setScalar(size*.19);o.updateMatrix();bud.setMatrixAt(i,o.matrix);
 }
 petals.castShadow=true;petals.receiveShadow=true;bud.castShadow=false;scene.add(petals,bud);
}

function lowerBranches(scene){
 const points=[],wood=scene.children.find(o=>o.name==='Sakura bark brown charcoal')?.material||new THREE.MeshStandardMaterial({color:0x766453,roughness:.94});
 function branch(path,radius){const curve=new THREE.CatmullRomCurve3(path),geo=new THREE.TubeGeometry(curve,20,radius,5,false),p=geo.attributes.position;
  for(let i=0;i<=20;i++){const c=curve.getPointAt(i/20),taper=1-i/20*.82;for(let j=0;j<=5;j++){const k=i*6+j;p.setXYZ(k,c.x+(p.getX(k)-c.x)*taper,c.y+(p.getY(k)-c.y)*taper,c.z+(p.getZ(k)-c.z)*taper);}}geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,wood);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return curve;}
 for(let i=0;i<12;i++){const a=i*2.399+.4,r=3.65+(Math.sin(i*4.7)+1)*.65,y=2.4+(i%4)*.38,dir=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),start=new THREE.Vector3(.4,y,-.35),end=start.clone().addScaledVector(dir,r);end.y=y+.55+.5*Math.sin(i*1.3);const mid=start.clone().addScaledVector(dir,r*.55);mid.y=y+.65;
  const trunk=branch([start,mid,end],.085);
  for(let j=0;j<7;j++){const t=.42+j*.078,p=trunk.getPoint(t),side=new THREE.Vector3(Math.cos(a+(j%2?1:-1)*.8),0,Math.sin(a+(j%2?1:-1)*.8)),tip=p.clone().addScaledVector(side,.5+.12*(j%3));tip.y+=.2+.22*Math.sin(j*2+i);const c=branch([p,p.clone().lerp(tip,.6).add(new THREE.Vector3(0,.13,0)),tip],.022);for(let k=2;k<=12;k++)points.push(c.getPoint(k/12));}
 }return points;
}
