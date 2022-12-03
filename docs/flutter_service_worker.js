'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "b1707408aa8b1a3d10cf7cc028c5f53a",
"index.html": "16be78c0048f6275073334396c08c18e",
"/": "16be78c0048f6275073334396c08c18e",
"main.dart.js": "1fc1d0b5d8b33788f8cc9b187a751842",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"img/loading.gif": "ad1b8dda0dcff92bd303cba6ed41072c",
"img/loading_small.gif": "5ea7d8b9f126323cb04348eaa5f2f71f",
"img/splash.png": "783169c8f70a1f6490a273bbe41a2b97",
"favicon.png": "7531477a6673d89f98b93e99d16f8d7b",
"icons/Icon-192.png": "6c870e0b0b1d596c6062d4fe29216c4b",
"icons/Icon-maskable-192.png": "6c870e0b0b1d596c6062d4fe29216c4b",
"icons/Icon-maskable-512.png": "c9691d24dc081639ac6cdd9d065c4fff",
"icons/Icon-512.png": "c9691d24dc081639ac6cdd9d065c4fff",
"manifest.json": "4c907538532915039d241d8a817ee066",
"assets/AssetManifest.json": "95b1bcb9b709bcad5aaaf47b38944707",
"assets/NOTICES": "717a8dcb22670a4f2de9898a46f1ba8d",
"assets/FontManifest.json": "125dcd6a3329c5238c03be594be456bc",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "7408b7fe25a1b9646cd62322d0640519",
"assets/fonts/Rowdies-Bold.ttf": "b765a76d63821e1d811d7b2240e49ace",
"assets/fonts/Rowdies-Light.ttf": "76feda2d732c062f958b226165ef347b",
"assets/fonts/Rowdies-Regular.ttf": "b5b1173f24fc49f859ea6031810c9bbe",
"assets/fonts/AzeretMono-Bold.ttf": "04c3af5db4df5aa2f27f53c161fa3735",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/audio/music/bensound-punky.mp3": "880cde284f4238d9677fc0fb54e4c711",
"assets/assets/audio/music/bensound-scifi.mp3": "4fe7478fd19f8919031313b198fbdc17",
"assets/assets/audio/music/bensound-extremeaction.mp3": "25888ed1c7d78da14987dbf89e499e86",
"assets/assets/audio/sounds/excellent.mp3": "744a0709117c553d661f93eb7099ada6",
"assets/assets/audio/sounds/game_over.mp3": "4d4e1020781bab328b4e1491c35fda4f",
"assets/assets/audio/sounds/swish.wav": "9b7302010874424974fb99b5822e596e",
"assets/assets/audio/sounds/great.mp3": "f0b8b9b64d408a0dbc7215da9903d702",
"assets/assets/audio/sounds/well_done.mp3": "58aff86e549e9f4653ea2fed9495cdfc",
"assets/assets/audio/sounds/beep.mp3": "a02f8b5b6e60144f57d31c160223a065",
"assets/assets/audio/sounds/keep_it_up.mp3": "5a09c36bfd1984ca8698572a353733b8",
"assets/assets/audio/sounds/that_was_close.mp3": "c3186f99a40df1377439ebd555a78646",
"assets/assets/audio/sounds/beep_long.mp3": "86e3fa26e8aba0c0900889e17b36c7bb",
"assets/assets/audio/sounds/click.wav": "3f92aaba50f151a0e6e8cdbeaaafe102",
"assets/assets/audio/sounds/too_easy.mp3": "d9a1547cb49350aab68cb965377e7332",
"assets/assets/audio/sounds/awesome.mp3": "d4e2d7fc3de7d9b4759e370f4762993c",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
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
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
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
