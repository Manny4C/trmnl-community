export function legacySeed(){
 const cells=Array(100*60).fill('0'),put=(x,y,c)=>{if(x>=0&&x<100&&y>=0&&y<60&&!(x>=76&&y>=30))cells[y*100+x]=c;};
 const ellipse=(cx,cy,rx,ry,c)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y,c);};
 const polygon=(points,c)=>{for(let y=0;y<60;y++)for(let x=0;x<100;x++){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;}if(inside)put(x,y,c);}};
 const stroke=(a,b,r,c)=>{const n=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));for(let t=0;t<=n;t++)ellipse(a[0]+(b[0]-a[0])*t/n,a[1]+(b[1]-a[1])*t/n,r,r,c);};
 ellipse(42,44,19,14,'1');for(const [a,b] of [[ [55,51],[66,48] ],[[66,48],[70,39]],[[70,39],[69,29]],[[69,29],[65,26]]])stroke(a,b,3,'1');
 polygon([[22,30],[22,7],[34,15],[49,15],[62,7],[62,30],[56,37],[28,37]],'1');
 polygon([[25,12],[25,22],[32,18]],'3');polygon([[59,12],[59,22],[52,18]],'3');
 ellipse(32,25,5,3,'6');ellipse(52,25,5,3,'6');for(let y=23;y<=27;y++){put(32,y,'1');put(52,y,'1');}put(30,24,'0');put(50,24,'0');
 polygon([[39,30],[45,30],[42,33]],'D');for(let x=26;x<=36;x++)put(x,57,'1');for(let x=47;x<=58;x++)put(x,57,'1');
 for(let x=14;x<=25;x++){put(x,30,'2');put(x,33,'2');}for(let x=58;x<=70;x++){put(x,30,'2');put(x,33,'2');}
 return cells.join('');
}
