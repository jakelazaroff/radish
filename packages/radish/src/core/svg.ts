// sys
import * as fs from "node:fs";

// lib
import type { Plugin } from "esbuild";
import { transform } from "@svgr/core";

export const svgPlugin: Plugin = {
  name: "svg",
  setup(build) {
    build.onLoad({ filter: /\.react\.svg$/ }, async args => {
      const svg = await fs.promises.readFile(args.path, "utf-8");
      const contents = await transform(svg, {}, { filePath: args.path });

      return { contents, loader: "jsx" };
    });
  }
};
