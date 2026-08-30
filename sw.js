const CACHE_NAME="akatsuky-v5-5";
const PRECACHE=["./","./index.html","./admin.html","./style.css","./app.js","./admin.js","./firebase-config.js","./manifest.json","./logo.png","./troco.js","./impressao-troco.js"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response && response.ok){
      const copy=response.clone();
      caches.open(CACHE_NAME).then(c=>c.put(event.request,copy));
    }
    return response;
  }).catch(()=>caches.match(event.request)));
});