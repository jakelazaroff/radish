import http from "http";
import https from "https";

export default function fetch(url: string) {
  return new Promise<string>((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, res => {
      if (!res.statusCode)
        return reject(new Error(`GET "${url}" returned no status.`));

      if ([301, 302, 307].includes(res.statusCode)) {
        if (!res.headers.location) {
          // prettier-ignore
          const err = new Error(`GET "${url}" returned status ${res.statusCode} but no location header.`);
          return reject(err);
        }

        return fetch(new URL(res.headers.location, url).toString())
          .then(resolve)
          .catch(reject);
      }

      if (res.statusCode === 200) {
        const chunks: any[] = [];
        res.on("data", chunk => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString()));
      } else reject(new Error(`GET ${url} returned status ${res.statusCode}`));
    });
  });
}
