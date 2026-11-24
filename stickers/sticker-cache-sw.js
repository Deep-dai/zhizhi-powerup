// Cache only public, content-addressed sticker pictures. Account responses,
// learning progress, pages and scripts always use their normal network path.
const CACHE='powerup-sticker-frames-v1',PREFIX='powerup-sticker-frames-',MAX_IMAGES=80;
const frameRoot=new URL('assets/frames/',self.location.href),pending=new Map();
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
async function picture(request){
 const cache=await caches.open(CACHE),cached=await cache.match(request);
 if(cached)return cached;
 if(!pending.has(request.url))pending.set(request.url,(async()=>{
  // The content hash is part of the URL, so an existing HTTP-cache copy is safe.
  const response=await fetch(request,{cache:'force-cache'});
  if(response.ok&&response.headers.get('content-type')?.includes('image/webp')){
   try{await cache.put(request,response.clone());const keys=await cache.keys();for(const key of keys.slice(0,Math.max(0,keys.length-MAX_IMAGES)))await cache.delete(key);}catch{/* Storage limits must never prevent a picture from loading. */}
  }
  return response;
 })().finally(()=>pending.delete(request.url)));
 return (await pending.get(request.url)).clone();
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==frameRoot.origin||!url.pathname.startsWith(frameRoot.pathname)||url.search||!/(base|upgraded)-[a-f0-9]{12}\.webp$/.test(url.pathname))return;
 event.respondWith(picture(request).catch(()=>fetch(request)));
});
