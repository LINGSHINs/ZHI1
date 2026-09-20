const VERSION='shizhi-v1.0.0';
const CACHE=VERSION+'-'+new URL(self.registration.scope).pathname;
const FILES=['./','./index.html','./styles.css','./questions.js','./engine.js','./themes.js','./app.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('shizhi-')&&k.endsWith('-'+new URL(self.registration.scope).pathname)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return response;}).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));});
