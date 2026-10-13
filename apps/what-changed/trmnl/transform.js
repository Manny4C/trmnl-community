function run(input) {
  const saved = input.trmnl?.state || {};
  const fields=input.trmnl?.plugin_settings?.custom_fields_values || {};
  const prompt=String(input.prompt || fields.news_prompt || '').normalize('NFKC').replace(/\s+/g,' ').trim();
  const topic=input.topic || (prompt?'custom':fields.topic || 'technology');
  const feedKey=input.feed_key || (topic==='custom' && saved.prompt===prompt ? saved.feed_key : topic);
  const previous = (saved.feed_key || saved.topic) === feedKey && (!prompt || !saved.prompt || saved.prompt===prompt) ? saved : {};
  if(input.empty===true){return {topic,empty:true,topic_label:'Your brief',stories:[],briefing_label:'No matching stories yet',stale:false,fetched_at:input.fetched_at,trmnl_state:{topic,feed_key:feedKey,prompt,seen:previous.seen||{},last_stories:[],fetched_at:input.fetched_at}};}
  if (!Array.isArray(input.stories) || !input.stories.length) {
    return {topic, stories: previous.last_stories || [], briefing_label: 'Sources unavailable', stale: true, fetched_at: previous.fetched_at || ''};
  }
  const seen = {...(previous.seen || {})};
  const first = Object.keys(seen).length === 0;
  const stories = input.stories.map(story => ({...story, change: first ? '' : !seen[story.id] ? 'NEW' : seen[story.id] !== story.fingerprint ? 'UPDATED' : ''}));
  const changed = stories.filter(story => story.change);
  const selected = [...changed, ...stories.filter(story => !story.change)].slice(0, 6);
  const width = Number(input.trmnl?.device?.width || 800);
  const height = Number(input.trmnl?.device?.height || 480);
  const displayLimit = height >= 1000 && height > width ? 6 : width >= 1000 ? 4 : 3;
  // Keep extra candidates for larger previews; remember the actual device's edition.
  for (const story of selected.slice(0, displayLimit)) {delete seen[story.id]; seen[story.id] = story.fingerprint;}
  const state = {topic, feed_key:feedKey, prompt, seen: Object.fromEntries(Object.entries(seen).slice(-60)), last_stories: selected, fetched_at: input.fetched_at};
  return {
    topic, topic_label:input.topic_label || (topic==='custom'?'Your brief':topic), fetched_at: input.fetched_at, stale: Boolean(input.stale), unavailable_sources: input.unavailable_sources || [],
    stories: selected,
    briefing_label: input.stale ? 'Last successful briefing' : first ? 'Your first briefing' : changed.length ? 'New since previous briefing' : 'No new items since previous briefing',
    ...(input.stale ? {} : {trmnl_state: state})
  };
}
