'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "dc5e194b44656991a44ebd578ab014d0",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "a8d1d130b9909728d724354dc06becc1",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/resim/aktifyasam_banner.jpg": "1de337a1f75b2001f51347f87f5a4b1d",
"assets/resim/aktif_yasam_3.png": "54c1017ef474ca8c2f473d2df39ba0fa",
"assets/resim/aktif_yasam_urun_1.jpg": "cbd51f07208288c86462ac8f4795a755",
"assets/resim/aktif_yasam_urun_2.png": "9a9791cbd22b115918cc646b660b2648",
"assets/resim/avatar.png": "69269a340687904586d1a5a233dfb9bb",
"assets/resim/besleyici_shake.png": "b7df4593009553e2c943199fc4f833a8",
"assets/resim/cay_urun_1.png": "59364894e4e8fa5ce9e7193cc5c0f1de",
"assets/resim/cay_urun_2.png": "e2e2165ae18e059d1a8ba70946945dfb",
"assets/resim/cay_urun_3.png": "b179b11f6bab44c46c22001335d2971e",
"assets/resim/cay_urun_4.png": "7e345a2f69003c6b8106140b243ba770",
"assets/resim/cay_urun_5.png": "149029bff56169750d4b695e3c599320",
"assets/resim/cay_urun_6.png": "9b1ed8333faf3e2a887403d54969b168",
"assets/resim/icecek_banner.jpg": "abf9a5f68cfe8b999d0e83d8b4f9e122",
"assets/resim/icecek_urun_1.png": "41507ed063fc8ee3ef7ff3cae63c6dc3",
"assets/resim/sporcu_banner.jpg": "4cc1fee1903447e37e60fa4a970b83b3",
"assets/resim/temelbeslenme_banner.jpg": "f89c1d7269e43af8cf17d2f0cf14d4ff",
"assets/resim/urun_2.png": "6fefc64a0f2bd74fde4418d3c6beb922",
"assets/resim/urun_3.png": "4d801c7a70560d9d8b6c0c11fb0e0f5b",
"assets/resim/urun_4.png": "0f2e94205ad390adeaa1c578ae439c80",
"assets/resim/urun_5.png": "9b1ed8333faf3e2a887403d54969b168",
"assets/resim/urun_6.jpg": "cbf379fc5d5fe74f4a0bbe4287cccb94",
"assets/resim/urun_banner.jpg": "ef18801d7b4c866c7ffcd4dd4892f5c9",
"assets/resim/yuz_temizleme_1.png": "939f665123f4ae7c60f90e3f720c1221",
"assets/resim/yuz_temizleme_2.png": "92136528bab8dc865bae207af4c18154",
"assets/resim/yuz_temizleme_3.png": "56c2bbb56af60663ac6150a984a8250e",
"assets/resim/yuz_temizleme_4.png": "992bdcec142804ab595ad03371f4cfd5",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "b323e380af04203e2f1c8dda7d88f985",
"/": "b323e380af04203e2f1c8dda7d88f985",
"main.dart.js": "9faf68a561886c188cfa218c113d0c3e",
"manifest.json": "de49d8ec19f86cde99ce65ca1171a83d",
"version.json": "19bb5e9f5be413d44a5fdd52ce5cc5f5"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
