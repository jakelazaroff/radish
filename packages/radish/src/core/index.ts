// sys
import * as path from "node:path";
import * as child from "node:child_process";

import { bundle, BundleOptions } from "./bundle.js";
import { serve } from "./serve.js";
import { websocket } from "./websocket.js";

export async function build(options: BundleOptions) {
  const src = path.resolve(options.src);
  const dest = path.resolve(options.dest);

  const ok = await bundle({ ...options, src, dest });
  if (!ok) process.exit(1);
}

interface DevOptions {
  src: string;
  dest: string;
  port?: number;
}

export async function dev(options: DevOptions) {
  const src = path.resolve(options.src);
  const dest = path.resolve(options.dest);

  const port = options.port ?? 8000;
  const ws = websocket({ port: port + 1 });
  const ok = await bundle({
    src,
    dest,
    public: "/public",
    watch: true,
    websocket: port + 1,
    onRebuild: ws.refresh
  });

  if (!ok) {
    ws.close();
    process.exit(1);
    return;
  }

  serve({ dir: dest, port });
}

interface LintOptions {
  src: string;
}

export async function lint(options: LintOptions) {
  const src = path.resolve(options.src);

  child.exec(
    `npx eslint --ext .jsx --ext .tsx ${src}`,
    (err, stdout, stderr) => {
      if (err) return console.error(err);
      console.log(stdout);
      console.error(stderr);
    }
  );
}
