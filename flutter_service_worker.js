'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "00b94b74e20b2a25df79ca2a952c9500",
"index.html": "7b0bed4d89c0bb67b65e76aac08e7ff7",
"/": "7b0bed4d89c0bb67b65e76aac08e7ff7",
"main.dart.js": "bf16034a52e3baa72409394c642edb69",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "b27f12e2b8c430fef0098efc03d7e1c1",
"assets/AssetManifest.json": "c470d8950bb610ec86fc05ba1822dbe9",
"assets/NOTICES": "1dd8fc057227d5da2bc09a0f220fa63d",
"assets/FontManifest.json": "73996947c0b6418f6bdc51dc7eba9c84",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/fluttertoast/assets/toastify.js": "8f5ac78dd0b9b5c9959ea1ade77f68ae",
"assets/packages/fluttertoast/assets/toastify.css": "8beb4c67569fb90146861e66d94163d7",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/assets/icon.png": "afe469c3727cc7cbfe11c4d68e5102e6",
"assets/assets/logo/logobaru.png": "b73fb54633061e65d9a330926fccc28b",
"assets/assets/logo/logo-white.png": "838d93dd977c30709884ceddf684f63f",
"assets/assets/logo/logo.png": "ef8e88589f25275c422be22e26805f78",
"assets/assets/logo/profile.jpg": "44f4693ad36ab3d0ee4e2de0b4798539",
"assets/assets/icons/leave_status.png": "7a79d19da58b0d2a96fe3b52767e3177",
"assets/assets/icons/icons8-leave-64.png": "b199ec214f2fd679dd71b5388a4b6abb",
"assets/assets/icons/attendance_summary.png": "ac396586cddb0411499fef3a998abf55",
"assets/assets/icons/Logo-splash.png": "81c92b7ddd865818df5c5150413e7051",
"assets/assets/icons/navigation-drawer.png": "2771e2fbd30e698a37e110746b3af4f8",
"assets/assets/icons/icons8-process-100.png": "2c7ae0b2645fbc046afc9068bd65ffab",
"assets/assets/icons/attendance_recorder.png": "f6eb07830fe8d965b4f9d67451122c16",
"assets/assets/icons/icons8-attendance-48.png": "19c4060feb4e06c8a5926d6f226b41e0",
"assets/assets/icons/icons8-location-64.png": "ba9937b4d787d9944f9653ae29e2d817",
"assets/assets/icons/leave_application.png": "aaeb1314a73994a8f996ef98e9d08723",
"assets/assets/fonts/Bitter-Bold.ttf": "2e4c2ad8fe4d233e582d2878ef1daffb",
"assets/assets/fonts/Poppins-Medium.otf": "f88c443f02135a3ba091560e76ed767f",
"assets/assets/fonts/Poppins-Bold.otf": "e47421f9b8cec2661620743c53475c8d",
"assets/assets/fonts/Bitter-Regular.ttf": "0f1c22edaad1740f071ec14648d2ec63",
"assets/assets/fonts/Sansation-Bold.ttf": "37c961d1db011f138962a4c60f356346",
"assets/assets/back.jpg": "22a90087b9016efb48a81c29baa8f727",
"assets/assets/gif/loading-gif.gif": "b2138e4161334a4da7d242265b754b21",
"assets/assets/gif/close.gif": "9ad63b0cfcc5305ac05007c0b21a104f",
"assets/assets/gif/tick.gif": "c1b0da7639cfd50233dea777dcca004a",
"assets/assets/gif/no_entry.gif": "399c4d1ae8fe01576e81500a71ff3b01"
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
  for (var resourceKey in Object.keys(RESOURCES)) {
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
