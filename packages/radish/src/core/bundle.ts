// sys
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import * as process from "node:process";

// lib
import esbuild, { BuildResult, OutputFile } from "esbuild";
import { globby } from "globby";

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
import {
  fromBuildError,
  fromRenderError,
  fromSuccess,
  RadishBuildResult
} from "./result.js";
import * as ansi from "../util/ansi.js";

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
  serviceWorker?: boolean;
  websocket?: number;
  onRebuild?(): void;
}

export async function bundle(options: BundleOptions): Promise<boolean> {
  const start = process.hrtime.bigint();

  const SRC = path.resolve(options.src);
  const DEST = path.resolve(options.dest);
  const PUBLIC = options.public;
  const SERVICE_WORKER = Boolean(options.serviceWorker);

  const PAGES = path.join(SRC, PAGES_DIR);
  const CONTENT = path.join(SRC, CONTENT_DIR);
  const ASSETS = path.join(DEST, ASSET_DIR);

  // bundle the pages and assets
  const pages = await globby([path.join(PAGES, "**/*{jsx,tsx}")]);
  const entry = pages.filter(page => !path.basename(page).startsWith("_"));
  const buildResult = await esbuild
    .build({
      write: false,
      bundle: true,
      minify: false,
      logLevel: "silent",
      // sourcemap: "inline",
      entryPoints: entry,
      nodePaths: [SRC],
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
        async onRebuild(error, result) {
          if (error) return reportErrors(error.errors.map(fromBuildError));
          if (!result) {
            return console.error("No result returned from watch build.");
          }

          // write the files to the filesystem
          const output = result.outputFiles ?? [];
          const files = [...output, ...cssDeps.values()];
          const content = contentMap();
          const bundleErrors = result.errors.map(fromBuildError);
          const renderResults = await writeFiles(files, {
            content,
            buildDir: DEST,
            assetDir: ASSETS,
            publicPath: PUBLIC,
            serviceWorker: SERVICE_WORKER,
            websocket: options.websocket
          });
          reportErrors([...bundleErrors, ...renderResults]);

          // prettier-ignore
          console.log(`Rebuilt ${renderResults.filter(r => !r.error).length} files.`);
          options.onRebuild?.();
        }
      }
    })
    .catch(result => result as BuildResult);

  const results: RadishBuildResult[] = [];
  results.push(...buildResult.errors.map(fromBuildError));

  // write the files to the filesystem
  const outputFiles = buildResult.outputFiles || [];
  const files = [...outputFiles, ...cssDeps.values()];
  const content = contentMap();
  const renderResults = await writeFiles(files, {
    content,
    buildDir: DEST,
    assetDir: ASSETS,
    publicPath: PUBLIC,
    serviceWorker: SERVICE_WORKER,
    websocket: options.websocket
  });
  results.push(...renderResults);
  const swResult = await buildServiceWorker(DEST, PUBLIC);
  results.push(swResult);

  const errors = results.filter(result => result.error);
  reportErrors(errors);

  if (!errors.length) {
    const end = process.hrtime.bigint();
    const ms = Number((end - start) / 1_000_000n);
    console.log(`🏗  Built in ${ms / 1000}s`);
  }

  return !errors.length;
}

interface WriteOptions {
  content: ContentMap;
  buildDir: string;
  assetDir: string;
  publicPath: string;
  serviceWorker: boolean;
  websocket?: number;
}

async function writeFiles(files: OutputFile[], options: WriteOptions) {
  const { content, assetDir, buildDir, publicPath, serviceWorker, websocket } =
    options;

  const preload = files
    .filter(file => /\.(eot|otf|ttf|woff2?|)$/.test(file.path))
    .map(file => path.relative(assetDir, file.path))
    .map(file => ({ href: path.join(publicPath, file), as: "font" }));

  // create assets dir
  await fs.promises.mkdir(assetDir, { recursive: true });
  const results = await Promise.all(
    files.map(async file => {
      const filepath = path.parse(file.path);
      if (filepath.ext !== ".js") {
        const output = path.join(assetDir, filepath.base);
        await fs.promises.writeFile(output, file.contents);
        return [fromSuccess(file.path, output)];
      }

      // bundled JS files are treated as assets
      if (/\.bundle-\w+\.js$/.test(filepath.base)) {
        const output = path.join(assetDir, filepath.base);
        await fs.promises.writeFile(output, file.contents);
        return [fromSuccess(file.path, output)];
      }

      return await writePage(
        file,
        content,
        buildDir,
        serviceWorker,
        preload,
        websocket
      );
    })
  );

  return results.flat();
}

async function writePage(
  file: OutputFile,
  content: ContentMap,
  root: string,
  serviceWorker: boolean,
  preload: Array<{ href: string; as: string }>,
  websocket?: number
): Promise<RadishBuildResult[]> {
  const results: RadishBuildResult[] = [];
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
        try {
          const html = render(component, {
            path: pathname,
            serviceWorker,
            preload,
            websocket
          });

          const output = path.join(dir, "index.html");
          await fs.promises.mkdir(dir, { recursive: true });
          await fs.promises.writeFile(output, html);
          results.push(fromSuccess(file.path, output));
        } catch (e) {
          if (!(e instanceof Error)) throw e;
          results.push(fromRenderError(e));
        }
      })
    );
  } else {
    // otherwise, just create the page
    const is404 = filepath.name === "404" && filepath.dir === root;
    const hasExt = path.extname(filepath.name) !== "";
    const shouldNest = !is404 && !hasExt && filepath.name !== "index";

    const name = shouldNest ? "index" : filepath.name;
    const dir = shouldNest
      ? path.join(filepath.dir, filepath.name)
      : filepath.dir;

    try {
      const html = render(component, {
        path: dir,
        serviceWorker,
        preload,
        websocket
      });

      const output = path.join(dir, hasExt ? name : `${name}.html`);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(output, html);
      results.push(fromSuccess(file.path, output));
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      results.push(fromRenderError(e));
    }
  }

  return results;
}

async function buildServiceWorker(dest: string, publicPath: string) {
  const input = path.resolve(__dirname, "../lib/sw.js");
  const output = path.join(dest, "sw.js");
  await esbuild.build({
    bundle: true,
    minify: true,
    outfile: output,
    entryPoints: [input],
    format: "esm",
    define: { PUBLIC_PATH: JSON.stringify(publicPath) }
  });

  // TODO: handle failure
  return fromSuccess(input, output);
}

function reportErrors(results: RadishBuildResult[]) {
  const errors = results.filter(result => result.error);
  if (!errors.length) return;

  const noun = errors.length === 1 ? "error" : "errors";
  const msg = [`⚠️  Radish encountered ${errors.length} ${noun}:\n`];

  for (const result of errors) {
    const column = result.error?.column ?? 0;
    const line = "" + result.error?.line;
    msg.push(
      ansi.red(`✘ [${result.error?.type}] `) +
        ansi.bold(result.error?.message) +
        "\n",
      `    ${result.inputFile}`,
      `      ` + ansi.dim(line + " | " + result.error?.line),
      `      ` + ansi.red("^".padStart(line.length + 3 + column))
    );
  }

  console.error(msg.join("\n"));
}
