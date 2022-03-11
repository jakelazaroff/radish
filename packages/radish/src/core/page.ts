import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

// lib
import type { Plugin } from "esbuild";

interface PageOptions {
  src: string;
}

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pagePlugin = (options: PageOptions): Plugin => ({
  name: "pages",
  setup(build) {
    const doc = path.resolve(__dirname, "../lib/Document"),
      docRE = new RegExp(doc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ".js$");

    build.onResolve({ filter: /\/pages\/.+\.[jt]sx$/ }, async args => {
      if (args.kind === "entry-point")
        return { path: args.path, namespace: "page" };

      return { namespace: "file" };
    });

    build.onLoad({ filter: /\.[jt]sx$/, namespace: "page" }, async args => {
      const contents = [
        `import Document from "${doc}";`,
        `import Component, * as page from "${args.path}";`,
        `export default function Page(props) {`,
        `  return (`,
        `    <Document {...props}>`,
        `      <Component {...props} />`,
        `    </Document>`,
        `  );`,
        `}`,
        `export const paths = page.paths;`,
        `export const head = Document.head;`
      ].join("\n");

      return { contents, loader: "jsx", resolveDir: options.src };
    });

    build.onLoad({ filter: docRE }, async args => {
      const contents = await fs.promises.readFile(args.path);
      return { contents, loader: "jsx", resolveDir: options.src };
    });
  }
});
