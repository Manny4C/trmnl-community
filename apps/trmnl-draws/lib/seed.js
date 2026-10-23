import{readFileSync}from'node:fs';
const pixels=readFileSync(new URL('../public/cat-photo-pixels.txt',import.meta.url),'utf8');
if(pixels.length!==384000||/[^0-9A-F]/.test(pixels))throw Error('Invalid generated-photo seed');
export const seed=()=>pixels;
