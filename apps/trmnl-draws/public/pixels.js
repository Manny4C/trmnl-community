export const WIDTH=800,HEIGHT=480,LIMIT=10,CANVAS_FORMAT='native-v2';
export const PALETTE=[['Paper','#ffffff'],['Black','#12131a'],['Gray','#838590'],['Charcoal','#3b3c47'],['Red','#dc3f42'],['Orange','#f28a38'],['Yellow','#f5d74c'],['Green','#4d9c61'],['Teal','#227f82'],['Sky','#70c8e7'],['Blue','#456bca'],['Navy','#293452'],['Purple','#8751ac'],['Pink','#ed95b9'],['Brown','#98664c'],['Mist','#dce0e6']];
export const protectedCell=(x,y)=>x>=608&&y>=240;
// Original native-resolution artwork. These curves are rasterized directly to palette pixels;
// every resulting coordinate is independently editable, with no enlarged drawing cells.
export function seed(){
 const cells=Array(WIDTH*HEIGHT).fill('0');
 const put=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<WIDTH&&y>=0&&y<HEIGHT&&!protectedCell(x,y))cells[y*WIDTH+x]=c;};
 const ellipse=(cx,cy,rx,ry,c)=>{for(let y=Math.max(0,Math.ceil(cy-ry));y<=Math.min(HEIGHT-1,cy+ry);y++)for(let x=Math.ceil(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y,c);};
 const polygon=(points,c)=>{const low=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1])))),high=Math.min(HEIGHT-1,Math.ceil(Math.max(...points.map(p=>p[1]))));for(let y=low;y<=high;y++){const cuts=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y))cuts.push(xi+(y-yi)*(xj-xi)/(yj-yi));}cuts.sort((a,b)=>a-b);for(let i=0;i<cuts.length;i+=2)for(let x=Math.ceil(cuts[i]);x<=cuts[i+1];x++)put(x,y,c);}};
 const curve=(points)=>{const out=[points[0]];for(let i=1;i<points.length;i+=3){const a=out.at(-1),b=points[i],c=points[i+1],d=points[i+2];for(let t=1;t<=64;t++){const u=t/64,v=1-u;out.push([v*v*v*a[0]+3*v*v*u*b[0]+3*v*u*u*c[0]+u*u*u*d[0],v*v*v*a[1]+3*v*v*u*b[1]+3*v*u*u*c[1]+u*u*u*d[1]]);}}return out;};
 const stroke=(points,r,c)=>{for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));for(let k=0;k<=n;k++)ellipse(a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,r,r,c);}};
 // Curling tail, seated body and a pointed, slightly asymmetric head.
 stroke(curve([[435,435],[570,466],[602,343],[570,257],[555,213],[578,177],[594,201]]),16,'1');
 stroke(curve([[493,431],[561,406],[582,331],[563,280]]),2,'3');
 polygon(curve([[278,240],[220,290],[218,393],[208,449],[198,478],[454,480],[457,451],[454,344],[425,278],[408,248],[366,223],[315,224],[278,240]]),'1');
 polygon(curve([[264,295],[232,338],[230,404],[228,440],[228,451],[242,453],[249,442],[249,383],[264,338],[279,311],[281,301],[273,294],[264,295]]),'3');
 polygon(curve([[233,193],[216,162],[212,88],[222,39],[252,50],[283,84],[295,100],[336,87],[376,87],[404,100],[426,76],[458,46],[478,39],[483,91],[477,159],[460,190],[462,245],[425,282],[347,287],[278,282],[228,245],[233,193]]),'1');
 polygon(curve([[230,57],[229,81],[232,115],[241,139],[253,117],[266,109],[282,109],[266,85],[243,65],[230,57]]),'3');
 polygon(curve([[468,57],[447,69],[429,91],[419,109],[438,109],[451,119],[463,139],[473,109],[474,76],[468,57]]),'3');
 stroke(curve([[238,70],[237,92],[242,111],[245,120]]),1,'2');stroke(curve([[464,70],[464,93],[459,111],[457,121]]),1,'2');
 // Fur-plane highlights and small brow tufts retain a mostly solid black silhouette.
 polygon(curve([[254,147],[279,128],[297,127],[310,131],[291,136],[270,144],[254,147]]),'3');
 polygon(curve([[388,130],[410,126],[435,136],[447,148],[423,141],[403,135],[388,130]]),'3');
 stroke(curve([[337,107],[332,121],[335,140],[341,151]]),1,'3');stroke(curve([[350,105],[358,121],[356,140],[351,150]]),1,'3');
 // Two almond-shaped gold eyes, iris rings, fine slit pupils and pin-point catchlights.
 const eye=(cx)=>{polygon(curve([[cx-37,175],[cx-19,153],[cx+15,152],[cx+37,174],[cx+19,197],[cx-18,196],[cx-37,175]]),'6');stroke(curve([[cx-33,175],[cx-16,160],[cx+13,160],[cx+32,174]]),1,'5');ellipse(cx,175,12,18,'8');ellipse(cx,175,8,18,'6');polygon([[cx,156],[cx-4,174],[cx,194],[cx+3,174]],'1');ellipse(cx-8,165,3,3,'0');put(cx+5,182,'0');};eye(289);eye(411);
 // Nose, muzzle and individual whiskers at one native pixel per line.
 ellipse(329,225,20,13,'3');ellipse(367,225,20,13,'3');polygon(curve([[338,213],[344,209],[353,209],[360,213],[356,222],[351,227],[348,227],[343,222],[339,217],[338,213]]),'D');stroke([[342,214],[355,214]],1,'F');stroke([[348,227],[348,237],[340,242],[334,240]],1,'1');stroke([[348,237],[356,242],[362,240]],1,'1');
 for(const [a,b,c,d]of [[[316,227],[274,218],[230,215],[182,221]],[[316,234],[263,233],[220,244],[177,255]],[[317,241],[272,253],[235,271],[205,290]],[[380,227],[423,216],[467,215],[511,221]],[[380,234],[430,233],[477,245],[520,255]],[[379,241],[422,252],[461,271],[494,290]]])stroke(curve([a,b,c,d]),.65,'2');
 // Front legs and paws, with restrained charcoal detail rather than enlarged blocks.
 stroke(curve([[298,300],[283,354],[286,411],[276,450]]),1.5,'3');stroke(curve([[389,300],[405,355],[401,415],[415,450]]),1.5,'3');
 ellipse(276,453,37,14,'1');ellipse(415,453,37,14,'1');for(const x of [261,274,287,401,414,427])stroke([[x,449],[x+1,458]],1,'3');
 for(let i=0;i<38;i++){const y=294+i*3,x=322+Math.round(Math.sin(i*.73)*7);stroke([[x,y],[x+6,y+3]],.6,'3');}
 for(const [x,y]of [[247,153],[246,159],[250,247],[259,255],[435,252],[445,242],[301,113],[398,111]])stroke([[x,y],[x-4,y+4]],.65,'3');
 return cells.join('');
}
export const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
export const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function computeLightness(index){if(index===0)return 1;if(index===1)return 0;const c=rgb(PALETTE[index][1]).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});const y=.2126*c[0]+.7152*c[1]+.0722*c[2],l=(y>.008856?116*Math.cbrt(y)-16:903.3*y)/100;return Math.min(.88,Math.max(.12,l));}
const LEVELS=PALETTE.map((_,i)=>computeLightness(i));
export const lightness=index=>LEVELS[index];
export function monoValue(pixels,x,y,scale=pixels.length===6000?8:1){const width=pixels.length===6000?100:WIDTH,height=pixels.length===6000?60:HEIGHT,cx=Math.min(width-1,Math.floor(x/scale)),cy=Math.min(height-1,Math.floor(y/scale)),index=parseInt(pixels[cy*width+cx],16),l=lightness(index);if(index===0)return 255;if(index===1)return 0;
 // Equal-lightness neighboring hues get a fine keyline; stable Bayer phases preserve tone.
 if((x%scale===0&&cx>0)||(y%scale===0&&cy>0)){const other=x%scale===0&&cx>0?parseInt(pixels[cy*width+cx-1],16):parseInt(pixels[(cy-1)*width+cx],16);if(other!==index&&Math.abs(lightness(other)-l)<.14)return l>.5?0:255;}
 const threshold=(BAYER[((y+index)%4)*4+((x+Math.floor(index/4))%4)]+.5)/16;return l>threshold?255:0;}
