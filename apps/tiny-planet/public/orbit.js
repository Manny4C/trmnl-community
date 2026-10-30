import {planetSVG,evolution} from './planet.js';
export function mountPlanet(host,onSelect){
 let state,selected,ink='color',angle=-.18,tilt=.28,paused=false,drag=null,moved=false,last=0,frame=0;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 function paint(){if(!state)return;host.innerHTML=planetSVG(state,{angle,tilt,bw:ink==='bw',selected,interactive:paused||reduced.matches});}
 function pause(value){paused=value;const b=document.getElementById('orbit-toggle');b.textContent=paused?'Resume orbit ↻':'Pause orbit Ⅱ';b.setAttribute('aria-pressed',String(paused));paint();}
 host.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,angle,tilt};moved=false;host.classList.add('dragging');});
 host.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5){moved=true;host.setPointerCapture?.(e.pointerId);}angle=drag.angle+dx*.006;tilt=Math.max(-.65,Math.min(.8,drag.tilt+dy*.004));paint();});
 host.addEventListener('pointerup',()=>{drag=null;host.classList.remove('dragging');});host.addEventListener('pointercancel',()=>{drag=null;host.classList.remove('dragging');});
 function select(e){const cell=e.target.closest?.('.planet-cell');if(cell&&!moved){pause(true);onSelect({x:Number(cell.dataset.x),y:Number(cell.dataset.y)});}}
 host.addEventListener('click',select);host.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(e);}});
 host.addEventListener('focusin',()=>{if(!paused)pause(true);});
 document.getElementById('orbit-toggle').addEventListener('click',()=>pause(!paused));
 document.getElementById('orbit-home').addEventListener('click',()=>{angle=-.18;tilt=.28;pause(true);});
 function tick(t){frame=requestAnimationFrame(tick);if(t-last<180)return;const elapsed=last?Math.min(t-last,200):0;last=t;if(!paused&&!drag&&!reduced.matches&&!document.hidden&&host.getBoundingClientRect().bottom>0&&host.getBoundingClientRect().top<window.innerHeight){angle+=elapsed*.000018;paint();}}
 frame=requestAnimationFrame(tick);
 return {update(s,cell,palette){state=s;selected=cell;ink=palette;const e=evolution(s);document.getElementById('evolution-stage').textContent=e.stage;document.getElementById('evolution-next').textContent=e.next;document.getElementById('evolution-fill').style.width=e.percent+'%';document.getElementById('evolution-progress').setAttribute('aria-valuenow',e.percent);paint();},stop(){cancelAnimationFrame(frame);}};
}
