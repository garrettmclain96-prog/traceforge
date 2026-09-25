const CACHE='traceforge-v3.1';
const ASSETS=['./','./index.html','./styles-base.css','./styles-responsive.css','./styles-recovery.css','./app-core-1.js','./app-core-2.js','./app-cases-1.js','./app-cases-2.js','./app-ui-1.js','./app-ui-2a.js','./app-ui-2b.js','./app-recovery.js','./app-easter.js','./app-wire.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));});
