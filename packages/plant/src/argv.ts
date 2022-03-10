export default function argv(argv: string[]) {
  const result: { _: any[]; [key: string]: any } = { _: [] };

  let positional = false;
  let currentKey = "";

  for (const arg of argv) {
    // if we've passed a "--", the rest of the args are positional
    if (positional) {
      result._.push(parse(arg));
      continue;
    }

    // if the arg starts with hyphens, it's a flag
    if (arg.startsWith("-")) {
      // if we're waiting on a value for a previous flag, we can just set it to a boolean
      if (currentKey) result[currentKey] = true;

      const [key, value] = arg.replace(/^-+/, "").split(/=(.*)/);

      // if there's no key, the arg is "--"; the rest of the arguments will be positional
      if (!key) {
        if (currentKey) result[currentKey] = true;
        positional = true;
        currentKey = "";
        continue;
      }

      // if there's no value, we'll wait to check the next arg
      if (!value) {
        currentKey = key;
        continue;
      }

      // if there's both a key and a value, we can just set them directly
      result[key] = value;
      currentKey = "";
      continue;
    }

    // if the arg isn't a flag and there's a current key, the arg is the value
    if (currentKey) {
      result[currentKey] = parse(arg);
      currentKey = "";
      continue;
    }

    // if the arg isn't a flag and there's no current key, it's positional
    result._.push(parse(arg));
  }

  // if the last argument was a flag, we can set it to true now
  if (currentKey) result[currentKey] = true;

  return result;
}

function parse(arg: string) {
  // if it's a number, return a number
  const num = Number(arg);
  if (!isNaN(num)) return num;

  // if it's "true" or "false", return a boolean
  if (arg === "true") return true;
  if (arg === "false") return false;

  // otherwise, return a string
  return arg;
}
