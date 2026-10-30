// A small software 3D renderer shared by the browser and the e-paper image API.
// Every tree, mountain and beacon comes from the saved game board.
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const vec=(a,b,r=1)=>[Math.cos(b)*Math.sin(a)*r,Math.sin(b)*r,Math.cos(b)*Math.cos(a)*r];
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const mul=(a,n)=>a.map(v=>v*n);
const dot=(a,b)=>a.reduce((v,n,i)=>v+n*b[i],0);
const light=[-.5,.7,.5];
const hex=(c,f)=>{const v=c.match(/\w\w/g).map(n=>clamp(Math.round(parseInt(n,16)*f),0,255));return '#'+v.map(n=>n.toString(16).padStart(2,'0')).join('');};
const noise=(x,y,s)=>{const n=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return n-Math.floor(n);};
export function evolution(s){const groves=s.tiles.join('').split('T').length-1,beacon=s.tiles.join('').includes('B');return {groves,beacon,stage:beacon&&groves>=8?'Ready for the horizon':groves>=8?'A world in bloom':groves>=5?'A growing woodland':groves>=3?'Putting down roots':'The first little forest',next:groves<8?`${8-groves} more groves to grow`:!beacon?'Build our beacon':'Select the beacon. Set sail.',percent:Math.round((Math.min(8,groves)+(beacon?2:0))/10*100)};}
export function planetSVG(s,{angle=-.18,tilt=.28,bw=false,device=false,selected=null,time=0,interactive=false}={}){
 const palette=bw?{sea:'e8e8e2',land:'d0d0c2',sand:'f7f7f0',tree:'55584d',trunk:'5c5c53',rock:'a4a49a',roof:'44443b'}:device?{sea:'f5dc7c',land:'fff4c7',sand:'fffdf5',tree:'b62d27',trunk:'38372e',rock:'c0b9a4',roof:'d0392d'}:{sea:'6dc9ce',land:'accb79',sand:'efe2b0',tree:'408665',trunk:'93714b',rock:'a3b6ac',roof:'db7654'};
 const faces=[],R=176,cx=320,cy=242;
 const rotate=p=>{const [x,y,z]=p,a=x*Math.cos(angle)+z*Math.sin(angle),c=z*Math.cos(angle)-x*Math.sin(angle);return [a,y*Math.cos(tilt)-c*Math.sin(tilt),c*Math.cos(tilt)+y*Math.sin(tilt)];};
 const project=p=>{const q=rotate(p);return [cx+q[0]*R,cy-q[1]*R,q[2]];};
 const polygon=(points,color,stroke=false,extra='')=>{const q=points.map(project),z=q.reduce((v,p)=>v+p[2],0)/q.length;if(z<-.025)return;faces.push({z,html:`<polygon points="${q.map(p=>p.slice(0,2).map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="${color}" stroke="${stroke?'#343d36':color}" stroke-width="${stroke?.8:.45}" stroke-linejoin="round" ${extra}/>`});};
 function tileAt(a,b){if(a< -1.28||a>1.28||b<-.9||b>.9)return '~';const x=clamp(Math.floor((a+1.28)/2.56*8),0,7),y=clamp(Math.floor((.9-b)/1.8*6),0,5);return s.tiles[y][x];}
 // A triangulated sphere. Shorelines are subdivided, rather than a flat map
 // pasted onto a circle; lighting is calculated in world space.
 function isLand(a,b){const x=(a+.035*Math.sin(b*7))/1.16,y=b/.79;return x*x+y*y<1+.09*Math.sin(a*7+b*5+s.chapter)+.065*Math.cos(b*9-a*3);}
 const nx=64,ny=36;
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const a=-Math.PI+i*TAU/nx,b=-Math.PI/2+j*Math.PI/ny,da=TAU/nx,db=Math.PI/ny,m=vec(a+da/2,b+db/2);if(rotate(m)[2]<-.12)continue;
  const tile=tileAt(a+da/2,b+db/2),land=isLand(a+da/2,b+db/2),edge=land&&[isLand(a-da/2,b+db/2),isLand(a+da*1.5,b+db/2),isLand(a+da/2,b-db/2),isLand(a+da/2,b+db*1.5)].includes(false);
  const base=edge?palette.sand:land?palette.land:palette.sea,shade=.78+Math.max(0,dot(m,light))*.26+noise(i,j,s.chapter)*.075;
  const pts=[vec(a,b),vec(a+da,b),vec(a+da,b+db),vec(a,b+db)];
  polygon([pts[0],pts[1],pts[2]],hex(base,shade));polygon([pts[0],pts[2],pts[3]],hex(base,shade+.025));
 }
 function local(a,b,u,v,h){return add(add(vec(a,b,1+h),mul([Math.cos(a),0,-Math.sin(a)],u)),mul([-Math.sin(b)*Math.sin(a),Math.cos(b),-Math.sin(b)*Math.cos(a)],v));}
 function cone(a,b,h,r,offset,color,n=6){const top=local(a,b,0,0,offset+h);for(let k=0;k<n;k++){const t=k*TAU/n,tt=(k+1)*TAU/n;polygon([local(a,b,Math.cos(t)*r,Math.sin(t)*r,offset),local(a,b,Math.cos(tt)*r,Math.sin(tt)*r,offset),top],hex(color,.74+k/n*.38),device||bw);}}
 function box(a,b,w,h,offset,color){const p=[[-w,-w],[w,-w],[w,w],[-w,w]].map(([u,v])=>local(a,b,u,v,offset)),q=[[-w,-w],[w,-w],[w,w],[-w,w]].map(([u,v])=>local(a,b,u,v,offset+h));for(let i=0;i<4;i++)polygon([p[i],p[(i+1)%4],q[(i+1)%4],q[i]],hex(color,.72+i*.1),true);polygon(q,'#fff9dc',true);}
 const markers=[];
 s.tiles.forEach((row,y)=>[...row].forEach((tile,x)=>{
  const a=(x+.5)/8*2.56-1.28,b=.9-(y+.5)/6*1.8,q=project(vec(a,b,1.015));if(q[2]<.06)return;
  if(tile==='T'||tile==='s'){
   const size=tile==='T'?1:.52;
   const count=tile==='T'?3:1;
   for(let k=0;k<count;k++){const aa=a+(k-1)*.065,bb=b+(k===1?.055:-.01),scale=size*(k===1?1.16:.88);box(aa,bb,.012,.11*scale,.005,palette.trunk);cone(aa,bb,.20*scale,.078*scale,.08*scale,palette.tree);cone(aa,bb,.15*scale,.064*scale,.18*scale,palette.tree);}
  }
  if(tile==='#'){cone(a-.025,b,.27,.13,.005,palette.rock,5);cone(a+.07,b+.02,.19,.09,.005,palette.rock,5);cone(a-.025,b,.07,.035,.205,'f7f5e5',5);}
  if(tile==='B'){box(a,b,.055,.26,.01,bw?'deded4':'fff6d5');box(a,b,.074,.055,.26,palette.roof);cone(a,b,.065,.1,.315,palette.roof);const tip=project(vec(a,b,1.42));faces.push({z:q[2]+.4,html:`<circle cx="${tip[0].toFixed(1)}" cy="${tip[1].toFixed(1)}" r="6" fill="${bw?'#fff':'#ffe291'}" stroke="#454d3c"/><path d="M${tip[0]-15},${tip[1]}h-12m54,0h-12" stroke="${bw?'#222':'#d58940'}" stroke-width="2"/>`});}
  if(tile==='.'&&noise(x,y,s.chapter)>.44){const p=project(vec(a,b,1.015));faces.push({z:p[2]+.003,html:`<path d="M${p[0]-3},${p[1]+2}l3,-5l3,4" fill="none" stroke="${bw?'#777':'#698c51'}" stroke-width="1.5"/>`});}
  if(selected?.x===x&&selected.y===y)markers.push(`<ellipse cx="${q[0]}" cy="${q[1]}" rx="15" ry="9" fill="none" stroke="${bw?'#000':'#c25039'}" stroke-width="3"/>`);
  if(interactive)markers.push(`<circle cx="${q[0]}" cy="${q[1]}" r="${tile==='~'?10:18}" fill="transparent" class="planet-cell" data-x="${x}" data-y="${y}" tabindex="0" role="button" aria-label="${({'.':'Meadow','~':'Water','#':'Rock',T:'Grove',s:'Sapling',B:'Beacon'})[tile]}, column ${x+1}, row ${y+1}"><title>${({'.':'Meadow','~':'Water','#':'Rock',T:'Grove',s:'Sapling',B:'Beacon'})[tile]} · ${x+1}, ${y+1}</title></circle>`);
 }));
 // Small faceted cloud clusters orbit above the surface. They are atmosphere,
 // not buildings or game resources, and never alter the saved world.
 for(let c=0;c<4;c++){const a=-1.6+c*1.12+Math.sin(time*.01)*.06,b=c%2?.62:-.35,q=project(vec(a,b,1.19));if(q[2]<.18)continue;for(let k=0;k<3;k++){const aa=a+(k-1)*.075;for(let j=0;j<4;j++)for(let i=0;i<8;i++){const f=(ii,jj)=>{const t=ii*TAU/8,p=jj*Math.PI/4-Math.PI/2;return local(aa,b,Math.cos(t)*Math.cos(p)*.07,Math.sin(t)*Math.cos(p)*.045,.20+Math.sin(p)*.04);};polygon([f(i,j),f(i+1,j),f(i+1,j+1),f(i,j+1)],hex('fffef2',.88+j*.035));}}}
 faces.sort((a,b)=>a.z-b.z);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 500" role="img" aria-label="3D Tiny Planet, island ${s.chapter}, turn ${s.turn}. ${evolution(s).groves} groves."><title>A little world, growing together</title><ellipse cx="320" cy="449" rx="132" ry="13" fill="${bw?'#d9d9d1':'#c6d6bd'}" opacity=".48"/><ellipse cx="320" cy="263" rx="264" ry="91" fill="none" stroke="${bw?'#b6b6ac':'#bdcbb3'}" stroke-width="1" stroke-dasharray="3 7" transform="rotate(-19 320 263)"/><circle cx="320" cy="242" r="184" fill="${bw?'#e9e9e2':'#e2edda'}"/><g stroke-linecap="round">${faces.map(f=>f.html).join('')}${markers.join('')}</g><g fill="${bw?'#68685d':'#839471'}"><path d="M98 134v12m-6-6h12M526 352v12m-6-6h12M501 98v8m-4-4h8"/><circle cx="138" cy="359" r="2"/><circle cx="489" cy="183" r="2.5"/><circle cx="195" cy="69" r="2"/></g></svg>`;
}
