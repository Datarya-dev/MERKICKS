import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const {products}=JSON.parse(await readFile('data/catalog.json','utf8'));
const scenes=JSON.parse(await readFile('data/scenes.json','utf8'));
assert.equal(new Set(products.map(p=>p.slug)).size,products.length,'Unique slugs');
let count=0;const seen=new Set();
for(const p of products){
 assert(p.images.length>0);const html=await readFile(`dist/producto/${p.slug}/index.html`,'utf8');
 assert(!/drive\.google\.com|googleusercontent\.com/.test(html));
 assert(html.includes('<title>'));assert(html.includes('og:description'));
 const wa=html.match(/href="(https:\/\/wa.me\/[^\"]+)"[^>]*[^]*?Consultar por WhatsApp/);
 assert(wa,p.slug+' WhatsApp link');const url=new URL(wa[1]);assert.equal(url.pathname,'/5213314369060');
 assert.equal(url.searchParams.get('text'),`Hola, vi los ${p.name} en la página de MERKICKS. ¿Me puedes compartir precio y tallas disponibles?`);
 for(const img of p.images){assert(!seen.has(img.id),'Duplicate image '+img.id);seen.add(img.id);assert(Math.min(img.width,img.height)>=800);for(const v of img.variants)assert((await stat('dist'+v.src)).size>0);count++;}
}
const home=await readFile('dist/index.html','utf8');assert(home.includes('https://chat.whatsapp.com/IigjkmqWznjDjCfbR5d9fN'));assert.equal(scenes.length,6);
for(const s of scenes)assert(products.find(p=>p.slug===s.slug)?.featured);
assert(scenes.some(s=>s.slug==='golden-goose-piel-con-firma'));assert(scenes.some(s=>s.slug==='jordan-travis-low-negro-blanco-azul-crema'));
console.log(`PASS: ${products.length} routes, ${count} unique photos, responsive assets, metadata, 6 highlights, exact WhatsApp messages and group URL.`);
