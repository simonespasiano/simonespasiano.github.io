// Tiene l'app disponibile senza rete: pagina e icone dalla cache, riquadri di mappa dalla cache della mappa offline.
const APP="chierego-app-v1", TILES="chierego-tiles-v1";
const SHELL=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(self.clients.claim())});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  if(u.hostname.endsWith("tile.opentopomap.org")){
    e.respondWith(caches.open(TILES).then(async c=>{const hit=await c.match(e.request.url);if(hit)return hit;
      const r=await fetch(e.request);if(r.ok||r.type==="opaque")c.put(e.request.url,r.clone());return r}));return}
  if(u.origin===location.origin){
    // rete prima (così gli aggiornamenti arrivano), cache se offline
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(APP).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("index.html"))))}
});
