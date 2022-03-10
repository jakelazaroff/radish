type Primitive = string | number;
// prettier-ignore
type ColorFn<T extends Primitive | ColorFn<any>> = (arg?: T) =>
  T extends Primitive ? string : ColorFn<any>;

/** Create an ANSI color */
function fn(seq: number) {
  return <T extends Primitive | ColorFn<any>>(arg?: T): T => {
    // if the argument is a function, prefix that function's return value with the ANSI code
    if (typeof arg === "function")
      return ((arg2: T) => `\u001b[${seq}m${arg(arg2)}`) as T;

    // if the argument is a primitive, prefix it with the ANSI code and follow it with a reset code
    return `\u001b[${seq}m${arg}\u001b[0m` as T;
  };
}

export const green = fn(32);
export const yellow = fn(33);
export const cyan = fn(96);
export const bold = fn(1);
