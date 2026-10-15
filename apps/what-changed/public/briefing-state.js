export const TOPIC_NAMES = {technology:'Technology',business:'Business',world:'World',science:'Science'};
export const MAX_SAVED_AGE = 24 * 60 * 60 * 1000;
export function validBriefing(data, topic, now = Date.now()) {
  if (!data || data.topic !== topic || (!Object.hasOwn(TOPIC_NAMES, topic) && topic !== 'custom')) return false;
  const timestamp = Date.parse(data.fetched_at);
  if (!Number.isFinite(timestamp) || timestamp > now + 60000 || now - timestamp > MAX_SAVED_AGE) return false;
  if(topic==='custom' && (typeof data.feed_key!=='string'||typeof data.prompt!=='string'))return false;
  if(data.empty===true && Array.isArray(data.stories) && data.stories.length===0)return true;
  return Array.isArray(data.stories) && data.stories.length > 0 && data.stories.length <= 20 &&
    data.stories.every(s => s && ['id','fingerprint','title','snippet','source','url','published_at'].every(k => typeof s[k] === 'string') &&
      s.title.length > 0 && s.title.length <= 140 && s.snippet.length <= 420 && Number.isFinite(Date.parse(s.published_at)));
}
export function savedBriefing(storage, topic, now = Date.now()) {
  try {
    const data = JSON.parse(storage.getItem('what-changed:last:'+topic));
    return validBriefing(data, data?.topic, now) && (data.feed_key||data.topic)===topic ? {...data, stale:true, notice:'Refresh unavailable. Showing your last saved briefing.'} : null;
  } catch { return null; }
}
export function saveBriefing(storage, data) {
  if (data.stale || data.empty || !validBriefing(data, data.topic)) return;
  try { storage.setItem('what-changed:last:'+(data.feed_key||data.topic), JSON.stringify(data)); } catch {}
}
export function selectEdition(stories, history, count = 8) {
  const first = !Object.keys(history).length;
  const changes = stories.map(s => ({...s, status:first?'':!Object.hasOwn(history,s.id)?'NEW':history[s.id]!==s.fingerprint?'UPDATED':''}));
  const selected = [...changes.filter(s=>s.status), ...changes.filter(s=>!s.status)].slice(0,Math.max(1,Math.min(20,Number(count)||8)));
  return {first, selected, changedCount:selected.filter(s=>s.status).length};
}
