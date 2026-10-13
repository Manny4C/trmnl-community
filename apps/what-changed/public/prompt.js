export const PRESETS = [
  {id:'ai_technology',name:'AI & technology',text:'AI and technology',terms:['artificial intelligence','technology','software','OpenAI','Anthropic'],words:['ai','artificial intelligence','technology','software','openai','anthropic','llm']},
  {id:'startups',name:'Startups',text:'startups',terms:['startup','startups','venture capital'],words:['startup','startups','venture','funding','founder']},
  {id:'y_combinator',name:'Y Combinator',text:'Y Combinator',terms:['Y Combinator'],words:['y combinator','yc']},
  {id:'markets_stocks',name:'Markets & stocks',text:'markets and stocks',terms:['stock market','stocks','earnings'],words:['stock','stocks','markets','earnings','nasdaq','s&p']},
  {id:'video_games',name:'Video games',text:'video games',terms:['video games','Nintendo','PlayStation','Xbox','Steam'],words:['gaming','games','game','nintendo','playstation','xbox','steam']},
  {id:'world_affairs',name:'World affairs',text:'world affairs',terms:['geopolitics','diplomacy','election'],words:['world affairs','geopolitics','diplomacy','election','government','president','minister']},
  {id:'science_space',name:'Science & space',text:'science and space',terms:['science','astronomy','space exploration'],words:['science','scientific','space','nasa','astronomy','research','scientists']},
  {id:'climate_energy',name:'Climate & energy',text:'climate and energy',terms:['climate','renewable energy','solar power'],words:['climate','energy','solar','renewable','electric','warming']},
  {id:'business_economy',name:'Business & economy',text:'business and the economy',terms:['economy','business','inflation'],words:['business','economy','economic','inflation','trade','bank','company']},
  {id:'local_news',name:'Local news',text:'local news',terms:[],words:[]}
];
export const DEFAULT_PROMPT = 'Find recent news about AI and technology.';
export function normalizePrompt(value) {return String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();}
export function buildPrompt(preferences={}, additions='', location='') {
  const included=PRESETS.filter(p=>preferences[p.id]==='include').map(p=>p.id==='local_news'?(location.trim()?`local news in ${location.trim()}`:'local news'):p.text);
  const excluded=PRESETS.filter(p=>preferences[p.id]==='exclude').map(p=>p.id==='local_news'?(location.trim()?`local news in ${location.trim()}`:'local news'):p.text);
  const pieces=[];
  if(included.length)pieces.push('Find recent news about '+included.join(', ')+'.');
  if(additions.trim())pieces.push(additions.trim());
  if(excluded.length)pieces.push('Exclude '+excluded.join(', ')+'.');
  return normalizePrompt(pieces.join(' '));
}
const ALIASES={'artificial intelligence':['artificial intelligence','ai','llm','large language model'],celebrity:['celebrity','celebrities'],crypto:['crypto','cryptocurrency','bitcoin','ethereum','blockchain','nft','nfts']};
const STOP = new Set('find show give me my the a an i am interested in news recent latest headlines stories articles about follow include also and or on for from with please updates update want would like to more less focus mainly especially coverage events developments new daily brief briefing useful only keep things happening today this week local well is that be'.split(' '));
const clean = s=>s.replace(/[^\p{L}\p{N}\s'-]/gu,' ').replace(/\s+/g,' ').trim();
function extract(text) {
  const found=[],matchedPresets=[];
  let remaining=text;
  const quoted=[...remaining.matchAll(/"([^"\n]{3,80})"/g)].map(m=>clean(m[1]));
  remaining=remaining.replace(/"[^"\n]*"/g,' ');
  found.push(...quoted);
  for(const preset of PRESETS.filter(p=>p.id!=='local_news')) {
    const label=preset.text.replace(/\band\b/g,'(?:and|&)').replace(/\s+/g,'\\s+');
    const regex=new RegExp('\\b'+label+'\\b','ig');
    if(regex.test(remaining)) {matchedPresets.push(preset);found.push(...preset.terms);remaining=remaining.replace(regex,' ');}
  }
  const phrases=[...remaining.matchAll(/"([^"\n]{3,80})"/g)].map(m=>clean(m[1]));
  remaining=remaining.replace(/"[^"\n]*"/g,' ');
  found.push(...phrases);
  // Names and places retain their phrase; ordinary interests become search keywords.
  for(const part of remaining.split(/[,;.\n]|\s+(?:and|or)\s+/i)) {
    const words=clean(part).split(/\s+/).filter(w=>w.length>=2 && !STOP.has(w.toLowerCase()));
    for(let i=0;i<words.length;i++) {
      const word=words[i];
      if(/^ai$/i.test(word)){found.push('artificial intelligence');continue;}
      if(/^yc$/i.test(word)){found.push('Y Combinator');continue;}
      if(/^[A-Z]/.test(word) && words[i+1] && /^[A-Z]/.test(words[i+1])) {found.push(word+' '+words[++i]);continue;}
      if(word.length>=3)found.push(word);
    }
  }
  return {terms:[...new Set(found.map(x=>x.toLowerCase()))].filter(x=>x.length>=3).slice(0,24),presets:matchedPresets};
}
export function compilePrompt(value) {
  const prompt=normalizePrompt(value);
  if(!prompt)throw new RangeError('Choose an interest or write a news prompt.');
  if(prompt.length>600)throw new RangeError('Keep your news prompt under 600 characters.');
  const pieces=prompt.split(/\b(?:exclude|avoid|without|excluding|except|skip|do not include|don't include|leave out)\b/i);
  const positive=extract(pieces[0]),negative=extract(pieces.slice(1).join(' '));
  const include=positive.terms,exclude=negative.terms;
  if(!include.length)throw new RangeError('Add a topic, company, or place to follow.');
  const quote=t=>'"'+t.replace(/["\\]/g,'')+'"';
  const expand=(terms,presets)=>[...new Set([...terms.flatMap(t=>ALIASES[t]||[t]),...presets.flatMap(p=>p.words)])];
  const query=(include.length===1?quote(include[0]):'('+include.map(quote).join(' OR ')+')')+
    exclude.map(t=>' -'+quote(t)).join('')+' sourcelang:english';
  const matched=positive.presets;
  const includeGroups=[...matched.map(p=>[...p.terms.map(t=>t.toLowerCase()),...p.words]),...include.filter(t=>!matched.some(p=>p.terms.some(x=>x.toLowerCase()===t))).map(t=>ALIASES[t]||[t])];
  return {prompt,include,exclude,includeGroups,includeWords:expand(include,positive.presets),excludeWords:expand(exclude,negative.presets),query};
}
export function containsTerm(text,term) {
  const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp('(?:^|[^a-z0-9])'+escaped+'(?:$|[^a-z0-9])','i').test(text);
}
export function matchScore(story,compiled) {
  const text=(story.title+' '+story.snippet).toLowerCase();
  if((compiled.excludeWords||compiled.exclude).some(term=>containsTerm(text,term)))return -1;
  if(compiled.includeGroups)return compiled.includeGroups.reduce((score,group)=>score+(group.some(term=>containsTerm(text,term))?1:0),0);
  return (compiled.includeWords||compiled.include).reduce((score,term)=>score+(containsTerm(text,term)?1:0),0);
}
