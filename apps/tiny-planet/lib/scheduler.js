export async function runAutopilot({secret,fetcher=fetch,origin='https://tiny-planet-trmnl.vercel.app'}={}){
 if(!secret)throw Error('Scheduler secret missing');
 const readiness=await fetcher(origin+'/api/world',{signal:AbortSignal.timeout(30000)});let state;try{state=await readiness.json();}catch{throw Error('Production world returned an unreadable readiness response.');}
 if(readiness.status===503&&state.error==='The shared planet is awaiting database activation.')return {status:'waiting_for_activation_deployment',moves:0};
 if(!readiness.ok||!Array.isArray(state.tiles)||state.tiles.length!==6||!state.tiles.every(r=>typeof r==='string'&&r.length===8)||!Number.isSafeInteger(state.turn))throw Error('Production world is not healthy; no owner move attempted.');
 const r=await fetcher(origin+'/api/autopilot',{method:'POST',headers:{Authorization:'Bearer '+secret},signal:AbortSignal.timeout(45000)}),data=await r.json();
 if(!r.ok)throw Error('Autopilot could not run: '+(data.error||r.status));
 if(!Number.isInteger(data.moves)||data.moves<0||data.moves>31||typeof data.last_autopilot_day!=='string')throw Error('Autopilot result was not confirmed.');
 return {status:'confirmed',...data};
}
