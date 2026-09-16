/* Lightweight cover-page study using the original sketch's curved blade construction. */
(() => {
 const host=document.querySelector('.cluster-stage'), canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let seed=53;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 const colors=['#e7b937','#c99b3a','#f5d370','#d4be67','#e9dfab'];
 const blades=Array.from({length:39},(_,i)=>({x:153+rand()*194,y:315+rand()*20,len:125+rand()*116,angle:(rand()-.5)*.4,bend:0,v:0,color:colors[i%5],kind:i%5})).sort((a,b)=>a.y-b.y);
 let frame=0,last=0,until=0,previous=null,visible=true;
 function paint(){ctx.clearRect(0,0,500,380);for(const b of blades){const a=b.angle+b.bend,tx=b.x+Math.sin(a)*b.len,ty=b.y-Math.cos(a)*b.len,cx=b.x+Math.sin(a*.6)*b.len*.6,cy=b.y-Math.cos(a*.6)*b.len*.6;
 ctx.fillStyle=b.color;ctx.beginPath();ctx.moveTo(b.x-1.5,b.y);ctx.quadraticCurveTo(cx-.75,cy,tx,ty);ctx.quadraticCurveTo(cx+.75,cy,b.x+1.5,b.y);ctx.fill();
 ctx.save();ctx.translate(tx,ty);ctx.rotate(a);ctx.strokeStyle=b.color;ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
 if(b.kind===0){ctx.moveTo(-4,-8);ctx.lineTo(0,0);ctx.lineTo(4,-8)}
 else if(b.kind===1){ctx.moveTo(-4,-7);ctx.lineTo(4,0);ctx.moveTo(4,-7);ctx.lineTo(-4,0)}
 else if(b.kind===2){ctx.moveTo(0,-9);ctx.lineTo(0,3);ctx.moveTo(-4,-3);ctx.lineTo(4,-3)}
 else if(b.kind===3){ctx.moveTo(0,-10);ctx.lineTo(4,-5);ctx.lineTo(0,0);ctx.lineTo(-4,-5);ctx.closePath()}
 else{ctx.moveTo(-3,-10);ctx.lineTo(3,-6);ctx.lineTo(-3,-2);ctx.lineTo(3,2)}ctx.stroke();ctx.restore();}}
 function stop(){cancelAnimationFrame(frame);frame=0;previous=null;blades.forEach(b=>{b.bend=0;b.v=0});paint()}
 function run(now){if(!visible||document.hidden||reduced.matches){stop();return}if(now-last<1000/30){frame=requestAnimationFrame(run);return}const dt=Math.min((now-last)/1000,.06);last=now;for(const b of blades){b.v+=(-b.bend*30-b.v*6)*dt;b.bend+=b.v*dt}paint();if(now<until)frame=requestAnimationFrame(run);else stop()}
 function gust(x,y,dir){if(reduced.matches||!visible)return;for(const b of blades){const distance=Math.abs(b.x-x);const influence=Math.max(0,1-distance/160);b.v+=dir*influence*1.35;b.v=Math.max(-3,Math.min(3,b.v))}until=performance.now()+3500;if(!frame){last=performance.now();frame=requestAnimationFrame(run)}}
 let inputTime=0;host.addEventListener('pointermove',e=>{if(performance.now()-inputTime<32)return;inputTime=performance.now();const r=host.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*500,y=(e.clientY-r.top)/r.height*380;const dir=previous?Math.max(-1,Math.min(1,(x-previous)/12)):.65;previous=x;gust(x,y,dir)},{passive:true});
 host.addEventListener('pointerdown',e=>{const r=host.getBoundingClientRect();gust((e.clientX-r.left)/r.width*500,150,.9)},{passive:true});host.addEventListener('pointerleave',()=>previous=null);
 host.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Enter',' '].includes(e.key)){e.preventDefault();gust(250,150,e.key==='ArrowLeft'?-1:1)}});
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible)stop()}).observe(host);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});reduced.addEventListener('change',stop);
 const resize=()=>{const dpr=Math.min(devicePixelRatio||1,1.5),w=host.clientWidth;canvas.width=w*dpr;canvas.height=w*380/500*dpr;ctx.setTransform(canvas.width/500,0,0,canvas.height/380,0,0);paint()};new ResizeObserver(resize).observe(host);resize();
})();
