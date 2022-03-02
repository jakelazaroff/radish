// sys
import * as path from "node:path";
import * as child from "node:child_process";

import { bundle, BundleOptions } from "./bundle.js";
import { serve } from "./serve.js";

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

  await bundle({ src, dest, public: "/public", watch: true });
  serve({ dir: dest, port: options.port ?? 8000 });
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
