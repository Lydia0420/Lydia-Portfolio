export class Navigation {
 constructor(data){Object.assign(this,data);}
 index(x,z){const c=Math.floor((x-this.x0)/this.step),r=Math.floor((z-this.z0)/this.step);return c<0||r<0||c>=this.width||r>=this.height?-1:r*this.width+c;}
 point(i){return [this.x0+(i%this.width+.5)*this.step,this.z0+(Math.floor(i/this.width)+.5)*this.step];}
 valid(i){return i>=0&&i<this.cells.length&&this.cells[i]==='1';}
 contains(x,z){return this.valid(this.index(x,z));}
 line(a,b){const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/(this.step*.3)));for(let i=0;i<=n;i++)if(!this.contains(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n))return false;return true;}
 nearest(p,limit=1){let best=-1,dist=limit*limit;const k=Math.ceil(limit/this.step),cx=Math.floor((p[0]-this.x0)/this.step),cz=Math.floor((p[1]-this.z0)/this.step);for(let z=cz-k;z<=cz+k;z++)for(let x=cx-k;x<=cx+k;x++){if(x<0||z<0||x>=this.width||z>=this.height)continue;const i=z*this.width+x;if(!this.valid(i))continue;const q=this.point(i),d=(q[0]-p[0])**2+(q[1]-p[1])**2;if(d<dist){best=i;dist=d;}}return best;}
 // Breadth-first search never crosses blocked cells or cuts a diagonal corner.
 path(start,goals){const s=this.index(...start);if(!this.valid(s))return null;const targets=new Map(goals.map((g,i)=>[this.index(...g),i]).filter(([j])=>this.valid(j)));if(!targets.size)return null;
 const prev=new Int32Array(this.cells.length).fill(-2),queue=new Int32Array(this.cells.length);let head=0,tail=1,end=-1;queue[0]=s;prev[s]=-1;
 while(head<tail){const i=queue[head++];if(targets.has(i)){end=i;break;}const x=i%this.width,z=Math.floor(i/this.width);
 for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=this.width||nz>=this.height)continue;const j=nz*this.width+nx;if(!this.valid(j)||prev[j]!==-2)continue;if(dx&&dz&&(!this.valid(i+dx)||!this.valid(i+dz*this.width)))continue;prev[j]=i;queue[tail++]=j;}}
 if(end<0)return null;const points=[];for(let j=end;j>=0;j=prev[j])points.push(this.point(j));points.reverse();points[0]=start.slice();const goal=targets.get(end);points.push(goals[goal].slice());
 // Remove grid stair-steps only where the complete segment is walkable.
 const smooth=[points[0]];let i=0;while(i<points.length-1){let j=i+1;while(j+1<points.length&&this.line(points[i],points[j+1]))j++;smooth.push(points[j]);i=j;}return {points:smooth,goal};
 }
 move(p,dx,dz){const distance=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(distance/(this.step*.4)));let q=p.slice();for(let i=0;i<n;i++){const x=[q[0]+dx/n,q[1]],z=[q[0],q[1]+dz/n],both=[q[0]+dx/n,q[1]+dz/n];if(this.line(q,both))q=both;else if(this.line(q,x))q=x;else if(this.line(q,z))q=z;}return this.line(p,q)?q:p.slice();}
}
