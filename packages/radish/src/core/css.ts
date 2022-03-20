// sys
import * as fs from "node:fs";
import * as path from "node:path";

// lib
import css from "@parcel/css";
import esbuild, { OutputFile, Plugin } from "esbuild";
import { globby } from "globby";

import * as loader from "./loaders.js";

interface Options {
  src: string;
  dest: string;
  prefix: string;
}

export const cssDeps = new Map<string, OutputFile>();

export const cssPlugin = (options: Options): Plugin => ({
  name: "css",
  setup(build) {
    // return the path to the concatenated style.css file for .css files
    build.onLoad({ filter: /\/\w+\.css$/ }, async args => {
      const r = await bundle(args.path, options);

      const deps = r.outputFiles.filter(f => path.extname(f.path) !== ".css"),
        styles = r.outputFiles.filter(f => path.extname(f.path) === ".css");

      const [main, ...rest] = styles;
      if (!main) throw Error("No output file returned.");
      if (rest.length > 1) throw Error("Too many output files returned.");

      for (const dep of deps) cssDeps.set(dep.path, dep);

      return {
        contents: main.text,
        loader: "file",
        warnings: r.warnings,
        errors: r.errors,
        watchFiles: Object.keys(r.metafile?.inputs ?? {})
      };
    });

    // return classname hashes from .module.css files
    build.onLoad({ filter: /\.module\.css$/ }, async args => {
      const file = await fs.promises.readFile(args.path);
      const stylesheet = transform(path.relative(options.src, args.path), file);

      const classNames: { [key: string]: string } = {};
      for (const [key, { name }] of Object.entries(stylesheet.exports || {})) {
        classNames[key] = name;
      }

      return { contents: JSON.stringify(classNames), loader: "json" };
    });
  }
});

function transform(filename: string, code: Buffer) {
  return css.transform({
    filename,
    code,
    sourceMap: false,
    minify: false,
    cssModules: true,
    drafts: { nesting: true, customMedia: true },
    targets: { firefox: 98 }
  });
}

async function bundle(file: string, options: Options) {
  return esbuild.build({
    write: false,
    bundle: true,
    metafile: true,
    entryPoints: [file],
    entryNames: "[name]-[hash]",
    outdir: options.dest,
    publicPath: options.prefix,
    loader: { ...loader.images, ...loader.fonts },
    plugins: [
      {
        name: "css",
        async setup(build) {
          const modules = await globby([
            path.join(options.src, "**/*.module.css")
          ]);

          build.onResolve({ filter: /\/\w+\.css$/ }, async args => {
            const namespace =
              args.kind === "entry-point" ? "css-import" : "file";

            const dir = path.dirname(args.importer);
            const filepath = path.isAbsolute(args.path)
              ? args.path
              : path.join(dir, args.path);

            return { path: filepath, namespace };
          });

          build.onLoad(
            { filter: /.*/, namespace: "css-import" },
            async args => {
              const imports = [
                `@import "${args.path}";`,
                ...modules.map(mod => `@import "${mod}";`)
              ];

              return {
                contents: imports.join("\n"),
                loader: "css",
                resolveDir: options.src
              };
            }
          );

          // return modularized text from .module.css files
          build.onLoad({ filter: /\.module\.css$/ }, async args => {
            const file = await fs.promises.readFile(args.path);
            const stylesheet = transform(
              path.relative(options.src, args.path),
              file
            );

            return { contents: stylesheet.code, loader: "css" };
          });
        }
      }
    ]
  });
}
