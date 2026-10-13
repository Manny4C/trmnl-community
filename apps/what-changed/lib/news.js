import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'node:crypto';

export const TOPICS = ['technology', 'business', 'world', 'science'];
const FEEDS = {
  technology: [
    ['BBC Technology', 'https://feeds.bbci.co.uk/news/technology/rss.xml'],
    ['Ars Technica', 'https://feeds.arstechnica.com/arstechnica/index'],
    ['Hacker News', 'https://hnrss.org/frontpage']
  ],
  business: [['BBC Business', 'https://feeds.bbci.co.uk/news/business/rss.xml']],
  world: [['BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml']],
  science: [['BBC Science', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml']]
};
const parser = new XMLParser({ignoreAttributes: false, processEntities: true});
const cache = new Map();
export function cleanText(value = '') {
  const s = typeof value === 'object' ? value['#text'] || '' : String(value);
  return s.replace(/<[^>]*>/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Math.min(Number(n), 0x10ffff)))
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}
export function canonicalUrl(value) {
  try {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol)) return null;
    u.hash = '';
    for (const key of [...u.searchParams.keys()]) if (/^(utm_|at_medium$|at_campaign$|fbclid|gclid|ref$)/i.test(key)) u.searchParams.delete(key);
    const normalized=u.toString();
    return normalized.length<=1200?normalized:null;
  } catch { return null; }
}
function words(title) {
  return new Set(title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(x => x.length > 3));
}
export function deduplicate(items) {
  const result = [];
  for (const item of items) {
    const current = words(item.title);
    const duplicate = result.some(other => {
      if (other.url === item.url || other.title.toLowerCase() === item.title.toLowerCase()) return true;
      const prior = words(other.title);
      const overlap = [...current].filter(x => prior.has(x)).length;
      return current.size >= 5 && prior.size >= 5 && overlap / new Set([...current, ...prior]).size >= 0.82;
    });
    if (!duplicate) result.push(item);
  }
  return result;
}
export function parseFeed(xml, source, now = Date.now()) {
  const data = parser.parse(xml);
  const entries = data.rss?.channel?.item || data.feed?.entry || [];
  return (Array.isArray(entries) ? entries : [entries]).flatMap(entry => {
    const title = cleanText(entry.title).slice(0, 140);
    let link = entry.link;
    if (Array.isArray(link)) link = link.find(x => x['@_rel'] === 'alternate') || link[0];
    if (typeof link === 'object') link = link['@_href'];
    const url = canonicalUrl(link);
    const time = Date.parse(entry.pubDate || entry.published || entry.updated || '');
    if (!title || !url || !Number.isFinite(time) || time > now + 3600000 || time < now - 7 * 86400000) return [];
    let snippet = source === 'Hacker News' ? 'A story being discussed by the Hacker News community.' : cleanText(entry.description || entry.summary || '').slice(0, 150);
    const id = createHash('sha256').update(url).digest('hex').slice(0, 12);
    const fingerprint = createHash('sha256').update(title + snippet).digest('hex').slice(0, 12);
    // Public TRMNL Recipes require a family-friendly default.
    if (/\b(?:fuck\w*|shit|cunt|motherfuck\w*|rape|raped|sexual assault|behead\w*|gore|porn\w*|suicide|torture)\b/i.test(title + ' ' + snippet)) return [];
    if (source === 'Hacker News' && /\b(?:is hiring|we are hiring|we're hiring)\b/i.test(title)) return [];
    return [{id, fingerprint, title, snippet, url, source, published_at: new Date(time).toISOString()}];
  });
}
export async function getBriefing(topic, {fetcher = fetch, now = Date.now()} = {}) {
  if (!TOPICS.includes(topic)) throw new RangeError('Choose technology, business, world or science.');
  const cached = cache.get(topic);
  if (cached && now - cached.at < 300000) return cached.body;
  const responses = await Promise.all(FEEDS[topic].map(async ([source, url]) => {
    try {
      const response = await fetcher(url, {signal: AbortSignal.timeout(8000), headers: {'User-Agent': 'WhatChanged-TRMNL/1.0'}});
      if (!response.ok) throw new Error('Source unavailable');
      const xml = await response.text();
      if (xml.length > 1500000) throw new Error('Feed too large');
      return {source, items: parseFeed(xml, source, now), ok: true};
    } catch { return {source, items: [], ok: false}; }
  }));
  const items = deduplicate(responses.flatMap(x => x.items).sort((a,b) => Date.parse(b.published_at) - Date.parse(a.published_at)));
  if (!items.length) {
    if (cached && now - cached.at < 86400000) return {...cached.body, stale: true, notice: 'Sources unavailable. Showing the last successful briefing.'};
    throw new Error('News sources are unavailable. Please try again later.');
  }
  // Limit one source's dominance while preserving an eight-story compact payload.
  const counts = {};
  const diverse = items.filter(item => { counts[item.source] = (counts[item.source] || 0) + 1; return counts[item.source] <= 3; });
  const chosen = [...diverse, ...items.filter(item => !diverse.includes(item))].slice(0, 8);
  const body = {topic, fetched_at: new Date(now).toISOString(), stale: false, unavailable_sources: responses.filter(x => !x.ok).map(x => x.source), stories: chosen};
  while (Buffer.byteLength(JSON.stringify(body)) > 4800 && body.stories.length > 1) body.stories.pop();
  cache.set(topic, {at: now, body});
  return body;
}

let sourcePool=null;
export async function getSourcePool({fetcher=fetch,now=Date.now()}={}) {
  if(sourcePool && now-sourcePool.at<900000)return sourcePool.body;
  const feeds=[...new Map(Object.values(FEEDS).flat().map(f=>[f[1],f])).values()];
  const replies=await Promise.all(feeds.map(async ([source,url])=>{
    try {const r=await fetcher(url,{signal:AbortSignal.timeout(8000),headers:{'User-Agent':'TheDailyTRMNL/2.0'}});if(!r.ok)throw Error();const xml=await r.text();if(xml.length>1500000)throw Error();return {source,items:parseFeed(xml,source,now),ok:true};}
    catch {return {source,items:[],ok:false};}
  }));
  const stories=deduplicate(replies.flatMap(r=>r.items));
  if(!stories.length) {
    if(sourcePool&&now-sourcePool.at<86400000)return {...sourcePool.body,stale:true};
    throw new Error('Sources unavailable');
  }
  const body={stories,stale:false,fetched_at:new Date(now).toISOString(),unavailable_sources:replies.filter(r=>!r.ok).map(r=>r.source)};
  sourcePool={at:now,body};return body;
}
