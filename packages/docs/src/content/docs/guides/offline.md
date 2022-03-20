---
order: 4
title: Offline
---

When you build your website, Radish includes a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) to improve performance and make it work offline.

By default, Radish will always request new versions of your pages, and it will cache static assets for a year. You can configure this time by setting the `max-age` cache control directive from your webserver. If you do override it, you should try to keep assets cached for a long time; since Radish changes asset filenames whenever the contents change, they are guaranteed to be up-to-date.

To prevent the service worker from caching individual files, set the `no-store` cache control directive on your webserver. To disable the service worker entirely, build your website with the flag `--service-worker=disabled`.

Note that if you host your static assets on a different domain, the service worker won't be able to cache them.
