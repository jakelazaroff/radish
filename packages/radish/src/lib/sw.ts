/// <reference lib="webworker" />

// https://web.archive.org/web/20201107234110/https://phyks.me/2019/01/manage-expiration-of-cached-assets-with-service-worker-caching.html
// https://gomakethings.com/offline-first-with-service-workers-and-vanilla-js/
// https://gomakethings.com/saving-recently-viewed-pages-offline-with-service-workers-and-vanilla-js/
// https://gomakethings.com/writing-your-first-service-worker-with-vanilla-js/
// https://gomakethings.com/how-to-set-an-expiration-date-for-items-in-a-service-worker-cache/
// https://gomakethings.com/the-amazing-power-of-service-workers/
// https://jakearchibald.com/2014/offline-cookbook/
// https://adactio.com/journal/13821

export type {};
declare const self: ServiceWorkerGlobalScope;
declare const PUBLIC_PATH: string;

const CACHE_NAME = "v1";

const SW_CACHE_KEY = "sw-cache-expires";
const DEFAULT_MAX_AGE = 0;
const DEFAULT_PUBLIC_MAX_AGE = 31_557_600;

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(["/"]);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => caches.delete(key)));
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request.url).then(cached => {
      const expires = Number(cached?.headers.get(SW_CACHE_KEY));
      if (cached && new Date().getTime() / 1000 < expires) return cached;

      const fresh = fetch(event.request)
        .then(res => {
          if (!res || res.status !== 200 || res.type !== "basic") return res;
          const control = cacheControl(res.headers.get("cache-control") || "");

          if (control["no-store"]) return res;

          // calculate the new expiry time
          const url = new URL(event.request.url);
          const defaultMaxAge = url.pathname.startsWith(PUBLIC_PATH)
            ? DEFAULT_PUBLIC_MAX_AGE
            : DEFAULT_MAX_AGE;
          const maxAge = control["max-age"] ?? defaultMaxAge,
            expires = Math.trunc(new Date().getTime() / 1000) + maxAge;

          // clone and cache the response
          const clone = res.clone();
          const headers = [...clone.headers, [SW_CACHE_KEY, "" + expires]];
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request.url, new Response(clone.body, { headers }));
          });

          return res;
        })
        .catch(() => cached || new Response("Page not available."));

      return fresh;
    })
  );
});

function cacheControl(header: string) {
  const result: { [key: string]: number } = {};
  if (!header) return {};

  const directives = header.split(/, ?/).map(val => val.split("="));
  for (const [key, val] of directives) {
    if (!key) continue;
    result[key] = val ? Number(val) : 1;
  }

  return result;
}
