// The same transparent selection policy runs on the server and in the time-of-day demo.
export function localContext(now,zone){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,hourCycle:'h23',hour:'2-digit',weekday:'short',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
 const hour=Number(parts.hour);return {hour,day:`${parts.year}-${parts.month}-${parts.day}`,weekday:parts.weekday,phase:hour<6?'night':hour<11?'morning':hour<17?'afternoon':hour<21?'evening':'night'};
}
export function routine(context){
 const content={morning:['Open with intention','Choose one useful outcome for today. Give it the first clear block on your calendar.'],afternoon:['Make room for one thing','Close a spare tab. Pick the next concrete step. Protect a short stretch of uninterrupted work.'],evening:['Leave a clean handoff','Write down what changed, what remains, and the first step for tomorrow.'],night:['Let the desk go quiet','Leave yourself a starting point for tomorrow. The internet will still be here.']}[context.phase];
 return {id:`routine-${context.phase}`,kind:'routine',title:content[0],summary:content[1],source:'Desk Editor routine',source_url:null,published_at:null,checked_at:null,stale:false};
}
function hash(text){let x=2166136261;for(const ch of text)x=Math.imul(x^ch.charCodeAt(0),16777619);return x>>>0;}
export function edit(candidates,config,now=new Date(),demoHour=null){
 let context=localContext(now,config.timezone);
 if(demoHour!==null){const hour=Number(demoHour);context={...context,hour,phase:hour<6?'night':hour<11?'morning':hour<17?'afternoon':hour<21?'evening':'night'};}
 const slot=Math.floor(now.getTime()/(config.cadence*60000));
 const pool=[...candidates.filter(c=>!c.expires_at||Date.parse(c.expires_at)>now.getTime()),routine(context)];
 const scored=pool.map(c=>{
  let score=0,reason='';
  if(c.kind==='alert'){score=1000;reason='An active severe or extreme NWS alert takes priority over the regular edition.';}
  else if(config.mode==='quiet'){
   score=c.kind==='routine'?100:c.kind==='weather'?65:20;
   reason=c.kind==='routine'?'Quiet mode puts a calm routine first.':c.kind==='weather'?'A practical forecast stays close at hand.':'A small optional update, without taking over the desk.';
  }else if(c.kind==='weather'){
   score=context.phase==='morning'?100:context.phase==='evening'?86:context.phase==='night'?35:55;
   reason=context.phase==='morning'?'Your local forecast gets the morning lead.':context.phase==='evening'?'The next forecast period helps you plan the evening.':'A local forecast alongside your desk updates.';
  }else if(c.kind==='release'){
   const recent=now.getTime()-Date.parse(c.published_at)<7*86400000;
   score=config.mode==='builder'?(recent?95:64):(recent?72:38);
   reason=config.mode==='builder'?'Builder mode favors the latest published release of your chosen tool.':'A published software release from a project you follow.';
  }else if(c.kind==='story'){
   score=config.mode==='builder'?75:context.phase==='afternoon'?98:context.phase==='night'?40:78;
   reason=(config.topics?'Its title matches your topic words. ':'')+(context.phase==='afternoon'?'A fresh HN story leads the afternoon edition.':'A recent story from the bounded HN front-page sample.');
  }else{score=context.phase==='night'?90:config.mode==='builder'?45:48;reason='A time-of-day suggestion, not a task or calendar event.';}
  if(c.stale){score-=35;reason+=' Cached source data; see its original check time.';}
  return {...c,reason,priority:score,rotation:hash(`${slot}:${c.id}`)};
 }).sort((a,b)=>b.priority-a.priority||a.rotation-b.rotation||a.id.localeCompare(b.id));
 // One card per kind keeps the screen useful rather than turning it into another headline list.
 const chosen=[],seen=new Set();for(const c of scored){if(seen.has(c.kind))continue;chosen.push(c);seen.add(c.kind);if(chosen.length===3)break;}
 return {context,slot,cards:chosen,next_selection_at:new Date((slot+1)*config.cadence*60000).toISOString()};
}
