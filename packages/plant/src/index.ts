// sys
import * as path from "node:path";

// lib

import init from "./init.js";
import argv from "./argv.js";

export default function cli(args: string[], version: string) {
  const flags = argv(args);

  if (flags.version) return console.log(version);

  const [dir] = flags._;
  if (!dir || flags.help) return help();

  init({
    dir: path.resolve(dir),
    typescript: Boolean(flags.typescript)
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
