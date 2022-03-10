// sys
import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

import * as ansi from "../util/ansi.js";

export interface ServeOptions {
  dir: string;
  port: number;
}

export function serve(options: ServeOptions) {
  const { dir, port } = options;

  const server = http.createServer(async (req, res) => {
    const url = new URL("http://localhost" + req.url);
    let pathname = url.pathname;
    if (!/\.\w+$/.test(pathname)) pathname = path.join(pathname, "index.html");

    if (req.method !== "GET") {
      res.writeHead(405);
      res.end("Only GET requests are allowed in local development.");

      // prettier-ignore
      console.log(`${ansi.bold(req.method)} ${url.pathname} ${ansi.bold(ansi.yellow(405))}`);
      return;
    }

    try {
      const file = await fs.promises.readFile(dir + pathname);

      const [, ext = "html"] = pathname.match(/\.(\w+)/) ?? [];
      const mime = MIME_TYPES[ext] || "text/plain";

      res.writeHead(200, { "content-type": mime });
      res.end(file);

      // prettier-ignore
      console.log(`${ansi.bold("GET")} ${url.pathname} ${ansi.bold(ansi.green(200))}`);
    } catch (err) {
      try {
        const body = await fs.promises.readFile(path.join(dir, "404.html"));
        res.writeHead(404, { "content-type": "text/html" });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end(JSON.stringify(err));
      }

      // prettier-ignore
      console.log(`${ansi.bold(req.method)} ${url.pathname} ${ansi.bold(ansi.yellow(404))}`);
    }
  });

  // prettier-ignore
  server.on("listening", () => console.log(`🌐 Listening at ${ansi.cyan("localhost:"+port)}`));
  server.listen(options.port);
}

const MIME_TYPES: Record<string, string> = {
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
  // fonts
  woff: "font/woff",
  woff2: "font/woff2",
  // images
  gif: "image/gif",
  ico: "image/vnd.microsoft.icon",
  jpg: "image/jpg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
  // audio
  aac: "audio/aac",
  flac: "audio/flac",
  mp3: "audio/mp3g",
  ogg: "audio/ogg",
  wav: "audio/wav",
  // video
  mp4: "video/mp4",
  webm: "video/webm"
};
