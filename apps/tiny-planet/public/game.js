export const TILES={'.':{name:'Meadow',symbol:'·',color:'white',css:'meadow'},'~':{name:'Water',symbol:'≈',color:'black',css:'water'},'#':{name:'Rock',symbol:'▲',color:'white',css:'rock'},s:{name:'Sapling',symbol:'♧',color:'yellow',css:'sapling'},T:{name:'Grove',symbol:'♣',color:'white',css:'grove'},B:{name:'Beacon',symbol:'⚑',color:'yellow',css:'beacon'}};
export const ACTIONS={plant:'Plant a sapling',water:'Water a sapling',gather:'Gather resources',clear:'Make a clearing',build:'Build a beacon',sail:'Sail to the next island'};
export function island(chapter=1){const maps=[['~~~~~~~~','~..s...~','~.T.#..~','~..s#..~','~...T..~','~~~~~~~~'],['~~~~~~~~','~..#s..~','~.T....~','~...#T.~','~s.....~','~~~~~~~~'],['~~~~~~~~','~.s..#.~','~...T..~','~T.#...~','~..s...~','~~~~~~~~']];return {chapter,turn:0,tiles:[...maps[(chapter-1)%3]],water:6,seeds:6,wood:2,stone:2,events:[],last_autopilot_day:null};}
export function legalActions(s,x,y){const tile=s.tiles[y]?.[x];return Object.keys(ACTIONS).filter(a=>a==='plant'?tile==='.'&&s.seeds>0:a==='water'?tile==='s'&&s.water>0:a==='gather'?['~','#','T'].includes(tile):a==='clear'?['s','T','B'].includes(tile):a==='build'?tile==='.'&&s.wood>=6&&s.stone>=4:tile==='B'&&s.tiles.join('').split('T').length-1>=8);}
// Practice only. Accepted community moves are applied by the PostgreSQL function.
export function practiceMove(state,action,x,y){if(!legalActions(state,x,y).includes(action))throw Error('Choose an available action.');let s=structuredClone(state),tile=s.tiles[y][x],message;
if(action==='plant'){s.seeds--;tile='s';message='Planted a sapling';}
if(action==='water'){s.water--;s.seeds+=2;s.wood++;tile='T';message='Grew a grove (+2 seeds, +1 wood)';}
if(action==='gather'){if(tile==='~'){s.water+=2;message='Collected 2 water';}if(tile==='T'){s.wood++;message='Gathered 1 fallen wood';}if(tile==='#'){s.stone++;message='Gathered 1 stone';}}
if(action==='clear'){if(tile==='T')s.wood++;else if(tile==='B'){s.wood+=2;s.stone++;}else s.seeds++;tile='.';message='Made a meadow clearing';}
if(action==='build'){s.wood-=6;s.stone-=4;tile='B';message='Built a beacon';}
if(action==='sail'){s={...island(state.chapter+1),turn:state.turn};message='Sailed to island '+s.chapter;}else s.tiles[y]=s.tiles[y].slice(0,x)+tile+s.tiles[y].slice(x+1);
s.turn++;s.events=[{turn:s.turn,kind:'practice',message,x,y,day:new Date().toISOString().slice(0,10),created_at:new Date().toISOString()},...state.events].slice(0,12);return s;}
