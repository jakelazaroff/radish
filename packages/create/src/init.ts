import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import url from "node:url";

interface InitOptions {
  dir: string;
  typescript?: boolean;
}

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE = path.resolve(__dirname, "../template");

export default async function init(options: InitOptions) {
  const { dir } = options;
  const name = path.basename(dir);

  // create the directory
  await fs.promises.mkdir(dir).catch((err: { code: string }) => {
    if (err.code !== "EEXIST") throw err;
  });

  // make sure the directory is empty
  const contents = await fs.promises.readdir(dir);
  if (contents.length) {
    console.error(`Target folder "${name}" is not empty!`);
    process.exit(1);
  }

  // copy package.json
  await fs.promises
    .readFile(path.join(TEMPLATE, "package.json"))
    .then(buffer => buffer.toString())
    .then(string => JSON.parse(string))
    .then(json => {
      let cfg = { ...json, name };
      if (!options.typescript) {
        delete cfg.devDependencies["@types/react"];
        delete cfg.devDependencies["@types/react-dom"];
        delete cfg.devDependencies["typescript"];
      }
      return cfg;
    })
    .then(json => JSON.stringify(json, null, 2))
    .then(file => fs.promises.writeFile(path.join(dir, "package.json"), file));

  // copy .gitignore
  // (templated version doesn't have a leading dot because npm won't publish it)
  await fs.promises.copyFile(
    path.join(TEMPLATE, "gitignore"),
    path.join(dir, ".gitignore")
  );

  const toCopy = [".eslintrc.json", "radish.env.d.ts", "src"];
  if (options.typescript) toCopy.push("tsconfig.json");

  await Promise.all(copy(TEMPLATE, dir, toCopy));

  if (options.typescript) {
    await fs.promises.rename(
      path.join(dir, "src", "pages", "index.jsx"),
      path.join(dir, "src", "pages", "index.tsx")
    );
  }

  console.log(
    `\n🌱 \u001b[32mRadish planted!\u001b[0m \`cd\` into "${name}" and start developing!`
  );
}

/** Copy a list of files or directories from `src` to `dest` */
function copy(src: string, dest: string, files: string[]): Promise<void>[] {
  const copies = files.map<Promise<void>>(async file => {
    const orig = path.join(src, file),
      next = path.join(dest, file);

    const stat = await fs.promises.lstat(orig);
    if (stat.isFile()) return fs.promises.copyFile(orig, next);
    if (stat.isDirectory()) {
      const contents = await fs.promises.readdir(orig);
      await fs.promises.mkdir(next);
      return Promise.all(copy(orig, next, contents)).then(() => void 0);
    }

    throw new Error(`File "${orig}" has unknown type!`);
  });

  return copies;
}
