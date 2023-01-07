// sys
import * as fs from "node:fs";
import * as path from "node:path";

// lib
import type { Plugin } from "esbuild";
import { globby } from "globby";
import grayMatter from "gray-matter";
import { compile as compileMdx } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import toml from "toml";
import yaml from "js-yaml";

import fetch from "../util/fetch.js";

interface Options {
  src: string;
}

export interface ContentMap {
  [key: string]: unknown;
}

/** A map from a content file's path to its contents. If the file was JSON, YAML or TOML, the value is a JavaScript object
 * of the file converted into JSON and parsed; if it was Markdown, the value is the parsed front matter.
 */
const content = new Map<string, ContentMap>();

export const contentMap = () => {
  const map: { [key: string]: any } = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

  for (const [file, matter] of content) {
    // split the path into an array of each segment
    const dirs = file.split(path.sep);

    // set the content in the map at the nested path
    // e.g. if the path is /blog/one, the content should be set at map["blog"]["one"]
    let current = map;
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i];
      if (dir === undefined) break;

      if (i === dirs.length - 1) current[dir] = matter;
      else current[dir] ??= {};
      current = current[dir];
    }
  }

  return map;
};

export const contentPlugin = (options: Options): Plugin => ({
  name: "content",
  setup(build) {
    // move CONTENT_INDEX imports into the `content` namespace
    build.onResolve({ filter: /CONTENT_INDEX$/ }, args => {
      return { path: args.path, namespace: "content" };
    });

    // to load a module in the `content` namespace, find all content file names and construct an "index" JS file that imports them
    build.onLoad({ filter: /.*/, namespace: "content" }, async () => {
      const paths = await globby([
        path.join(options.src, "**/!(_)*.{md,mdx,json,toml,yaml,yml,js,ts}")
      ]);
      const files = paths.map(filepath => path.relative(options.src, filepath));

      const src = ["export const content = {};\n"];
      const levels = new Set<string>();

      // counter ensures unique names for each import
      let i = 1;
      for (const file of files) {
        const filepath = path.parse(file);

        // convert slash-delimited path to brackets — /blog/one to ["blog"]["one"]
        const dirs = filepath.dir
          .split(path.sep)
          .filter(Boolean)
          .map(dir => `["${dir}"]`);

        // ensure each level of nesting is initialized with an empty object
        for (let j = 1; j <= dirs.length; j++) {
          const nested = dirs.slice(0, j).join("");
          if (levels.has(nested)) continue;

          levels.add(nested);
          src.push(`content${nested} = {};`);
        }

        // write the import
        const joined = dirs.join("") + `["${filepath.name}"]`;
        src.push(`import * as content${i} from "./${file}";`);
        if (/\.mdx?$/.test(filepath.base)) {
          src.push(
            `content${joined} = { ...content${i}, Component: content${i}.default };`,
            `delete content${joined}.default;\n`
          );
        } else src.push(`content${joined} = content${i};`);

        // increment the counter
        i += 1;
      }

      return {
        contents: src.join("\n"),
        loader: "js",
        resolveDir: options.src
      };
    });

    // escape src path for use in regular expressions
    const src = options.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    build.onLoad({ filter: new RegExp(`${src}/.*\\.toml$`) }, async args => {
      const file = await fs.promises.readFile(args.path, "utf-8");
      const json = toml.parse(file);

      const filepath = path.parse(args.path);
      const key = path.relative(
        options.src,
        path.join(filepath.dir, filepath.name)
      );
      content.set(key, json);

      return {
        contents: compileDataFile(json),
        loader: "js",
        resolveDir: path.dirname(args.path)
      };
    });

    build.onLoad({ filter: new RegExp(`${src}/.*\\.ya?ml$`) }, async args => {
      const file = await fs.promises.readFile(args.path, "utf-8");
      const json: any = yaml.load(file); // eslint-disable-line @typescript-eslint/no-explicit-any

      const filepath = path.parse(args.path);
      const key = path.relative(
        options.src,
        path.join(filepath.dir, filepath.name)
      );
      content.set(key, json);

      return {
        contents: compileDataFile(json),
        loader: "js",
        resolveDir: path.dirname(args.path)
      };
    });

    build.onLoad({ filter: new RegExp(`${src}/.*\\.json$`) }, async args => {
      const file = await fs.promises.readFile(args.path, "utf-8");
      const json = JSON.parse(file);

      const filepath = path.parse(args.path);
      const key = path.relative(
        options.src,
        path.join(filepath.dir, filepath.name)
      );
      content.set(key, json);

      return {
        contents: compileDataFile(json),
        loader: "js",
        resolveDir: path.dirname(args.path)
      };
    });

    // compile .md and .mdx files to JSX and add their front matter to the cache
    build.onLoad({ filter: new RegExp(`${src}/.*\\.mdx?$`) }, async args => {
      const md = await fs.promises.readFile(args.path, "utf-8");

      const filepath = path.parse(args.path);

      const key = path.relative(
        options.src,
        path.join(filepath.dir, filepath.name)
      );

      // parse as TOML if the delimiter is +++
      let language: string | undefined;
      const delimiters = md.substring(0, md.indexOf("\n")).trim();
      if (delimiters === "+++") language = "toml";

      // extract front matter from file
      const matter = grayMatter(md, {
        language,
        delimiters,
        engines: { toml: toml.parse.bind(toml) }
      });

      // set front matter in content map
      content.set(key, matter.data);

      // compile mdx
      const file = await compileMdx(matter.content, {
        jsx: true,
        rehypePlugins: [rehypeHighlight],
        remarkPlugins: [remarkGfm]
      });

      // import stub mdjson file with front matter
      const lines = file.value.toString().split("\n");
      const from = path.join(filepath.dir, filepath.name + ".mdjson");
      const imports = Object.keys(matter.data).join(", ");
      lines.splice(
        1,
        0,
        `import { ${imports} } from "${from}"`,
        `export { ${imports} } from "${from}"`
      );

      // return compiled mdx as contents of file
      return { contents: lines.join("\n"), loader: "jsx" };
    });

    build.onResolve({ filter: /\.mdjson$/ }, args => ({
      path: args.path,
      namespace: "mdjson"
    }));

    build.onLoad({ filter: /.*/, namespace: "mdjson" }, async args => {
      const filepath = path.parse(args.path);
      const key = path.relative(
        options.src,
        path.join(filepath.dir, filepath.name)
      );

      const matter = content.get(key);
      if (!matter) return;

      return {
        contents: compileDataFile(matter),
        loader: "js",
        resolveDir: path.dirname(args.path)
      };
    });

    build.onResolve({ filter: /^https?:\/\// }, args => ({
      path: args.path,
      namespace: "remote"
    }));

    const http = new Map<string, string>();
    build.onLoad({ filter: /.*/, namespace: "remote" }, async args => {
      let contents = http.get(args.path);

      if (!contents) {
        contents = await fetch(args.path);
        http.set(args.path, contents);
      }

      return { contents, loader: "json" };
    });
  }
});

