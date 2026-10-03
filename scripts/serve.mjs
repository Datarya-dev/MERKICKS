import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 try {let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(root,'.'+p);if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403).end();return;}
 try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');}catch{}
 const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes);
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(resolve(root,'404.html')).catch(()=>Buffer.from('404')));}
}).listen(4173,'127.0.0.1',()=>console.log('MERKICKS local: http://127.0.0.1:4173'));
