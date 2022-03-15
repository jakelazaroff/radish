/// <reference lib="webworker" />

export type {};
declare const self: ServiceWorkerGlobalScope;
declare const PUBLIC_PATH: string;

const VERSION = "v1";
const PAGES_CACHE = `pages_${VERSION}`;
const ASSET_CACHE = `assets_${VERSION}`;
const CACHES = new Set([PAGES_CACHE, ASSET_CACHE]);

const SW_CACHE_KEY = "sw-cache-expires";
const DEFAULT_MAX_AGE = 0;
const DEFAULT_PUBLIC_MAX_AGE = 31_557_600;

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => {
        const deletes = keys
          .filter(key => !CACHES.has(key))
          .map(key => caches.delete(key));
        return Promise.all(deletes);
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request.url).then(cached => {
      const expires = Number(cached?.headers.get(SW_CACHE_KEY));
      if (cached && new Date().getTime() / 1000 < expires) return cached;

      const url = new URL(event.request.url);
      const isPublic = url.pathname.startsWith(PUBLIC_PATH);

      const fresh = fetch(event.request)
        .then(res => {
          if (!res || res.status !== 200 || res.type !== "basic") return res;
          const control = cacheControl(res.headers.get("cache-control") || "");

          if (control["no-store"]) return res;

          // calculate the new expiry time
          const defaultMaxAge = isPublic
            ? DEFAULT_PUBLIC_MAX_AGE
            : DEFAULT_MAX_AGE;
          const maxAge = control["max-age"] ?? defaultMaxAge,
            expires = Math.trunc(new Date().getTime() / 1000) + maxAge;

          // clone and cache the response
          const clone = res.clone();
          const headers = [...clone.headers, [SW_CACHE_KEY, "" + expires]];
          caches.open(isPublic ? ASSET_CACHE : PAGES_CACHE).then(cache => {
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
