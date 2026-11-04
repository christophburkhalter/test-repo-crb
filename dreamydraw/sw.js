// Der "Service Worker" merkt sich die App, damit sie auch ohne Internet startet.
// Er holt immer zuerst die neuste Version aus dem Internet. Klappt das nicht
// (z.B. kein Empfang auf der Piste), nimmt er die gespeicherte Kopie.
const ZWISCHENSPEICHER = "dreamydraw-v1";
const DATEIEN = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (ereignis) => {
  ereignis.waitUntil(caches.open(ZWISCHENSPEICHER).then((speicher) => speicher.addAll(DATEIEN)));
  self.skipWaiting();
});

self.addEventListener("activate", (ereignis) => {
  // Alte Kopien von früheren Versionen wegräumen
  ereignis.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((name) => name !== ZWISCHENSPEICHER).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (ereignis) => {
  if (ereignis.request.method !== "GET") return;
  ereignis.respondWith(
    fetch(ereignis.request)
      .then((antwort) => {
        const kopie = antwort.clone();
        caches.open(ZWISCHENSPEICHER).then((speicher) => speicher.put(ereignis.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(ereignis.request))
  );
});
