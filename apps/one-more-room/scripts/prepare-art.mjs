import {readFile,writeFile,copyFile,mkdir,access} from 'node:fs/promises';
import sharp from 'sharp';
const manifest=JSON.parse(await readFile('assets/imagegen-v2.json','utf8'));
await mkdir('assets/originals',{recursive:true});await mkdir('public/art',{recursive:true});
for(const asset of manifest.assets){
  const original='assets/originals/'+asset.key+'-v2.png';
  try{await access(original);}catch{await copyFile(asset.source_path,original);}
  const image=sharp(original).resize({width:1200,withoutEnlargement:true});
  await image.clone().webp({quality:88}).toFile('public/art/'+asset.key+'-v2.webp');
  await image.clone().jpeg({quality:88,mozjpeg:true}).toFile('public/art/'+asset.key+'-v2.jpg');
  asset.original=original;asset.web='public/art/'+asset.key+'-v2.webp';asset.device='public/art/'+asset.key+'-v2.jpg';delete asset.source_path;
}
await writeFile('assets/imagegen-v2.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Preserved '+manifest.assets.length+' ImageGen originals; prepared faithful WebP/JPEG delivery copies.');
