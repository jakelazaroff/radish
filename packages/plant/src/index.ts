// sys
import * as path from "node:path";

// lib
import minimist from "minimist";

import init from "./init.js";

export default function cli(argv: string[], version: string) {
  const args = minimist(argv);

  const [dir] = args._;
  if (!dir || args.help) return help();
  if (args.version) return console.log(version);

  init({
    dir: path.resolve(dir),
    typescript: Boolean(args.typescript)
  });
}

function help() {
  const lines: string[] = [];

  lines.push(`🌱\n`, `Usage: plant-radish <dir> [options]\n`);
  lines.push(
    `Options:`,
    ...formatOptions(
      [`  --typescript`, "generate a typescript project"],
      [`  --help`, "display help"],
      [`  --version`, "display version"]
    )
  );

  const output = lines.map(line => "  " + line).join("\n");
  console.log(`\n${output}\n`);
}

function formatOptions(...options: [string, string][]) {
  let max = options
    .map(([flag]) => flag.length)
    .reduce((a, b) => Math.max(a, b));
  max += 4;

  return options.map(([flag, desc]) => flag.padEnd(max) + desc);
}
