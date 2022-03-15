// sys
import * as path from "node:path";
import * as child from "node:child_process";

import { bundle, BundleOptions } from "./bundle.js";
import { serve } from "./serve.js";
import { websocket } from "./websocket";

export async function build(options: BundleOptions) {
  const src = path.resolve(options.src);
  const dest = path.resolve(options.dest);

  return bundle({ ...options, src, dest });
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
  await bundle({
    src,
    dest,
    public: "/public",
    watch: true,
    websocket: port + 1,
    onRebuild: ws.refresh
  });
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
