import {getBriefing, TOPICS} from '../lib/news.js';
export default async function handler(req, res) {
  if (req.method !== 'GET') {res.setHeader('Allow', 'GET'); return res.status(405).json({error: 'Method not allowed'});}
  const topic = new URL(req.url, 'https://what-changed.local').searchParams.get('topic') || 'technology';
  if (!TOPICS.includes(topic)) return res.status(400).json({error: 'Unknown topic', topics: TOPICS});
  try {
    const body = await getBriefing(topic);
    res.setHeader('Cache-Control', body.stale ? 'public, max-age=0, s-maxage=60' : 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json(body);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({error: 'News sources are unavailable. Please try again later.'});
  }
}
