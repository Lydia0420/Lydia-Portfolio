import * as THREE from './vendor/three.module.js';
// One continuous indexed height-field, with one plaster material and welded normals.
export async function installRelief(scene){
 const images=await Promise.all(['a','b','c'].map(c=>new THREE.TextureLoader().loadAsync(`./textures/depth-${c}.png`)));
 const fields=images.map(t=>{const c=document.createElement('canvas');c.width=t.image.width;c.height=t.image.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(t.image,0,0);const rgba=ctx.getImageData(0,0,c.width,c.height).data,raw=new Float32Array(c.width*c.height),data=new Float32Array(raw.length);for(let i=0;i<raw.length;i++)raw[i]=rgba[i*4]/255;
  const temp=new Float32Array(raw.length),weights=[1,2,3,4,3,2,1];
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){let sum=0;for(let d=-3;d<=3;d++)sum+=raw[y*c.width+Math.max(0,Math.min(c.width-1,x+d))]*weights[d+3];temp[y*c.width+x]=sum/16;}
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){let sum=0;for(let d=-3;d<=3;d++)sum+=temp[Math.max(0,Math.min(c.height-1,y+d))*c.width+x]*weights[d+3];data[y*c.width+x]=sum/16;}// Silhouette distance creates rounded body volume; image shading contributes only shallow folds.
  const distance=new Float32Array(raw.length);for(let i=0;i<raw.length;i++)distance[i]=raw[i]>.12?1e4:0;
  const w=c.width,h=c.height;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const k=y*w+x;distance[k]=Math.min(distance[k],distance[k-1]+1,distance[k-w]+1,distance[k-w-1]+1.414,distance[k-w+1]+1.414);}
  for(let y=h-2;y>0;y--)for(let x=w-2;x>0;x--){const k=y*w+x;distance[k]=Math.min(distance[k],distance[k+1]+1,distance[k+w]+1,distance[k+w+1]+1.414,distance[k+w-1]+1.414);}
  for(let i=0;i<data.length;i++){const body=1-Math.exp(-distance[i]/12);data[i]=body*(.55+.45*data[i]);}
  t.dispose();return {w:c.width,h:c.height,data};});
 const smooth=(x)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 function sample(f,u,v){const x=Math.min(f.w-1,Math.max(0,u*(f.w-1))),y=Math.min(f.h-1,Math.max(0,(1-v)*(f.h-1))),i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j;const at=(xx,yy)=>f.data[Math.min(f.h-1,yy)*f.w+Math.min(f.w-1,xx)];return (at(i,j)*(1-fx)+at(i+1,j)*fx)*(1-fy)+(at(i,j+1)*(1-fx)+at(i+1,j+1)*fx)*fy;}
 const nx=3072,ny=160,stride=nx+1,order=[0,1,2,1,0,2],pos=new Float32Array(stride*(ny+1)*3),heights=new Float32Array(stride*(ny+1)),colors=new Float32Array(pos.length),indices=new Uint32Array(nx*ny*6);
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=(i%512)/512,v=j/ny,f=fields[order[Math.floor(i/512)%6]],edge=smooth(u/.025)*smooth((1-u)/.025)*smooth(v/.035)*smooth((1-v)/.035),h=.055*Math.max(0,(sample(f,u,v)-.025)/.975)*edge,a=i/nx*Math.PI*2,r=4.69-h,k=j*stride+i;heights[k]=h;pos.set([r*Math.sin(a),4.05+1.48*v,19.44+r*Math.cos(a)],k*3);}
 let n=0;for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const k=j*stride+i;indices.set([k,k+stride,k+1,k+1,k+stride,k+stride+1],n);n+=6;}
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const k=j*stride+i,h=heights[k];let cavity=0;for(const [dx,dy] of [[3,0],[-3,0],[0,3],[0,-3],[6,0],[-6,0]]){const other=heights[Math.max(0,Math.min(ny,j+dy))*stride+(i+dx+nx)%nx];cavity+=Math.max(0,other-h);}const ao=1-Math.min(.14,cavity*2.5);colors.fill(ao,k*3,k*3+3);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(colors,3));geo.setIndex(new THREE.BufferAttribute(indices,1));geo.computeVertexNormals();const normals=geo.attributes.normal;
 for(let j=0;j<=ny;j++){const a=j*stride,b=a+nx,v=new THREE.Vector3().fromBufferAttribute(normals,a).add(new THREE.Vector3().fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,v.x,v.y,v.z);normals.setXYZ(b,v.x,v.y,v.z);}
 const mat=new THREE.MeshStandardMaterial({color:new THREE.Color(.86,.815,.735),roughness:.88,envMapIntensity:.25,vertexColors:true,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(geo,mat);mesh.name='Continuous sculpted plaster frieze';mesh.castShadow=true;mesh.receiveShadow=false;mesh.layers.enable(2);scene.add(mesh);
 // Broad raking fill approximates light scattered from the oculus; avoid the
 // coarse whole-building shadow map projecting architectural blocks over fine relief.
 const fill=new THREE.DirectionalLight(0xfff6ed,.65);fill.position.set(-5,8,22);fill.target.position.set(0,4.8,19.44);fill.layers.set(2);scene.add(fill,fill.target);
 const trim=new THREE.MeshStandardMaterial({color:new THREE.Color(.86,.815,.735),roughness:.88});
 for(const y of [4.035,5.545]){const ring=new THREE.Mesh(new THREE.TorusGeometry(4.69,.025,10,512),trim);ring.rotation.x=Math.PI/2;ring.position.set(0,y,19.44);scene.add(ring);}
 scene.userData.relief={vertices:stride*(ny+1),triangles:nx*ny*2,maxDepth:.055,continuous:true};
}
