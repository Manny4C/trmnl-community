export const TOPIC_NAMES = {technology:'Technology',business:'Business',world:'World',science:'Science'};
export const MAX_SAVED_AGE = 24 * 60 * 60 * 1000;
export function validBriefing(data, topic, now = Date.now()) {
  if (!data || data.topic !== topic || !Object.hasOwn(TOPIC_NAMES, topic)) return false;
  const timestamp = Date.parse(data.fetched_at);
  if (!Number.isFinite(timestamp) || timestamp > now + 60000 || now - timestamp > MAX_SAVED_AGE) return false;
  return Array.isArray(data.stories) && data.stories.length > 0 && data.stories.length <= 8 &&
    data.stories.every(s => s && ['id','fingerprint','title','snippet','source','url','published_at'].every(k => typeof s[k] === 'string') &&
      s.title.length > 0 && s.title.length <= 140 && s.snippet.length <= 150 && Number.isFinite(Date.parse(s.published_at)));
}
export function savedBriefing(storage, topic, now = Date.now()) {
  try {
    const data = JSON.parse(storage.getItem('what-changed:last:'+topic));
    return validBriefing(data, topic, now) ? {...data, stale:true, notice:'Refresh unavailable. Showing your last saved briefing.'} : null;
  } catch { return null; }
}
export function saveBriefing(storage, data) {
  if (data.stale || !validBriefing(data, data.topic)) return;
  try { storage.setItem('what-changed:last:'+data.topic, JSON.stringify(data)); } catch {}
}
export function selectEdition(stories, history) {
  const first = !Object.keys(history).length;
  const changes = stories.map(s => ({...s, status:first?'':!Object.hasOwn(history,s.id)?'NEW':history[s.id]!==s.fingerprint?'UPDATED':''}));
  const selected = [...changes.filter(s=>s.status), ...changes.filter(s=>!s.status)].slice(0,5);
  return {first, selected, changedCount:selected.filter(s=>s.status).length};
}
