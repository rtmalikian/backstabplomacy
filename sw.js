/* Backstabplomacy service worker — offline app shell + notifications.
   Bump CACHE on every release or installed phones keep the old shell. */
const CACHE = "backstabplomacy-v4";
const ASSETS = ["./","index.html","css/style.css","js/data.js","js/personas.js","js/trophies.js","variants/caucasus.json","variants/empires.json","js/app.js","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","variants/classic.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => { if (e.request.method !== "GET") return; e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return resp; }).catch(() => caches.match("index.html")))); });
/* Real Web Push: when a VAPID push server (see docs) sends a payload
   {title, body, url}, show it as a system notification — works in the
   browser and in the installed Android PWA. */
self.addEventListener("push", e => { let d = {title:"Backstabplomacy", body:"Your Diplomacy game needs you.", url:"./"}; try { d = Object.assign(d, e.data.json()); } catch(_) { if (e.data) d.body = e.data.text(); }
  e.waitUntil(self.registration.showNotification(d.title, {body:d.body, icon:"icons/icon-192.png", badge:"icons/icon-192.png", data:{url:d.url}})); });
self.addEventListener("notificationclick", e => { e.notification.close(); const url = (e.notification.data && e.notification.data.url) || "./"; e.waitUntil(clients.matchAll({type:"window", includeUncontrolled:true}).then(cs => { for (const c of cs) if ("focus" in c) return c.focus(); return clients.openWindow(url); })); });
