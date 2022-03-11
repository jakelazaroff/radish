import { dev, build, lint } from "../core/index.js";
import * as ansi from "../util/ansi.js";
import argv from "../util/argv.js";

export default function cli(args: string[], version: string) {
  const flags = argv(args);

  const [command] = flags._;
  if (flags.help) return help(command);

  switch (command) {
    case "build": {
      build({
        src: flags.src ?? "./src",
        dest: flags.out ?? "./build",
        public: flags.public ?? "/public",
        serviceWorker: flags["service-worker"] !== "disabled"
      });
      return;
    }

    case "dev": {
      dev({
        src: flags.src ?? "./src",
        dest: flags.out ?? "./build",
        port: flags.port
      });
      return;
    }

    case "lint": {
      lint({ src: flags.src ?? "./src" });
      return;
    }

    default: {
      if (flags.version) return console.log(version);
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
          [`  --public <path>`, "URL prefix at which assets are available"],
          [`  --service-worker`, "generate a service worker (beta)"],
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
