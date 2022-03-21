// sys
import * as fs from "node:fs";
import * as path from "node:path";

// lib
import esbuild, { Plugin } from "esbuild";

interface Options {
  dest: string;
  prefix: string;
}

export const jsPlugin = (options: Options): Plugin => ({
  name: "js",
  setup(build) {
    build.onLoad({ filter: /\.bundle\.[jt]s$/ }, async args => {
      const r = await esbuild.build({
        entryPoints: [args.path],
        entryNames: "[name]-[hash]",
        outdir: options.dest,
        bundle: true,
        write: false,
        minify: true,
        metafile: true,
        format: "esm"
      });

      const [file, ...rest] = r.outputFiles;
      if (!file) throw Error("No output file returned.");
      if (rest.length > 1) throw Error("Too many output files returned.");

      // calculate the file hash
      const [, hash] = file.path.match(/.+\.bundle-(\w+)\.js/) ?? [],
        basename = path.basename(file.path, `.bundle-${hash}.js`),
        filename = `${basename}-${hash}.js`;

      // write the bundled js to the public directory
      await fs.promises.mkdir(options.dest, { recursive: true });
      await fs.promises.writeFile(path.join(options.dest, filename), file.text);

      // return the path to the bundled js as a text string
      return {
        contents: path.join(options.prefix, filename),
        loader: "text",
        errors: r.errors,
        warnings: r.warnings,
        watchFiles: Object.keys(r.metafile?.inputs ?? {})
      };
    });
  }
});
