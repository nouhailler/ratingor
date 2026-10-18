import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await walk(p));else if(e.name!=='sw.js')out.push(p)}return out;}
const paths=await walk('dist');const files=paths.map(p=>'./'+p.slice(5));const hash=createHash('sha256');for(const p of paths)hash.update(await readFile(p));hash.update(await readFile(new URL(import.meta.url)));const version=hash.digest('hex').slice(0,12);
await writeFile('dist/sw.js',`const PREFIX='ratingor-'+self.registration.scope+'-';const CACHE=PREFIX+'${version}';const FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||!u.href.startsWith(self.registration.scope))return;e.respondWith(caches.match(e.request,{ignoreVary:true}).then(cached=>cached||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match(new URL('index.html',self.registration.scope)):Response.error())))});`);
