function run(input) {
  const saved=input.trmnl?.state||{},fields=input.trmnl?.plugin_settings?.custom_fields_values||{};
  const rawCount=Number(fields.headline_count??input.headline_count??8);
  const count=Number.isInteger(rawCount)&&rawCount>=1&&rawCount<=20?rawCount:8;
  const density=count<=3?'detail':count<=5?'medium':count<=8?'compact':count<=16?'columns':'dense';
  const layout={headline_count:count,density,column_rows:Math.ceil(count/2)};
  const prompt=String(input.prompt||fields.news_prompt||'').normalize('NFKC').replace(/\s+/g,' ').trim();
  const topic=input.topic||(prompt?'custom':fields.topic||'technology');
  const feedKey=input.feed_key||(topic==='custom'&&saved.prompt===prompt?saved.feed_key:topic);
  const previous=(saved.feed_key||saved.topic)===feedKey&&(!prompt||!saved.prompt||saved.prompt===prompt)?saved:{};
  const unpack=row=>({id:row[0],fingerprint:row[1],title:row[2],snippet:row[3],source:row[4],published_at:row[5],time_kind:row[6]?'indexed':'published'});
  const pack=story=>[story.id,story.fingerprint,story.title,story.snippet,story.source,story.published_at,story.time_kind==='indexed'?1:0];
  const priorStories=Array.isArray(previous.last_rows)?previous.last_rows.map(unpack):previous.last_stories||[];
  const stories=Array.isArray(input.rows)?input.rows.map(unpack):input.stories;
  const topicLabel=input.topic_label||previous.topic_label||(topic==='custom'?'Your brief':topic);
  if(input.empty===true)return {...layout,topic,topic_label:topicLabel,no_matches:true,empty:true,stories:[],briefing_label:'No matching stories yet',stale:false,fetched_at:input.fetched_at,trmnl_state:{topic,feed_key:feedKey,prompt,seen:previous.seen||{},last_rows:[],fetched_at:input.fetched_at}};
  if(!Array.isArray(stories)||!stories.length)return {...layout,topic,topic_label:topicLabel,stories:priorStories.slice(0,count),briefing_label:'Sources unavailable',stale:true,fetched_at:previous.fetched_at||''};
  const seen={...(previous.seen||{})},first=Object.keys(seen).length===0;
  const labeled=stories.map(story=>({...story,change:first?'':!seen[story.id]?'NEW':seen[story.id]!==story.fingerprint?'UPDATED':''}));
  const changed=labeled.filter(story=>story.change);
  const selected=[...changed,...labeled.filter(story=>!story.change)].slice(0,count);
  for(const story of selected){delete seen[story.id];seen[story.id]=story.fingerprint;}
  const state={topic,topic_label:topicLabel,feed_key:feedKey,prompt,seen:Object.fromEntries(Object.entries(seen).slice(-60)),last_rows:selected.map(pack),fetched_at:input.fetched_at};
  const bytes=value=>encodeURIComponent(JSON.stringify(value)).replace(/%[A-F\d]{2}/gi,'x').length;
  while(bytes(state)>7800&&Object.keys(state.seen).length)delete state.seen[Object.keys(state.seen)[0]];
  return {...layout,topic,topic_label:topicLabel,fetched_at:input.fetched_at,stale:Boolean(input.stale),unavailable_sources:input.unavailable_sources||[],stories:selected,briefing_label:input.stale?'Last successful briefing':first?'Your first briefing':changed.length?'New since previous briefing':'No new items since previous briefing',...(input.stale?{}:{trmnl_state:state})};
}
