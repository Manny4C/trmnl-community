function run(input){
 const previous=input.trmnl?.state||{},same=previous.key===input.key,seen=same&&Array.isArray(previous.seen)?previous.seen.filter(v=>typeof v==='string'&&/^\d{1,10}:\d{1,22}$/.test(v)).slice(-60):[],first=!seen.length;
 const games=new Map((input.games||[]).map(g=>[g[0],g[1]]));
 const items=(input.rows||[]).map(row=>({id:row[1]+':'+row[0],game:games.get(row[1])||'Steam app '+row[1],title:row[2],kind:row[3],published_at:new Date(row[4]*1000).toISOString(),is_new:!input.stale&&!first&&!seen.includes(row[1]+':'+row[0])}));
 const fresh=items.filter(i=>i.is_new).length,status=input.stale?'Cached Steam posts':input.partial?'Some games unavailable':first?'First edition':fresh?fresh+' new since last refresh':'No new posts since last refresh';
 const out={key:input.key,checked_at:input.checked_at,source_checked_at:input.source_checked_at,days:input.days,count:input.count,kind:input.kind,games:input.games,partial:Boolean(input.partial),stale:Boolean(input.stale),empty:Boolean(input.empty),items,status,new_count:fresh};
 // Do not advance history during an outage or empty edition; returning to an earlier filter starts a fresh edition.
 if(!input.stale&&items.length){out.trmnl_state={key:input.key,seen:[...new Set([...seen,...items.map(i=>i.id)])].slice(-60)};}
 const bytes=value=>encodeURIComponent(JSON.stringify(value)).replace(/%[A-F\d]{2}/gi,'x').length;
 // The runtime context never becomes merge data. Bound the full return, including memory,
 // so even long multibyte titles and a full history fit a standard 5 kB plugin.
 for(const max of [100,80,60,40,24,12]){
  if(bytes(out)<=4800)break;
  out.items.forEach(i=>{const chars=[...i.title];if(chars.length>max)i.title=chars.slice(0,max-1).join('')+'…';});
 }
 return out;
}
