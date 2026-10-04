import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';

const config=JSON.parse(await readFile('site.config.json','utf8'));
const {products}=JSON.parse(await readFile('data/catalog.json','utf8'));
const scenes=JSON.parse(await readFile('data/scenes.json','utf8'));
const base='/'+String(config.basePath||'').split('/').filter(Boolean).join('/')+'/';
const origin=(process.env.SITE_ORIGIN||config.origin).replace(/\/$/,'');
const siteUrl=path=>origin+'/'+path.replace(/^\//,'');
const siteFile=path=>join('dist',path.slice(base.length).split(/[?#]/)[0]);

async function checkPath(path){
  assert(path.startsWith(base),`Outside ${base}: ${path}`);
  const pathname=path.split(/[?#]/)[0];
  const file=siteFile(pathname);
  const target=pathname.endsWith('/')?join(file,'index.html'):file;
  assert((await stat(target)).size>0,`Missing ${path}`);
}

async function checkHtml(html,path,indexable=true){
  assert(html.includes('<html lang="es-MX">'));
  assert(html.includes('<title>')&&html.includes('og:description'));
  assert(!/drive\.google\.com|googleusercontent\.com/.test(html));
  if(indexable){
    assert(html.includes(`rel="canonical" href="${siteUrl(path)}"`),`Canonical ${path}`);
    assert(html.includes(`property="og:url" content="${siteUrl(path)}"`),`Open Graph URL ${path}`);
  }else{
    assert(html.includes('name="robots" content="noindex"'));
    assert(!html.includes('rel="canonical"'));
  }
  for(const [,url] of html.matchAll(/\b(?:href|src|data-src)="([^"]+)"/g)){
    if(url.startsWith('/'))await checkPath(url);
  }
  for(const [,srcset] of html.matchAll(/\bsrcset="([^"]+)"/g)){
    for(const item of srcset.split(','))await checkPath(item.trim().split(/\s+/)[0]);
  }
  for(const [,image] of html.matchAll(/property="og:image" content="([^"]+)"/g)){
    assert(image.startsWith(origin+'/'),`Open Graph image ${path}`);
    await checkPath(new URL(image).pathname);
  }
}

assert.equal(base,'/MERKICKS/');
assert.equal(new URL(origin).pathname,base.slice(0,-1));
assert.equal(new Set(products.map(p=>p.slug)).size,products.length);
const home=await readFile('dist/index.html','utf8');
await checkHtml(home,'/');
assert(home.includes(config.groupUrl));
assert.equal(scenes.length,6);
for(const scene of scenes){
  assert(products.find(p=>p.slug===scene.slug)?.featured);
  assert(home.includes(`/MERKICKS/products/${scene.imageId}-1440.webp`));
}
const imageIds=new Set();
for(const product of products){
  assert(product.images.length>0);
  const path=`/producto/${product.slug}/`;
  const html=await readFile(`dist/producto/${product.slug}/index.html`,'utf8');
  await checkHtml(html,path);
  const href=html.match(/href="(https:\/\/wa.me\/[^"]+)"[^>]*>Consultar por WhatsApp<\/a>/)?.[1];
  assert(href,`WhatsApp ${product.slug}`);
  const whatsapp=new URL(href);
  assert.equal(whatsapp.pathname,'/5213314369060');
  assert.equal(whatsapp.searchParams.get('text'),`Hola, vi los ${product.name} en la página de MERKICKS. ¿Me puedes compartir precio y tallas disponibles?`);
  for(const image of product.images){
    assert(!imageIds.has(image.id));imageIds.add(image.id);
    assert(Math.min(image.width,image.height)>=800);
    for(const variant of image.variants)await checkPath(base+variant.src.replace(/^\//,''));
  }
}
const notFound=await readFile('dist/404.html','utf8');
await checkHtml(notFound,'/',false);
const sitemap=await readFile('dist/sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert.equal(urls.length,products.length+1);
assert.equal(urls[0],siteUrl('/'));
for(const product of products)assert(urls.includes(siteUrl(`/producto/${product.slug}/`)));
const robots=await readFile('dist/robots.txt','utf8');
assert(robots.includes(`Sitemap: ${siteUrl('/sitemap.xml')}`));
await checkPath(base+'styles.css');await checkPath(base+'app.js');await checkPath(base+'brand/logo.svg');
console.log(`PASS: ${products.length} product routes, ${imageIds.size} photos, ${urls.length} sitemap URLs, base path, assets, metadata, 404 and WhatsApp.`);
