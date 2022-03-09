import minimist from "minimist";
import * as n from "narrows";

import { dev, build, lint } from "../core/index.js";
import * as ansi from "../util/ansi.js";

const validate = n.record({
  _: n.array(n.string),
  src: n.optional(n.string),
  out: n.optional(n.string),
  public: n.optional(n.string),
  port: n.optional(n.number),
  help: n.optional(n.boolean),
  version: n.optional(n.boolean)
});

export default function cli(argv: string[], version: string) {
  const args = minimist(argv);

  if (!validate(args)) throw new Error(`Invalid args.`);

  const [command] = args._;
  if (args.help) return help(command);

  switch (command) {
    case "build": {
      build({
        src: args.src ?? "./src",
        dest: args.out ?? "./build",
        public: args.public ?? "/public"
      });
      return;
    }

    case "dev": {
      dev({
        src: args.src ?? "./src",
        dest: args.out ?? "./build",
        port: args.port
      });
      return;
    }

    case "lint": {
      lint({ src: args.src ?? "./src" });
      return;
    }

    default: {
      if (args.version) return console.log(version);
      if (command) console.error(`Unrecognized command "${command}".`);
      help();
    }
  }
}

function help(command?: string) {
  const lines: string[] = [];

  switch (command) {
    case "build": {
      lines.push(`🌱\n`, `${ansi.bold("Usage:")} radish build [options]\n`);
      lines.push(
        ansi.bold(`Options:`),
        ...formatOptions(
          [`  --src <dir>`, "source directory"],
          [`  --out <dir>`, "build directory"],
          [`  --public <path>`, "public path"],
          [`  --help`, "display help"]
        )
      );
      break;
    }

    case "dev": {
      lines.push(`🌱\n`, `${ansi.bold("Usage:")} radish dev [options]\n`);
      lines.push(
        ansi.bold(`Options:`),
        ...formatOptions(
          [`  --src <dir>`, "source directory"],
          [`  --out <dir>`, "build directory"],
          [`  --port <path>`, "dev server port"],
          [`  --help`, "display help"]
        )
      );
      break;
    }

    case "lint": {
      lines.push(`🌱\n`, `${ansi.bold("Usage:")} radish lint [options]\n`);
      lines.push(
        ansi.bold(`Options:`),
        ...formatOptions(
          [`  --src <dir>`, "source directory"],
          [`  --help`, "display help"]
        )
      );
      break;
    }

    default: {
      lines.push(`🌱\n`, `${ansi.bold("Usage:")} radish <command> [options]\n`);
      lines.push(
        ansi.bold(`Commands:`),
        ...formatOptions(
          [`  build`, "build site"],
          [`  dev`, "watch site and serve"],
          [`  lint`, "lint your source code"]
        ),
        ""
      );

      lines.push(
        ansi.bold(`Options:`),
        ...formatOptions(
          [`  --help`, "display help"],
          [`  --version`, "display version"]
        )
      );
      break;
    }
  }

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