/** Given a plain JavaScript object, create source code that exports that object,
 * overwriting any properties in the form of `url("./somefile.png")` with the result of an actual esbuild import */
function compileDataFile(obj: object) {
  const src: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    src.push(`export let ${key} = ${JSON.stringify(value)};`);
  }

  // get an index of key-value pairs in the form of [["path", "to", "value"], "value"]
  const index = indexObject(obj);

  let i = 1;
  for (const [path, value] of index) {
    // skip anything that's not a string
    if (typeof value !== "string") continue;

    // skip anything that doesn't match `url("")`
    const [, url] = value.match(/^url\(["'](.*)["']\)/) ?? [];
    if (!url) continue;

    // overwrite the imported property in the data object
    const first = path.shift();
    if (!first) continue;
    const bracketed = path.map(key => `["${key}"]`).join("");
    src.push(
      "",
      `import file${i} from "${url}";`,
      `${first}${bracketed} = file${i};`
    );

    i += 1;
  }

  return src.join("\n");
}

type Path = [string[], unknown];
function indexObject(obj: object): Path[] {
  if (Object(obj) !== obj) return [[[], obj]];

  return Object.entries(obj).flatMap(([key, nested]) => {
    return indexObject(nested).map(
      ([path, val]) =>
        [[Array.isArray(obj) ? Number(key) : key, ...path], val] as Path
    );
  });
}
