// Course des Légendes : mode hors ligne.
// Quand tu modifies le jeu, change le numéro de version ci-dessous (v1 -> v2)
// pour que les téléphones récupèrent la nouvelle version.
const VERSION = 'cdl-v1';
const FICHIERS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(VERSION).then(function(c){ return c.addAll(FICHIERS); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(noms){
      return Promise.all(noms.filter(function(n){ return n !== VERSION; }).map(function(n){ return caches.delete(n); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// D'abord le cache (rapide, marche sans internet). Ce qui n'y est pas (la police) est
// récupéré sur le réseau puis gardé pour la fois suivante.
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(trouve){
      if (trouve) return trouve;
      return fetch(e.request).then(function(rep){
        var copie = rep.clone();
        caches.open(VERSION).then(function(c){ c.put(e.request, copie); });
        return rep;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
