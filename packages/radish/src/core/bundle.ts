// sys
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as process from "node:process";

// lib
import esbuild, { OutputFile } from "esbuild";
import { globby } from "globby";
import mkdirp from "mkdirp";

// plugins
import loaders from "./loaders.js";
import { pagePlugin } from "./page.js";
import { contentPlugin, contentMap, ContentMap } from "./content.js";
import { cssPlugin, cssDeps } from "./css.js";
import { jsPlugin } from "./js.js";
import { svgPlugin } from "./svg.js";

import type { Page } from "./types";
import esm from "./esm.js";
import render from "./render.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dirs
const CONTENT_DIR = "content";
const PAGES_DIR = "pages";
const ASSET_DIR = "public";

export interface BundleOptions {
  src: string;
  dest: string;
  public: string;
  watch?: boolean;
}

export async function bundle(options: BundleOptions) {
  const start = process.hrtime.bigint();

  const SRC = path.resolve(options.src);
  const DEST = path.resolve(options.dest);
  const PUBLIC = options.public;

  const PAGES = path.join(SRC, PAGES_DIR);
  const CONTENT = path.join(SRC, CONTENT_DIR);
  const ASSETS = path.join(DEST, ASSET_DIR);

  // bundle the pages and assets
  const pages = await globby([path.join(PAGES, "**/*{jsx,tsx}")]);
  const entry = pages.filter(page => !path.basename(page).startsWith("_"));
  const result = await esbuild.build({
    write: false,
    bundle: true,
    entryPoints: entry,
    outdir: DEST,
    outbase: PAGES,
    format: "esm",
    inject: [path.resolve(__dirname, "inject.js")],
    publicPath: PUBLIC,
    loader: loaders,
    plugins: [
      pagePlugin({ src: SRC }),
      contentPlugin({ src: CONTENT }),
      cssPlugin({ src: SRC, dest: ASSETS, prefix: PUBLIC }),
      jsPlugin({ dest: ASSETS, prefix: PUBLIC }),
      svgPlugin
    ],

    incremental: options.watch,
    watch: options.watch && {
      onRebuild(error, result) {
        if (error) return console.error("Watch build failed:", error);
        if (!result) {
          return console.error("No result returned from watch build.");
        }

        // write the files to the filesystem
        const output = result.outputFiles ?? [];
        const files = [...output, ...cssDeps.values()];
        const content = contentMap();
        writeFiles(files, content, DEST, ASSETS);
      }
    }
  });

  // write the files to the filesystem
  const files = [...result.outputFiles, ...cssDeps.values()];
  const content = contentMap();
  await writeFiles(files, content, DEST, ASSETS);

  const end = process.hrtime.bigint();
  const ms = Number((end - start) / 1_000_000n);
  console.log(`🏗  Built in ${ms / 1000}s`);
}

async function writeFiles(
  files: OutputFile[],
  content: ContentMap,
  buildDir: string,
  assetDir: string
) {
  // create assets dir
  await mkdirp(assetDir);
  return Promise.all(
    files.map(async file => {
      const filepath = path.parse(file.path);
      if (filepath.ext !== ".js") return writeAsset(file, assetDir);

      // bundled JS files are treated as assets
      if (/\.bundle-\w+\.js$/.test(filepath.base))
        return writeAsset(file, assetDir);

      return writePage(file, content, buildDir);
    })
  );
}

async function writeAsset(file: OutputFile, dir: string) {
  const filepath = path.parse(file.path);

  const contents = filepath.ext === ".css" ? file.text : file.contents;
  await fs.promises.writeFile(path.join(dir, filepath.base), contents);
}

async function writePage(file: OutputFile, content: ContentMap, root: string) {
  const filepath = path.parse(file.path);

  // compile the component into an ES module
  const component = await esm<Page>(file.text);

  // get paths to generate; an empty array means to just generate the page at its own path
  const paths = new Set(component.paths?.(content) ?? []);
  if (paths.size) {
    // if the page returns a list of path, render an HTML file for each one
    await Promise.all(
      [...paths].map(async pathname => {
        const dir = path.join(filepath.dir, pathname);
        const html = render(component, { path: pathname });

        await mkdirp(dir);
        await fs.promises.writeFile(path.join(dir, "index.html"), html);
      })
    );
  } else {
    // otherwise, just create the page
    const is404 = filepath.name === "404" && filepath.dir === root;
    const shouldNest = !is404 && filepath.name !== "index";

    const name = shouldNest ? "index" : filepath.name;
    const dir = shouldNest
      ? path.join(filepath.dir, filepath.name)
      : filepath.dir;

    const html = render(component, { path: dir });

    await mkdirp(dir);
    await fs.promises.writeFile(path.join(dir, name + ".html"), html);
  }
}
