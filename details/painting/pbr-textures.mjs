import * as THREE from './vendor/three.module.js';
export async function loadSurfaces(){
 const loader=new THREE.TextureLoader(),sets={};
 await Promise.all(['stone','plaster','bark','frame'].map(async kind=>{const set={};await Promise.all(['Diffuse','Displacement','Rough'].map(async channel=>{const t=await loader.loadAsync(`./textures/${kind}-${channel}.jpg`);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;t.colorSpace=channel==='Diffuse'?THREE.SRGBColorSpace:THREE.NoColorSpace;set[channel]=t;}));sets[kind]=set;}));return sets;
}
export function scannedSurface(mat,name,sets){
 const frame=/oak|print frame/.test(name),portal=/portal|02 warm greige|03 pale grey limestone|02 finely honed/.test(name),ceramic=/satin ceramic/.test(name),gold=/gold|champagne/.test(name),bark=/bark/.test(name),stone=name==='Honed limestone'||/Lobby stone floor/.test(name),plaster=/plaster|mist blue|dusty rose|grey sage/i.test(name);
 if(!bark&&!stone&&!plaster&&!frame&&!portal&&!ceramic&&!gold)return mat;
 const kind=frame?'frame':bark?'bark':stone||portal?'stone':'plaster',set=sets[kind],previous=mat.onBeforeCompile.bind(mat),oldKey=mat.customProgramCacheKey.bind(mat);
 mat.onBeforeCompile=s=>{previous(s);s.uniforms.scanDiffuse={value:set.Diffuse};s.uniforms.scanHeight={value:set.Displacement};s.uniforms.scanRough={value:set.Rough};
 s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 scanP;varying vec3 scanN;');
 s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nscanP=(modelMatrix*vec4(transformed,1.)).xyz;scanN=normalize(mat3(modelMatrix)*objectNormal);');
 s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
 varying vec3 scanP;varying vec3 scanN;uniform sampler2D scanDiffuse;uniform sampler2D scanHeight;uniform sampler2D scanRough;
 vec3 scanWeights(){vec3 w=pow(abs(scanN),vec3(8.));return w/max(dot(w,vec3(1.)),.001);}
 vec2 scanUv(vec2 uv){return ${portal?'fract(uv)*vec2(.2,.15)+vec2(.06,.02)':'uv'};}
 vec4 scanSample(sampler2D tex){vec3 w=scanWeights();vec3 p=scanP*${bark?'vec3(.8,.55,.8)':frame?'vec3(3.,.6,3.)':stone?'vec3(.185185,.208333,.208333)':'vec3(.5)'};return texture2D(tex,scanUv(p.zy))*w.x+texture2D(tex,scanUv(p.xz))*w.y+texture2D(tex,scanUv(p.xy))*w.z;}
 vec3 scanBump(vec3 n,float h){vec3 p=-vViewPosition;vec3 dx=dFdx(p),dy=dFdy(p);vec3 r1=cross(dy,n),r2=cross(n,dx);float det=dot(dx,r1);return normalize(abs(det)*n-sign(det)*(dFdx(h)*r1+dFdy(h)*r2));}
 `);
 s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec3 sc=scanSample(scanDiffuse).rgb;float lum=dot(sc,vec3(.2126,.7152,.0722));
 ${frame?'diffuseColor.rgb*=mix(.83,1.15,clamp(lum/.4,0.,1.));':bark?'diffuseColor.rgb=mix(diffuseColor.rgb,sc*.82,.84);':stone?'diffuseColor.rgb*=mix(.89,1.04,clamp(lum/.38,0.,1.));':'diffuseColor.rgb*=mix(.94,1.035,clamp(lum/.68,0.,1.));'}
 `);
 s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>\nnormal=scanBump(normal,scanSample(scanHeight).r*${bark?'.015':portal?'.0012':frame?'.00045':ceramic?'.00015':gold?'.00008':stone?'.0009':'.0004'});`);
 s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>\nroughnessFactor=${bark?'.65+.25':portal?'.42+.12':frame?'.42+.13':ceramic?'.3+.08':gold?'.25+.08':stone?'.28+.2':'.68+.15'}*scanSample(scanRough).r;`);
 s.fragmentShader=s.fragmentShader.replace('roughnessFactor=.3+.09*stoneNoise(vStoneWorld*2.);','roughnessFactor=.28+.2*scanSample(scanRough).r;');
 // Bounce compensation for downward facing ceiling surfaces only.
 if(plaster)s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\nif(scanP.y>3.8&&abs(scanN.y)>.85)totalEmissiveRadiance+=vec3(.14,.137,.129);`);
 };
 mat.customProgramCacheKey=()=>oldKey()+'-scan-v8-'+kind+[portal,ceramic,gold,frame].join('-');return mat;
}
