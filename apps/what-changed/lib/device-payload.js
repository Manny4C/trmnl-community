export function headlineCount(value=8){
 const count=Number(value);if(!Number.isInteger(count)||count<1||count>20)throw new RangeError('Choose between 1 and 20 headlines.');return count;
}
function excerpt(text,max){if(max<=0)return '';let result='';text=String(text||'');if(Buffer.byteLength(text)<=max)return text;for(const c of text){if(Buffer.byteLength(result+c+'…')>max)break;result+=c;}return result.trimEnd()+'…';}
export function devicePayload(body,count){
 const detail=count<=3?420:count<=5?160:count<=8?60:0;
 const result={topic:body.topic,topic_label:body.topic_label,feed_key:body.feed_key,prompt:body.prompt,headline_count:count,fetched_at:body.fetched_at,stale:body.stale,empty:body.empty,unavailable_sources:body.unavailable_sources||[],rows:body.stories.slice(0,count).map(s=>[s.id,s.fingerprint,s.title,s.snippet,s.source,s.published_at.slice(0,10),s.time_kind==='indexed'?1:0])};
 // Tuple rows omit URLs and repeated property names; links remain in the website's rich feed.
 for(const limit of [140,110,90,70]){
  result.rows=result.rows.map(row=>[row[0],row[1],excerpt(row[2],limit),excerpt(row[3],detail),excerpt(row[4],24),row[5],row[6]]);
  if(Buffer.byteLength(JSON.stringify(result))<=4700)return result;
 }
 result.rows=result.rows.map(row=>[row[0],row[1],excerpt(row[2],55),'',excerpt(row[4],18),row[5],row[6]]);
 return result;
}
