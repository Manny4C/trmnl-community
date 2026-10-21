export const WIDTH=100,HEIGHT=60,LIMIT=10;
export const PALETTE=[['Paper','#ffffff'],['Black','#12131a'],['Gray','#838590'],['Charcoal','#3b3c47'],['Red','#dc3f42'],['Orange','#f28a38'],['Yellow','#f5d74c'],['Green','#4d9c61'],['Teal','#227f82'],['Sky','#70c8e7'],['Blue','#456bca'],['Navy','#293452'],['Purple','#8751ac'],['Pink','#ed95b9'],['Brown','#98664c'],['Mist','#dce0e6']];
export const protectedCell=(x,y)=>x>=76&&y>=30;
export function seed(){
 const cells=Array(WIDTH*HEIGHT).fill('0'),put=(x,y,c)=>{if(x>=0&&x<WIDTH&&y>=0&&y<HEIGHT&&!protectedCell(x,y))cells[y*WIDTH+x]=c;};
 const ellipse=(cx,cy,rx,ry,c)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y,c);};
 const polygon=(points,c)=>{for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;}if(inside)put(x,y,c);}};
 const stroke=(a,b,r,c)=>{const n=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));for(let t=0;t<=n;t++)ellipse(a[0]+(b[0]-a[0])*t/n,a[1]+(b[1]-a[1])*t/n,r,r,c);};
 ellipse(42,44,19,14,'1');for(const [a,b] of [[ [55,51],[66,48] ],[[66,48],[70,39]],[[70,39],[69,29]],[[69,29],[65,26]]])stroke(a,b,3,'1');
 polygon([[22,30],[22,7],[34,15],[49,15],[62,7],[62,30],[56,37],[28,37]],'1');
 polygon([[25,12],[25,22],[32,18]],'3');polygon([[59,12],[59,22],[52,18]],'3');
 ellipse(32,25,5,3,'6');ellipse(52,25,5,3,'6');for(let y=23;y<=27;y++){put(32,y,'1');put(52,y,'1');}put(30,24,'0');put(50,24,'0');
 polygon([[39,30],[45,30],[42,33]],'D');for(let x=26;x<=36;x++)put(x,57,'1');for(let x=47;x<=58;x++)put(x,57,'1');
 for(let x=14;x<=25;x++){put(x,30,'2');put(x,33,'2');}for(let x=58;x<=70;x++){put(x,30,'2');put(x,33,'2');}
 return cells.join('');
}
export const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
export const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function computeLightness(index){if(index===0)return 1;if(index===1)return 0;const c=rgb(PALETTE[index][1]).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});const y=.2126*c[0]+.7152*c[1]+.0722*c[2],l=(y>.008856?116*Math.cbrt(y)-16:903.3*y)/100;return Math.min(.88,Math.max(.12,l));}
const LEVELS=PALETTE.map((_,i)=>computeLightness(i));
export const lightness=index=>LEVELS[index];
export function monoValue(pixels,x,y,scale=8){const cx=Math.min(WIDTH-1,Math.floor(x/scale)),cy=Math.min(HEIGHT-1,Math.floor(y/scale)),index=parseInt(pixels[cy*WIDTH+cx],16),l=lightness(index);if(index===0)return 255;if(index===1)return 0;
 // Equal-lightness neighboring hues get a fine keyline; stable Bayer phases preserve tone.
 if((x%scale===0&&cx>0)||(y%scale===0&&cy>0)){const other=x%scale===0&&cx>0?parseInt(pixels[cy*WIDTH+cx-1],16):parseInt(pixels[(cy-1)*WIDTH+cx],16);if(other!==index&&Math.abs(lightness(other)-l)<.14)return l>.5?0:255;}
 const threshold=(BAYER[((y+index)%4)*4+((x+Math.floor(index/4))%4)]+.5)/16;return l>threshold?255:0;}
